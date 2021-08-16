<template>
<<<<<<< HEAD
  <!-- <h1>Playground</h1> -->
  <div class="row">
    <div class="config-panel col-2">
      <div class="wrapper">
        <span class="config-tag">Dataset</span>
        <div class="wrapper">
=======
  <div class="static">
    <div class="row">
      <div class="col-2">
        <div class="wrapper">
          <span class="config-tag">Dataset</span>
          <div class="wrapper">
          
>>>>>>> master
          <label class="form-label" for="wordleUpload">
            Upload <span class="code">CSV</span>
          </label>
          <button class="button" @click="openFile">
            <i class="fas fa-cloud-upload-alt light"></i>
            <span class="code">&nbsp;&nbsp;CSV</span>
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
<<<<<<< HEAD
        <select name="emordle-dataset" id="dataset" v-model="wordleData">
          <option
            v-for="item in collection"
            v-bind:key="item.tag"
            v-bind:value="item"
          >
            {{ item.tag }}
          </option>
        </select>
      </div>
      <br />
      <div class="wrapper">
        <span class="config-tag">Color Scheme</span>
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
        <span class="config-tag">Font</span>
        <select name="FontFamily" id="FontFamily" v-model="fontFamily" :style="{ 'font-family': fontFamily }">
          <option
            v-for="item in fontFamilies"
            :data-tag="item"
            v-bind:key="item"
            v-bind:value="item"
            :style="{ 'font-family': item }"
          >
            {{ item }}
          </option>
        </select>
      </div>
      <br>
      <div class="wrapper">
      <span class="config-tag">Scheme</span>
      <select v-model="animationMode" @change="animationModeChange">
        <option
          v-for="item in animationModes"
          v-bind:key="item"
          v-bind:value="item"
        >
          {{ item }}
        </option>
      </select>
      </div>
      <div style="margin: 0 auto;">
        <Slider
          :init="speed"
          step="0.05"
          label="Speed"
          className="speed"
          :callback="speedCallback"
        ></Slider>
      </div>
      <div style="margin: 0 auto;">
        <Slider
          :init="entropy"
          step="0.05"
          label="Entropy"
          className="entropy"
          :callback="entropyCallback"
        ></Slider>
      </div>
      <br />
      <button @click="animate">animate</button>
      <div>
        <button @click="play">{{ "play" }}</button>
        <button @click="pause">{{ "pause" }}</button>
      </div>

      <!-- <button id="reverse">reverse</button> -->
      <button @click="restart">restart</button>
      <button @click="center">center</button>

      <br>
      <br>
      <button @click="downloadConfig"> <i class="fas fa-download light"></i> &nbsp; config</button>
      <button @click="downloadGIF"> <i class="fas fa-download light"></i> &nbsp; gif </button>

      <!-- <button @click="pressUpload">upload</button> -->
      <input type="file" accept=".csv" id="uploadId" @change="upload" hidden />
    </div>
    <div class="right-column col-8">
      <div id="emordle-container"></div>
      <svg id="emordle-test-svg-container"></svg>
      <div id="emordle-test-div-container"></div>
      <!-- <canvas id="emordle-test-canvas"></canvas> -->
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable prettier/prettier */
import anime, { AnimeInstance } from "animejs";
import { Options, Vue } from "vue-class-component";
import Slider from "@/components/ui/Slider.vue";
import * as d3 from "d3";
import { Watch } from "vue-property-decorator";
import { DraggableText, TextStyleConfig, Word } from "@/assets/types";
import * as Emordle from "@/assets/ts/animate";
import { getColor } from "@/assets/color-preset";
import {
  applyStyle,
  initDraggableText,
  getTextCenter,
  preprocessData,
  sanityChecknFill,
  testSize,
  getRandomInt,
  arrayToCSV
} from "@/assets/ts/utils";
import * as d3Dsv from "d3-dsv";
import {
  generateWordle,
  defaultStyleSheet,
  testOnSvg
} from "@/assets/ts/layout";
const WIDTH = defaultStyleSheet.width;
const HEIGHT = defaultStyleSheet.height;
const divId = "emordle-container";
const fileNames = ["thx", "2020_search", "xmas", "ingredients"];
const fileReader = new FileReader();
let uploadFilename = "a";
interface Dataset {
  data: TextStyleConfig[];
  tag: string;
}
@Options({
  components: {
    Slider
  }
})
export default class Tool extends Vue {
  public collection: Dataset[] = [];
  private draggableTexts: DraggableText[] = [];
  private wordleData: Dataset = { data: [], tag: "" };
  private animationInstances: AnimeInstance[] = [];
  private animationMode = "sad";
  private animationModes = [
    "still",
    "tender",
    "happy",
    "angry",
    "sad",
    "fearful",
    // "nervous"
  ];
  private colorScheme = "black";
  private colorSchemes = [
    "black",
    "red",
    "calm",
    "positive",
    "negative",
    "playful",
    "trustworthy",
    "rainbow",
    "exciting"
  ];
  private speed = 0.5;
  private entropy = 0.5;
  public fontFamilies = [
    "Arial",
    "NotoSans",
    "DancingScript",
    "RobotoMono",
    "Raleway",
    "Manrope",
    "Dreamwood",
    "GT Flexa"
  ];
  public fontFamily = "NotoSans";

  private readonly animeParams: anime.AnimeParams = {
    easing: "linear",
    // direction: "alternate",
    loop: true
  };
  initLayout() {
    const container = document.querySelector("#" + divId) as HTMLDivElement;
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    const test = document.querySelector(
      "#emordle-test-svg-container"
    ) as SVGElement;
    test.style.width = `${WIDTH}px`;
    test.style.height = `${HEIGHT}px`;
  }

  async mounted() {
    this.initLayout();
    fileReader.addEventListener("load", this.parseFile, false);
    await Promise.all(
      fileNames.map((f: string) => d3.json(`./dataset/layout/layout_${f}.json`))
    ).then((rawData: unknown[]) => {
      const data = rawData as Word[][];
      data.forEach((instance, idx: number) => {
        const style = (preprocessData(
          instance
        ) as unknown) as TextStyleConfig[];
        this.collection.push({ data: style, tag: fileNames[idx] });
      });
      this.wordleData = this.collection[0];
      d3.select("#emordle-dataset")
        .selectAll("option")
        .property("selected", false)
        .filter((v: any) => v["data-tag"] === this.collection[0].tag)
        .property("selected", true);
  
      this.initiateData(this.collection[0].data);
      // testOnSvg(data[0]);
    });
  }
  @Watch("wordleData")
  wordleDataChanged() {
    if (!this.wordleData) return;
    this.initiateData(this.wordleData.data);
  }
  @Watch("colorScheme")
  colorSchemeChanged() {
    const colorSet = getColor(this.colorScheme);
    const n = colorSet.length;
    this.draggableTexts.forEach(obj => {
      const c = colorSet[getRandomInt(0, n - 1)];
      obj.initData.color = c;
      obj.elem.style.color = c;
    });
  }
  @Watch("fontFamily")
  fontFamilyChanged() {
     this.draggableTexts.forEach(obj => {
      obj.initData.fontFamily = this.fontFamily;
      obj.elem.style.fontFamily = this.fontFamily;
    });
  }
  initiateData(data: TextStyleConfig[]) {
    d3.selectAll(".text-node").remove();
    this.draggableTexts = initDraggableText(data);
    this.colorSchemeChanged();
    this.pause();
    this.center();
    this.animate();
  }
  animate() {
    const animator = new Emordle.Animator(
      this.draggableTexts,
      this.entropy,
      this.speed,
      this.animationMode
    );
    this.animationInstances = animator.getAnimationScheme();
    this.play();
  }
  play() {
    this.animationInstances.forEach(i => i.play());
  }
  pause() {
    console.log('pause', this.animationInstances)
    this.animationInstances.forEach(i => i.pause());
  }

  center() {
    const center = getTextCenter(this.draggableTexts);
    const translateX = WIDTH / 2 - center.x;
    const translateY = HEIGHT / 2 - center.y;
    anime({
      targets: ".text-node",
      left: function(el: HTMLElement, i: number, l: number) {
        const offsetL = parseInt(el.style.left.split("px")[0]);
        return `${offsetL + translateX}px`;
      },
      top: function(el: HTMLElement, i: number, l: number) {
        const offsetT = parseInt(el.style.top.split("px")[0]);
        return `${offsetT + translateY}px`;
      }
    });
    // this.draggableTexts.forEach((draggableText) => {
    //   const toCenterLeft = WIDTH / 2 - this.midPoint.x;
    //   const toCenterTop = HEIGHT / 2 - this.midPoint.y;
    //   const offsetLeft = parseInt(draggableText.elem.style.left.split("px")[0]);
    //   const offsetTop = parseInt(draggableText.elem.style.top.split("px")[0]);
    //   draggableText.elem.style.left = `${
    //     offsetLeft + toCenterLeft - draggableText.elem.offsetWidth
    //   }px`;
    //   draggableText.elem.style.top = `${
    //     offsetTop + toCenterTop - draggableText.elem.offsetHeight
    //   }px`;
    // });
  }

  restart() {
    for (let index = 0; index < this.draggableTexts.length; index++) {
      const obj = this.draggableTexts[index].elem;
      const data = this.draggableTexts[index].initData;
      obj.removeAttribute("style");
      applyStyle(obj, data);
    }
    this.center();
  }

  speedCallback(v: string) {
    this.speed = parseFloat(v);
    this.animate();
  }
  entropyCallback(v: string) {
    this.entropy = parseFloat(v);
    this.animate();
  }

  animationModeChange(v: string) {
    // stops what ever animation
    this.animationInstances.forEach(i => {
      i.restart();
      i.pause();
    });
    this.animationInstances = [];
    this.restart();
    this.animate();
  }
  handleUpload(event: Event) {
    const target = event.target as HTMLFormElement;
    if (target === null) return;
    const files = target.files;
    if (files === null) return;
    const file = files[0];
    if (!file) return;
    fileReader.readAsText(file);
    uploadFilename = file.name
      .split(".")
      .slice(0, -1)
      .join(".");
    for (const dataset of this.collection) {
      if (dataset.tag === uploadFilename) {
        uploadFilename += Math.random()
          .toString()
          .substring(2, 4);
      }
    }
  }
  openFile() {
    document.getElementById("wordleUpload")?.click();
  }
  insertDataset(data: TextStyleConfig[]) {
    const dataset = {
      data: data,
      tag: uploadFilename
    };
    this.collection.push(dataset);
    d3.select("#emordle-dataset").property("value", dataset);
    this.draggableTexts = initDraggableText(dataset.data);
    this.colorSchemeChanged();
  }
  parseFile() {
    const res = fileReader.result;
    if (!res || typeof res !== "string") return;
    const data = (d3Dsv.csvParse(res, d3Dsv.autoType) as unknown) as Word[];
    const sanity = sanityChecknFill(data);
    if (!sanity.data) {
      alert(`Wrong Data Format! Please use 'Text' and 'Frequency'!`);
      return;
    }
    const configs: TextStyleConfig[] = [];
    if (sanity.compute) {
      generateWordle(data, { width: WIDTH, height: HEIGHT })
        .on("end", layout => {
          layout.forEach(w => {
            const config = {
              left: WIDTH / 2 + w.x!,
              top: HEIGHT / 2 + w.y!,
              fontFamily: this.fontFamily!,
              fontWeight: Number(w.weight!),
              fontSize: w.size!,
              color: "black",
              text: String(w.text),
              x: w.x!,
              y: w.y!,
              size: w.size!
            };
            const bbox = testSize(config);
            config.left -= bbox.width * 0.55;
            config.top -= w.size! * 1.2;
            configs.push(config);
          });
          testOnSvg((configs as unknown) as Word[]);
          this.insertDataset(configs);
          this.wordleData = this.collection[this.collection.length - 1];
        })
        .start();
    } else {
      this.insertDataset((data as unknown) as TextStyleConfig[]);
      this.wordleData = this.collection[this.collection.length - 1];
    }
  }
  downloadConfig() {
    const a = document.createElement("a");
    const jsonData =this.draggableTexts.map(v => v.initData);
    const csvData = arrayToCSV(jsonData);
    a.href = URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
    a.download = `layout_${this.wordleData.tag}.csv`;
    a.click();
    a.remove();
  }
  downloadGIF() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([new Blob()], { type: "gif" }));
    a.target = "_blank";
    a.download = `${this.wordleData.tag}_E${this.entropy.toFixed(3)}_S${this.speed.toFixed(3)}.csv`;
    a.click();
    a.remove();
    alert("NOT IMPLEMENTED!");
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/_ui.scss";
#emordle-container {
  border: 1px solid black;
  margin: 0 auto;
  position: relative;
}
.text-node {
  border-style: none;
  cursor: default;
  &.active {
    border: 0.5px dotted grey;
    border-radius: 5px;
    cursor: grab;
  }
}
.point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
}
.group-configs {
  visibility: hidden;
  display: none;
  // display: flex;
  &.active {
    visibility: visible;
    flex-wrap: wrap; /* | wrap-reverse;*/
    -webkit-flex-wrap: wrap;
  }
  .group-config {
    width: fit-content;
    margin: 1vh 1vw;
  }
}
.right-column {
  position: relative;
  #emordle-container {
    position: absolute;
    top: 0;
    left: 0;
    // div {
    //   opacity: 0.1;
    // }
  }
  #emordle-test-svg-container {
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
    // opacity: 0.8;
  }
  #emordle-test-div-container {
    position: absolute;
    top: 0;
    left: 0;
  }
}
=======
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
        
        <br />
        <!-- <div class="wrapper">
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
        </div> -->
        <div class="wrapper">
          <span class="config-tag">Font Family</span>
          <select
            name="fontFamily"
            id="fontFamily"
            v-model="fontFamily"
            :style="{ 'font-family': fontFamily }"
          >
            <option
              v-for="item in fontFamilies"
              :data-tag="item"
              v-bind:key="item"
              v-bind:value="item"
              :style="{ 'font-family': item }"
            >
              {{ item }}
            </option>
          </select>
        </div>
        <div class="wrapper">
          <span class="config-tag">Font Weight</span>
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
          <span class="config-tag">Color Scheme</span>
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
          <span class="config-tag">Spiral Type</span>
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
        <br />
        <div class="wrapper">
          <!-- <label class="form-label" for="wordleLayoutDownload">
            Download <span class="code">CSV</span>
          </label>
          <button type="button" class="button" @click="downloadGif">
            <i class="fas fa-film light"></i>
            <span class="code">&nbsp;&nbsp;GIF</span>
          </button> -->
          <button
            class="button"
            @click="downloadJson"
            id="wordleLayoutDownload"
          >
            <i class="fas fa-download light"></i>
            <span class="code">&nbsp;&nbsp;CSV</span>
          </button>
        </div>
      </div>
      <div class="col-8 major">
        <div>
          <div class="annotation-wrapper">
            <svg
              id="emotional-wordle-edit-svg"
              :height="styleScheme.height * zoomLevel"
              :width="styleScheme.width"
              :viewBox="
                `${0} ${(-styleScheme.height * (1 - zoomLevel)) / 2} ${
                  styleScheme.width
                } ${styleScheme.height}`
              "
              preserveAspectRatio="xMidYMid meet"
            ></svg>
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
import { CloudManager } from "@/assets/cloud"
import { createBackground, fragment } from "@/assets/gl-helper"
import * as ColorPreset from "@/assets/color-preset"
import { createColorPicker } from "@/assets/color-picker"
import Slider from "@/components/ui/Slider.vue"
import { FontConfig } from "@/assets/variable-font"
import "bootstrap"
import * as ColorPrest from "@/assets/color-preset"
import * as d3 from "d3"
import * as dsv from "d3-dsv"
import { Dataset, Word, Mode, Style } from "@/assets/types"
function randInt(min: number,max: number){
	var range = max - min;
	var rand = Math.floor(Math.random() * (range + 1));
	return min + rand;
}


@Options({
  components: {
    Slider,
  }
})
export default class Static extends Vue {
  public wordleData: Dataset | null = null
  public collection: Dataset[] = []
  public fileReader = new FileReader()
  public uploadFilename: string = ""
  public animationModes: Array<Mode> = [Mode.bubble, Mode.colorful, Mode.chill, Mode.glisten, Mode.electric]
  public animationMode: Mode = Mode.bubble
  public fontFamilies = ['Arial', 'NotoSans', 'DancingScript', 'RobotoMono', 'Raleway', 'Manrope', 'Dreamwood', 'GT Flexa']
  public fontFamily = 'NotoSans'
  public fontStyles = ['normal', 'oblique', 'italic']
  public fontStyle = 'normal'
  public fontWeights = ['normal', 200, 300, 800, 'bold']
  public fontWeight = 'normal'
  public colorSchemes = ['calm', 'positive', 'negative', 'playful', 'trustworthy', 'rainbow', 'exciting', 'black']
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
  public zoomLevel: number = 0.9

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
      width: 780,
      font: new FontConfig().update({'name': 'NotoSans'})
    }
  }
  created() {

  }
  mounted() {
    this.fileReader.addEventListener("load", this.parseFile, false)
    let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep", "ingredients"]
    // let fileNames = ["creep"]
    let tasks = fileNames.map((tag: string) =>
        d3.csv(`dataset/${tag}.csv`, (v: any) => {
          return {
            frequency: parseFloat(v.frequency),
            text: v.text
          }
        })
      )
    Promise.all([tasks[0]]).then((dataList: any) => {
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
    // createColorPicker('black', this.presetColors, '.color-picker')
  }
  @Watch('wordleData')
  wordleDataChanged() {
    if (!this.wordleData) return
    let color = ColorPreset.getColor(this.colorScheme)
    let colorLen = color.length
    this.wordleData.data.forEach((v: Word) => {
      v.color = color[randInt(0, colorLen-1)]
      v.weight = this.styleScheme.fontWeight;
    })
    this.cloudManager = new CloudManager(this.wordleData.data, 
                                         this.styleScheme, 
                                         this.animationMode,
                                         'emotional-wordle-edit-svg',
                                         'emotional-wordle-canvas',
                                         this.bgAnimator,
                                         false,
                                         true)
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
        this.uploadFilename += '_1'
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
  // downloadGif() {
  //   if(!this.cloudManager) return
  //   console.log(this.cloudManager);
  //   this.cloudManager.animator!.createGif()
  // }
  jsonToCsv(data: any[]) {
    let array = typeof data != 'object' ? JSON.parse(data) : data;
    let headers = ['frequency','text','color','weight','font','style','rotate','size','padding','x','y','width','height','xoff','yoff','x1','y1','x0','y0','hasText'];
    let csvStr = headers.join(',') + "\n";

    array.forEach((element:any) => {

      for(let header of headers) {
        const d = element[header];
        csvStr += d == undefined 
          ? ','
          : d + ','
        }
        csvStr = csvStr.slice(0,-1);
        csvStr += '\n'
      })
    return csvStr;
  }
  downloadJson() {
    if (!this.wordleData) return
    const a = document.createElement('a');
    const jsonData = this.wordleData.data;
    const csvData = this.jsonToCsv(jsonData);
    a.href = URL.createObjectURL( new Blob([csvData], {type: 'text/csv'}) );
    a.download = `layout_${this.wordleData.tag}.csv`
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


>>>>>>> master
</style>
