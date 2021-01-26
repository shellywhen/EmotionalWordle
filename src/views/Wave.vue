<template>
  <div>
    <canvas id="wave-canvas" width="800" height="520"> </canvas>
  </div>
</template>
<script lang="js">
import { Vue } from "vue-class-component"
import * as d3 from "d3"
import { jumpingWordle } from "@/assets/jump.js"
export default class Wave extends Vue {
    mounted() {
        d3.json('./dataset/layout/layout_creep.json').then(d => {
            jumpingWordle(d, './font/NotoSans.ttf')
        })
    }
}
</script>
<style lang="scss">
@keyframes float {
  0% {
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
    transform: translatey(0px);
  }
  50% {
    box-shadow: 0 25px 15px 0px rgba(0, 0, 0, 0.2);
    transform: translatey(-20px);
  }
  100% {
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.6);
    transform: translatey(0px);
  }
}
canvas {
  animation: float 6s ease-in-out infinite;
}
</style>
