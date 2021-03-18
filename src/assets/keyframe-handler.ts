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
        const numGroup = Math.max(1, Math.trunc(wordLength * entropy) - 1);
        const minNumStage = 10;
        const maxNumStage = 100;
        const numStage = (maxNumStage - minNumStage) * speed + minNumStage; // at least
        const steps = 100 / numStage;
        for (let index = 0; index < numGroup; index++) {
            const groupKf = [] as KeyFrame[];
            for (let j = 0; j < numStage + 1; j++) {
                const stage = Math.trunc(j * steps);
                let kf: KeyFrame;
                if(j % 2 == 0) {
                    kf = new KeyFrame({xoff: 0, yoff: 0, stage: stage});
                } else {
                    const randxd = Math.round(Math.random()) * 2 - 1;
                    const randyd = Math.round(Math.random()) * 2 - 1;
                    const randx = parseFloat((Math.random() + extent).toFixed(2));
                    const randy = parseFloat((Math.random() + extent).toFixed(2));
                    kf = new KeyFrame({ xoff: randxd * randx, yoff: randyd * randy, stage: stage });
                }
                groupKf.push(kf);
            }
            keyFrames.push(groupKf);
        }
        return keyFrames;
    }
}

export { KeyFrameHandler }