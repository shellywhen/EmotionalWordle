/* eslint-disable */

/** Constants for Variable.vue
 */
import * as ColorPreset from "@/assets/color-preset";

export class FontConfig {
    public name: string = 'GT Flexa'
    public widthRange: [number, number] = [45, 65] //[0, 200]
    public italicRange: [number, number] = [0, 200] //[0, 200]
    public weightRange: [number, number] = [120, 700] //[0, 700]
    public width: number = 100
    public weight: number = 350
    public italic: number = 100
    constructor() {
    }
    update(configs: Partial<FontConfig>) {
        Object.assign(this, configs)
    }
    setValWithRatio(type: string, extent: number) {
        let range = [0, 0]
        if(type == 'width') range = this.widthRange
        else if(type == 'weight') range = this.weightRange
        else if(type == 'italic') range = this.italicRange
        let val = extent * (range[1] - range[0]) + range[0]
        this.update({[type]: val})
    }
    getCss() {
        return `"wdth" ${Math.ceil(this.width)}, "wght" ${Math.ceil(this.weight)}, "ital" ${Math.ceil(this.italic)}`
    }
}



 