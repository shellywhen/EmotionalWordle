/* eslint-disable */
/**
 * doc comment for color-picker.ts.
 * create a color picker.
 * @packageDocumentation
 */
import Pickr from "@simonwep/pickr"
import { rainbow } from "@/assets/color-preset"
let swatches = rainbow
let createColorPicker = function (defaultColor: string, colorList:Array<string> = swatches, identifier: string = '.color-picker') {
    const pickr = Pickr.create({
        el: identifier,
        theme: 'nano',
        swatches: colorList,
        default: defaultColor,
        components: {
            // Main components
            preview: true,
            opacity: true,
            hue: true,
            // Input / output Options
            interaction: {
                hex: true,
                rgba: true,
                hsla: true,
                hsva: true,
                cmyk: true,
                input: true,
                clear: true,
                save: true
            }
        }
    })
}


export {
    createColorPicker
}