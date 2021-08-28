import anime, { AnimeAnimParams, AnimeInstance } from "animejs";
import { kmeans } from "@/assets/lib/kmeans";
import { DraggableText } from "../types";
import { textToChars } from "./utils";
import { defaultStyleSheet } from "@/assets/ts/layout";
import { mix, random } from "tinycolor2";
interface AnimationScheme {
  (data: DraggableText[], entropy: number, speed: number): AnimeInstance[];
}
interface AnimationFrameScheme {
  (
    data: DraggableText[],
    entropy: number,
    speed: number,
    idx: number
  ): AnimeInstance[];
}

enum DivideMode {
  split = "split",
  x = "x",
  y = "y",
  xy = "xy",
  random = "random",
}
enum SchemeType {
  happy = "happy",
  sad = "sad",
  still = "still",
  angry = "angry",
  fearful = "fearful",
  tender = "tender",
  nervous = "nervous",
}

const animeParams: anime.AnimeParams = {
  easing: "linear",
  loop: true,
};

const shuffle = function<T>(array: T[]) {
  let currIdx = array.length,
    tempVal,
    randIdx;
  while (0 != currIdx) {
    randIdx = Math.floor(Math.random() * currIdx);
    currIdx -= 1;
    tempVal = array[currIdx];
    array[currIdx] = array[randIdx];
    array[randIdx] = tempVal;
  }
  return array;
};

const getMatrix = function<T>(row: number, col: number) {
  const matrix = [] as Array<Array<T>>;
  for (let i = 0; i < row; i++) {
    if (col !== 0) {
      matrix.push(new Array(col).fill(0));
    } else {
      const slot = [] as Array<T>;
      matrix.push(slot);
    }
  }
  return matrix;
};

const getDuration = function(speed: number) {
  return (300 + Math.random() * 50) * (1 / speed);
};

const getSadSchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  speed,
  idx = 0
) {
  const animationInstances = [] as AnimeInstance[];
  const duration = getDuration(speed);
  const stagger = idx * duration / 5;
  const params: AnimeAnimParams = {
    targets: `.group_${idx}`,
    opacity: [0.8, 0.4, 0.4, 0.25, 0.3, 0.3, 0.3, 0.4, 0.8, 1, 1, 1],
    translateY: [1, 2, 5, 8, 8, 8, 8, 6.5, 5, 2.5, 0],
    filter: [
      "blur(0)",
      "blur(0)",
      "blur(0)",
      "blur(0.2px)",
      "blur(1px)",
      "blur(0.2px)",
      "blur(0)",
      "blur(0)",
    ],
    duration: duration * 5,
    easing: "linear",
    delay: anime.stagger(stagger),
    endDelay: anime.stagger(duration + 1000 - stagger)
  };
  animationInstances.push(anime({ ...animeParams, ...params }));
  return animationInstances;
};

const getAngrySchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  speed,
  idx = 0
) {
  const animationInstances = [] as AnimeInstance[];
  const duration = getDuration(speed);
  const period = 0.6 + Math.random() * 1;
  let x = 0,
    y = 0;
  data.forEach((d) => {
    x += d.initData.left + (d.initData.offx || 0);
    y += d.initData.top + (d.initData.offy || 0);
  });
  x /= Math.max(1, data.length);
  y /= Math.max(1, data.length);
  const theta = Math.atan2(y - defaultStyleSheet.height / 2, x - defaultStyleSheet.width /2);
  const d = Math.sqrt((y - defaultStyleSheet.height / 2)**2 + (x - defaultStyleSheet.width /2)**2)
  const params: AnimeAnimParams = { 
      targets: `.group_${idx}`,
      scale: [0.75, 1.25],
      translateY: [ d * Math.sin(theta) * 0.75],
      translateX: [ d * Math.cos(theta) * 0.75],
      duration: duration,
      easing: `easeInElastic(1, ${period})`,
      direction: "alternate"
  };
  animationInstances.push(anime({ ...animeParams, ...params }));
  return animationInstances;
};

const getFearfulSchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  speed,
  idx = 0
) {
  const animationInstances = [] as AnimeInstance[];
  const duration = getDuration(speed);
  const extent = (1 + entropy) * 15 + Math.random() * 15;
  const direction = Math.random() > 0.5 ? 0 : Math.random() > 0.5 ? -1 : 1;
  const params: AnimeAnimParams = {
      targets: `.group_${idx}`,
      translateY: [0, - extent],
      translateX: [direction * 5 * Math.random(), -direction * 5 * Math.random()],
      duration: duration,
      easing: 'easeOutQuad',
      loop: true,
      direction: "alternate"
  };
  animationInstances.push(anime({ ...animeParams, ...params }));
  return animationInstances;
};

const getTenderSchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  speed,
  idx = 0
) {
  const animationInstances = [] as AnimeInstance[];
  const textElems = data.map(v => v.elem);
  textElems.forEach((textElem, i) => {
    const selector = `char-node-${idx}`;
    const charElems = textToChars(textElem);
    charElems.forEach((elem) => {
      elem.classList.add(selector);
      elem.style.filter = `saturate(80%)`;
      elem.style.fontVariant =  `"wght" 200, "ital" 0`;
    });

    const duration = getDuration(speed) * 2;
    const stagger = (duration / charElems.length) * .9;
    const params: AnimeAnimParams = {
      targets: `.${selector}`,
      keyframes: [
        { fontVariationSettings: `'wght' ${entropy * 300 + 50},  'ital' 0`, 
          filter: "saturate(60%)" ,
          skew: '0deg',
          translateY: 5
        },{
          fontVariationSettings: `'wght' 600, 'ital' 200`,
          filter: "saturate(50%)",
          translateY: -10 - 5 * entropy,
          skew: '-5deg',
        },{
          fontVariationSettings: `'wght' ${entropy * 300 + 50}, 'ital' 0`,
          filter: "saturate(40%)",
          translateY: 2,
          skew: '0deg',
        }
      ],
      delay: anime.stagger(stagger),
      duration: duration,
    };
    animationInstances.push(anime({ ...animeParams, ...params }));
  });
  return animationInstances;
};
const getStillSchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  duration,
  idx = 0
) {
  return [anime({ ...animeParams })] as AnimeInstance[];
};

const getHappySchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  speed,
  idx = 0
) {
  const animationInstances = [] as AnimeInstance[];
  const duration = getDuration(speed);
  let x = 0,
    y = 0;
  data.forEach((d) => {
    x += d.initData.left + (d.initData.offx || 0);
    y += d.initData.top + (d.initData.offy || 0);
  });
  x /= Math.max(1, data.length);
  y /= Math.max(1, data.length);
  const theta = Math.atan2(
    y - defaultStyleSheet.height / 2,
    x - defaultStyleSheet.width / 2
  );
  const d = Math.sqrt(
    (y - defaultStyleSheet.height / 2) ** 2 +
      (x - defaultStyleSheet.width / 2) ** 2
  );
  const params: AnimeAnimParams = {
    targets: `.group_${idx}`,
    translateY: [(d * Math.sin(theta)) / 2],
    translateX: [(d * Math.cos(theta)) / 2],
    duration: duration / 2,
    easing: `easeInQuart`,
    direction: "alternate",
    loop: true
  };
  const instance = anime.timeline(params);
  instance.add({
    targets: `.group_${idx}`,
    rotate: [0, (-theta * Math.PI) / 2 + Math.PI/2, 0],
    duration: duration / 10,
    easing: `easeInOutQuart`
  })
  instance.add({
    targets: `.group_${idx}`,
    translateY: [0],
    translateX: [0],
    duration: duration / 2,
    easing: `easeOutQuart`,
    direction: "alternate"
  })
  // animationInstances.push(anime({ ...animeParams, ...params }));
  animationInstances.push(instance)
  return animationInstances;
};

const getNervousSchemeFrame: AnimationFrameScheme = function(
  data,
  entropy,
  speed,
  idx
) {
  const animationInstances = [] as AnimeInstance[];
  const duration = getDuration(speed) * 1.5;
  const extent = (1 + entropy) * 15 + Math.random() * 15;
  const direction = Math.random() > 0.5 ? 0 : Math.random() > 0.5 ? -1 : 1;
  const params: AnimeAnimParams = {
      targets: `.group_${idx}`,
      translateY: [0, -extent * 0.3],
      translateX: [direction * 5 * Math.random(), -direction * 5 * Math.random()],
      rotate: [-Math.PI/6,Math.PI/6,0,0,-Math.PI/4,0, Math.PI/4, -Math.PI/4,0, Math.PI/4, -Math.PI/4,0, Math.PI/4],
      duration: duration,
      easing: 'easeOutQuad',
      direction: "alternate"
  };
  animationInstances.push(anime({ ...animeParams, ...params }));
  return animationInstances;
};

class Animator {
  private data: DraggableText[];
  private entropy: number;
  private speed: number;
  private split: DivideMode;
  private scheme: SchemeType;
  get numGroup() {
    const value = Math.max(1, Math.ceil(this.data.length * this.entropy));
    return value;
  }
  get splitCenters() {
    const centers = [] as Array<[number, number]>;
    const a = defaultStyleSheet.width / 4,
      b = defaultStyleSheet.height / 4;
    const alpha = (1 * Math.PI) / 4;
    const numGroups = this.numGroup;
    for (let idx = 0; idx < numGroups; idx++) {
      const theta = (idx * 2 * Math.PI) / numGroups + alpha;
      const x = a * Math.cos(theta);
      const y = b * Math.sin(theta);
      centers.push([x, y]);
    }
    return centers;
  }
  get schemeFunc() {
    switch (this.scheme) {
      case SchemeType.happy:
        return getHappySchemeFrame; // bump
      case SchemeType.nervous:
        return getNervousSchemeFrame; // drip
      case SchemeType.sad:
        return getSadSchemeFrame; // fade
      case SchemeType.angry:
        return getAngrySchemeFrame; // scale
      case SchemeType.fearful:
        return getFearfulSchemeFrame; // shake
      case SchemeType.tender:
        return getTenderSchemeFrame; // wave
      default:
        return getStillSchemeFrame; // still
    }
  }
  constructor(
    data: DraggableText[],
    entropy: number,
    speed: number,
    scheme: string
  ) {
    (this.data = data), (this.speed = speed), (this.entropy = entropy);
    switch (scheme) {
      case "happy":
        this.scheme = SchemeType.happy;
        this.split = DivideMode.xy;
        break;
      case "nervous":
        this.scheme = SchemeType.nervous;
        this.split = DivideMode.random;
        break;
      case "sad":
        this.scheme = SchemeType.sad;
        this.split = DivideMode.y;
        break;
      case "angry":
        this.scheme = SchemeType.angry;
        this.split = DivideMode.xy;
        break;
      case "fearful":
        this.scheme = SchemeType.fearful;
        this.split = DivideMode.xy;
        break;
      case "tender":
        this.scheme = SchemeType.tender;
        this.split = DivideMode.y;
        if (data[0].initData.fontFamily !== "GT Flexa") {
          // alert("You should use a variable font for this scheme.");
        }
        break;
      default:
        this.scheme = SchemeType.still;
        this.split = DivideMode.xy;
    }
  }
  getAnimationScheme() {
    const words = this.splitGroup();
    const func = this.schemeFunc;
    const animationInstances: AnimeInstance[] = [];
    anime.remove(".animating");
    words.forEach((group, idx) => {
      group.forEach((word) => {
        const name = word.elem.classList.item(1);
        if (name) word.elem.classList.remove(name);
        word.elem.classList.add(`group_${idx}`);
        word.elem.classList.add(`animating`);
      });
      animationInstances.push(...func(group, this.entropy, this.speed, idx));
    });

    return animationInstances;
  }
  splitGroup() {
    const numGroup = this.numGroup;
    const numWordsPerGroup = Math.max(
      1,
      Math.ceil(this.data.length / numGroup)
    );
    const assignedWords = this.data.map((d) => Object.assign({}, d));
    const results = [] as DraggableText[][];
    if (this.split !== DivideMode.xy) {
      if (this.split === DivideMode.random) {
        shuffle(assignedWords);
      } else if (this.split === DivideMode.x) {
        assignedWords.sort((a, b) => a.initData.left! - b.initData.left!);
      } else if (this.split == DivideMode.y) {
        assignedWords.sort((a, b) => a.initData.top! - b.initData.top!);
      }
      let i = 0;
      for (; i * numWordsPerGroup <= assignedWords.length; i += 1) {
        const startIdx = numWordsPerGroup * i;
        const endIdx = Math.min(
          numWordsPerGroup + startIdx,
          assignedWords.length
        );
        const words = assignedWords.slice(startIdx, endIdx);
        results.push(words);
      }
    } else {
      // divide by xy
      const positions = assignedWords.map((obj) => [
        obj.initData.left + (obj.initData.offx || 0),
        obj.initData.top + (obj.initData.offy || 0),
      ]);
      const centers = this.splitCenters;
      const alias = this.split === DivideMode.xy ? "kmeans" : centers;
      const kmResult = kmeans(positions, numGroup, alias);
      const wordBags = getMatrix(numGroup, 0) as Array<Array<DraggableText>>;
      kmResult.indexes.forEach((d: number, idx: number) => {
        wordBags[d].push(this.data[idx]);
      });
      wordBags.forEach((bag) => {
        if (bag.length !== 0) results.push(bag);
      });
    }
    return results;
  }
}

export { Animator };
