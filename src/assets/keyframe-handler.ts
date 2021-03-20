/* eslint-disable */

import { KeyFrame } from "./animator";
import * as Manual from "@/assets/manual";

class KeyFrameHandler {
    public getKeyFrames(mode: string, wordLength: number, extent: number, speed: number, entropy: number) {
        let keyFrames = [] as KeyFrame[][];
        if (mode == "disco") {
            keyFrames = this.getDiscoKeyFrames(wordLength, extent, speed, entropy);
        } else {
            keyFrames = [Manual.colorTransition()];
        }
        return keyFrames;
    }

    private getDiscoKeyFrames(wordLength: number, extent: number, speed: number, entropy: number): KeyFrame[][] {
        const keyFrames = [];
        const minNumGroup = 1;
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