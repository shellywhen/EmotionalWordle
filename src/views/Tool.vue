<template>
  <!-- <h1>Playground</h1> -->
  <div class="row">
    <div class="config-panel col-2">
      <div class="wrapper">
        <span class="config-tag">Dataset</span>
        <div class="wrapper">
          <label class="form-label" for="wordleUpload">
            Upload <span class="code">CSV</span>
          </label>
          <button class="button" @click="isShowModal = true">
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
        <select
          name="FontFamily"
          id="FontFamily"
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
      <br />
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
      <div style="margin: 0 auto">
        <Slider
          :init="speed"
          step="0.05"
          label="Speed"
          className="speed"
          :callback="speedCallback"
          :showValue="true"
        ></Slider>
      </div>
      <div style="margin: 0 auto">
        <Slider
          :init="entropy"
          step="0.05"
          label="Entropy"
          className="entropy"
          :callback="entropyCallback"
          :showValue="true"
        ></Slider>
      </div>
      <br />
      <!-- <button @click="animate">animate</buttonf> -->
      <div>
        <!-- <button @click="play">{{ "play" }}</button>
        <button @click="pause">{{ "pause" }}</button> -->
        <div class="row">
          <div class="col-6">
            <i
              id="playButton"
              @click="play()"
              class="fas fa-play-circle active lg light"
            ></i>
          </div>
          <div class="col-6">
            <i
              id="pauseButton"
              @click="pause()"
              class="fas fa-pause-circle lg light"
            ></i>
          </div>
        </div>
      </div>

      <!-- <button id="reverse">reverse</button> -->
      <!-- <button @click="restart">restart</button> -->
      <br />
      <!-- <button @click="center">center</button> -->
      <button @click="relayout">relayout</button>
      <button @click="mask">{{ ifMask ? "unmask" : "mask" }}</button>
      <br />
      <br />
      <button @click="downloadConfig">
        <i class="fas fa-download light"></i> &nbsp; config
      </button>
      <!-- <button @click="downloadGIF">
        <i class="fas fa-download light"></i> &nbsp; gif
      </button> -->

      <!-- <button @click="pressUpload">upload</button> -->
      <input type="file" accept=".csv" id="uploadId" @change="upload" hidden />
    </div>
    <div class="right-column col-10">
      <div id="emordle-container"></div>
      <svg id="emordle-test-svg-container"></svg>
      <div id="emordle-test-div-container"></div>
      <!-- <canvas id="emordle-test-canvas"></canvas> -->
    </div>
  </div>

  <transition name="fade" appear>
    <div class="modal-overlay" @click="hideModal" v-if="isShowModal"></div>
  </transition>
  <transition name="pop" appear>
    <div class="modal-div" v-if="isShowModal">
      <span class="close" @click="hideModal">&times;</span>
      <h1>Upload CSV</h1>
      <p>
        Upload a csv file with <code>text</code> and <code>frequency</code> as
        only columns
      </p>
      <div class="table-div">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">text</th>
              <th scope="col">frequency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in uploadData" :key="index">
              <th scope="row">{{ index + 1 }}</th>
              <td>{{ item.text }}</td>
              <td>{{ item.frequency }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="button-group">
        <button
          id="upload-csv-button"
          class="button btn btn-success"
          @click="openFile"
        >
          Upload CSV
        </button>
        <button
          id="generate-emordle-button"
          class="button btn btn-primary"
          @click="generateEmordle"
        >
          Generate Emordle
        </button>
      </div>
    </div>
  </transition>
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
import { getColor } from "@/assets/ts/color-preset";
import {
  applyStyle,
  initDraggableText,
  getTextCenter,
  sanityChecknFill,
  // testSize,
  getRandomInt,
  arrayToCSV,
} from "@/assets/ts/utils";
import * as d3Dsv from "d3-dsv";
import {
  generateWordle,
  defaultStyleSheet,
  // testOnSvg,
  word2Config,
  config2Word,
} from "@/assets/ts/layout";
const WIDTH = defaultStyleSheet.width;
const HEIGHT = defaultStyleSheet.height;
const divId = "emordle-container";
const fileNames = [
  "emotive/happy-words.csv",
  "emotive/sad-words.csv",
  "emotive/tender-words.csv",
  "emotive/afraid-words.csv",
  "emotive/angry-words.csv",
  "reallife/2020_search.csv",
  "reallife/creep.csv",
  "reallife/thx.csv",
  "reallife/ingredients.csv",
];
const fileReader = new FileReader();
let uploadFilename = "a";
interface Dataset {
  data: TextStyleConfig[];
  tag: string;
}
interface UploadData {
  text: string;
  frequency: number;
}
@Options({
  components: {
    Slider,
  },
})
export default class Tool extends Vue {
  public collection: Dataset[] = [];
  private draggableTexts: DraggableText[] = [];
  private wordleData: Dataset = { data: [], tag: "" };
  private animationInstances: AnimeInstance[] = [];
  private animationMode = "happy";
  private ifMask = false;
  private isShowModal = false;
  private uploadData: UploadData[] = [];
  private animationModes = [
    "still",
    "tender",
    "happy",
    "angry",
    "sad",
    "fearful",
    "nervous",
  ];
  private colorScheme = "gray";
  private colorSchemes = [
    "black",
    "gray",
    "red",
    "calm",
    "positive",
    "negative",
    "playful",
    "trustworthy",
    "rainbow",
    "exciting",
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
    "GT Flexa",
  ];
  public fontFamily = "GT Flexa";

  private readonly animeParams: anime.AnimeParams = {
    easing: "linear",
    // direction: "alternate",
    loop: true,
  };

  printisShowModal() {
    console.log(this.isShowModal);
  }
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
    fileReader.addEventListener(
      "load",
      () => {
        const res = fileReader.result;
        if (!res || typeof res !== "string") return;
        const data = (d3Dsv.csvParse(res, d3Dsv.autoType) as unknown) as Word[];
        this.parseFile(data);
      },
      false
    );
    await Promise.all(
      fileNames.map((f: string) => d3.csv(`./dataset/${f}`))
    ).then((rawData: unknown[]) => {
      const data = rawData as Word[][];
      data.forEach((instance, idx: number) => {
        uploadFilename = fileNames[idx].split("/")[1].split(".")[0];
        this.parseFile(instance, false);
      });
      this.wordleData = this.collection[0];
      d3.select("#emordle-dataset")
        .selectAll("option")
        .property("selected", false)
        .filter((v: any) => v["data-tag"] === this.collection[0].tag)
        .property("selected", true);

      this.initiateData(this.collection[0].data);
      this.relayout();
    });
    // Promise.all(
    //   fileNames.slice(1).map((f: string) => d3.csv(`./dataset/${f}`))
    // ).then((rawData: unknown[]) => {
    //   const data = rawData as Word[][];
    //   data.forEach((instance, idx: number) => {
    //     uploadFilename = fileNames[idx + 1].split("/")[1].split(".")[0];
    //     this.parseFile(instance, false);
    //   })
    //   })
  }
  @Watch("wordleData")
  wordleDataChanged() {
    if (!this.wordleData || this.wordleData.data.length === 0) return;
    this.ifMask = false;
    this.initiateData(this.wordleData.data);
    // this.relayout();
  }
  @Watch("colorScheme")
  colorSchemeChanged() {
    const colorSet = getColor(this.colorScheme);
    const n = colorSet.length;
    this.draggableTexts.forEach((obj) => {
      const c = colorSet[getRandomInt(0, n - 1)];
      obj.initData.color = c;
      obj.elem.style.color = c;
    });
  }
  @Watch("fontFamily")
  fontFamilyChanged() {
    this.draggableTexts.forEach((obj) => {
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
    if (!this.draggableTexts || this.draggableTexts.length === 0) return;
    const animator = new Emordle.Animator(
      this.draggableTexts,
      this.entropy,
      this.speed,
      this.animationMode
    );
    this.animationInstances = animator.getAnimationScheme();
    this.play();
    setTimeout(() => {
      d3.select("#pauseButton").on("click");
    }, 60000);
  }
  play() {
    document.querySelector("#pauseButton")?.classList.remove("active");
    this.animationInstances.forEach((i) => i.play());
    document.querySelector("#playButton")?.classList.add("active");
  }
  pause() {
    document.querySelector("#playButton")?.classList.remove("active");
    this.animationInstances.forEach((i) => i.pause());
    document.querySelector("#pauseButton")?.classList.add("active");
  }

  center() {
    const center = getTextCenter(this.draggableTexts);
    const translateX = WIDTH / 2 - center.x;
    const translateY = HEIGHT / 2 - center.y;
    anime({
      targets: ".text-node",
      left: function(el: HTMLElement) {
        const offsetL = parseInt(el.style.left.split("px")[0]);
        return `${offsetL + translateX}px`;
      },
      top: function(el: HTMLElement) {
        const offsetT = parseInt(el.style.top.split("px")[0]);
        return `${offsetT + translateY}px`;
      },
    });
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

  relayout() {
    this.pause();
    const words = config2Word(this.draggableTexts.map((v) => v.initData));
    generateWordle(words, { width: WIDTH, height: HEIGHT })
      .on("end", (layout) => {
        const configs = word2Config(layout, WIDTH, HEIGHT);
        configs.forEach((config, i) => {
          config.color = this.draggableTexts[i].initData.color;
        });
        this.draggableTexts = initDraggableText(configs);
        this.animate();
      })
      .start();
  }

  mask() {
    this.ifMask = !this.ifMask;
    if (this.ifMask) {
      this.draggableTexts.forEach((v) => {
        v.elem.textContent = "x".repeat(v.initData.text.length);
      });
    } else {
      this.draggableTexts.forEach((v) => {
        v.elem.textContent = v.initData.text;
      });
    }
  }

  speedCallback(v: string) {
    this.speed = parseFloat(v);
    this.animate();
  }
  entropyCallback(v: string) {
    this.entropy = parseFloat(v);
    if (this.animationMode == "tender") this.entropy = 1 - this.entropy;
    this.animate();
  }

  animationModeChange(v: string) {
    // stops what ever animation
    this.animationInstances.forEach((i) => {
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
  showModal() {
    this.isShowModal = true;
  }
  hideModal() {
    this.uploadData = [];
    this.isShowModal = false;
    const btn = document.querySelector(
      "#generate-emordle-button"
    ) as HTMLButtonElement;
    btn.style.display = "none";
  }
  openFile() {
    document.getElementById("wordleUpload")?.click();
  }
  insertDataset(data: TextStyleConfig[], changeData = true) {
    const dataset = {
      data: data,
      tag: uploadFilename,
    };
    this.collection.push(dataset);
    if (changeData) {
      d3.select("#emordle-dataset").property("value", dataset);
      this.draggableTexts = initDraggableText(dataset.data);
      this.colorSchemeChanged();
      this.wordleData = this.collection[this.collection.length - 1];
    }
  }
  parseFile(data: Word[], newFileFlag = true) {
    const sanity = sanityChecknFill(data);
    if (!sanity.data) {
      alert(`Wrong Data Format! Please use 'Text' and 'Frequency'!`);
      return;
    }
    // show user the loaded csv file first
    this.uploadData = data.map(
      (x) =>
        ({
          text: x.text,
          frequency: x.frequency,
        } as UploadData)
    );
    if (sanity.compute) {
      generateWordle(data, { width: WIDTH, height: HEIGHT })
        .on("end", (layout) => {
          const configs = word2Config(layout, WIDTH, HEIGHT);
          //testOnSvg((configs as unknown) as Word[]);
          this.insertDataset(configs, newFileFlag);
          this.wordleData = this.collection[this.collection.length - 1];
        })
        .start();
    } else {
      this.insertDataset((data as unknown) as TextStyleConfig[], newFileFlag);
    }
  }

  downloadConfig() {
    const a = document.createElement("a");
    const jsonData = this.draggableTexts.map((v) => {
      const d = v.initData;
      return {
        text: d.text,
        color: d.color,
        fontFamily: d.fontFamily,
        fontSize: d.fontSize,
        fontWeight: d.fontWeight,
        left: d.left,
        top: d.top,
        frequency: d.fontSize,
        offx: d.offx,
        offy: d.offy,
      };
    });
    const csvData = d3Dsv.csvFormat(jsonData);
    a.href = URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
    a.download = `layout_${this.wordleData.tag}.csv`;
    a.click();
    a.remove();
  }
  downloadGIF() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([new Blob()], { type: "gif" }));
    a.target = "_blank";
    a.download = `${this.wordleData.tag}_E${this.entropy.toFixed(
      3
    )}_S${this.speed.toFixed(3)}.csv`;
    a.click();
    a.remove();
    alert("NOT IMPLEMENTED!");
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/_ui.scss";
#emordle-container {
  // border: 1px solid black;
  margin: 0 auto;
  position: relative;
}
.text-node {
  border-style: none;
  cursor: default;
  span {
    display: inline-block;
    margin-right: -2px;
  }
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
  // #emordle-container {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  // div {
  //   opacity: 0.1;
  // }
  // }
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

#generate-emordle-button {
  display: none;
}
.button-group button {
  margin-bottom: 10px;
}
.table-div {
  height: 500px;
  overflow: scroll;
}
.close {
  color: #aaa;
  position: absolute;
  top: 0;
  right: 1rem;
  // float: right;
  font-size: 28px;
  font-weight: bold;
}
.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
.modal-div {
  position: absolute;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  text-align: center;
  width: 500px;
  height: fit-content;
  // max-width: 22em;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
  background: #fff;
  z-index: 999;
  transform: none;
}
.modal-div h1 {
  margin: 0 0 2rem;
}

.modal-overlay {
  content: "";
  position: absolute;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  background: #2c3e50;
  opacity: 0.6;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s linear;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: transform 0.4s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.4s linear;
}

.pop-enter,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(-50%);
}
#upload-csv-button {
  background-color: #42b983;
  border-color: #42b983;
}
</style>
