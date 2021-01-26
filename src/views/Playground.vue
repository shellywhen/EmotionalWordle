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
            max="8000"
            min="1000"
            init="5000"
            step="500"
            label="Speed"
            className="speed"
            :callback="speedCallback"
          ></Slider>
        </div>
        <div class="wrapper">
          <div class="config-radio">
            <div v-for="item in animationModes" :key="item">
              <input
                type="radio"
                :id="'mode-' + item"
                :value="item"
                v-model="animationMode"
              />
              <label :for="'mode-' + item">
                {{ item }}
              </label>
            </div>
          </div>
        </div>
        <div class="wrapper-mid row">
          <div class="col-4">
            <i
              id="pauseButton"
              @click="pause()"
              class="fas fa-pause-circle lg"
            ></i>
          </div>
          <div class="col-4">
            <i
              id="playButton"
              @click="play()"
              class="fas fa-play-circle active lg"
            ></i>
          </div>
          <div class="col-4">
            <i
              id="replayButton"
              @click="replay()"
              class="fas fa-arrow-circle-left lg"
            ></i>
          </div>
          <!-- <div class="col"></div> -->
        </div>
        <br />
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
          <p class="config-tag">Transition Mode</p>
          <select name="EaseType" id="easeType" v-model="easeType">
            <option
              v-for="item in easeTypes"
              :data-tag="item"
              v-bind:key="item"
              v-bind:value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <br />
        <div class="wrapper">
          <label class="form-label" for="wordleDownload">
            Download <span class="code">gif</span>
          </label>
          <button class="button" @click="downloadGif" id="wordleDownload">
            <i class="fas fa-download light"></i>
            <span class="code">&nbsp;&nbsp;gif</span>
          </button>
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
        <div
          class="canvas-container"
          :style="{ height: styleScheme.height + 'px' }"
        >
          <canvas id="emotional-wordle-canvas"></canvas>
          <canvas id="emotional-wordle-bg-canvas"></canvas>
       </div>

        <div>
          <div id="annotation-wrapper">
            <svg id="emotional-wordle-svg"></svg>
            <div id="text-style-config">
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
export default class Playground extends Vue {
  public wordleData: Dataset | null = null
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
  public duration: number = 5000
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
  created() {
  }
  mounted() {
    // test function only
    this.testFunc()
    this.fileReader.addEventListener("load", this.parseFile, false)
    let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep", "creep_emoji", "creep_mask"]
    //let fileNames = ["creep"]
    let tasks = fileNames.map((tag: string) => d3.json(`./dataset/layout/layout_${tag}.json`))
    Promise.all(tasks).then((dataList: any) => {
      console.log("fuck", dataList)
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
    //createColorPicker('black', this.presetColors, '.color-picker')
  }
  @Watch('wordleData')
  wordleDataChanged() {
    if (!this.wordleData) return
    if(this.cloudManager) {
      this.cloudManager.stop()
    }
    this.cloudManager = new CloudManager(this.wordleData!.data, 
                                         this.styleScheme, 
                                         this.animationMode,
                                         'emotional-wordle-svg',
                                         'emotional-wordle-canvas',
                                         this.bgAnimator,
                                         true,
                                         false,
                                         this.duration
                                        )
  }
  @Watch('easeType')
  easeTypeChanged() {
    if(!this.cloudManager) return
    this.cloudManager.animator!.update('ease', this.easeType)
    this.cloudManager.animator!.play()
  }
  @Watch('styleScheme')
  schemeChanged() {
    this.wordleDataChanged()
  }
  @Watch('animationMode')
  animationModeChanged() {
    if( this.animationMode === Mode.bubble ) this.easeType = 'elasticIn'
    this.cloudManager!.updateMode(this.animationMode)
  }
  async testFunc() {
    // createBackground(`#emotional-wordle-bg-canvas`, this.styleScheme.width, this.styleScheme.height)
    await fragment(`#emotional-wordle-bg-canvas`, this.styleScheme.width, this.styleScheme.height)
      .then((v) => {
      this.bgAnimator = v
    })
    
  }
  speedCallback(v: number) {
    this.duration = v
    if(!this.cloudManager) return
    this.cloudManager!.play(this.duration)
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

<style lang="scss" scoped>
@import "../assets/scss/_ui.scss";
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
.canvas-container {
  position: relative;
  #emotional-wordle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    // background:url(https://i.gifer.com/Sngz.gif); 
    // background-size: 800px;
  }
  #emotional-wordle-bg-canvas {
    position: absolute;
    top: 0;
    left: 0;
    // visibility: hidden;
  }
}

</style>
