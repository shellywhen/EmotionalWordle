/* eslint-disable */
/**
 * doc comment for color-preset.ts.
 * default variables for color.
 * @packageDocumentation
 * Reference: : http://dx.doi.org/10.1145/3025453.3026041
 */
export const rainbow = [ 
'rgba(244, 67, 54, 1)',
'rgba(233, 30, 99, 0.95)',
'rgba(156, 39, 176, 0.9)',
'rgba(103, 58, 183, 0.85)',
'rgba(63, 81, 181, 0.8)',
'rgba(33, 150, 243, 0.75)',
'rgba(3, 169, 244, 0.7)',
'rgba(0, 188, 212, 0.7)',
'rgba(0, 150, 136, 0.75)',
'rgba(76, 175, 80, 0.8)',
'rgba(139, 195, 74, 0.85)',
'rgba(205, 220, 57, 0.9)',
'rgba(255, 235, 59, 0.95)',
'rgba(255, 193, 7, 1)'
]

export const calm = [
    '#6E746A',
    '#478F8D',
    '#00BEB9',
    '#83B3E3',
    '#AAD2E0',
    '#A2CCC0',
    '#ADD9A1',
    '#DDD8BA',
    '#EAC793',
    '#F1D9CA',
    '#DFB0C7',
    '#A857AA',
    '#9796BB',
    '#D4D4D4'
]

export const negative = [
    '#D8D8D8',
    '#899390',
    '#6E746A',
    '#3C3C3C',
    '#9796BB',
    '#30355F',
    '#335671',
    '#51692B',
    '#69301D',
    '#845145',
    '#920000',
    '#C91E11'
]

export const positive = [
    '#F9468C',
    '#F80F19',
    '#FF8000',
    '#FFAB1C',
    '#F3D027',
    '#23BF0C',
    '#5A922D',
    '#B7DE55',
    '#8AD2F1',
    '#32BFF2',
    '#00BEB9'
]

export const exciting = [
    '#AAD2E0',
    '#478F8D',
    '#23BF0C',
    '#F3D027',
    '#FFAB1C',
    '#FF8000',
    '#F80F19',
    '#920000',
    '#C91E11',
    '#F9468C',
    '#863E85',
    '#6D6EB9',
    '#423FA8',
    '#0073AA'
]

export const disturbing = [
    '#30355F',
    '#3C3C3C',
    '#899390',
    '#845145',
    '#69301D',
    '#920000',
    '#C91E11',
    '#F80F19',
    '#FF8000',
    '#F3D027',
    '#23BF0C'
]

export const serious = [
    '#899390',
    '#335671',
    '#116160',
    '#A5B34B',
    '#5A922D',
    '#1B4C79',
    '#30355F',
    '#2F2F2F',
    '#3C3C3C',
    '#8A594E',
    '#69301D',
    '#920000',
    '#F80F19',
]

export const playful = [
    '#A857AA',
    '#F9468C',
    '#F80F19',
    '#FF8000',
    '#FFAB1C',
    '#F3D027',
    '#25C00F',
    '#00BEB9',
    '#32BFF2'
]

export const trustworthy = [
    '#FF8000',
    '#FFAB1C',
    '#F3D027',
    '#B7DE55',
    '#23BF0C',
    '#ADD9A1',
    '#A2CCC0',
    '#478F8D',
    '#96D7F2',
    '#32BFF2',
    '#0572CD',
    '#9796BB'
]

export const black = ['#000000']

export const gray = ['#6c757d']

export const red = ['#F80F19']

export let getColor = function (name: string) {
    console.log(name, '???')
    if (name == "trustworthy") return trustworthy
    if (name == "positive") return positive
    if (name == "negative") return negative
    if (name == "calm") return calm
    if (name == "black") return black
    if (name == "gray") return gray
    if (name == "red") return red
    if (name == "playful") return playful
    if (name == "rainbow") return rainbow
    if (name == "serious") return serious
    if (name == "disturbing") return disturbing
    return calm
}