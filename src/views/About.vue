<template>
<br>
  <div class="about">
    <h1>About</h1>
    <br>
    <h3>Welcome to Emordle!</h3>
    <h5>Emordle is an online tool where you can easily create an animated wordle with emotion context.</h5>
    <br>

    <div class="steps">
      <h6>1️⃣ On "Static Helper" tab, upload a CSV file with two columns, named "text" and "frequency".</h6>
      <h6>2️⃣ Use the panel on the left to adjust the style of the wordle. You can change font family, font weight, color scheme and spiral type of the wordle. Additionally, you can use drag and drop to manually adjust the position and orientation of each word.</h6>
      <h6>3️⃣ Download the layout CSV file once you are happy with the configurations.</h6>
      <h6>4️⃣ Navigate to "Emordle Tool" and upload the layout CSV file.</h6>
      <h6>5️⃣ Choose the animation scheme from the dropdown. Play around with speed and entropy sliders until you see an animated emotion that you feel satisfied. You can also pause and restart the animation with the green play/pause button.</h6>
      <h6>6️⃣ Once you are satisfied, press the generate button to donwload the animated GIF. This requires around 30 seconds to process. </h6>
      <p>*For the wave scheme, please press the button around 5 seconds after the animation is played.</p>


    </div>
<hr>
  </div>
</template>
// <script lang="js">
// import "@/assets/tmp/app"
// import { Vue } from "vue-class-component"
// export default class About extends Vue {
// }
// </script>
<style>
.about {
  padding: 0 15vw;
}
h3,h5 {
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