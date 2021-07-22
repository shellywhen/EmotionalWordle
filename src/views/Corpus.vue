<template>
  <div class="corpus">
    <div class="filter"></div>
    <div class="showcase">
    <div class="cards">
      <div class="card" v-for="item in fullList" :key="item.index">
        <img :src="item.Link" />
      </div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
import * as d3 from "d3"
export default {
    name: 'Corpus',
    data() {
        return {
            focus: [],
            fullList: []
        }
    },
    mounted() {
        d3.csv('./dataset/animatedText.csv').then(d => {
            console.log(d)
            this.fullList = d
        })
    }
}
</script>
<style lang="scss">
.corpus {
  display: inline-flex;
  min-height: 80vh;
  width: 98vw;
  .filter {
    width: 20%;
    padding: 0 2vw;
    background-color: gray;
  }
  .showcase {
    width: 80%;
    padding: 0 4vw;
    // background-color: blue;
    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: auto;
      grid-gap: 1rem;
    }
    .cards {
      border: none;
      border-radius: 4px;
      padding: .1rem;
    }
  }
}
</style>
