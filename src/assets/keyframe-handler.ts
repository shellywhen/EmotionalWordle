/* eslint-disable */

import { KeyFrame } from "./animator";
import * as Manual from "@/assets/manual";
import { Mode } from "@/assets/types"
import { FontConfig } from "@/assets/variable-font"

const minNumGroup = 1;
const sampleFont = new FontConfig()
const sampleItalic = sampleFont.italicRange
const sampleWeight = sampleFont.weightRange
const sampleItalicInterval = sampleItalic[1] - sampleItalic[0]
const sampleWeightInterval = sampleWeight[1] - sampleWeight[0]
const sampleItalicMid = ( sampleItalic[1] + sampleItalic[0] ) / 2
const sampleWeightMid = ( sampleWeight[1] + sampleWeight[0] ) / 2

class KeyFrameHandler {
    public getKeyFrames(mode: Mode, wordLength: number, speed: number, entropy: number, alpha=0) {
        let keyFrames = [] as KeyFrame[][];
        if (mode == Mode.dance) {
            keyFrames = this.getDiscoKeyFrames(wordLength, speed, entropy);
        } else if (mode == Mode.split) {
            keyFrames = this.getSplitKeyframes(wordLength, speed, entropy, alpha)
        } else if (mode == Mode.swing) {
            keyFrames = this.getSwingingKeyFrames(wordLength, speed, entropy)
        }
        else {
            keyFrames = [Manual.colorTransition()];
        }
        return keyFrames;
    }

    private getSwingingKeyFrames(wordLength: number, speed: number, entropy: number) {
        let keyFrames = [] as KeyFrame[][];
        const maxNumGroup =  Math.floor(wordLength * 0.9);
        let numGroup = Math.max(1, entropy * maxNumGroup)
        for (let index = 0; index < numGroup; index++) {
            let groupKeyFrames = [] as KeyFrame[]
            const italicDelta = sampleItalicInterval * ( entropy * 0.5 + Math.random() * 0.1 + 0.4 )
            const weightDelta = sampleWeightInterval * ( entropy * 0.5 + Math.random() * 0.1 + 0.4 )
            const italicRange = [sampleItalicMid - italicDelta, sampleItalicMid + italicDelta]
            const weightRange = [sampleWeightMid - weightDelta * 0.2, sampleWeightMid + weightDelta]
            let fontMid = new FontConfig()
            fontMid.update({italic: sampleItalicMid, weight: sampleWeightMid})
            let fontStart = new FontConfig()
            fontStart.update({italic: italicRange[0], weight:weightRange[0]})
            let fontEnd = new FontConfig()
            fontEnd.update({italic: italicRange[1], weight: weightRange[1]})
            let fontWideMid = new FontConfig()
            fontWideMid.update({italic: sampleItalicMid, weight: weightRange[1]})
            let fontWideStart = new FontConfig()
            fontWideStart.update({ italic: italicRange[0], weight: weightRange[0] })
 
            let animation = [] as KeyFrame[]
            let backupFrames = [
                new KeyFrame({font: fontEnd}),
                new KeyFrame({font: fontEnd}),
                new KeyFrame({font: fontWideMid, xoff: -1}),
                new KeyFrame({font: fontWideStart, xoff: -4}),
                // new KeyFrame({font: fontStart }),
                new KeyFrame({font: fontWideMid, yoff: Math.random()>0.5?-2:2}),
                new KeyFrame({font: fontEnd}),
                new KeyFrame({font: fontEnd}),
            ]
            for(let it = 0; it < Math.max(1, Math.floor(Math.random()*3)); it ++) {
                for(let fid = 0; fid < backupFrames.length; fid ++) {
                    if(Math.random() > 0.2) {
                        animation.push(backupFrames[fid])
                    }
                }
            }
            const iter = 10 * speed;
            const al = animation.length;
            const tl = al * iter - 1;
            if(iter == 0) {
                groupKeyFrames.push(...[
                    new KeyFrame({stage: 0}),
                    new KeyFrame({stage: 100}),
                ])
            }
            for (let i = 0; i < iter; i++) {
                animation.forEach((move, idx) => {
                    const stage = Math.ceil((100 / tl) * (idx + i * al));
                    groupKeyFrames.push({...move, stage: stage});
                });
            }

            keyFrames.push(groupKeyFrames)
        }
        return keyFrames
    }




    private getSplitKeyframes(wordLength: number, speed: number, entropy: number, alpha: number) {
        let keyFrames = [] as KeyFrame[][];
        let maxNumGroup =  Math.floor(wordLength * 0.9);
        let numGroup = Math.max(minNumGroup, Math.floor(entropy * maxNumGroup))
        for (let index = 0; index < numGroup; index++) {
            const groupKf = [] as KeyFrame[]
            const theta = alpha + index * 2 * Math.PI / numGroup 
            const dis = Math.random() * 4 + 2 + entropy * 18
          //  console.log(theta/(2*Math.PI), numGroup,  dis * Math.cos(theta), dis * Math.sin(theta))
            const iter = Math.floor(10 * speed)
            const _move_left = new KeyFrame({ xoff: 3*dis/5 * Math.cos(theta+ Math.PI/7), yoff: 3*dis/5 * Math.sin(theta+Math.PI/7), rotate: 0});
            const _move_right = new KeyFrame({ xoff: 4*dis/5 * Math.cos(theta - Math.PI/8), yoff: 4*dis/5 * Math.sin(theta+Math.PI/8), rotate: 0});
            const _move = new KeyFrame({ xoff: dis * Math.cos(theta), yoff: dis * Math.sin(theta), rotate: 0});
            const _center = new KeyFrame({ xoff: 0, yoff: 0, rotate: 0 });
            const _rotate = new KeyFrame({ rotate: (theta-Math.PI/4)})
            const _neg_rotate = new KeyFrame({ rotate: (-theta+Math.PI/4)})
            const animation = [
                _center,
                // _move_left,
                // _move_right,
                _move,
                _rotate,
                _rotate,
                _neg_rotate,
                _move,
                _move,
                _move,
                _move,
                // _move_right,
                // _move_left,
                _center,
            ]
            const al = animation.length;
            const tl = al * iter - 1;
            if(iter == 0) {
                groupKf.push(...[
                    new KeyFrame({stage: 0}),
                    new KeyFrame({stage: 100}),
                ])
            }
            for (let i = 0; i < iter; i++) {
                animation.forEach((move, idx) => {
                    const stage = Math.ceil((100 / tl) * (idx + i * al));
                    groupKf.push({...move, stage: stage});
                });
            }
            keyFrames.push(groupKf);
        }
        return keyFrames;
    }
    private getDiscoKeyFrames(wordLength: number, speed: number, entropy: number): KeyFrame[][] {
        const keyFrames = [];
        const maxNumGroup =  10;
        const numGroup = Math.min(wordLength, Math.trunc((maxNumGroup - minNumGroup) * entropy + minNumGroup));
        // const minNumStage = 10;
        // const maxNumStage = 100;
        // const numStage = (maxNumStage - minNumStage) * speed + minNumStage; // at least
        // const steps = 100 / numStage;
        for (let index = 0; index < numGroup; index++) {
            const groupKf = [] as KeyFrame[];
            const randXD = Math.round(Math.random()) * 2 - 1;
            const move = new KeyFrame({ xoff: randXD * (  entropy * 3) });
            const center = new KeyFrame({ xoff: 0, yoff: 0 });
            const randY = Math.random() * 2.0;
            const jump = new KeyFrame({yoff: -randY * (speed + entropy + 1)});
            const animation = [
                move,
                center,
                move,
                jump
            ]
            const iter = 10 * speed;
            const al = animation.length;
            const tl = al * iter - 1;
            if(iter == 0) {
                groupKf.push(...[
                    new KeyFrame({stage: 0}),
                    new KeyFrame({stage: 100}),
                ])
            }
            for (let i = 0; i < iter; i++) {
                animation.forEach((move, idx) => {
                    const stage = Math.ceil((100 / tl) * (idx + i * al));
                    groupKf.push({...move, stage: stage});
                });
            }
            // for (let j = 0; j < numStage + 1; j++) {
            //     const stage = Math.trunc(j * steps);
            //     let kf: KeyFrame;
                // if(j % 2 == 0) { 
                //     kf = new KeyFrame({xoff: 0, yoff: 0, stage: stage});
                // } else {
                //     const randxd = Math.round(Math.random()) * 2 - 1;
                //     const randyd = Math.round(Math.random()) * 2 - 1;
                //     const randrd = Math.round(Math.random()) * 2 - 1;
                //     const randx = parseFloat((Math.random() + entropy * 3).toFixed(2));
                //     const randy = parseFloat((Math.random() + entropy * 3).toFixed(2));
                //     const randr = parseFloat((Math.random()).toFixed(2));
                //     kf = new KeyFrame({ xoff: randxd * randx, yoff: randyd * randy, rotate: randrd * randr, stage: stage });
                // }
                // 1. left -> left -> jump
                // left

                // jump
                // groupKf.push(kf);
            // }
            keyFrames.push(groupKf);
        }
        return keyFrames;
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

export { KeyFrameHandler }