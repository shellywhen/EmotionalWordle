<template>
<div>
  <svg id="emotional-wordle-edit-svg"
             :height="styleScheme.height"
            :width="styleScheme.width"
            :viewBox="`0 0 ${styleScheme.width} ${styleScheme.height}`"
            preserveAspectRatio="xMidYMid meet"
            ></svg>
  <div
    class="canvas-container"
    :style="{ height: styleScheme.height + 'px', 'text-align': 'center' }"
  >
    <canvas id="emotional-wordle-canvas"></canvas>
    <!-- <canvas id="emotional-wordle-bg-canvas"></canvas> -->
  </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */

import { Vue } from "vue-class-component"
import { CloudManager } from "@/assets/cloud"
import { Dataset, Mode, Style, Word } from '@/assets/types'
import * as ColorPreset from "@/assets/color-preset"
import * as d3 from "d3-fetch"


export default class ShakingView extends Vue {
  public wordleData: Word[] = []
  public collection: Dataset[] = []
  public fileReader = new FileReader()
  public uploadFilename: string = ""
  public animationModes: Array<Mode> = [Mode.bubble, Mode.colorful, Mode.chill, Mode.glisten, Mode.electric]
  public animationMode: Mode = Mode.bubble
  public fontFamily = 'NotoSans'
  public fontStyle = 'normal'
  public fontWeight = 'normal'
  public colorSchemes = ['red', 'black', 'Viridis', 'Plasma', 'rainbow']
  public colorScheme = 'red'
  public easeTypes = ['Cubic', 'ElasticIn', 'ElasticOut', 'BounceIn', 'BounceOut', 'BounceInOut']
  public easeType = 'ElasticIn'
  public strokeWidth = '2px'
  public rotation: number = 0
  public duration: number = 10000
  public cloudManager: CloudManager | undefined
  public customColor = "#000000"
  public presetColors = ColorPreset.rainbow
  public bgAnimator: any
  get styleScheme ():Style {
    return {
      colorScheme: this.colorScheme,
      fontStyle: this.fontStyle,
      fontWeight: this.fontWeight,
      fontFamily: this.fontFamily,
      strokeWidth: this.strokeWidth,
      rotation: this.rotation,
      height: 520,
      width: 800
    }
  }

  mounted() {
    let url = './dataset/layout/layout_xmas.json'
    d3.json(url).then((d: any) => {
        this.wordleData = d as Word[]
        this.cloudManager = new CloudManager(this.wordleData, 
                                            this.styleScheme, 
                                            this.animationMode,
                                            'emotional-wordle-svg',
                                            'emotional-wordle-canvas',
                                            this.bgAnimator,
                                            true,
                                            false,
                                            this.duration
                                            )
      this.cloudManager.animator?.createGif()                 
      this.cloudManager.animator?.play()
      }, (err: any) => {
      console.log(err)
    })
    
  }
}

</script>
<style lang="scss" scoped>
@import "../assets/scss/_ui.scss";
// @keyframes float {
//   0% {
//     box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
//     transform: translatey(0px);
//   }
//   50% {
//     box-shadow: 0 25px 15px 0px rgba(0, 0, 0, 0.2);
//     transform: translatey(-20px);
//   }
//   100% {
//     box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
//     transform: translatey(0px);
//   }
// }
.text-canvas {
  stroke-width: 0;
  fill-opacity: 0;
  stroke: black;
  &.active {
    stroke-width: 1px;
     &.activate {
        stroke: orange;
      }
  }
}

</style>
