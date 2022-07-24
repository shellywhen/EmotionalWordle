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
        width: '420px',
        height: '300px'
      }"></div>
      <!-- <div class="poem">
        <h3>{{ poems[imageIndex] }}</h3>
        <h6>{{ poemAuthors[imageIndex] }}</h6>
        <a :href="poemUrls[imageIndex]">{{poemUrls[imageIndex]}}</a>

      </div> -->
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
      "./gallery/dance-hello.gif",
    "./gallery/dance-thx.gif",
    "./gallery/fade-one_art.gif",
     "./gallery/fade-raven.gif",
    "./gallery/fist-anger.gif",
    "./gallery/explosion-bad_blood.gif",
    "./gallery/shake-fear.gif",
    "./gallery/shake-raven.gif",
    "./gallery/shake-creep.gif"
  ];
  public poems:string[] = [
    'The Waste Land',
    'Daddy',
    'Middle Passage',
    'Howl',
    'Raven',
    'Song of Myself (1892 version)',
    'Meditations in an Emergency',
    'Diving into the Wreck',
    // 'i'
  ]
  public poemAuthors: string[] = [
    'T. S. ELIOT',
    'SYLVIA PLATH',
    'ROBERT HAYDEN',
    'ALLEN GINSBERG',
    'EDGAR ALLAN POE',
    'WALT WHITMAN',
    'FRANK O\'HARA',
    'ADRIENNE RICH'
  ]
  public poemUrls: string[] = [
    'https://www.poetryfoundation.org/poems/47311/the-waste-land',
    'https://www.poetryfoundation.org/poems/48999/daddy-56d22aafa45b2',
    'https://www.poetryfoundation.org/poems/43076/middle-passage',
    'https://www.poetryfoundation.org/poems/49303/howl',
    'https://www.poetryfoundation.org/poems/48860/the-raven',
    'https://www.poetryfoundation.org/poems/45477/song-of-myself-1892-version',
    'https://www.poetryfoundation.org/poetrymagazine/poems/26538/meditations-in-an-emergency',
    'https://poets.org/poem/diving-wreck'
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
  /* display: inline-block; */
  text-align: left;
}
.instance {
  /* display: flex; */
  text-align: middle;
}
.poem {
  display: inline-block;
  padding: 16px;
  text-align: left;
}
.gallery {
  text-align: middle;
  padding: 0 0vw;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

</style>
