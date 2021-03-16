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
import * as Manual from "@/assets/manual"
import { KeyframeConfig, GroupingMode, Word, Mode, MetaConfig, GroupManagerConfig } from "@/assets/types"

class KeyFrame implements KeyframeConfig {
    public x: number = 0
    public y: number = 0
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
        Object.assign(this, configs);
    }
}

class GroupManager implements GroupManagerConfig {
    public order: number = 0;
    public delay: number = 0;
    public duration: number = 2000;
    public ease: (a: number) => (number) = (a:number) => a; //d3Ease.easeCubic
    public words: Array<Word> = [];
    public origin: Array<Word> = [];
    public keyFrames: Array<KeyFrame> = [];
    public frameCounter: number = 0;
    public font: FontConfig = new FontConfig();
    constructor(configs: Partial<GroupManager>) {
        Object.assign(this, configs);
    }

    public updateWord(ckf: KeyFrame, nkf: KeyFrame, frameAt: number, phase: number) {
        this.font.setValWithRatio('width', 1);
        this.font.setValWithRatio('italic', Math.abs(Math.sin(Date.now()/1000)));
        this.font.setValWithRatio('weight', phase);
        const color = d3Itpl.interpolateHcl(ckf.color, nkf.color)(frameAt);
        const fontString = this.font.getCss();
        // assign by value  
        this.words.forEach((d) => {
            const xoff = (nkf.xoff - ckf.xoff) * this.ease(frameAt);
            const yoff = (nkf.yoff - ckf.yoff) * this.ease(frameAt);
            const scale = (nkf.scale - ckf.scale) * this.ease(frameAt);
            const rotate = (nkf.rotate - ckf.rotate) * this.ease(frameAt);
            d.x = d.x! + xoff;
            d.y = d.y! + yoff;
            d.rotate = +d.rotate! + rotate;
            d.size = d.size! * (1 + scale);
            d.color = color;
            d.fontString = fontString;
        });
    }

    public setFrameCounter(fc: number) {
        this.frameCounter = fc;
    }

    public reset() {
        this.words = this.origin.map(a => ({...a}));
        this.frameCounter = 0;
    }
}

/** obatin animating frames and control the groups */
class WordleAnimator {
    public data: Array<MetaConfig> = [];
    public timer?: d3Timer.Timer | undefined;
    readonly words: Array<Word> = new Array();
    public duration: number = 30000;
    public groupManagers: Array<GroupManager> = [];
    public plotHandler?: PlotHandler;
    public mode: Mode = Mode.chill;
    public gif: any;

    constructor(configs: Partial<WordleAnimator>) {
        Object.assign(this, configs);
    }


    public createManagers(numGroups: number) {
        this.groupManagers = new Array(numGroups);
        for(var i = 0; i < numGroups; ++i) {
            this.groupManagers[i] = new GroupManager({});
        }
    }

    public assignKeyFrame(keyFrames: KeyFrame[][]) {
        this.groupManagers.forEach((gm, idx) => {
            gm.keyFrames = keyFrames[idx];
        });
    }

    /** Devide the words into groups
     *  1. create groupNum group managers
     *  2. assign words to each group manager according to the mode
     */
    public divideGroup(mode: GroupingMode) {
        let numGroup = this.groupManagers.length;
        let numWordsPerGroup = Math.ceil(this.words.length / numGroup);
        let assignedWords = [] as Word[];
        if (mode !== GroupingMode.xy) {
            if (mode === GroupingMode.random) {
                assignedWords = shuffle(this.words);
            } else if (mode === GroupingMode.x) {
                assignedWords = this.words.sort((a, b) => a.x! - b.x!);
            } else if (mode == GroupingMode.y) {
                assignedWords = this.words.sort((a, b) => a.y! - b.y!);
            }
            this.groupManagers.forEach((group, i) => {
                const startIdx = numWordsPerGroup * i;
                const endIdx = startIdx + numWordsPerGroup;
                const words = this.words.slice(startIdx, endIdx);
                group.words = words;
                group.origin = words.map(x => ({...x}));
            })
        }
        else {
            let positions = this.words.map((word: Word) => [word.x, word.y]);
            let result = kmeans(positions, numGroup, "kmeans");
            let wordBags = getMatrix(numGroup, 0) as Array<Array<Word>>;
            result.indexes.forEach((d: number, idx: number) => {
                wordBags[d].push(this.words[idx]);
            });
            this.groupManagers.forEach((group, idx) => {
                const words = wordBags[idx];
                group.words = words;
                group.origin = this.copyByValue(words);
            });
        }
    }

    public reset() {
        this.groupManagers.forEach(gm => {
            const copy = this.copyByValue(gm.origin);
            gm.words = copy;
            gm.frameCounter = 0;
        })
    }

    public copyByValue(val: any) {
        const copy = val.map((x: any) => ({...x}));
        return copy;
    }


    public update(field: string, value: any) {
        if (field === 'duration') this.duration = (value as number)
    }

    /** Play the animated wordle.
     * @param {boolean} gifFlag whether to produce Gif
     */
    public play(gifFlag: boolean = false, replay: boolean = false) {
        const keyFrames = getKeyFrames();
        const numGroups = keyFrames.length;
        const mode = getDivideMode();
        
        if (!replay) {
            this.createManagers(numGroups);
            this.assignKeyFrame(keyFrames);
            this.divideGroup(mode);
        } else {
            this.reset();
        }
        const gms = this.groupManagers;
        
        this.plotHandler?.plotOnSvg(this.words);
        this.timer?.stop();
        this.timer = d3Timer.timer((elapsed) => {
            if (elapsed < this.duration) {      
                let totalWords: Word[] = [];
                gms.forEach((gm, _) => { 
                    let fc = gm.frameCounter;
                    const keyFrames = gm.keyFrames;
                    const ckf = keyFrames[fc];
                    const nkf = keyFrames[fc + 1];
                    const cfa = nkf.stage / 100 * this.duration;
                    if( elapsed >= cfa ) {
                        gm.setFrameCounter(fc + 1);
                    }
                    const fs = ckf.stage / 100 * this.duration; 
                    const frameAt = (elapsed - fs) / (cfa - fs);
                    const phase = elapsed / gm.duration;
                    gm.updateWord(ckf, nkf, frameAt, phase);
                    totalWords.push(...gm.words);
                })
                this.plotHandler?.plotOnSvg(totalWords);
                if (gifFlag) {
                    this.gif.addFrame(this.plotHandler?.canvas, { copy: true, delay: this.duration / 256 });
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
                this.play(gifFlag, true);
            }
        })
    }
    private getTotalWords() {
        let res = [] as Array<Word>;
        this.groupManagers.forEach((group: GroupManager, idx: number) => {
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
        let param = getKeyFrames();
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
            let startIdx = numWordsPerGroup * i;
            let endIdx = startIdx + numWordsPerGroup;
            this.groupManagers[i].words = wordsCopy.slice(startIdx, endIdx);
        }
    }

}

function getDivideMode() {
    return GroupingMode.xy;
}

// separate key frame getter logic from wordle class
function getKeyFrames() {
    // logic to get keyframes, hard coded for now
    return [Manual.smallShake(), Manual.colorTransition(), Manual.shakeNRotate()];
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