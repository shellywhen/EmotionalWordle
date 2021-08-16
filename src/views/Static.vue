<template>
  <div class="static">
    <div class="row">
      <div class="col-2">
        <div class="wrapper">
          <span class="config-tag">Dataset</span>
          <div class="wrapper">
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
              :viewBox="`${0} ${(-styleScheme.height * (1 - zoomLevel)) / 2} ${
                styleScheme.width
              } ${styleScheme.height}`"
              preserveAspectRatio="xMidYMid meet"
            ></svg>
            <canvas id="emordle-test-static-canvas"></canvas>
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
import { Options, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { CloudManager } from "@/assets/cloud";
import { createBackground, fragment } from "@/assets/gl-helper";
import * as ColorPreset from "@/assets/color-preset";
import { createColorPicker } from "@/assets/color-picker";
import Slider from "@/components/ui/Slider.vue";
import { FontConfig } from "@/assets/variable-font";
import "bootstrap";
import * as ColorPrest from "@/assets/color-preset";
import * as d3 from "d3";
import * as dsv from "d3-dsv";
import { Dataset, Word, Mode, Style } from "@/assets/types";
function randInt(min: number, max: number) {
  var range = max - min;
  var rand = Math.floor(Math.random() * (range + 1));
  return min + rand;
}

@Options({
  components: {
    Slider,
  },
})
export default class Static extends Vue {
  public wordleData: Dataset | null = null;
  public collection: Dataset[] = [];
  public fileReader = new FileReader();
  public uploadFilename: string = "";
  public animationModes: Array<Mode> = [
    Mode.bubble,
    Mode.colorful,
    Mode.chill,
    Mode.glisten,
    Mode.electric,
  ];
  public animationMode: Mode = Mode.bubble;
  public fontFamilies = [
    "Arial",
    "NotoSans",
    "DancingScript",
    "RobotoMono",
    "Raleway",
    "Manrope",
    "Dreamwood",
    "GT Flexa",
  ];
  public fontFamily = "NotoSans";
  public fontStyles = ["normal", "oblique", "italic"];
  public fontStyle = "normal";
  public fontWeights = ["normal", 200, 300, 800, "bold"];
  public fontWeight = "normal";
  public colorSchemes = [
    "calm",
    "positive",
    "negative",
    "playful",
    "trustworthy",
    "rainbow",
    "exciting",
    "black",
  ];
  public colorScheme = "black";
  public easeTypes = [
    "Cubic",
    "ElasticIn",
    "ElasticOut",
    "BounceIn",
    "BounceOut",
    "BounceInOut",
  ];
  public easeType = "ElasticIn";
  public strokeWidth = "2px";
  public rotation: number = 0;
  public duration: number = 5000;
  public spiralTypes = ["rectangular", "archimedean"];
  public spiralType = "rectangular";
  public cloudManager: CloudManager | undefined;
  public customColor = "#000000";
  public presetColors = ColorPreset.rainbow;
  public bgAnimator: any;
  public zoomLevel: number = 0.9;
  get styleScheme(): Style {
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
      font: new FontConfig().update({ name: "NotoSans" }),
    };
  }
  created() {}
  mounted() {
    this.fileReader.addEventListener("load", this.parseFile, false);
    let fileNames = [
      "2020_search",
      "xmas",
      "xmas-emoji",
      "thx",
      "Poe",
      "creep",
      "ingredients",
    ];
    // let fileNames = ["creep"]
    let tasks = fileNames.map((tag: string) =>
      d3.csv(`dataset/${tag}.csv`, (v: any) => {
        return {
          frequency: parseFloat(v.frequency),
          text: v.text,
        };
      })
    );
    Promise.all(tasks).then((dataList: any) => {
      this.collection = dataList.map((data: Word[], idx: number) => {
        return {
          tag: fileNames[idx],
          data: data,
        };
      });
      this.wordleData = this.collection[0];
      d3.select("#dataset")
        .selectAll("option")
        .property("selected", "false")
        .filter((v: any) => v["data-tag"] == this.collection[0].tag)
        .property("selected", true);
    });
    // createColorPicker('black', this.presetColors, '.color-picker')
  }
  @Watch("wordleData")
  wordleDataChanged() {
    if (!this.wordleData) return;
    let color = ColorPreset.getColor(this.colorScheme);
    let colorLen = color.length;
    this.wordleData.data.forEach((v: Word) => {
      v.color = color[randInt(0, colorLen - 1)];
      v.weight = this.styleScheme.fontWeight;
    });
    this.cloudManager = new CloudManager(
      this.wordleData.data,
      this.styleScheme,
      this.animationMode,
      "emotional-wordle-edit-svg",
      "emotional-wordle-canvas",
      this.bgAnimator,
      false,
      true
    );
  }
  @Watch("styleScheme")
  schemeChanged() {
    this.wordleDataChanged();
  }
  @Watch("animationMode")
  animationModeChanged() {
    if (this.animationMode === Mode.bubble) this.easeType = "elasticIn";
    d3.select("#emotional-wordle-bg-canvas").style(
      "visibility",
      this.animationMode === Mode.chill ? "visible" : "hidden"
    );
    this.cloudManager!.updateMode(this.animationMode);
  }
  rotateCallback(v: number) {
    this.rotation = v;
  }
  handleUpload(event: any) {
    let file = event.target.files[0];
    if (!file) return;
    this.fileReader.readAsText(file);
    this.uploadFilename = file.name.split(".csv")[0];
    this.collection.forEach((dataset: Dataset) => {
      if (dataset.tag == this.uploadFilename) {
        this.uploadFilename += "_1";
      }
    });
  }
  pause() {
    let ele = "#pauseButton";
    let state = !d3.select(ele).classed("active");
    d3.select(ele).classed("active", state);
    d3.select("#playButton").classed("active", !state);
    if (!this.cloudManager) return;
    this.cloudManager!.stop();
  }
  play() {
    let ele = "#playButton";
    let state = !d3.select(ele).classed("active");
    d3.select(ele).classed("active", state);
    d3.select("#pauseButton").classed("active", !state);
    if (!this.cloudManager) return;
    this.cloudManager!.play(this.duration);
  }
  replay() {
    if (!this.cloudManager) return;
    this.cloudManager!.play(this.duration);
  }
  parseFile() {
    let res = this.fileReader.result;
    if (!res || typeof res !== "string") return;
    let data = dsv.csvParse(res, (item: any) => {
      return {
        frequency: parseFloat(item.frequency),
        text: item.text,
      };
    });
    let dataset = {
      data: data,
      tag: this.uploadFilename,
    };
    this.collection.push(dataset);
    d3.select("#dataset").property("value", dataset);
    this.wordleData = dataset;
  }
  updateColor() {
    console.log(this.customColor);
  }
  // downloadGif() {
  //   if(!this.cloudManager) return
  //   console.log(this.cloudManager);
  //   this.cloudManager.animator!.createGif()
  // }
  jsonToCsv(data: any[]) {
    let array = typeof data != "object" ? JSON.parse(data) : data;
    let headers = [
      "frequency",
      "text",
      "color",
      "weight",
      "font",
      "style",
      "rotate",
      "size",
      "padding",
      "x",
      "y",
      "width",
      "height",
      "xoff",
      "yoff",
      "x1",
      "y1",
      "x0",
      "y0",
      "hasText",
    ];
    let csvStr = headers.join(",") + "\n";

    array.forEach((element: any) => {
      for (let header of headers) {
        const d = element[header];
        csvStr += d == undefined ? "," : d + ",";
      }
      csvStr = csvStr.slice(0, -1);
      csvStr += "\n";
    });
    return csvStr;
  }
  downloadJson() {
    if (!this.wordleData) return;
    const a = document.createElement("a");
    const jsonData = this.wordleData.data;
    const csvData = this.jsonToCsv(jsonData);
    a.href = URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
    a.download = `layout_${this.wordleData.tag}.csv`;
    a.click();
    a.remove();
  }
  openFile() {
    document.getElementById("wordleUpload")!.click();
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
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
    transform: translatey(0px);
  }
  50% {
    box-shadow: 0 25px 15px 0px rgba(0, 0, 0, 0.2);
    transform: translatey(-20px);
  }
  100% {
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
    transform: translatey(0px);
  }
}
// text {
//    animation: bop 10s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards infinite
//       alternate;
// }
</style>
