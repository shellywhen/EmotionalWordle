/* eslint-disable */
<template>
  <div class="groupConfig">
    <div class="word-group-div">
      <span v-for="item in wordContent" v-bind:key="item" class="word-content">
        {{ item }}
      </span>
    </div>
    <div class="color-set">
      <div class="group-color">
        <div
          v-for="(item, index) in colorScheme"
          v-bind:key="item"
          :id="`color_${groupIndex}_${index}`"
          class="color-block"
        ></div>
      </div>
    </div>
    <div class="sliders">
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
          max="8000"
          min="1000"
          init="5000"
          step="500"
          label="Delay"
          className="delay"
          :callback="delayCallback"
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
      <div class="keyframes">
        <KeyframeList :keyframes="keyframes" :groupIndex="groupIndex"></KeyframeList>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Prop, Watch } from "vue-property-decorator";
import { Options, Vue } from "vue-class-component";
import Slider from "@/components/ui/Slider.vue";
import KeyframeList from "@/components/KeyframeList.vue";
import * as d3 from "d3";
import * as ColorPreset from "@/assets/color-preset";
import { createColorPicker } from "@/assets/color-picker";
import { FontConfig } from "@/assets/variable-font";
import { KeyframeConfig, GroupManagerConfig, Word } from "@/assets/types";
import { GroupManager } from "@/assets/animator"
@Options({
  components: {
    Slider,
    KeyframeList
  },
})
export default class GroupPanel extends Vue {
  @Prop({}) public group: GroupManagerConfig = new GroupManager({})
  @Prop({}) public font: FontConfig = new FontConfig()
  @Prop({}) public groupIndex: number = 0
  private colorScheme: Array<string> = ColorPreset.exciting
  private delay: number = 0
  private duration: number = 2000
  get wordContent(): Array<string> {
    if(!this.group) return []
    return this.group.words.map((v: Word) => v.text || "")
  }
  get keyframes(): Array<KeyframeConfig> {
    if(!this.group) return []
    return this.group.keyFrames
  }
  created() { 
    
  }
  mounted() {
    // let colors = this.colorScheme
    //  this.colorScheme.forEach((c, idx) => {
    //   createColorPicker(c, colors, `#color_${this.groupIndex}_${idx}`)
    // })
  }
  @Watch("group")
  public groupChanged(val: GroupManagerConfig): void {
    console.log(val, 'nonono')
     let colors = this.colorScheme
     this.colorScheme.forEach((c, idx) => {
      createColorPicker(c, colors, `#color_${this.groupIndex}_${idx}`)
    })
  }
  wghtCallback(v: number) {
    this.font.setValWithRatio("weight", v);
  }
  italCallback(v: number) {
    this.font.setValWithRatio("italic", v);
  }
  widhCallback(v: number) {
    this.font.setValWithRatio("width", v);
  }
  durationCallback(v: number) {
    this.duration = v;
  }
  delayCallback(v: number) {
    this.delay = v;
  }
}
</script>
<style lang="scss" scoped>
$deep-gray: #343a40;
$gray: #c0c0c0;
$light-gray: #f8f9fa;
.group-color {
  display: flex;
}
.groupConfig {
  border: $gray solid 1px;
  border-radius: 5px;
  padding: 10px;
  width: 20vw;
  .pickr {
    flex-wrap: wrap;
    -webkit-flex-wrap: wrap;
    margin-left: 2px;
  }
  .sliders {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    -webkit-flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    .slider-wrapper {
      width: 48%;
      margin: 0 0.3vw 0 0;
    }
  }
  .word-group-div {
    line-height: 0.8;
    // display: none;
    .word-content {
      margin-left: .2em;
      padding: 0.1em 0.1em;
      color: $deep-gray;
      background-color: $light-gray;
      display: inline-block;
      font-size: .75em;
      font-weight: 700;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .25rem;
    }
  }
}
</style>