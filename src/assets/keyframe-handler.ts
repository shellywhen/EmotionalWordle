/* eslint-disable */

import { KeyFrame } from "./animator";
import * as Manual from "@/assets/manual";
import { Mode } from "@/assets/types"
const minNumGroup = 1;
class KeyFrameHandler {
    public getKeyFrames(mode: Mode, wordLength: number, speed: number, entropy: number, alpha=0) {
        let keyFrames = [] as KeyFrame[][];
        if (mode == Mode.dance) {
            keyFrames = this.getDiscoKeyFrames(wordLength, speed, entropy);
        } else if (mode == Mode.split) {
            keyFrames = this.getSplitKeyframes(wordLength, speed, entropy, alpha)
        }
        else {
            keyFrames = [Manual.colorTransition()];
        }
        return keyFrames;
    }
    private getSplitKeyframes(wordLength: number, speed: number, entropy: number, alpha: number) {
        let keyFrames = [] as KeyFrame[][];
        let maxNumGroup =  Math.floor(wordLength * 0.9);
        let numGroup = Math.max(minNumGroup, Math.floor(entropy * maxNumGroup))
        for (let index = 0; index < numGroup; index++) {
            const groupKf = [] as KeyFrame[]
            const theta = alpha + index * 2 * Math.PI / numGroup 
            const dis = Math.random() * 4 + 2 + entropy * 18
            console.log(theta/(2*Math.PI), numGroup,  dis * Math.cos(theta), dis * Math.sin(theta))
            const iter = Math.floor(10 * speed)
            const _move = new KeyFrame({ xoff: dis * Math.cos(theta), yoff: dis * Math.sin(theta), rotate: 0});
            const _center = new KeyFrame({ xoff: 0, yoff: 0, rotate: 0 });
            const _rotate = new KeyFrame({ rotate: (theta-Math.PI/2)})
            const _neg_rotate = new KeyFrame({ rotate: (-theta-Math.PI/2)})
            const animation = [
                _center,
                _move,
                _rotate,
                _rotate,
                _rotate,
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

export { KeyFrameHandler }