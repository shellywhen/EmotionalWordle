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
import { Mode, Word } from './cloud'
import { Meta } from './animation'
import { PlotHandler } from './plot'
import * as Gif from "@/assets/lib/gif/gif"
import { kmeans } from './lib/kmeans'

const frameDuration = 10   // each frame takes 100ms

/** different strategies for assigning groups to words */
enum GroupingMode {
    y = 'y',    
    x = 'x',
    xy = 'xy',  // kmeans for 2d adjacent words
    random = 'random'
}

/** interface for key frame configureation */
interface KeyframeConfig {
    xoff: number,
    yoff: number,
    rotate: number,
    scale: number,
    opacity: number,
    color: string,
    stage: number
}

class KeyFrame implements KeyframeConfig {
    public xoff: number = 0
    public yoff: number = 0
    public rotate: number = 0
    public scale: number = 1
    public opacity: number = 1
    public color: string = 'black'
    public stage: number = 0
    constructor(configs: Partial<KeyframeConfig>) {
        Object.assign(this, configs)
    }
}

class GroupManager {
    public delay: number = 0
    public duration: number = 0
    public ease: (a: number) => (number) = d3Ease.easeCubic
    public words: Array<Word> = []
    constructor(configs: Partial<GroupManager>) {
        Object.assign(this, configs)
    }
    public updateWord(curFrame: KeyFrame, prevFrame: KeyFrame, frameAt: number) {
        // assign by value
        const wordsCopy = this.words.map(obj => ({ ...obj }))
        wordsCopy.forEach((word, idx) => {
            word.x! += curFrame.xoff * this.ease(frameAt)
            word.y! += curFrame.yoff * this.ease(frameAt)
            word.size! += word.size! * (curFrame.scale - 1) * this.ease(frameAt)
            word.rotate! += curFrame.rotate * this.ease(frameAt)
            word.color = d3Itpl.interpolateLab(prevFrame.color, curFrame.color)(this.ease(frameAt)) //keyFrame.color
        })
        return wordsCopy
    }
}

/** obatin animating frames and control the groups */
class WordleAnimator {
    public data: Array<Meta> = []
    public timer?: d3Timer.Timer | undefined
    public words: Array<Word> = new Array()
    public duration: number = 1000
    public groups: Array<GroupManager> = []
    public plotHandler?: PlotHandler
    public mode: Mode = Mode.chill
    public gif: any
    constructor(configs: Partial<WordleAnimator>) {
        Object.assign(this, configs)
    }
    public divideGroup(mode: GroupingMode, groupNum: number) {
        // 1. create groupNum group managers
        // 2. assign words to each group manager according to the mode
        let wordsCopy = this.words
        let numWordsPerGroup = Math.ceil(this.words.length / groupNum)
        let assignedWords = [] as Word[]
        this.groups = []
        if( mode !== GroupingMode.xy) {
            if (mode === GroupingMode.random) {
                assignedWords = shuffle(wordsCopy)
            } else if (mode === GroupingMode.x) {
                assignedWords = wordsCopy.sort((a, b) => a.x! - b.x!)
            } else if (mode == GroupingMode.y) {
                assignedWords = wordsCopy.sort((a, b) => a.y! - b.y!)
            } 
            this.assignWords(groupNum, numWordsPerGroup, assignedWords)
        }
        else {
            let positions = wordsCopy.map((word: Word) => [word.x, word.y])
            let result = kmeans(positions, groupNum, "kmeans")
            let wordBags = getMatrix(groupNum, 0) as Array<Array<Word>>
            result.indexes.forEach((d: number, idx: number) => {
                wordBags[d].push(wordsCopy[idx])
            })
            wordBags.forEach((wordbag: Array<Word>) => {
                this.groups.push(new GroupManager({'words': wordbag}))
            })           
        }
    }

    public update(field: string, value: any) {
        if (field === 'duration') this.duration = (value as number)
    }

    /** Play the animated wordle.
     * @param {boolean} gifFlag whether to produce Gif
     */
    public play(gifFlag: boolean = false) {
        const keyFrames = this.getKeyFrames()
        const numGroups = keyFrames.length
        this.divideGroup(GroupingMode.xy, numGroups)
        let currentFrames: { [k: number]: number } = {}
        currentFrames = keyFrames.map((_, idx) => { return currentFrames[idx] = 0 }) // keeps track of currentFrame of the group
        let counter = 0;
        let timer = d3Timer.timer((elapsed) => {
            if (elapsed < this.duration) {
                // change frame after frameDuration
                counter += 1;
                let totalWords: Word[] = []
                this.groups.forEach((group, idx) => {
                    if (counter % frameDuration == 0) {
                        // change the current frame of the group if the frame duration has passed
                        currentFrames[idx] = currentFrames[idx] < keyFrames[idx].length - 1
                            ? currentFrames[idx] + 1
                            : 0
                    }
                    let frameAt = (counter % frameDuration) / frameDuration
                    // let frameAt = 1;
                    let currentFrame = currentFrames[idx]
                    let words = group.updateWord(keyFrames[idx][currentFrame], keyFrames[idx][Math.max(0, currentFrame-1)], frameAt)
                    totalWords.push(...words)
                })
                this.plotHandler?.plotOnCanvas(totalWords)
                if (gifFlag) {
                    this.gif.addFrame(this.plotHandler?.canvas, {copy: true, delay: this.duration / 256 })
                }
            }
            else {
                timer.stop()
                if (gifFlag) {
                    console.log(this.gif)
                    this.gif.render()
                }
                // this.play()
            }
        })
    }

    private getPlayMode() {

    }

    public stop() {

    }
    /**Generate Gif for a round
     * Reference: https://github.com/jnordberg/gif.js
    @param quality the sampling rate
    */
   public createGif(quality: number=5) {
        this.gif = new Gif({
            quality: quality
        }) 
        let param = this.getKeyFrames()
        this.gif.on('finished', function(blob: any) {
            let wlink = document.createElement('a')
            wlink.setAttribute('target', '_blank')
            wlink.setAttribute('href', URL.createObjectURL(blob))
            wlink.setAttribute('download', "animation.gif")
            wlink.addEventListener('click', function() {
                this.remove()
            })
            wlink.click()
            
            let plink = document.createElement('a')
            plink.setAttribute('target', '_blank')
            plink.setAttribute('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(param)))
            plink.setAttribute('download', "param.json")
            plink.addEventListener('click', function() {
                this.remove()
            })
            plink.click()
        })
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
        let groupKeyFrames = [
            [
                new KeyFrame({ xoff: -1, yoff: -1, color: 'red' }),
                new KeyFrame({ xoff: 1, yoff: -1, color: 'yellow' }),
                new KeyFrame({ xoff: -1, yoff: 1, color: 'yellow'}),
                new KeyFrame({ xoff: 1, yoff: 1, color: 'blue' }),
                new KeyFrame({ xoff: -1, yoff: 1 }),
                new KeyFrame({ xoff: -1, yoff: -1 }),
                new KeyFrame({ xoff: 1, yoff: -1 }),
                new KeyFrame({ xoff: 0, yoff: 1 }),
            ]
            ,
            [
                new KeyFrame({ xoff: 10, yoff: 1 }),
                new KeyFrame({ xoff: 0, yoff: 1 }),
                new KeyFrame({ xoff: -10, yoff: 0 }),
            ]//,
            // [
            //     new KeyFrame({ xoff: 1, yoff: 0, rotate: 5 }),
            //     new KeyFrame({ xoff: 1, yoff: 0 , rotate: 5}),
            //     new KeyFrame({ xoff: 1, yoff: -1, rotate: -5 }),
            //     new KeyFrame({ xoff: -1, yoff: 1, rotate: 5 }),
            //     new KeyFrame({ xoff: -1, yoff: 0, rotate: -5 }),
            //     new KeyFrame({ xoff: 0, yoff: 1, rotate: -5 }),
            //     new KeyFrame({ xoff: -1, yoff: -1, rotate: 5 }),
            //     new KeyFrame({ xoff: 0, yoff: 0, rotate: -5 }),
            // ],
            // [
            //     new KeyFrame({ scale: 0.5 }),
            //     new KeyFrame({ scale: 1.5 }),
            //     new KeyFrame({ scale: 1.0 }),
            // ]

        ]
        return groupKeyFrames
    }
}

let shuffle = function<T>(array: T[]) {
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

let getMatrix = function<T>(row: number, col: number) {
    let matrix = [] as Array<Array<T>>
    for (let i = 0; i < row; i ++) {
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

export { WordleAnimator }