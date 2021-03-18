<template>
  <div class="interface">
    <div class="wrapper row">
      <div class="parameters row col-2">
        <div>
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
          </div>
          <br />
          <div class="wrapper">
            <p class="config-tag">Emotion</p>
            <select
              name="emotion-select"
              id="emotion-select"
              v-model="tendancy"
            >
              <option
                v-for="item in tendancies"
                v-bind:key="item"
                v-bind:value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div class="slider-wrapper">
            <Slider
              init="0.5"
              step="0.1"
              label="Extent"
              className="extent"
              :callback="extentCallback"
            ></Slider>
          </div>
          <div class="slider-wrapper">
            <Slider
              init="0.5"
              step="0.1"
              label="Speed"
              className="speed"
              :callback="speedCallback"
            ></Slider>
          </div>
          <div class="slider-wrapper">
            <Slider
              init="0.5"
              step="0.1"
              label="Entropy"
              className="entropy"
              :callback="entropyCallback"
            ></Slider>
          </div>
          <!-- <div class="slider-wrapper">
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
        </div> -->
          <br />
          <button type="button" class="button" @click="getGif">
            <i class="fas fa-check light"></i>
            <span class="code">&nbsp;&nbsp;Generate</span>
          </button>
          <button type="button" class="button" @click="showGroup">
            <i class="fas fa-search light"></i>
            <span class="code">&nbsp;&nbsp;Config</span>
          </button>
        </div>
      </div>
      <div class="col-10">
        <svg
          id="emo-wordle"
          :height="styleScheme.height * 0.5"
          :width="styleScheme.width"
          :viewBox="`0 0 ${styleScheme.width} ${styleScheme.height}`"
          preserveAspectRatio="xMidYMid meet"
        ></svg>
        <div class="group-configs active">
          <div
            v-for="(item, index) in groups"
            v-bind:key="item"
            v-bind:class="`group-config group_config_${index}`"
          >
            <GroupPanel
              :group="item"
              :font="font"
              :groupIndex="index"
            ></GroupPanel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Options, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { createColorPicker } from "@/assets/color-picker";
import Slider from "@/components/ui/Slider.vue";
import GroupPanel from "@/components/GroupPanel.vue";
import { Dataset, Word, Mode, Style, GroupManagerConfig } from "@/assets/types";
import * as ColorPreset from "@/assets/color-preset";
import * as d3 from "d3";
import * as dsv from "d3-dsv";
import { FontConfig } from "@/assets/variable-font";
import { PlotHandler } from "@/assets/plot";
import { WordleAnimator } from "@/assets/animator";

@Options({
  components: {
    Slider,
    GroupPanel,
  },
})
export default class Interface extends Vue {
  public wordleData: Dataset | null = null;
  public collection: Dataset[] = [];
  public fileReader = new FileReader();
  public uploadFilename: string = "";
  public font = new FontConfig();
  public colorSchemes = ["black", "black", "Viridis", "Plasma", "rainbow"];
  public colorScheme = "red";
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
  public speed: number = 0.5;
  public entropy: number = 0.5;
  public customColor = "#000000";
  public presetColors = ColorPreset.rainbow;
  public animator: null | WordleAnimator = null;
  public extent: number = 0.5;
  public tendancies: Array<string> = ["positive", "negative"];
  public tendancy: string = "positive";
  get groups() {
    if (!this.animator) return [] as Array<GroupManagerConfig>;
    return this.animator.groupManagers;
  }
  get styleScheme() {
    return {
      colorScheme: "black",
      fontStyle: "regular",
      fontWeight: "400",
      fontFamily: this.font.name,
      strokeWidth: "2px",
      rotation: 0,
      height: 520,
      width: 800,
      font: this.font,
    };
  }
  public plotHandler: undefined | PlotHandler = undefined;
  mounted() {
    this.plotHandler = new PlotHandler(
      "",
      "emo-wordle",
      this.styleScheme,
      false
    );
    this.fileReader.addEventListener("load", this.parseFile, false);
    //let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep", "creep_emoji", "creep_mask"]
    let fileNames = ["xmas"];
    let tasks = fileNames.map((tag: string) =>
      d3.json(`./dataset/layout/layout_${tag}.json`)
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
    //createColorPicker('black', this.presetColors, '.color-picker')
  }
  @Watch("wordleData")
  wordleDataChanged() {
    if (!this.wordleData) return;
    this.animator = new WordleAnimator({
      words: assignColor(this.wordleData.data),
      duration: this.duration,
      plotHandler: this.plotHandler,
    });
    this.animator.play();
  }
  @Watch("easeType")
  easeTypeChanged() {}
  extentCallback(v: string) {
    if (!this.wordleData) return;
    const pv = parseFloat(v);
    this.extent = pv;
    this.animator!.extent = pv;
    this.animator!.play({ mode: "disco" });
  }
  speedCallback(v: string) {
    if (!this.wordleData) return;
    const pv = parseFloat(v);
    this.speed = pv;
    this.animator!.speed = pv;
    this.animator!.play({ mode: "disco" });
  }
  entropyCallback(v: string) {
    if (!this.wordleData) return;
    const pv = parseFloat(v);
    this.entropy = pv;
    this.animator!.entropy = pv;
    this.animator!.play({ mode: "disco" });
  }
  handleUpload(event: any) {
    let file = event.target.files[0];
    if (!file) return;
    this.fileReader.readAsText(file);
    this.uploadFilename = file.name.split(".csv")[0];
    this.collection.forEach((dataset: Dataset) => {
      if (dataset.tag == this.uploadFilename) {
        this.uploadFilename +=
          Math.random().toString() + Math.random.toString();
      }
    });
  }
  showGroup() {
    let ele = ".group-configs";
    let state = !d3.select(ele).classed("active");
    d3.select(ele).classed("active", state);
    console.log(state);
  }
  pause() {
    let ele = "#pauseButton";
    let state = !d3.select(ele).classed("active");
    d3.select(ele).classed("active", state);
    d3.select("#playButton").classed("active", !state);
    if (!this.animator) return;
    this.animator.stop();
  }
  play() {
    let ele = "#playButton";
    let state = !d3.select(ele).classed("active");
    d3.select(ele).classed("active", state);
    d3.select("#pauseButton").classed("active", !state);
    if (!this.animator) return;
    this.animator.stop();
  }
  replay() {
    if (!this.animator) return;
    this.animator.play();
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
  downloadGif() {
    if (!this.animator) return;
    this.animator.createGif().play({ gifFlag: true });
  }
  downloadJson() {
    if (!this.wordleData) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(this.wordleData.data)], { type: `text/json` })
    );
    a.download = `layout_${this.wordleData.tag}.json`;
    a.click();
    a.remove();
  }
  openFile() {
    document.getElementById("wordleUpload")!.click();
  }
}
let assignColor = function (words: Word[]) {
  words.forEach((word: Word, idx: number) => {
    word.color = "black";
  });
  return words;
};
</script>
<style lang="scss">
@import "@/assets/scss/_ui.scss";
.group-configs {
  display: none;
  &.active {
    display: flex;
    flex-wrap: wrap; /* | wrap-reverse;*/
    -webkit-flex-wrap: wrap;
  }
  .group-config {
    width: fit-content;
    margin: 1vh 1vw;
  }
}
</style>
