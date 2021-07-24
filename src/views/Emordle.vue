<template>
  <div class="interface">
    <div class="wrapper row">
      <div class="parameters row col-2">
        <div>
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
          <div class="wrapper">
            <span class="config-tag">Animation Scheme</span>
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
            <!-- <div class="col-4">
              <i
                id="pauseButton"
                @click="pause()"
                class="fas fa-pause-circle lg light"
              ></i>
            </div> -->
            <div class="col-12">
              <i
                id="playButton"
                @click="play()"
                class="fas fa-play-circle active lg light"
              ></i>
            </div>
            <!-- <div class="col-4">
              <i
                id="replayButton"
                @click="replay()"
                class="fas fa-arrow-circle-left lg light"
              ></i>
            </div> -->
          </div>
          <br />
          <button
            type="button"
            class="button"
            @click="downloadGif"
            :disabled="disabled"
          >
            <i class="fas fa-check light"></i>
            <span class="code">&nbsp;&nbsp;Generate</span>
          </button>
          <!-- <button type="button" class="button" @click="showGroup">
            <i class="fas fa-search light"></i>
            <span class="code">&nbsp;&nbsp;Config</span>
          </button> -->
        </div>
      </div>
      <div class="col-10">
        <svg
          id="emordle-svg"
          :height="styleScheme.height * zoomLevel"
          :width="styleScheme.width"
          :viewBox="`${0} ${(-styleScheme.height * (1 - zoomLevel)) / 2} ${
            styleScheme.width
          } ${styleScheme.height + 40}`"
          preserveAspectRatio="xMidYMid meet"
        ></svg>
        <canvas
          id="emordle-canvas"
          :height="styleScheme.height * zoomLevel"
          :width="styleScheme.width"
        >
        </canvas>
        <div id="png-container"></div>

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
import {
  Dataset,
  Word,
  EmotionMode,
  Mode,
  Style,
  GroupManagerConfig,
} from "@/assets/types";
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
export default class Emordle extends Vue {
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
  public tendencies: Array<EmotionMode> = [
    EmotionMode.positive,
    EmotionMode.negative,
  ];
  public tendency: EmotionMode = EmotionMode.positive;
  public animationModes: Array<Mode> = [
    Mode.split,
    Mode.dance,
    Mode.wave,
    Mode.swing,
  ];
  public animationMode: Mode = Mode.dance;
  public disabled: boolean = false;
  get groups() {
    if (!this.animator) return [] as Array<GroupManagerConfig>;
    return this.animator.groupManagers;
  }
  get styleScheme() {
    return {
      fontStyle: "regular",
      fontWeight: "550",
      fontFamily: this.font.name,
      height: 520,
      width: 800,
      font: this.font,
    };
  }
  public plotHandler: undefined | PlotHandler = undefined;
  mounted() {
    // this.setDisabled();
    this.fileReader.addEventListener("load", this.parseFile, false);
    //let fileNames = ["2020_search", "xmas", "xmas-emoji", "thx", "Poe", "creep", "creep_emoji", "creep_mask"]
    let fileNames = ["Poe", "thx", "2020_search", "xmas", "ingredients"];
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
    let copy = this.wordleData.data.map((v) => Object.assign({}, v));
    if (!("color" in copy[0])) copy = assignColor(copy);
    this.font.update({ name: copy[0].font });
    this.plotHandler = new PlotHandler(
      "emordle-canvas",
      "emordle-svg",
      this.styleScheme,
      true
    );
    if (this.animator) this.animator!.stop();
    this.animator = new WordleAnimator({
      data: copy,
      duration: this.duration,
      plotHandler: this.plotHandler,
      mode: this.animationMode,
    });
    this.animator.play();
  }
  @Watch("animationMode")
  aniModeChanged() {
    // this.setDisabled();
    if (!this.wordleData) return;
    this.animator!.update("mode", this.animationMode);
    this.animator!.reset();
    this.animator!.play();
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
    this.uploadFilename = file.name.split(".").slice(0, -1).join(".");
    this.collection.forEach((dataset: Dataset) => {
      if (dataset.tag == this.uploadFilename) {
        this.uploadFilename +=
          Math.random().toString() + Math.random.toString();
      }
    });
  }
  // setDisabled() {
  //   this.disabled = this.animationMode == Mode.wave ? true : false;  
  //   setTimeout(this.enabledDisabled, 2000);
  // }
  // enabledDisabled() {
  //   this.disabled = true;
  // }
  // showGroup() {
  //   let ele = ".group-configs";
  //   let state = !d3.select(ele).classed("active");
  //   d3.select(ele).classed("active", state);
  //   console.log(state);
  // }
  // pause() {
  //   let ele = "#pauseButton";
  //   let state = !d3.select(ele).classed("active");
  //   d3.select(ele).classed("active", state);
  //   d3.select("#playButton").classed("active", !state);
  //   if (!this.animator) return;
  //   this.animator.stop();
  // }
  play() {
    let ele = "#playButton";
    let state = !d3.select(ele).classed("active");
    d3.select(ele)
      .classed("active", state)
      .classed("fa-play-circle", state)
      .classed("fa-pause-circle", !state);
    // d3.select("#pauseButton").classed("active", !state);
    if (!this.animator) return;
    if (!state) this.animator.stop();
    else this.animator.play({ replay: true });
  }
  // replay() {
  //   if (!this.animator) return;
  //   this.animator.play();
  // }

  
  csvToJson(data: string) {
    let lines = data.split("\n");
    let result = [];
    let headers = lines[0].split(",");

    let strings = ['text','weight', 'color','font','style','rotate'];
    let numbers = ['frequency','size','padding','x','y','width','height','xoff','yoff','x1','y1','x0','y0'];
    let booleans = ['hasText'];

    for(let i=1;i<lines.length;i++){
      let obj = {} as any;
      let currentline=lines[i].split(";");

      for(let j=0;j<headers.length;j++){
        const header = headers[j];
        let dt = currentline[j]  as any;
        if(strings.includes(header)) {
          dt = dt;
        } else if(numbers.includes(header)) {
          dt = Number(dt);
        } else if(booleans.includes(header)) {
          dt = header == "TRUE" ? true : false;
        }
        obj[headers[j]] = dt;
      }
      result.push(obj);
    }
    return result;
  }

  parseFile() {
    let res = this.fileReader.result;
    if (!res || typeof res !== "string") return;
    // console.log(this.fileReader)
    // let data = JSON.parse(res);
     let data = this.csvToJson(res);
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
    this.animator.createGif();
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
</style>