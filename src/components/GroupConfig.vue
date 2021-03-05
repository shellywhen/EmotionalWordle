/* eslint-disable */
<template>
  <div class="groupConfig">
    <div class="color-set">
      <div class="group-color">
        <div
          v-for="(item, index) in colorScheme"
          v-bind:key="item"
          :id="'color_picker_' + index"
          class="color-block"
        ></div>
      </div>
    </div>
    <div>
      <div>
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
        <div class="slider-wrapper">
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
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Prop, Watch } from "vue-property-decorator";
import { Vue } from "vue-class-component";
import * as d3 from "d3";
import * as ColorPreset from "@/assets/color-preset";
import { createColorPicker } from "@/assets/color-picker";
import { GroupManagerConfig } from "@/assets/types"
export default class GroupPanel extends Vue {
  @Prop({}) public group: GroupManagerConfig
  private colorScheme: Array<String> = ColorPreset.happy
  private delay: number = 0
  private duration: number = 2000
  created() { 

  }
  mounted() {

  }
  @Watch("colorScheme")
  public colorChanged(val: string): void {
    colors = this.colorScheme
    this.colorScheme.forEach((c, idx) => {
      createColorPicker(val, colors, `#color_picker_${idx}`)
    })
  }
  @Watch("value")
  public valueChanged(val: number): void {
    this.callback(val);
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
<style lang="scss">
.group-color {
  display: flex;
}
</style>