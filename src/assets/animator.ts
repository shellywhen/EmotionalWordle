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
import { Mode, Word } from './cloud'
import { Meta } from './animation'
import { PlotHandler } from './plot'
import { toHandlers } from 'vue'
import { tsvFormatValue } from 'd3-dsv'

/** different strategies for assigning groups to words */
enum GroupingMode {
    y = 'y',
    x = 'x',
    xy = 'xy',
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

/** interface for animator configureation */
interface AnimationConfig {


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
    //  public plotHandler: PlotHandler | undefined
    constructor(configs: Partial<GroupManager>) {
        Object.assign(this, configs)
    }
    public updateWord(keyFrame: KeyFrame, frameAt: number) {
        // assign by value
        const wordsCopy = this.words.map(obj => ({ ...obj }));
        wordsCopy.forEach((word, idx) => {
            word.x! += keyFrame.xoff * this.ease(frameAt)
            word.y! += keyFrame.yoff * this.ease(frameAt)
            word.size! += word.size! * (keyFrame.scale - 1) * this.ease(frameAt)
            word.rotate! += keyFrame.rotate * this.ease(frameAt)
            word.color = keyFrame.color
        });
        return wordsCopy
    }
    public stop() {

    }
}

/** obatin animating frames and control the groups */
class WordleAnimator {
    public data: Array<Meta> = []
    public timer?: d3Timer.Timer
    public words: Array<Word> = []
    public duration: number = 1000
    public groups: Array<GroupManager> = []
    public plotHandler?: PlotHandler
    public mode: Mode = Mode.chill
    constructor(configs: Partial<WordleAnimator>) {
        Object.assign(this, configs)
    }
    public divideGroup(mode: GroupingMode, groupNum: number) {
        // 1. create groupNum group managers
        // 2. assign words to each group manager according to the mode
        let wordsCopy = this.words.slice()
        let numWordsPerGroup = Math.ceil(this.words.length / groupNum)

        wordsCopy = this.assignWords(wordsCopy, mode)

        for (let i = 0; i < groupNum; i++) {
            let gm = new GroupManager({})
            let startIdx = numWordsPerGroup * i;
            let endIdx = startIdx + numWordsPerGroup;
            gm.words = wordsCopy.slice(startIdx, endIdx)
            this.groups.push(gm)
        }
    }
    public play() {
        const keyFrames = this.getKeyFrames();
        const numGroups = keyFrames.length;
        this.divideGroup(GroupingMode.random, numGroups);
        const frameDuration = 10; // each frame takes 100ms
        let currentFrames: { [k: number]: number } = {}
        currentFrames = keyFrames.map((_, idx) => { return currentFrames[idx] = 0 }); // keeps track of currentFrame of the group

        let counter = 0;
        let timer = d3Timer.timer((elapsed) => {
            if (elapsed < this.duration) {
                // change frame after frameDuration
                counter += 1;
                let totalWords = [] as Word[]
                this.groups.forEach((group, idx) => {
                    if (counter % frameDuration == 0) {
                        // change the current frame of the group if the frame duration has paased
                        currentFrames[idx] = currentFrames[idx] < keyFrames[idx].length - 1
                            ? currentFrames[idx] + 1
                            : 0
                    }
                    let frameAt = (counter % frameDuration) / frameDuration
                    // let frameAt = 1;
                    let currentFrame = currentFrames[idx]
                    let words = group.updateWord(keyFrames[idx][currentFrame], frameAt)
                    totalWords.push(...words)
                });
                if (this.mode === Mode.chill) {
                    this.playLikeShaking(totalWords)
                }
            }
            else {
                timer.stop()
            }
        })
    }

    public playLikeShaking(words: Word[]) {
        // define keyframeconfigs to be used to animate
        // requires all words to be placed
        this.plotHandler?.plotOnCanvas(words)
    }
    public stop() {

    }
    public createGif() {

    }
    public update(mode: string, val: any) {

    }
    private assignWords(words: Word[], mode: GroupingMode) {
        let assignedWords = [] as Word[]
        if (mode === GroupingMode.random) {
            assignedWords = shuffle(words)
        } else if (mode === GroupingMode.x) {
            assignedWords = words.sort((a, b) => a.x! - b.x!)
        }
        return assignedWords
    }

    private getKeyFrames() {
        // logic to get keyframes, hard coded for now

        let groupKeyFrames = [
            [
                new KeyFrame({ xoff: -1, yoff: -1 }),
                new KeyFrame({ xoff: 1, yoff: -1 }),
                new KeyFrame({ xoff: -1, yoff: 1 }),
                new KeyFrame({ xoff: 1, yoff: 1 }),
                new KeyFrame({ xoff: -1, yoff: 1 }),
                new KeyFrame({ xoff: -1, yoff: -1 }),
                new KeyFrame({ xoff: 1, yoff: -1 }),
                new KeyFrame({ xoff: 0, yoff: 1 }),
            ],
            [
                new KeyFrame({ xoff: 10, yoff: 1 }),
                new KeyFrame({ xoff: 0, yoff: 1 }),
                new KeyFrame({ xoff: -10, yoff: 0 }),
            ],
            [
                new KeyFrame({ xoff: 1, yoff: 0, rotate: 5 }),
                new KeyFrame({ xoff: 1, yoff: 0 , rotate: 5}),
                new KeyFrame({ xoff: 1, yoff: -1, rotate: -5 }),
                new KeyFrame({ xoff: -1, yoff: 1, rotate: 5 }),
                new KeyFrame({ xoff: -1, yoff: 0, rotate: -5 }),
                new KeyFrame({ xoff: 0, yoff: 1, rotate: -5 }),
                new KeyFrame({ xoff: -1, yoff: -1, rotate: 5 }),
                new KeyFrame({ xoff: 0, yoff: 0, rotate: -5 }),
            ],
            [
                new KeyFrame({ scale: 0.5 }),
                new KeyFrame({ scale: 1.5 }),
                new KeyFrame({ scale: 1.0 }),

            ]

        ]
        return groupKeyFrames
    }
}

function shuffle(array: any[]) {
    let currIdx = array.length, tempVal, randIdx;
    while (0 != currIdx) {
        randIdx = Math.floor(Math.random() * currIdx);
        currIdx -= 1;
        tempVal = array[currIdx];
        array[currIdx] = array[randIdx]
        array[randIdx] = tempVal;
    }
    return array;
}

export { WordleAnimator }