<template>
  <div class="playground">
    <div class="row">
      <div class="col-2">
        <div class="wrapper">
          <p class="config-tag">Dataset</p>
          <select name="dataset" id="dataset" v-model="wordleData">
            <option
              v-for="item in collection"
              v-bind:key="item.tag"
              v-bind:value="item"
            >
              {{ item.tag }}
            </option>
          </select>
        </div>
        <div class="wrapper">
          <label class="form-label" for="wordleUpload">
            Upload <span class="code">csv</span>
          </label>
          <button class="button" @click="openFile">
            <i class="fas fa-cloud-upload-alt light"></i>
            <span class="code">&nbsp;&nbsp;csv</span>
          </button>
          <input
            type="file"
            class="form-control-sm"
            id="wordleUpload"
            name="wordleUpload"
            accept="text/txt"
            @change="handleUpload($event)"
          />
        </div>
        <br />
        <div class="wrapper">
          <Slider
            max="45"
            min="-45"
            init="0"
            step="5"
            label="Rotate"
            className="rotate"
            showValue="true"
            :callback="rotateCallback"
          ></Slider>
        </div>
        <div class="wrapper">
          <p class="config-tag">Font Family</p>
          <select name="fontFamily" id="fontFamily" v-model="fontFamily">
            <option
              v-for="item in fontFamilies"
              :data-tag="item"
              v-bind:key="item"
              v-bind:value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <div class="wrapper">
          <p class="config-tag">Font Weight</p>
          <select name="fontWeight" id="fontWeight" v-model="fontWeight">
            <option
              v-for="item in fontWeights"
              :data-tag="item"
              v-bind:key="item"
              v-bind:value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <div class="wrapper">
          <p class="config-tag">Color Scheme</p>
          <select name="ColorScheme" id="ColorScheme" v-model="colorScheme">
            <option
              v-for="item in colorSchemes"
              :data-tag="item"
              v-bind:key="item"
              v-bind:value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <div class="wrapper">
          <p class="config-tag">Spiral Type</p>
          <select name="spiralType" id="spiralType" v-model="spiralType">
            <option
              v-for="item in spiralTypes"
              :data-tag="item"
              v-bind:key="item"
              v-bind:value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <div class="wrapper">
          <label class="form-label" for="wordleLayoutDownload">
            Download <span class="code">json</span>
          </label>
          <button
            class="button"
            @click="downloadJson"
            id="wordleLayoutDownload"
          >
            <i class="fas fa-download light"></i>
            <span class="code">&nbsp;&nbsp;json</span>
          </button>
        </div>
      </div>
      <div class="col-8 major">
        <div>
          <div class="annotation-wrapper">
            <svg id="emotional-wordle-edit-svg"></svg>
            <div class="text-style-config">
              <div class="color-picker"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Options, Vue } from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import { Word, Mode, CloudManager, Style } from "@/assets/cloud"
import { createBackground, fragment } from "@/assets/gl-helper"
import * as ColorPreset from "@/assets/color-preset"
import { createColorPicker } from "@/assets/color-picker"
import Slider from "@/components/ui/Slider.vue"
import "bootstrap"
import * as d3 from "d3"
import * as dsv from "d3-dsv"
interface Dataset {
  data: Word[]
  tag: string
}

@Options({
  components: {
    Slider
  }
})
export default class Manual extends Vue {
  public wordleData: Dataset | null = null
  public collection: Dataset[] = []
  public fileReader = new FileReader()
  public uploadFilename: string = ""
  public animationModes: Array<Mode> = [Mode.bubble, Mode.colorful, Mode.chill, Mode.glisten, Mode.electric]
  public animationMode: Mode = Mode.bubble
  public fontFamilies = ['NotoSans', 'serif', 'Arial', 'fantasy', 'sans serif', 'monospace']
  public fontFamily = 'NotoSans'
  public fontStyles = ['normal', 'oblique', 'italic']
  public fontStyle = 'normal'
  public fontWeights = ['normal', 'bold']
  public fontWeight = 'normal'
  public colorSchemes = ['red', 'black', 'Viridis', 'Plasma', 'rainbow']
  public colorScheme = 'black'
  public easeTypes = ['Cubic', 'ElasticIn', 'ElasticOut', 'BounceIn', 'BounceOut', 'BounceInOut']
  public easeType = 'ElasticIn'
  public strokeWidth = '2px'
  public rotation: number = 0
  public duration: number = 5000
  public spiralTypes = ['rectangular', 'archimedean']
  public spiralType = 'rectangular'
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
      spiralType: this.spiralType,
      height: 520,
      width: 800
    }
  }
  created() {
  }
  mounted() {
    this.fileReader.addEventListener("load", this.parseFile, false)
    let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep"]
    //let fileNames = ["creep"]
    let tasks = fileNames.map((tag: string) =>
        d3.csv(`dataset/${tag}.csv`, (v: any) => {
          return {
            frequency: parseFloat(v.frequency),
            text: v.text
          }
        })
      )
    Promise.all(tasks).then((dataList: any) => {
      this.collection = dataList.map((data: Word[], idx: number) => {
        return {
          tag: fileNames[idx],
          data: data
        }
      })
      this.wordleData = this.collection[0]
      d3.select('#dataset')
        .selectAll('option')
        .property('selected', 'false')
        .filter((v: any) => v['data-tag']==this.collection[0].tag)
        .property('selected', true)
    })
    createColorPicker('black', this.presetColors, '.color-picker')
  }
  @Watch('wordleData')
  wordleDataChanged() {
    if (!this.wordleData) return
    this.cloudManager = new CloudManager(this.wordleData!.data, 
                                         this.styleScheme, 
                                         this.animationMode,
                                         'emotional-wordle-edit-svg',
                                         'emotional-wordle-canvas',
                                         this.bgAnimator,
                                         false)
  }
  @Watch('styleScheme')
  schemeChanged() {
    this.wordleDataChanged()
  }
  @Watch('animationMode')
  animationModeChanged() {
    if( this.animationMode === Mode.bubble ) this.easeType = 'elasticIn'
    d3.select('#emotional-wordle-bg-canvas')
      .style('visibility', this.animationMode === Mode.chill? 'visible': 'hidden')
    this.cloudManager!.updateMode(this.animationMode)
  }
  rotateCallback(v: number) {
    this.rotation = v
  }
  handleUpload(event: any) {
    let file = event.target.files[0]
    if (!file) return
    this.fileReader.readAsText(file)
    this.uploadFilename = file.name.split('.csv')[0]
    this.collection.forEach((dataset: Dataset) => {
      if (dataset.tag == this.uploadFilename) {
        this.uploadFilename += Math.random().toString() + Math.random.toString()
      }
    })
  }
  pause() {
    let ele = "#pauseButton"
    let state = !d3.select(ele).classed("active")
    d3.select(ele).classed("active", state)
    d3.select("#playButton").classed("active", !state)
    if(!this.cloudManager) return
    this.cloudManager!.stop()
  }
  play() {
    let ele = "#playButton"
    let state = !d3.select(ele).classed("active")
    d3.select(ele).classed("active", state)
    d3.select("#pauseButton").classed("active", !state)
    if(!this.cloudManager) return
    this.cloudManager!.play(this.duration)
  }
  replay() {
    if(!this.cloudManager) return
    this.cloudManager!.play(this.duration)
  }
  parseFile() {
    let res = this.fileReader.result
    if (!res || typeof res !== 'string') return
    let data = dsv.csvParse(res, (item: any) => {
        return {
          frequency: parseFloat(item.frequency),
          text: item.text
        }
      })
    let dataset = {
      data: data,
      tag: this.uploadFilename
    }
    this.collection.push(dataset)
    d3.select('#dataset').property('value', dataset)
    this.wordleData = dataset
  }
  updateColor() {
    console.log(this.customColor)
  }
  downloadGif() {
    if(!this.cloudManager) return
    this.cloudManager.animator!.createGif()
  }
  downloadJson() {
    if (!this.wordleData) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL( new Blob([JSON.stringify(this.wordleData.data)], { type:`text/json` }) );
    a.download = `layout_${this.wordleData.tag}.json`
    a.click()
    a.remove()
  }
  openFile() {
    document.getElementById("wordleUpload")!.click()
  }
}
</script>
<style lang="scss">
@import "../assets/scss/_ui.scss";
@import "../assets/scss/_frames.scss";
$highlightColor: #f96760;
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
.rotationHandler {
    fill: red;
    visibility: hidden;
    &.active {
      visibility: visible;
    }
}
.annotation-wrapper {
  position: relative;
  .text-style-config {
    position: absolute;
    &.active {
      visibility: visible;
    }
  }
}

@keyframes float {
	0% {
		box-shadow: 0 5px 15px 0px rgba(0,0,0,0.6);
		transform: translatey(0px);
	}
	50% {
		box-shadow: 0 25px 15px 0px rgba(0,0,0,0.2);
		transform: translatey(-20px);
	}
	100% {
		box-shadow: 0 5px 15px 0px rgba(0,0,0,0.6);
		transform: translatey(0px);
	}
}
// text {
//    animation: bop 10s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards infinite
//       alternate;
// }


</style>
