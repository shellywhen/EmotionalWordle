/* eslint-disable */
/**
 * doc comment for animator.ts
 * @remarks 
 * the latest design for animation unit
 * the logic is to use Animator to control GroupManager
 * @packageDocumentation
 */
import * as d3Ease from 'd3-ease'
import { Mode, Word } from './cloud'

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
     public scale: number = 0
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
     public ease: (a:number)=>(number) = d3Ease.easeCubic
     public words: Array<Word> = []
     constructor(configs: Partial<GroupManager>) {
         Object.assign(this, configs)   
     }
     public play() {

     }
     public stop() {

     }
 }

 /** obatin animating frames and control the groups */
 class WordleAnimator {
     public words: Array<Word>=[]
     public duration: number = 1000
     public groups: Array<GroupManager>|undefined
     public divideGroup(mode: GroupingMode, groupNum: number) {
        let func: (v: Meta, idx: number)=>number
        if(mode === GroupingMode.random) {
            func = (d: Meta, idx: number) => getRandomInt(0, groupNum - 1)
        }
        else if(mode === GroupingMode.y) {
            func = (d: Meta, idx: number) => {
                let height = this.plotHandler.height
                return Math.ceil(((d.ty + height / 2 )/height + 0.5)* groupNum)
                }
        }
        else if(mode === GroupingMode.x) {
            func = (d: Meta, idx: number) => {
                let width = this.plotHandler.width
                return Math.ceil(((d.x + width / 2 )/width + 0.5)* groupNum)
            }
        }
        else if(mode === GroupingMode.xy) {
            func = (d: Meta, idx: number) => {
                return Math.ceil(idx*groupNum/this.data.length + 0.5)
            }
        }
        else {
            console.log('wrong!')
        }
        this.data.forEach((v: Meta, idx: number) => { v.order = func(v, idx) })



     }
     public play() {

     }
     public stop() {

     }
 }

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}