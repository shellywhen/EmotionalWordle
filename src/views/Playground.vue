<template>
  <h1>Playground</h1>
  <div class="text-layout-container">
    <!-- <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div>
    <div class="text-node">text to animate</div> -->
  </div>
  <button @click="animate">animate</button>
  <button id="reverse">reverse</button>
  <button @click="restart">restart</button>

  <!-- <button @click="pressUpload">upload</button> -->
  <input type="file" accept=".csv" id="uploadId" @change="upload" hidden />
</template>

<script lang="ts">
import anime from "animejs";
import { Vue } from "vue-class-component";
export default class Playground extends Vue {
  private draggableTexts: DraggableText[] = [];
  constructor(private animation: anime.AnimeInstance) {
    super(animation);
  }
  mockData: TextStyleConfig[] = [
    {
      text: "this is 0,0",
      left: 0,
      top: 0,
      color: "red",
      fontFamily: "GT Flexa",
      fontWeight: 100,
      fontSize: 100,
    },
    {
      text: "grasp",
      left: 100,
      top: 100,
      color: "red",
      fontFamily: "GT Flexa",
      fontWeight: 100,
      fontSize: 100,
    },
    {
      text: "creep",
      left: 200,
      top: 200,
      color: "green",
      fontFamily: "GT Flexa",
      fontWeight: 100,
      fontSize: 60,
    },
    {
      text: "hi",
      left: 50,
      top: 100,
      color: "red",
      fontFamily: "GT Flexa",
      fontWeight: 100,
      fontSize: 80,
    },
  ];

  applyStyle(obj: HTMLDivElement, data: TextStyleConfig) {
    obj.style.position = "absolute";
    obj.textContent = data.text;
    obj.style.left = `${data.left}px`;
    obj.style.top = `${data.top}px`;
    obj.style.color = `${data.color}`;
    obj.style.fontFamily = data.fontFamily;
    obj.style.fontWeight = `${data.fontWeight}`;
    obj.style.fontSize = `${data.fontSize}px`;
    // return obj;
  }
  mounted() {
    const WIDTH = 1000;
    const HEIGHT = 700;

    // prepare the text layout
    const container = document.querySelector(
      ".text-layout-container"
    )! as HTMLDivElement;
    container.style.backgroundColor = "rgba(0,0,0,0.1)";
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    container.style.margin = "0 auto";
    container.style.position = "relative";

    for (let index = 0; index < this.mockData.length; index++) {
      const data: TextStyleConfig = this.mockData[index];
      // assign initial text data from mock data
      const obj: HTMLDivElement = document.createElement("div");
      obj.classList.add("text-node");
      this.applyStyle(obj, data);

      // assign properties to enable draggablity
      const draggableTextProp: DraggableTextProp = {
        mousePosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        isDown: false,
      };
      // draggableTexts[index].elem = obj;
      this.draggableTexts.push({
        elem: obj,
        textProp: draggableTextProp,
      } as DraggableText);
      const mouseEnterCallBack = function (e: MouseEvent) {
        // prevents mousemove event to lose to overlapping element
        obj.parentNode?.appendChild(obj);
        obj.style.border = "0.5px dotted grey";
        obj.style.borderRadius = "5px";
        obj.style.cursor = "grab";
      };
      const mouseLeaveCallBack = function () {
        obj.style.borderStyle = "none";
        obj.style.cursor = "default";
      };
      const mouseMoveCallBack = function (e: MouseEvent) {
        // e.preventDefault();
        if (draggableTextProp.isDown) {
          // this ensures that the isDown property sets to false when the mouse speed is too fast
          // and the mouse leaves the div during mousemove
          obj.onmouseleave = function () {
            draggableTextProp.isDown = false;
          };
          draggableTextProp.mousePosition.x = e.clientX;
          draggableTextProp.mousePosition.y = e.clientY;

          const leftMouseDrag =
            draggableTextProp.mousePosition.x + draggableTextProp.offset.x;
          const topMouseDrag =
            draggableTextProp.mousePosition.y + draggableTextProp.offset.y;

          if (leftMouseDrag <= WIDTH - obj.offsetWidth && leftMouseDrag > 0) {
            obj.style.left = leftMouseDrag + "px";
          }
          // console.log(leftMouseDrag);
          if (topMouseDrag <= HEIGHT - obj.offsetHeight && topMouseDrag > 0) {
            obj.style.top = topMouseDrag + "px";
          }
        }
      };
      const mouseDownCallBack = function (e: MouseEvent) {
        obj.style.cursor = "grabbing";
        draggableTextProp.isDown = true;
        draggableTextProp.offset.x = obj.offsetLeft - e.clientX;
        draggableTextProp.offset.y = obj.offsetTop - e.clientY;
        obj.onmousemove = mouseMoveCallBack;
      };

      const mouseUpCallBack = function () {
        obj.style.cursor = "grab";
        draggableTextProp.isDown = false;
      };
      obj.addEventListener("mouseleave", mouseLeaveCallBack);
      obj.addEventListener("mouseenter", mouseEnterCallBack);
      obj.addEventListener("mousedown", mouseDownCallBack);
      obj.addEventListener("mouseup", mouseUpCallBack);
      container?.appendChild(obj);
    }
  }

  animate() {
    this.animation = anime({
      targets: ".text-node",
      fontVariationSettings: [
        "'wght' 100, 'wdth' 85",
        "'wght' 700, 'wdth' 100",
      ],
      easing: "linear",
      direction: "alternate",
      loop: true,
      // fontStretch: ["150%", "100%"],
      // width: function (el: HTMLElement, _: number, __: number) {
      //   // return [el.offsetWidth,;
      // },
      // loop: true,
      // translateX: [
      //   { value: 250, duration: 1000, delay: 500 },
      //   { value: 0, duration: 1000, delay: 500 },
      // ],
      // translateY: [
      //   { value: -40, duration: 500 },
      //   { value: 40, duration: 500, delay: 1000 },
      //   { value: 0, duration: 500, delay: 1000 },
      // ],
      // scaleX: [
      //   { value: 4, duration: 100, delay: 500, easing: "easeOutExpo" },
      //   { value: 1, duration: 900 },
      //   { value: 4, duration: 100, delay: 500, easing: "easeOutExpo" },
      //   { value: 1, duration: 900 },
      // ],
      // scaleY: [
      //   { value: [1.75, 1], duration: 500 },
      //   { value: 2, duration: 50, delay: 1000, easing: "easeOutExpo" },
      //   { value: 1, duration: 450 },
      //   { value: 1.75, duration: 50, delay: 1000, easing: "easeOutExpo" },
      //   { value: 1, duration: 450 },
      // ],
      // translateX: 300,
      // translateY: 250,
      // scaleY: [0.2, 1.0],

      // scale: 1.5,
      duration: 2000,
      // width: function (el: HTMLElement, i: number, l: number) {
      //   return [0, el.offsetWidth];
      // },
      // fontStretch: ["20%", "100%"],
      // height: function (el: HTMLElement, i: number, l: number) {
      //   return [el.style.height, 0];
      // },
      // fontSize: function (el: HTMLElement, i: number, l: number) {
      //   return [0, el.style.fontSize];
      // },
      // delay: anime.stagger(100),
      // width: "100%",
      // fontSize: ["12px", "50px"],
      // fontWeight: ["10", "900"],
      // direction: "alternate",
      // rotate: {
      //   value: 360,
      //   duration: 2000,
      // },
      // loop: true,
    });
    (document.querySelector("#reverse") as HTMLButtonElement).onclick =
      this.animation.reverse;
  }

  restart() {
    for (let index = 0; index < this.draggableTexts.length; index++) {
      const obj = this.draggableTexts[index].elem;
      const data = this.mockData[index];
      obj.removeAttribute("style");
      this.applyStyle(obj, data);
    }
  }
  pressUpload() {
    document.getElementById("uploadId")!.click();
  }
  upload(e: any) {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;
    fileReader.onload = function (e) {
      const data = e.target!.result;
      console.log(data);
    };
    fileReader.readAsText(file);
  }
}

interface DraggableText {
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
