/* eslint-disable */
/**
 * doc comment for animator.ts
 * @remarks 
 * the latest design for animation unit
 * the logic is to use Animator to control GroupManager
 * @packageDocumentation
 */
import * as d3Timer from 'd3-timer'
import * as d3Ease from 'd3-ease'
import * as d3Itpl from 'd3-interpolate'
import { PlotHandler } from './plot'
import * as Gif from "@/assets/lib/gif/gif"
import { kmeans } from '@/assets/lib/kmeans'
import { FontConfig } from "@/assets/variable-font"
import { throwStatement } from "@babel/types"
import * as Manual from "@/assets/manual"
import { KeyframeConfig, GroupingMode, Word, Mode, MetaConfig, GroupManagerConfig } from "@/assets/types"

class KeyFrame implements KeyframeConfig {
    public xoff: number = 0
    public yoff: number = 0
    public rotate: number = 0
    public scale: number = 1
    public opacity: number = 1
    public color: string = 'black'
    public stage: number = 0
    public duration: number = 10
    public font: FontConfig = new FontConfig()
    constructor(configs: Partial<KeyframeConfig>) {
        Object.assign(this, configs)
    }
}

class GroupManager implements GroupManagerConfig {
    public delay: number = 0
    public duration: number = 2000
    public ease: (a: number) => (number) = (a:number) => a //d3Ease.easeCubic
    public words: Array<Word> = []
    public keyFrames: Array<KeyFrame> = []
    public font: FontConfig = new FontConfig()
    public origin: Array<Word>
    constructor(configs: Partial<GroupManager>) {
        Object.assign(this, configs)
        this.origin = configs.words?.map(obj => ({ ... obj })) || []
    }

    public updateWord(curFrame: KeyFrame, prevFrame: KeyFrame, frameAt: number, phase: number) {
        const wordsCopy = this.words.map(obj => ({ ...obj }))
        this.font.setValWithRatio('width', 1)
        this.font.setValWithRatio('italic', Math.abs(Math.sin(Date.now()/1000)))
        this.font.setValWithRatio('weight', phase)
        let color = d3Itpl.interpolateHcl(prevFrame.color, curFrame.color)(frameAt) 
        let fontString = this.font.getCss()
        // assign by value
        wordsCopy.forEach((word, idx) => {
            word.x! += curFrame.xoff * this.ease(frameAt)
            word.y! += curFrame.yoff * this.ease(frameAt)
            word.size! += word.size! * (curFrame.scale - 1) * this.ease(frameAt)
            word.rotate! += curFrame.rotate * this.ease(frameAt)
            word.color = color
            word.fontString = fontString
        })
        return wordsCopy
    }
    public reset() {
        this.words = this.origin.map(obj => ({ ... obj }))
    }
}

/** obatin animating frames and control the groups */
class WordleAnimator {
    public data: Array<MetaConfig> = []
    public timer?: d3Timer.Timer | undefined
    public words: Array<Word> = new Array()
    public duration: number = 30000
    public groups: Array<GroupManager> = []
    public plotHandler?: PlotHandler
    public mode: Mode = Mode.chill
    public gif: any

    constructor(configs: Partial<WordleAnimator>) {
        Object.assign(this, configs)
        this.getGroups()
    }

    /** Devide the words into groups
     *  1. create groupNum group managers
     *  2. assign words to each group manager according to the mode
     */
    public divideGroup(mode: GroupingMode) {
        let wordsCopy = this.words
        let numGroup = this.groups.length
        let numWordsPerGroup = Math.ceil(this.words.length / numGroup)
        let assignedWords = [] as Word[]
        if (mode !== GroupingMode.xy) {
            if (mode === GroupingMode.random) {
                assignedWords = shuffle(wordsCopy)
            } else if (mode === GroupingMode.x) {
                assignedWords = wordsCopy.sort((a, b) => a.x! - b.x!)
            } else if (mode == GroupingMode.y) {
                assignedWords = wordsCopy.sort((a, b) => a.y! - b.y!)
            }
            this.assignWords(numGroup, numWordsPerGroup, assignedWords)
        }
        else {
            let positions = wordsCopy.map((word: Word) => [word.x, word.y])
            let result = kmeans(positions, numGroup, "kmeans")
            let wordBags = getMatrix(numGroup, 0) as Array<Array<Word>>
            result.indexes.forEach((d: number, idx: number) => {
                wordBags[d].push(wordsCopy[idx])
            })
            this.groups.forEach((group, idx) => {
                group.words = wordBags[idx]
            })
        }
    }
    /**
     * Create group managers.
     */
    public getGroups() {
        let keyframes = this.getKeyFrames()
        this.groups = keyframes.map((kf, idx)=> new GroupManager({
                'keyFrames': kf
            }))
        this.divideGroup(GroupingMode.xy) // divide the words into groups according to the grouping mode
        this.plotHandler?.plotOnSvg(this.getTotalWords())
    }

    public update(field: string, value: any) {
        if (field === 'duration') this.duration = (value as number)
    }

    /** Play the animated wordle.
     * @param {boolean} gifFlag whether to produce Gif
     */
    public play(gifFlag: boolean = false) {
        this.timer?.stop()
        let currentFrames: { [k: number]: number } = {}
        currentFrames = this.groups.map((_, idx) => { return currentFrames[idx] = 0 }) // keeps track of currentFrame of the group
        this.timer = d3Timer.timer((elapsed) => {
            if (elapsed < this.duration) {      
                let totalWords: Word[] = []
                this.groups.forEach((group, idx) => { 
                    const groupDuration = group.duration
                    let rep = ~~(elapsed / groupDuration)
                    let currentFrameIdx = currentFrames[idx]
                    let isLastFrame = currentFrameIdx == group.keyFrames.length - 1
                    let frameDuration = group.keyFrames[currentFrameIdx].stage * groupDuration / 100
                    let changeFrameAt = rep * groupDuration + frameDuration
                    if( elapsed > changeFrameAt - 10) {
                        currentFrames[idx] = isLastFrame ? 0 : currentFrames[idx] + 1
                    }
                    let frameAt = frameDuration == 0 ? 0 : (frameDuration - changeFrameAt + elapsed) / frameDuration
                    let prevFrameIdx = Math.max(0, currentFrameIdx - 1)
                    let words = group.updateWord(group.keyFrames[currentFrameIdx], group.keyFrames[prevFrameIdx], frameAt, elapsed/group.duration)
                    totalWords.push(...words)
                })
                this.plotHandler?.updateOnSvg(totalWords)
                if (gifFlag) {
                    this.gif.addFrame(this.plotHandler?.canvas, { copy: true, delay: this.duration / 256 })
                }
            }
            else {
                this.timer?.stop()
                // this.groups.forEach((group, idx) => {
                //     group.reset()
                // })
                if (gifFlag) {
                    this.gif.render()
                }
                this.play()
            }
        })
    }
    private getTotalWords() {
        let res = [] as Array<Word>;
        this.groups.forEach((group: GroupManager, idx: number) => {
            res = res.concat(group.words)
        })
        return res
    }

    public stop() {
        this.timer?.stop()
    }
    /**Generate Gif for a round
     * Reference: https://github.com/jnordberg/gif.js
    @param quality the sampling rate
    */
    public createGif(quality: number = 5) {
        this.gif = new Gif({
            quality: quality
        })
        let param = this.getKeyFrames()
        this.gif.on('finished', function (blob: any) {
            let wlink = document.createElement('a')
            wlink.setAttribute('target', '_blank')
            wlink.setAttribute('href', URL.createObjectURL(blob))
            wlink.setAttribute('download', "animation.gif")
            wlink.addEventListener('click', function () {
                this.remove()
            })
            wlink.click()

            let plink = document.createElement('a')
            plink.setAttribute('target', '_blank')
            plink.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(param)))
            plink.setAttribute('download', "param.json")
            plink.addEventListener('click', function () {
                this.remove()
            })
            plink.click()
        })
        return this
    }

    /** Group the words according to position.
     */
    private assignWords(groupNum: number, numWordsPerGroup: number, wordsCopy: Word[]) {
        for (let i = 0; i < groupNum; i++) {
            let gm = new GroupManager({})
            let startIdx = numWordsPerGroup * i;
            let endIdx = startIdx + numWordsPerGroup;
            gm.words = wordsCopy.slice(startIdx, endIdx)
            this.groups.push(gm)
        }
    }

    private getKeyFrames() {
        // logic to get keyframes, hard coded for now
        return [Manual.colorTransition(), Manual.coloredShake(), Manual.coloredShake(), Manual.smallShake()]
    }
}

let shuffle = function <T>(array: T[]) {
    let currIdx = array.length, tempVal, randIdx
    while (0 != currIdx) {
        randIdx = Math.floor(Math.random() * currIdx)
        currIdx -= 1
        tempVal = array[currIdx]
        array[currIdx] = array[randIdx]
        array[randIdx] = tempVal
    }
    return array
}

let getMatrix = function <T>(row: number, col: number) {
    let matrix = [] as Array<Array<T>>
    for (let i = 0; i < row; i++) {
        if (col !== 0) {
            matrix.push(new Array(col).fill(0))
        }
        else {
            let slot = [] as Array<T>
            matrix.push(slot)
        }
    }
    return matrix
}

export { WordleAnimator, KeyFrame, GroupManager }