<template>
<div class="groupConfig">
    <div class="color-set">
    </div>
</div>
</template>
<script lang="ts">
/* eslint-disable */
import { Prop, Watch } from "vue-property-decorator";
import { Vue } from "vue-class-component";
import * as d3 from "d3";
import * as ColorPreset from "@/assets/color-preset";
export default class GroupPanel extends Vue {
  created() {

  }
  mounted() {

  }
  @Watch("value")
  public valueChanged(val: number): void {
    this.callback(val);
  }
}
</script>
<style lang="scss">

</style>