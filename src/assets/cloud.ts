/* eslint-disable */
/**
 * doc comment for cloud.ts
 * control the layout for words based on their size and font
 * @packageDocumentation
 */
import cloudGenerator from 'd3-cloud'
import * as scale from 'd3-scale'
import { PlotHandler } from './plot'
import { WordleAnimator } from './animator'
import { Word, Style, Mode } from "@/assets/types"

class CloudManager {
    public canvasHandler: PlotHandler
    // public animator: Animator | undefined
    public animator: WordleAnimator | undefined
    constructor(data: Word[],
                styleSheet: Style,
                mode: Mode = Mode.bubble,
                svgid: string = 'emotional-wordle-svg', 
                canvasid: string = 'emotional-wordle-canvas',
                bgAnimator: Generator<any, void, any>,
                loadCanvasFlag: boolean = true,
                loadSvgFlag: boolean = true,
                duration: number = 2000
                ) {
        this.canvasHandler = new PlotHandler(canvasid, svgid, styleSheet, loadCanvasFlag)
        let self = this
        // console.log(data, 'cloud data')
        if(loadCanvasFlag) {
            self.animator = new WordleAnimator({
                words: assignColor(data), 
                plotHandler: self.canvasHandler, 
                duration: duration
            })
            // self.animator = new Animator(data, self.canvasHandler, duration, bgAnimator)
            // self.animator.play()
        }
        else if (loadSvgFlag) {
            testCloud(data, styleSheet)
            .on('end', function (words: cloudGenerator.Word[]) {
                let finalData = words as Word[]
                  self.canvasHandler.plotOnSvgWithConfig(finalData)
            })
        }
    }
    public play(duration: number=2000) {
        if (!this.animator) return
        this.animator!.update('duration', duration)
        this.animator!.stop()
        this.animator!.play()
        return this
    }
    public stop() {
        this.animator!.stop()
        return this
    }
    public updateMode(mode: Mode) {
        this.animator!.update('mode', mode)
    }
}
let testCloud = function (data: Word[], styleSheet: Style) {
    let width = styleSheet.width
    let height = styleSheet.height
    let wordScale = scale.scaleLinear()
        .domain([0, 75])  // !!!!!!!!!!!!!!!!!!!!!!!
        .range([10, 120]) // !!!!!!!!!!!!!!!!!!!!!!!
    return cloudGenerator()
        .size([width, height])
        .timeInterval(200)
        .words(data)
        .rotate(styleSheet.rotation!) //function(d) { return 0 }
        .fontSize((d: cloudGenerator.Word, idx: number) => {
            let word = d as Word
            return wordScale(word.frequency)
        })
        .font(styleSheet.fontFamily!)
        .fontStyle(styleSheet.fontStyle!)
        .fontWeight(styleSheet.fontWeight!)
        .text((d: cloudGenerator.Word, idx: number)=> {
            return d.text || ''
        })
        .spiral(styleSheet.spiralType!) // 'archimedean' or 'rectangular'
        .start()
}

function assignColor(words: Word[]) {
    words.forEach((word: Word, idx: number) => {
        word.color = 'black'
    })
    return words
}

export {
    CloudManager
}
