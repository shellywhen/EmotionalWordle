<template>
  <div class="gallery container">
    <div
      class="instance"
      v-for="(image, imageIndex) in images"
      :key="imageIndex"
      @click="index = imageIndex"
    >
      <div class="preview"
        :style="{
        backgroundImage: 'url(' + image + ')',
        width: '390px',
        height: '260px'
      }"></div>
      <div class="poem">
        {{ poems[imageIndex] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class Home extends Vue {
  // public images: string[] = [
  //       require('@/assets/gifs/poem1.gif'),
  //       require('@/assets/gifs/poem2.gif'),
  //       require('@/assets/gifs/poem3.gif'),
  //       require('@/assets/gifs/poem4.gif'),
  //       require('@/assets/gifs/poem6.gif'),
  //       require('@/assets/gifs/poem7.gif'),
  //       require('@/assets/gifs/poem8.gif'),
  //       require('@/assets/gifs/poem9.gif'),
  //       require('@/assets/gifs/poem10.gif'),
  //     ];
  public images: string[] = [
    "./gallery/poem1.gif",
    "./gallery/poem2.gif",
    "./gallery/poem3.gif",
    "./gallery/poem4.gif",
    // "./gallery/poem5.gif",
    "./gallery/poem6.gif",
    "./gallery/poem7.gif",
    "./gallery/poem8.gif",
    "./gallery/poem9.gif"
  ];
  public poems:string[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    // 'i'
  ]
  public index = null;
}
</script>

<style scoped>
.preview {
  float: left;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  border: 1px solid #ebebeb;
  margin: 5px;
  display: inline-block;
  text-align: left;
}
.instance {
  display: flex;
  text-align: middle;
}
.poem {
  display: inline-block;
  padding: 16px;
  text-align: left;
}

</style>
