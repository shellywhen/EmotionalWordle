<template>
  <div class="interface">
    <div class="wrapper row">
      <div class="parameters row col-2">
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
        <div class="slider-wrapper">
          <Slider
            max="8000"
            min="1000"
            init="5000"
            step="500"
            label="Speed"
            className="duration"
            :callback="durationCallback"
          ></Slider>
        </div>
        <div class="slider-wrapper">
          <Slider
            label="f: widh"
            className="widh"
            :callback="widhCallback"
          ></Slider>
        </div>
        <div class="slider-wrapper">
          <Slider
            label="f: wght"
            className="wght"
            :callback="wghtCallback"
          ></Slider>
        </div>
        <div class="slider-wrapper">
          <Slider
            label="f: ital"
            className="ital"
            :callback="italCallback"
          ></Slider>
        </div>
      </div>
      <div class="col-8">
        <svg
          id="emo-wordle"
          :height="styleScheme.height"
          :width="styleScheme.width"
        ></svg>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Options, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { Word, Mode, CloudManager, Style } from "@/assets/cloud";
import { createBackground, fragment } from "@/assets/gl-helper";
import * as ColorPreset from "@/assets/color-preset";
import { createColorPicker } from "@/assets/color-picker";
import Slider from "@/components/ui/Slider.vue";
import "bootstrap";
import * as d3 from "d3";
import * as dsv from "d3-dsv";
import { FontConfig } from "@/assets/variable-font";
import { PlotHandler } from "@/assets/plot";
import { WordleAnimator } from "@/assets/animator";
interface Dataset {
  data: Word[]
  tag: string
}

@Options({
  components: {
    Slider
  }
})

export default class Variable extends Vue {
  public wordleData: Dataset | null = null
  public collection: Dataset[] = []
  public fileReader = new FileReader()
  public uploadFilename: string = ""
  public font = new FontConfig()
  public colorSchemes = ['black', 'black', 'Viridis', 'Plasma', 'rainbow']
  public colorScheme = 'red'
  public easeTypes = ['Cubic', 'ElasticIn', 'ElasticOut', 'BounceIn', 'BounceOut', 'BounceInOut']
  public easeType = 'ElasticIn'
  public strokeWidth = '2px'
  public rotation: number = 0
  public duration: number = 5000
  public customColor = "#000000"
  public presetColors = ColorPreset.rainbow
  public animator: null | WordleAnimator = null
  get styleScheme() {
    return {
      colorScheme: 'black',
      fontStyle: 'regular',
      fontWeight: '400',
      fontFamily: this.font.name,
      strokeWidth: '2px',
      rotation: 0,
      height: 520,
      width: 800,
      font: this.font
    } 
  }
  public plotHandler: undefined | PlotHandler = undefined
  mounted() {
    this.plotHandler = new PlotHandler('', 'emo-wordle', this.styleScheme, false)
    this.fileReader.addEventListener("load", this.parseFile, false)
    //let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep", "creep_emoji", "creep_mask"]
    let fileNames = ["creep"]
    let tasks = fileNames.map((tag: string) => d3.json(`./dataset/layout/layout_${tag}.json`))
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
    //createColorPicker('black', this.presetColors, '.color-picker')
  }
  @Watch('wordleData')
  wordleDataChanged() {
    if (!this.wordleData) return  
    let animator = new WordleAnimator({
      words: assignColor(this.wordleData.data),
      duration: this.duration,
      plotHandler: this.plotHandler
    })
    animator.play()
  }
  @Watch('easeType')
  easeTypeChanged() {
  }
  wghtCallback(v: number) {
     let val = this.font.weightRange[0] + v * (this.font.weightRange[0])
     this.font.setValWithRatio('weight', v)
  }
  italCallback(v: number) {
      this.font.setValWithRatio('italic', v)
  }
  widhCallback(v: number) {
     this.font.setValWithRatio('width', v)
  }
  durationCallback(v: number) {
      this.duration = v
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
    if(!this.animator) return
    this.animator.stop()
  }
  play() {
    let ele = "#playButton"
    let state = !d3.select(ele).classed("active")
    d3.select(ele).classed("active", state)
    d3.select("#pauseButton").classed("active", !state)
    if(!this.animator) return
    this.animator.stop()
  }
  replay() {
    if(!this.animator) return
    this.animator.play()
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
  downloadGif() {
    if(!this.animator) return
    this.animator.createGif().play(true)
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
function assignColor(words: Word[]) {
    words.forEach((word: Word, idx: number) => {
        word.color = 'black'
    })
    return words
}
</script>
<style lang="scss"></style>
