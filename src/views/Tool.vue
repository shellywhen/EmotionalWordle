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
      <!-- <button @click="animate">animate</button> -->
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
      <button @click="downloadGIF">
        <i class="fas fa-download light"></i> &nbsp; gif
      </button>

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
  arrayToCSV,
} from "@/assets/ts/utils";
import * as d3Dsv from "d3-dsv";
import {
  generateWordle,
  defaultStyleSheet,
  testOnSvg,
  word2Config,
  config2Word,
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
  private animationModes = [
    "still",
    "tender",
    "happy",
    "angry",
    "sad",
    "fearful",
    "nervous",
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
  public fontFamily = "NotoSans";

  private readonly animeParams: anime.AnimeParams = {
    easing: "linear",
    // direction: "alternate",
    loop: true,
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
      console.log(rawData, "??");
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
      this.relayout();
      // testOnSvg(data[0]);
    });
  }
  @Watch("wordleData")
  wordleDataChanged() {
    if (!this.wordleData || this.wordleData.data.length === 0) return;
    this.ifMask = false;
    this.initiateData(this.wordleData.data);
    this.relayout();
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
    // console.log(this.animationInstances);
    // console.log(this.animationInstances.length);
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
      left: function(el: HTMLElement, i: number, l: number) {
        const offsetL = parseInt(el.style.left.split("px")[0]);
        return `${offsetL + translateX}px`;
      },
      top: function(el: HTMLElement, i: number, l: number) {
        const offsetT = parseInt(el.style.top.split("px")[0]);
        return `${offsetT + translateY}px`;
      },
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
  openFile() {
    document.getElementById("wordleUpload")?.click();
  }
  insertDataset(data: TextStyleConfig[]) {
    const dataset = {
      data: data,
      tag: uploadFilename,
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
    if (sanity.compute) {
      generateWordle(data, { width: WIDTH, height: HEIGHT })
        .on("end", (layout) => {
          const configs = word2Config(layout, WIDTH, HEIGHT);
          //testOnSvg((configs as unknown) as Word[]);
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
    const jsonData = this.draggableTexts.map((v) => v.initData);
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
</style>
