<template>
  <div
    class="image"
    v-for="(image, imageIndex) in images"
    :key="imageIndex"
    @click="index = imageIndex"
    :style="{ backgroundImage: 'url(' + image + ')', width: '780px', height: '520px' }"
  ></div>
</template>


<script lang="ts">
  import { Vue } from 'vue-class-component';
  
  export default class Home extends Vue {
    public images: string[] = [
          require('@/assets/gifs/poem1.gif'),
          require('@/assets/gifs/poem2.gif'),
          require('@/assets/gifs/poem3.gif'),
          require('@/assets/gifs/poem4.gif'),
          require('@/assets/gifs/poem6.gif'),
          require('@/assets/gifs/poem7.gif'),
          require('@/assets/gifs/poem8.gif'),
          require('@/assets/gifs/poem9.gif'),
          require('@/assets/gifs/poem10.gif'),
        ];
    public index = null;
  }
</script> 

<style scoped>
  .image {
    float: left;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 1px solid #ebebeb;
    margin: 5px;
  }
</style>