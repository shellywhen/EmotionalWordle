/* eslint-disable */
import * as d3Timer from 'd3-timer'
import * as d3Ease from 'd3-ease'
import * as d3Interpolate from 'd3-interpolate'
import * as Gif from "@/assets/gif/gif"
import { Word, Mode } from './cloud'

enum Direction {
    left, right
}

class Meta implements Word {
    public text: string
    public size: number
    public sx: number
    public tx: number
    public sy: number
    public ty: number
    public x: number
    public y: number
    public truex: number
    public truey: number
    public trues: number
    public truec: string
    public ss: number
    public ts: number
    public color: string
    public sc: string
    public tc: string
    public selected: boolean
    public order: number
    public frequency: number
    public direction: Direction
    public rotate: number
    constructor(word: Word, width: number, height: number) {
        this.text = word.text!
        this.size = word.size!
        this.tx = word.x!
        this.ty = word.y!
        this.truex = word.x!
        this.truey = word.y!
        this.trues = word.size!
        this.truec = 'black'
        this.sx = 0
        this.ts = word.size!
        this.ss = 0
        this.sy = 0 // height / 2 - word.size!
        this.x = this.sx
        this.y = this.sy
        this.color = 'black'
        this.sc = 'white'
        this.tc = 'black'
        this.selected = true // !!!!!!!!!!!!!!!!!
        this.order = 1 // !!!!!!!!!!!!!!!!!!!!!
        this.frequency = word.frequency
        this.direction = Direction.left
        this.rotate = word.rotate!
    }
    update(tx:number=1, ty:number=1, ts:number=1, tc:number=1) {
        this.x = this.sx + (this.tx - this.sx) * tx
        this.y = this.sy + (this.ty - this.sy) * ty
        this.size = this.ss + (this.ts - this.ss) * ts
        this.color = d3Interpolate.interpolate(this.sc, this.tc)(tc)
    }
    setframe(tx: number, ty: number, ts: number, tc: string) {
        this.tx = tx
        this.ty = ty
        this.ts = ts
        this.tc = tc
        this.sx = this.truex
        this.sy = this.truey
        this.ss = this.trues
        this.sc = this.truec
    }
}

class Animator {
    public timer?: d3Timer.Timer
    public plotHandler: any
    public ease: (elapse: number) => number
    public duration: number
    public data: Meta[]
    public gif: any
    public bgAnimator: Generator<any, void, any>
    public bgCanvas: any
    public mode: Mode = Mode.bubble
    public groupNum: number = 1
    constructor (data: Word[],
                 plotHandler: any,
                 duration: number = 5000,
                 bgAnimator: Generator<any, void, any>) {
        this.ease = getEaseType(plotHandler.styleSheet.easeType)
        this.data = data.map((v: Word) => new Meta(v, plotHandler.width, plotHandler.height))
        this.duration = duration
        this.plotHandler = plotHandler
        this.bgAnimator = bgAnimator
    }
    public update(field: string, value: any) {
        if (field === 'duration') this.duration = (value as number)
        if (field === 'ease') this.ease = getEaseType(value as string)
        if(field === 'mode') {
            this.timer?.stop()
            this.mode = value as Mode
            this.timer = this.play()
        }
    }
    public test() {
        this.data.forEach((v: Meta) => v.update(1,1,1,1))
        this.plotHandler.plotHoloTextOnCanvas(this.data)
        // this.plotHandler.plotOnSvg(this.data)
        this.timer = d3Timer.timer((elapsed: number) => {
            this.timer!.stop()
        })
        return this.timer
    }
    public playWithBackground() {
        this.data.forEach((v: Meta) => v.update(1,1,1,1))
        this.plotHandler.plotHoloTextOnCanvas(this.data)
        return this.playFramework(
            (animator: Animator, t: number) => {
                animator.bgAnimator.next()
            }, false)
    }
    public playLikeBubbles() {
        this.assignOrder('position-y', 15)
        this.data.forEach((v: Meta) => {
            v.sy = -this.plotHandler.height + v.ty - 0.5 * v.ts // this.plotHandler.height * 0.8 + v.ty
            v.ss = v.ts //> 20 ? v.ts*0.2 : v.ts * 0.5//Math.min(0.2 * v.ts, 15)
        })
        return this.playFramework(
            (animator: Animator, t: number) => {
                animator.data.forEach((word: Meta) => {
                    let time = Math.max(0, t - 0.1 * word.order /(this.groupNum))
                    word.update(1, this.ease(time), this.ease(time), 1)
                })
                animator.plotHandler.plotOnCanvas(animator.data)
            }, true)
    }
    public playLikeShaking() {
        let movement = [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
            [-1, 1],
            [1, -1],
            [0, 1],
            [-1, 0]
        ]
        let frames = movement.length
        let frameDuration = 1 / frames
        let flags = new Array(frames).fill(false)
        this.data.forEach((v: Meta) => v.update(1,1,1,1))
        this.assignOrder('random', 5)
        let step = 90
        return this.playFramework(
            (animator: Animator, t: number) => {
                for (let frame = 0; frame < frames; frame ++) {
                    if(t <= (frame + 1) / frames && t >= (frame) / frames) {
                     if(!flags[frame - 1]) {
                         animator.data.forEach((v: Meta) => {
                             v.setframe(v.truex + movement[frame][0] * step * v.trues/15,
                                        v.truey + movement[frame][1] * step * v.trues/15,
                                        v.trues,
                                        v.truec)
                         })
                         flags[frame-1] = true
                     }
                     animator.data.forEach((word: Meta) => {
                        let time = Math.max(0, t - 0.25 * word.order /(this.groupNum))
                        word.update(this.ease(time - frame/frames), this.ease(time - frame/frames), 1, 1)
                       })
                    animator.plotHandler.plotOnCanvas(animator.data)
                    break
                    }
                }
            }, false)
    }

    public play(generateGif: boolean=false) {
        if(this.mode === Mode.bubble) {
            return this.playLikeBubbles()(generateGif)
        }
        if(this.mode === Mode.colorful) {
            return this.playWithBackground()(generateGif)
        }
        if(this.mode === Mode.chill) {
            return this.playLikeShaking()(generateGif)
        }
    }
    public stop() {
        if(!this.timer) return
        this.timer.stop()
    }

    /**A framework to customize animation effects
    @param {(Animator, number):void} plotCanvasCallback corresponding function in each frame t
    @param {boolean} stopFlag whether it an infinite loop
    */
    public playFramework(plotCanvasCallback: any, stopFlag=true) {
        let self = this
        return function(generateGif: boolean=false) {
            const frames = 128 // #frames in the Gif
            let frameCnt = 0
            let cnt = 0
            if(self.timer) self.timer.stop()
            let round = 0
            self.timer = d3Timer.timer((elapsed: number) => {
                cnt += 1
                const t = Math.min(1, elapsed / self.duration)
                if (generateGif && t > frameCnt / frames) {
                    frameCnt = Math.floor(frameCnt/frames) + 1
                    self.gif.addFrame(self.plotHandler.canvas, {copy: true,  delay: self.duration / frames});
                }
                plotCanvasCallback(self, t)
                if ( elapsed > self.duration) {
                    if( stopFlag ) {
                        if (generateGif) {
                            self.gif.render()               
                        }
                        self.timer!.stop()
                        plotCanvasCallback(self, 1)
                    }
                    else {
                        self.timer!.stop()
                        self.timer = self.play()
                    }
                }
             }, 0)
            return self.timer
        }
    }
    /**Generate Gif for a round
     * Reference: https://github.com/jnordberg/gif.js
    @param quality the sampling rate
    */
    public createGif() {
        this.gif = new Gif({
            quality: 5
        })  
        this.gif.on('finished', function(blob: any) {
            let link = document.createElement('a')
            link.setAttribute('target', '_blank')
            link.setAttribute('href', URL.createObjectURL(blob))
            link.setAttribute('download', "animation.gif")
            link.addEventListener('click', function() {
                this.remove()
            })
            link.click()
          })
        this.play(true)
    }

    /**Animate text elements by group.
    @param {string} type order assign strategy
    @param {number} groupNum Total number of groups
    */
    public assignOrder(type:string = 'random', groupNum: number = 5) {
        this.groupNum = groupNum
        let func: (v: Meta, idx: number)=>number
        if(type === 'unique') {
            func = (d: Meta, idx: number) => 1
        }
        else if(type === 'random') {
            func = (d: Meta, idx: number) => getRandomInt(0, groupNum - 1)
        }
        else if(type === 'position-y') {
            func = (d: Meta, idx: number) => {
                let height = this.plotHandler.height
                return Math.ceil(((d.ty + height / 2 )/height + 0.5)* groupNum)
                }
        }
        else if(type === 'position-x') {
            func = (d: Meta, idx: number) => {
                let width = this.plotHandler.width
                return Math.ceil(((d.x + width / 2 )/width + 0.5)* groupNum)
            }
        }
        else if(type === 'size') {
            func = (d: Meta, idx: number) => {
                return Math.ceil(idx*groupNum/this.data.length + 0.5)
            }
        }
        else {
            console.log('wrong!')
        }
        this.data.forEach((v: Meta, idx: number) => { v.order = func(v, idx) })
    }
}

function getEaseType(idx: string) {
    switch(idx) {
        case 'Cubic':
            return d3Ease.easeCubic
        case 'ElasticIn':
            return d3Ease.easeElasticIn
        case 'ElasticOut':
            return d3Ease.easeElasticOut
        case 'BounceIn':
            return d3Ease.easeBounceIn
        case 'BounceOut':
            return d3Ease.easeBounceOut
        case 'BounceInOut':
            return d3Ease.easeBounceInOut
        default:
            return d3Ease.easeCubic
    }
}

function getBubbleInitialLayout(words: Word[], width: number, height: number) {
    let data = words.map((word: Word) => new Meta(word, width, height))
    return data
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export {
    Meta,
    Animator
}