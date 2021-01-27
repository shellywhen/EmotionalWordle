# Views

## 🏗 Manual
Interface for configuring static wordle from raw data. The input is a `csv` (refer to `~/public/dataset/xmas.csv`) and the output is a `json` (refer to `~/public/dataset/layout/xmas.json`).
- Allow manual adjustment to the layout.
  - [x] Drag to reposition.
  - [x] Click and drag the top right corner to rotate.
    - [ ] Fix the bug to rotate smoothly.
  - [ ] Change the color.
    - [ ] Random assign from the emotional palette.
    - [ ] Manually configure.
      - [ ] Palette.
      - [ ] Select one by one.
  - [ ] Change the font style.
    - [x] Font family
  
Relevant files in assets: cloud, plot

## 🛠 Playground
Test for some animation effects. The framework can be extended to the next iteration. The input dataset is the layout `json` file.
Relevant files in assets: cloud, animation, plot

### Code Logic
When the layout data is arrived, create a new instance of `CloudManager`. It will initialize the `PlotHandler` for plotting and `Animator` for animating the wordle.

## 💧 Particle
Test on force simulation in wordles.
Relevant files in assets: float

## 💧 Wave
Test on the waving effect.
Relevant files in assets: gl-helper


