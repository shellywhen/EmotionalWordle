<template>
  <div class="slider-container">
    <p class="config-tag slider-tag">
      <span>{{ label }}</span>
      <span v-if="showValue"> &nbsp;&nbsp; {{ value }} </span>
    </p>
    <input
      type="range"
      :class="rangeClass"
      :min="min"
      :max="max"
      :step="step"
      v-model="value"
    />
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { Prop, Watch } from "vue-property-decorator";
import { Vue } from "vue-class-component";
import * as d3 from "d3";
type Callback = (x: number) => void;
export default class Slider extends Vue {
  @Prop({ default: 0 }) public min: number = 0;
  @Prop({ default: 1 }) public max: number = 1;
  @Prop({ default: 0.1 }) public step: number = 0.1;
  @Prop({ default: (a: number) => {} }) public callback: Callback = (a: number) => {};
  @Prop({ default: "" }) public label: string = "";
  @Prop({ default: "slider" }) public className: string = "slider";
  @Prop({ default: 0 }) public init: number = 0;
  @Prop({ default: false }) public showValue: boolean = false
  public value = 0;
  public range = 1;
  get rangeClass(): string {
    return this.className + " slider";
  }
  created() {
    this.value = this.init
  }
  @Watch("value")
  public valueChanged(val: number): void {
    this.callback(val);
  }
}
</script>

<style lang="scss" scoped>
$deep-gray: #aaaeb3;
$gray: #7a7a7a;
$light-gray: #e2e6ea;
$normal: #2c3e50;
.slider-container {
  width: 100%;
  text-align: left;
  margin-top: 2px;
  .slider-tag {
    position: relative;
    margin-bottom: -2vh;
    color: black;
    span:nth-child(2) {
      position: absolute;
      right: 0;
    }
  }
}
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 0.8vh;
  border-radius: 0.8vh;
  background: $light-gray;
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 2vh;
  height: 2vh;
  border-radius: 50%;
  background: $deep-gray;
  cursor: pointer;
  &:hover {
      background: $gray;
    }
}
.slider::-moz-range-thumb {
  width: 2vh;
  height: 2vh;
  border-radius: 50%;
  background: $deep-gray;
  cursor: pointer;
}
</style>
