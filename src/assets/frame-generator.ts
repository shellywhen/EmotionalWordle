/* eslint-disable */
/**
 * doc comment for frame-generator.ts
 * @remarks 
 * Automatically generate keyframe allocation
 * @packageDocumentation
 */

 import { KeyFrame } from './animator'
 import * as d3 from 'd3-random'


 let shake = function () {
    let config = []
    for (let groupid = 0; groupid < 3; groupid ++ ) {
        let framenum = d3.randomInt(5, 10)()
        let animation = []
        for (let frameid = 0; frameid < framenum; frameid ++ ) {
            animation.push(new KeyFrame({
                xoff: d3.randomInt(-5, 6)(),
                yoff: d3.randomInt(-5, -6)()
            }))
        }
        config.push(animation)
    }
   return config
 }