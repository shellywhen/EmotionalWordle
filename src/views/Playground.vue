<template>
  <h1>Playground</h1>
  <div class="row">
    <div class="config-panel col-2">
      <span>Animation Scheme</span>
      <select v-model="animationMode" @change="animationModeChange">
        <option
          v-for="item in animationModes"
          v-bind:key="item"
          v-bind:value="item"
        >
          {{ item }}
        </option>
      </select>
      <br />
      <span>Easing</span>
      <select v-model="easing" @change="animate">
        <option v-for="item in easings" v-bind:key="item" v-bind:value="item">
          {{ item }}
        </option>
      </select>
      <div style="margin: 0 auto">
        <Slider
          :init="speed"
          step="0.05"
          label="Speed"
          className="speed"
          :callback="speedCallback"
        ></Slider>
      </div>
      <div style="margin: 0 auto">
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

      <!-- <button @click="pressUpload">upload</button> -->
      <input type="file" accept=".csv" id="uploadId" @change="upload" hidden />
    </div>
    <div id="container" class="col-8"></div>
  </div>
</template>

<script lang="ts">
const WIDTH = 1000;
const HEIGHT = 700;
let mockData: TextStyleConfig[] = [
  {
    text: "TEXT1",
    left: 0,
    top: 0,
    color: "red",
    fontFamily: "GT Flexa",
    fontWeight: 100,
    fontSize: 100
  },
  {
    text: "TEXT2",
    left: 100,
    top: 100,
    color: "black",
    fontFamily: "GT Flexa",
    fontWeight: 100,
    fontSize: 100
  },
  {
    text: "TEXT3",
    left: 100,
    top: 100,
    color: "red",
    fontFamily: "GT Flexa",
    fontWeight: 100,
    fontSize: 100
  },
  {
    text: "TEXT4",
    left: 100,
    top: 100,
    color: "red",
    fontFamily: "GT Flexa",
    fontWeight: 100,
    fontSize: 100
  },
  {
    text: "breeze",
    left: 200,
    top: 200,
    color: "green",
    fontFamily: "GT Flexa",
    fontWeight: 100,
    fontSize: 60
  },
  {
    text: "thisissochill",
    left: 50,
    top: 100,
    color: "red",
    fontFamily: "GT Flexa",
    fontWeight: 100,
    fontSize: 80
  }
];

import anime, { AnimeAnimParams, AnimeInstance } from "animejs";
import { Options, Vue } from "vue-class-component";
import Slider from "@/components/ui/Slider.vue";
import * as d3 from "d3";
@Options({
  components: {
    Slider
  }
})
export default class Playground extends Vue {
  private draggableTexts: DraggableText[] = [];
  private animationInstances: AnimeInstance[] = [];
  private animationMode = "happy";
  private animationModes = ["tender", "happy", "angry", "sad", "fearful"];
  private speed = 0.5;
  private entropy = 0.5;
  private easing = "linear";
  private easings = [
    "linear",
    "easeInQuad",
    "easeInCubic",
    "easeInQuart",
    "easeInQuint",
    "easeInSine",
    "easeInExpo",
    "easeInCirc",
    "easeInBack",
    "easeOutQuad",
    "easeOutCubic",
    "easeOutQuart",
    "easeOutQuint",
    "easeOutSine",
    "easeOutExpo",
    "easeOutCirc",
    "easeOutBack",
    "easeInBounce",
    "easeInOutQuad",
    "easeInOutCubic",
    "easeInOutQuart",
    "easeInOutQuint",
    "easeInOutSine",
    "easeInOutExpo",
    "easeInOutCirc",
    "easeInOutBack",
    "easeInOutBounce",
    "easeOutBounce",
    "easeOutInQuad",
    "easeOutInCubic",
    "easeOutInQuart",
    "easeOutInQuint",
    "easeOutInSine",
    "easeOutInExpo",
    "easeOutInCirc",
    "easeOutInBack",
    "easeOutInBounce"
  ];

  private readonly animeParams: anime.AnimeParams = {
    easing: "linear",
    // direction: "alternate",
    loop: true
  };

  applyStyle(obj: HTMLDivElement, style: TextStyleConfig) {
    obj.style.position = "absolute";
    obj.textContent = style.text;
    obj.style.left = `${style.left}px`;
    obj.style.top = `${style.top}px`;
    obj.style.color = `${style.color}`;
    obj.style.fontFamily = style.fontFamily;
    obj.style.fontWeight = `${style.fontWeight}`;
    obj.style.fontSize = `${style.fontSize}px`;
    // return obj;
  }
  initLayout() {
    const container = document.querySelector("#container")! as HTMLDivElement;
    container.style.border = "1px solid black";
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    container.style.margin = "0 auto";
    container.style.position = "relative";
  }
  initDraggableText() {
    for (let index = 0; index < mockData.length; index++) {
      const style: TextStyleConfig = mockData[index];

      //  initial text data from mock data
      const container = document.querySelector("#container") as HTMLDivElement;
      const elem: HTMLDivElement = document.createElement("div");
      elem.classList.add("text-node");
      this.applyStyle(elem, style);

      // assign properties to enable draggablity
      const draggableTextProp: DraggableTextProp = {
        mousePosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        isDown: false
      };

      this.draggableTexts.push({
        initData: style,
        elem: elem,
        textProp: draggableTextProp
      } as DraggableText);

      const mouseEnterCallBack = function(e: MouseEvent) {
        // prevents mousemove event to lose to overlapping element
        elem.parentNode?.appendChild(elem);
        elem.style.border = "0.5px dotted grey";
        elem.style.borderRadius = "5px";
        elem.style.cursor = "grab";
      };
      const mouseLeaveCallBack = function() {
        elem.style.borderStyle = "none";
        elem.style.cursor = "default";
      };
      const mouseMoveCallBack = function(e: MouseEvent) {
        // e.preventDefault();
        if (draggableTextProp.isDown) {
          // this ensures that the isDown property sets to false when the mouse speed is too fast
          // and the mouse leaves the div during mousemove
          elem.onmouseleave = function() {
            draggableTextProp.isDown = false;
          };
          draggableTextProp.mousePosition.x = e.clientX;
          draggableTextProp.mousePosition.y = e.clientY;

          const leftMouseDrag =
            draggableTextProp.mousePosition.x + draggableTextProp.offset.x;
          const topMouseDrag =
            draggableTextProp.mousePosition.y + draggableTextProp.offset.y;

          if (leftMouseDrag <= WIDTH - elem.offsetWidth && leftMouseDrag > 0) {
            elem.style.left = leftMouseDrag + "px";
          }
          // console.log(leftMouseDrag);
          if (topMouseDrag <= HEIGHT - elem.offsetHeight && topMouseDrag > 0) {
            elem.style.top = topMouseDrag + "px";
          }
        }
      };
      const mouseDownCallBack = function(e: MouseEvent) {
        elem.style.cursor = "grabbing";
        draggableTextProp.isDown = true;
        draggableTextProp.offset.x = elem.offsetLeft - e.clientX;
        draggableTextProp.offset.y = elem.offsetTop - e.clientY;
        elem.onmousemove = mouseMoveCallBack;
      };

      const mouseUpCallBack = function() {
        elem.style.cursor = "grab";
        draggableTextProp.isDown = false;
      };
      elem.addEventListener("mouseleave", mouseLeaveCallBack);
      elem.addEventListener("mouseenter", mouseEnterCallBack);
      elem.addEventListener("mousedown", mouseDownCallBack);
      elem.addEventListener("mouseup", mouseUpCallBack);
      container?.appendChild(elem);
    }
  }

  initAnimation() {
    const animation = anime(this.animeParams);
    animation.pause();
    this.animationInstances.push(animation);
  }
  async mounted() {
    const tag = "ingredients";
    await Promise.all([d3.json(`./dataset/layout/layout_${tag}.json`)]).then(
      data => {
        const result = data[0] as any[];
        result.forEach(d => {
          d.left = -d.width / 2 + d.x;
          d.top = -d.height * 0.58 + d.y;
          d.x - d.left;
          d.fontSize = d.size;
          d.fontFamily = d.font;
          d.fontWeight = 100;
          d.color = "black";
        });
        mockData = result;
      }
    );
    this.easing = "easeOutBounce";
    this.initLayout();
    this.initDraggableText();
    this.initAnimation();
    this.center();
  }

  animate() {
    this.animationInstances = [];
    switch (this.animationMode) {
      case "happy":
        this.animateHappy();
        break;
      case "tender":
        this.animateBreeze();
        break;
      case "angry":
        this.animateAngry();
        break;
      case "sad":
        this.animateSad();
        break;
      case "fearful":
        this.animateFearful();
        break;
      default:
        break;
    }
  }
  private animateSad() {
    const params: AnimeAnimParams = {
      targets: ".text-node",
      translateY: [-20, 20],
      // duration: 200 * (1 / this.speed),
      easing: this.easing,
      direction: "alternate"
    };
    this.animationInstances.push(anime({ ...this.animeParams, ...params }));
  }
  private animateHappy() {
    const params: AnimeAnimParams = {
      targets: ".text-node",
      translateY: [-20, 20],
      duration: 200 * (1 / this.speed),
      easing: this.easing,
      direction: "alternate"
    };
    this.animationInstances.push(anime({ ...this.animeParams, ...params }));
  }
  private animateBreeze() {
    const textElems = document.querySelectorAll(".text-node");
    textElems.forEach((textElem, i) => {
      const selector = `char-node-${i}`;
      const charElems = this.textToChars(textElem);
      charElems.forEach(elem => {
        elem.classList.add(selector);
        elem.style.color = "rgb(153,204,204)";
      });

      // slowest 2000, fastest 1000
      const duration = 1000 * (1 - this.speed) + 1000;
      const stagger = duration / charElems.length;
      const params: AnimeAnimParams = {
        targets: `.${selector}`,
        keyframes: [
          { fontVariationSettings: "'wght' 150", color: "rgb(153,204,204)" },
          {
            fontVariationSettings: "'wght' 700",
            color: "rgb(154,189,198)",
            translateY: "-100"
          },
          { fontVariationSettings: "'wght' 150", color: "rgb(153,204,204)" }
        ],
        delay: anime.stagger(stagger),
        duration: duration
      };
      this.animationInstances.push(anime({ ...this.animeParams, ...params }));
    });
  }

  private textToChars(textElem: Element) {
    const text = textElem.textContent!;
    textElem.textContent = "";
    const charElems: HTMLElement[] = [];
    for (let index = 0; index < text.length; index++) {
      const charEl = document.createElement("span");
      charEl.textContent = text[index];
      textElem.appendChild(charEl);
      charElems.push(charEl);
    }
    return charElems;
  }

  play() {
    this.animationInstances.forEach(i => i.play());
  }
  pause() {
    this.animationInstances.forEach(i => i.pause());
  }

  center() {
    const center = this.getTextCenter();
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
      const data = mockData[index];
      obj.removeAttribute("style");
      this.applyStyle(obj, data);
    }
  }

  private calculateCenter(positions: Position[]): Position {
    const center: Position = { x: 0, y: 0 };
    for (let index = 0; index < positions.length; index++) {
      const element = positions[index];
      center.x += element.x;
      center.y += element.y;
    }
    center.x = center.x / positions.length;
    center.y = center.y / positions.length;
    return center;
  }

  getTextCenter(draw = false): Position {
    const leftTops: Position[] = [],
      rightBots: Position[] = [];
    this.draggableTexts.forEach(val => {
      const leftTopX = val.elem.offsetLeft;
      const leftTopY = val.elem.offsetTop;
      const rightTopX = leftTopX + val.elem.offsetWidth;
      const leftBotY = leftTopY + val.elem.offsetHeight;
      const rightBotX = rightTopX;
      const rightBotY = leftBotY;

      leftTops.push({ x: leftTopX, y: leftTopY });
      rightBots.push({ x: rightBotX, y: rightBotY });
    });
    const centerLeftTop = this.calculateCenter(leftTops);
    const centerRightBots = this.calculateCenter(rightBots);
    const center = this.calculateCenter([centerLeftTop, centerRightBots]);
    if (draw) {
      const container = document.querySelector("#container");
      const centerMid = this.createPoint();
      const leftTopMid = this.createPoint();
      const rightBotMid = this.createPoint();

      container?.appendChild(centerMid);
      container?.appendChild(leftTopMid);
      container?.appendChild(rightBotMid);

      this.draw(centerMid, center);
      this.draw(leftTopMid, centerLeftTop);
      this.draw(rightBotMid, centerRightBots);
    }
    return center;
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
    this.animationInstances.length = 0;
    this.restart();
    this.animate();
  }
  // drawPoints() {}

  createPoint(): HTMLElement {
    const point = document.createElement("div");
    point.classList.add("point");
    point.style.background = `rgb(${Math.random() * 255},${Math.random() *
      255},${Math.random() * 255})`;
    point.style.width = "10px";
    point.style.height = "10px";
    point.style.borderRadius = "50%";
    point.style.position = "absolute";
    return point;
  }

  draw(elem: HTMLElement, position: Position) {
    elem.style.left = `${position.x}px`;
    elem.style.top = `${position.y}px`;
  }
  // pressUpload() {
  //   document.getElementById("uploadId")!.click();
  // }
  // upload(e: any) {
  //   const fileReader = new FileReader();
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   fileReader.onload = function (e) {
  //     const data = e.target!.result;
  //     console.log(data);
  //   };
  //   fileReader.readAsText(file);
  // }
}

interface DraggableText {
  initData: TextStyleConfig;
  elem: HTMLDivElement;
  textProp: DraggableTextProp;
}

interface DraggableTextProp {
  mousePosition: Position;
  offset: Position;
  isDown: boolean;
}
interface Position {
  x: number;
  y: number;
}
interface TextStyleConfig {
  left: number;
  top: number;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  color: string;
  text: string;
}
</script>
