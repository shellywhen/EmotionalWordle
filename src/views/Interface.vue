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
            <div class="config-radio">
              <div v-for="item in tendencies" :key="item">
                <input
                  type="radio"
                  :value="item"
                  :id="'mode-' + item[0]"
                  v-model="tendency"
                />
                <label :for="'mode-' + item[0]">
                  {{ item }}
                </label>
              </div>
            </div>
          </div>
          <div class="wrapper">
            <p class="config-tag">Animation Scheme</p>
            <select name="emotion-select" v-model="animationMode">
              <option
                v-for="item in animationModes"
                v-bind:key="item"
                v-bind:value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <br />
          <div class="slider-wrapper">
            <Slider
              init="0.5"
              step="0.05"
              label="Speed"
              className="speed"
              :callback="speedCallback"
            ></Slider>
          </div>
          <div class="slider-wrapper">
            <Slider
              init="0.5"
              step="0.05"
              label="Entropy"
              className="entropy"
              :callback="entropyCallback"
            ></Slider>
          </div>
          <br />
          <div class="wrapper-mid row">
            <div class="col-4">
              <i
                id="pauseButton"
                @click="pause()"
                class="fas fa-pause-circle lg light"
              ></i>
            </div>
            <div class="col-4">
              <i
                id="playButton"
                @click="play()"
                class="fas fa-play-circle active lg light"
              ></i>
            </div>
            <div class="col-4">
              <i
                id="replayButton"
                @click="replay()"
                class="fas fa-arrow-circle-left lg light"
              ></i>
            </div>
          </div>
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
          id="emordle-svg"
          :height="styleScheme.height * zoomLevel"
          :width="styleScheme.width"
          :viewBox="
            `${0} ${(-styleScheme.height * (1 - zoomLevel)) / 2} ${
              styleScheme.width
            } ${styleScheme.height}`
          "
          preserveAspectRatio="xMidYMid meet"
        ></svg>
        <canvas
          id="emordle-canvas"
          :height="styleScheme.height * zoomLevel"
          :width="styleScheme.width"
        >
        </canvas>
        <div class="group-configs">
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
import { Dataset, Word, EmotionMode, Mode, Style, GroupManagerConfig } from "@/assets/types";
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
  public zoomLevel: number = 0.8;
  public uploadFilename: string = "";
  public font = new FontConfig();
  public duration: number = 5000;
  public speed: number = 0.5;
  public entropy: number = 0.5;
  public customColor = "#000000";
  public animator: null | WordleAnimator = null;
  public extent: number = 0.5;
  public tendencies: Array<EmotionMode> = [EmotionMode.positive, EmotionMode.negative];
  public tendency: EmotionMode = EmotionMode.positive
  public animationModes: Array<Mode> = [Mode.split, Mode.dance, Mode.wave, Mode.swing]
  public animationMode: Mode = Mode.wave
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
      height: 520,
      width: 800,
      font: this.font,
    };
  }
  public plotHandler: undefined | PlotHandler = undefined;
  mounted() {
    this.plotHandler = new PlotHandler(
      "emordle-canvas",
      "emordle-svg",
      this.styleScheme,
      true
    );
    this.fileReader.addEventListener("load", this.parseFile, false);
    //let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep", "creep_emoji", "creep_mask"]
    let fileNames = ["2020_search"];
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
  }
  @Watch("wordleData")
  wordleDataChanged() {
    if (!this.wordleData) return;
    let copy = this.wordleData.data.map((v) => Object.assign({}, v))
    this.animator = new WordleAnimator({
      data: assignColor(copy),
      duration: this.duration,
      plotHandler: this.plotHandler,
      mode: this.animationMode
    });
    this.animator.play();
  }
  @Watch("animationMode")
  aniModeChanged() {
    if(!this.wordleData) return
    this.animator!.update('mode', this.animationMode)
    this.animator!.reset()
    this.animator!.play()
  }
  speedCallback(v: string) {
    if (!this.wordleData) return;
    const pv = parseFloat(v);
    this.speed = pv;
    this.animator!.speed = pv;
    this.animator?.reset();
    this.animator!.play();
  }
  entropyCallback(v: string) {
    if (!this.wordleData) return;
    const pv = parseFloat(v);
    this.entropy = pv;
    this.animator!.entropy = pv;
    this.animator!.reset();
    this.animator!.play();
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
  visibility: hidden;
  display: flex;
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
</style>