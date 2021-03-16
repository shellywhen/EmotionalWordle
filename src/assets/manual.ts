/* eslint-disable */
/**
 * doc comment for manual.ts
 * @remarks 
 * Manual attempts for animation effects.
 * @packageDocumentation
 */

import * as Color from "@/assets/color-preset"
import { GroupManager, KeyFrame } from "@/assets/animator"
import { KeyframeConfig } from "@/assets/types"
import * as d3Ease from "d3-ease"

export let colorTransition = function () {
     let keyframes = [] as Array<KeyFrame>
     let colors = Color.calm;
     colors.forEach((c, idx) => {
        keyframes.push(new KeyFrame({
            'color': c,
            'stage': Math.ceil((idx) * 100/(colors.length-1))
        }))
     })
     return keyframes
}

// I found it only works as a function or there will be import error
export let coloredShake = () => [
        new KeyFrame({ xoff: -1, yoff: -1, color: 'red', stage: 0 }),
        new KeyFrame({ xoff: 0, yoff: 0, color: 'yellow', stage: 20 }),
        new KeyFrame({ xoff: -1, yoff: 1, color: 'blue', stage: 60 }),
        new KeyFrame({ xoff: 0, yoff: 0, color: 'grey', stage: 80 }),
        new KeyFrame({ xoff: 1, yoff: 1, color: 'green', stage: 100 })
        // new KeyFrame({ xoff: -1, yoff: 1 }),
        // new KeyFrame({ xoff: -1, yoff: -1 }),
        // new KeyFrame({ xoff: 1, yoff: -1 }),
        // new KeyFrame({ xoff: 0, yoff: 1 }),
    ]

export let smallShake = () => [
        new KeyFrame({ xoff: 0, yoff: 0, stage: 0 }),
        new KeyFrame({ xoff: 0.5, yoff: 0.5, stage: 5 }),
        new KeyFrame({ xoff: 0, yoff: 0, stage: 10 }),
        new KeyFrame({ xoff: -0.5, yoff: 0, stage: 15 }),
        new KeyFrame({ xoff: 0, yoff: 0, stage: 20 }),
        new KeyFrame({ xoff: 0.5, yoff: -0.5, stage: 25 }),
        new KeyFrame({ xoff: 1, yoff: 0, stage: 100 })
    ]

export let shakeNRotate = () => [
        new KeyFrame({ xoff: 1, yoff: 0, rotate: 5, stage: 0 }),
        new KeyFrame({ xoff: 1, yoff: 0 , rotate: 5, stage: 10}),
        new KeyFrame({ xoff: 0, yoff: 0, rotate: -5, stage: 20 }),
        new KeyFrame({ xoff: -1, yoff: 1, rotate: 5, stage: 30 }),
        new KeyFrame({ xoff: -1, yoff: 0, rotate: -5, stage: 40 }),
        new KeyFrame({ xoff: 0, yoff: 0, rotate: -5, stage: 50 }),
        new KeyFrame({ xoff: -1, yoff: -1, rotate: 5, stage: 60 }),
        new KeyFrame({ xoff: 0, yoff: 0, rotate: -5, stage: 100 })
    ]

export let scale = () => [
        new KeyFrame({ scale: 0.5 }),
        new KeyFrame({ scale: 1.5 }),
        new KeyFrame({ scale: 1.0 })
]

export let xmas = () =>   [
    new KeyFrame({ xoff: -1, yoff: -1, color: '#FF000000', stage: 0}),
    new KeyFrame({ xoff: -1, yoff: 1, color: '#FF0000', stage: 10}),
    new KeyFrame({ xoff: 1, yoff: 1, color: '#FF0000', stage: 20}),
    new KeyFrame({ xoff: 2, yoff: 2, color: 'white', stage: 30}),
    new KeyFrame({ xoff: 1, yoff: -2, color: 'white', stage: 40}),
    new KeyFrame({ xoff: -1, yoff: -2, color: '#FF8F39', stage: 50}),
    new KeyFrame({ xoff: 3, yoff: -3, color: '#FF8F39', stage: 60}),
    new KeyFrame({ xoff: 2, yoff: 2, color: 'red', stage: 70}),
    new KeyFrame({ xoff: 1, yoff: 1, color: 'red', stage: 80}),
    new KeyFrame({ xoff: -1, yoff: -1, color: '#FF8F39', stage: 90}),
    new KeyFrame({ xoff: 1, yoff: 0, color: '#FF8F39', stage: 100})
]

export let split = function () {
    
}

export let hardCodeGroups = function () {
     let groupManager: GroupManager[] = [
            new GroupManager({
                duration: 500,
                keyFrames: xmas()
            }),
        ]
        // hasty?
        // let groupManager: GroupManager[] = [
        //     new GroupManager({
        //         duration: 2000,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100, color: 'red'}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2100,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2200,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2300,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2400,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2500,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2600,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        //     new GroupManager({
        //         duration: 2700,
        //         keyFrames: [
        //             new KeyFrame({ xoff: 0, stage: 0}),
        //             new KeyFrame({ xoff: 1000, stage: 100}),

        //         ],
        //     }),
        // ]
        // bubbly effect
        // let groupManager: GroupManager[] = [
        //     new GroupManager({
        //         duration: 3000,
        //         keyFrames: [
        //             new KeyFrame({ scale: 0.5, stage: 0, color: 'gold' }),
        //             new KeyFrame({ scale: 1.25, stage: 100, color: 'red' }),

        //         ]
        //     }),
        //     new GroupManager({
        //         duration: 4000,
        //         keyFrames: [
        //             new KeyFrame({ scale: 0.5, stage: 0, color: 'red' }),
        //             new KeyFrame({ scale: 1.125, stage: 100, color: 'green' }),

        //         ]
        //     }),
        //     new GroupManager({
        //         duration: 3500,
        //         keyFrames: [
        //             new KeyFrame({ scale: 0.5, stage: 0, color: 'green' }),
        //             new KeyFrame({ scale: 1.3, stage: 100, color: 'gold' }),

        //         ]
        //     }),
        // ] 
        // fly away        
        // let groupManager: GroupManager[] = [
        //     new GroupManager({
        //         duration: 3000,
        //         keyFrames: [
        //             new KeyFrame({rotate: 0, stage: 0}),
        //             new KeyFrame({xoff: 200, yoff: -200, scale: 0, rotate: 720, stage: 100}),

        //         ]
        //     }),
        //     new GroupManager({
        //         duration: 2000,
        //         keyFrames: [
        //             new KeyFrame({rotate: 0, stage: 0}),
        //             new KeyFrame({xoff: 200, yoff: -200, scale: 0, rotate: 720, stage: 100}),

        //         ]
        //     }),
        //     new GroupManager({
        //         duration: 2100,
        //         keyFrames: [
        //             new KeyFrame({rotate: 0, stage: 0}),
        //             new KeyFrame({xoff: 200, yoff: -200, scale: 0, rotate: 720, stage: 100}),

        //         ]
        //     }),
        //     new GroupManager({
        //         duration: 2400,
        //         keyFrames: [
        //             new KeyFrame({rotate: 0, stage: 0}),
        //             new KeyFrame({xoff: 200, yoff: -200, scale: 0, rotate: 720, stage: 100}),

        //         ]
        //     })
        // ]
        // slide away
        //  let groupManager: GroupManager[] = [
        //     new GroupManager({
        //         duration: 3000,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 1500, scale: 0, stage: 100, color: '#C1C1C1'}),

        //         ]
        //     }),
        // ]
        // inception style?
        //  let groupManager: GroupManager[] = [
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 3000,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 2250,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 2000,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 2500,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 2600,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 2400,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        //     new GroupManager({
        //         ease: d3Ease.easeLinear,
        //         duration: 2700,
        //         keyFrames: [
        //             new KeyFrame({xoff: 0, stage: 0}),
        //             new KeyFrame({xoff: 0, scale: 0, stage: 100}),
        //         ]
        //     }),
        // ]
        // rotation with colorization
        // let groupManager: GroupManager[] = [
        //         new GroupManager({
        //             ease: d3Ease.easeSin,
        //             duration: 3000,
        //             keyFrames: [
        //                 new KeyFrame({xoff: 0, stage: 0}),
        //                 new KeyFrame({xoff: 0, rotate: 720, color:'#0CB04A', stage: 100}),
        //             ]
        //         }),
        //         new GroupManager({
        //             ease: d3Ease.easeCircle,
        //             duration: 3000,
        //             keyFrames: [
        //                 new KeyFrame({xoff: 0, stage: 0}),
        //                 new KeyFrame({xoff: 0, rotate: 360, color:'#0A7533', stage: 100}),
        //             ]
        //         }),
        //         new GroupManager({
        //             ease: d3Ease.easeCubic,
        //             duration: 3000,
        //             keyFrames: [
        //                 new KeyFrame({xoff: 0, stage: 0}),
        //                 new KeyFrame({xoff: 0, rotate: 1080, color: '#FF3A2F', stage: 100}),
        //             ]
        //         }),
        //         new GroupManager({
        //             ease: d3Ease.easePoly,
        //             duration: 3000,
        //             keyFrames: [
        //                 new KeyFrame({xoff: 0, stage: 0}),
        //                 new KeyFrame({xoff: 0, rotate: 1440, color: '#A92921', stage: 100}),
        //             ]
        //         }),
        //     ]
    return groupManager
}