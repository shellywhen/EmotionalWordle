<template>
  <br />
  <div class="about">
    <h1>About</h1>
    <br />
    <h3>Welcome to Emordle!</h3>
    <h5>
      Emordle is an online tool where you can easily create an animated wordle
      with emotion context.
    </h5>
    <br />

    <div class="steps">
      <h6>
        1️⃣ On <code>Tool</code> tab, upload a CSV file with only two columns,
        named <code>text</code> and <code>frequency</code>. Review the emordle generateed based on the uploaded dataReview the data.
      </h6>
      <h6>
        2️⃣ Use the panel on the left to adjust the style of the wordle. You can
        change the
        <code>font family</code> and <code>color scheme</code> of the wordle.
        Use drag and drop to manually adjust the position of each word.
      </h6>
      <h6>
        3️⃣ Choose the animation scheme from the dropdown. Play around with
        <code>speed</code> and <code>entropy</code> sliders until you see an
        emordle that you feel satisfied.
        <p></p>
        <p>Several buttons were implemented to enhance authoring experience
        <ul>
          <li>
            <code>relayout</code>: randomly change the layout of the words in
            the emordle.
          </li>
          <li>
            play and pause: resumes or stops the animation. Can be used to fine tune the position of the words in the wordle.
          </li>
        </ul>
        </p>
      </h6>
      <h6>
        4️⃣ Export
        <ul>
          <p>We have not implemented the module to export as GIF yet. However, you may use a screen recording tool in your computer.</p>
          <li>
            <a
              href="https://support.apple.com/guide/quicktime-player/record-your-screen-qtp97b08e666/mac"
              >How to screen record on Mac</a
            >
          </li>
          <li>
            <a
              href="https://www.microsoft.com/en-us/p/free-screen-recorder/9p7bfxjtbtzz?activetab=pivot:overviewtab#"
              >How to screen record on Windows</a
            >
          </li>
        </ul>
      </h6>
    </div>
    <hr />
  </div>
</template>
//
<script lang="js">
// import "@/assets/tmp/app"
// import { Vue } from "vue-class-component"
// export default class About extends Vue {
// }
//
</script>
<style>
.about {
  padding: 0 15vw;
}
h3,
h5 {
  text-align: left;
}
.steps {
  margin: 0 auto;
  width: 1000px;
  text-align: left;
}
h6 {
  font-size: 20px;
  margin: 40px 0px 0px 0px;
}
</style>
