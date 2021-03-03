/* eslint-disable */

/** Constants for Variable.vue
 */
import * as ColorPreset from "@/assets/color-preset";

export class FontConfig {
    public name: string = 'Flexa'
    public widthRange: [number, number] = [0, 200]
    public italicRange: [number, number] = [0, 200]
    public weightRange: [number, number] = [0, 700]
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
        let number = extent * (range[1] - range[0]) + range[0]
        this.update({[type]: extent})
    }
    getCss() {
        return `"wdth" ${this.width}, "wght" ${this.weight}, "ital" ${this.italic}`
    }
}



 