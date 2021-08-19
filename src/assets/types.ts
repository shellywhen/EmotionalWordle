/* eslint-disable */
import * as cloudGenerator from "d3-cloud"
import { FontConfig } from "@/assets/variable-font"
import { KeyFrame } from "./animator"

interface AnimatorPlayParams {
    replay?: boolean,
    mode?: string,
    gifFlag?: boolean,
    extent?: number,
    speed?: number,
    entropy?: number
}

interface SimulationData {
    ox: number,
    oy: number,
    radius: number,
    width: number,
    height: number,
    x?: number,
    y?: number
}

interface Dataset {
    data: Word[]
    tag: string
}

interface GroupManagerConfig {
    words: Array<Word>,
    duration: number,
    delay: number,
    ease: (a: number) => number,
    keyFrames: Array<KeyFrame>,
    font: FontConfig,
    origin: Array<Word>,
    updateWord: (cur: KeyFrame, prev: KeyFrame, fid: number, stage: number) => void
}

/** interface for key frame configureation */
interface KeyframeConfig {
    xoff: number,
    yoff: number,
    rotate: number,
    scale: number,
    opacity: number,
    color: string,
    stage: number,
    font: FontConfig,
    duration: number
}

interface Word extends cloudGenerator.Word {
    frequency: number
    width?: number
    height?: number
    color?: string
    class?: string
    fontString?: string
    left?: number
    top?: number
    fontFamily?: string
    fontWeight?: number
    fontSize?: number
}

interface DraggableText {
    initData: TextStyleConfig;
    elem: HTMLDivElement;
    textProp: DraggableTextProp;
  }
  
  interface DraggableTextProp {
    mousePosition: Position;
    offset: Position;
    isDown: boolean;
  }
  interface Position {
    x: number;
    y: number;
  }
  interface TextStyleConfig {
    left: number;
    top: number;
    fontFamily: string;
    fontWeight: number;
    fontSize: number;
    color: string;
    text: string;
    offx?: number;
    offy?: number;
  }

interface Style {
    colorScheme?: string
    fontStyle?: string
    fontWeight?: string
    fontFamily?: string
    easeType?: string
    strokeWidth?: string
    rotation?: number
    rotationTotal?: number
    rotationMin?: number
    rotationMax?: number
    spiralType?: string
    width: number
    height: number
    font?: any
}

interface MetaConfig extends Word {
    truex: number,
    truey: number,
    trues: number,
    truec: string,
    ss: number,
    ts: number,
    sc: string,
    tc: string,
    selected: boolean,
    order: number,
    direction: Direction,
    update: (tx: number, ty: number, ts: number, tc: number) => void,
    setframe: (tx: number, ty: number, ts: number, tc: string) => void
}

enum Direction {
    left, right
}

/** different strategies for assigning groups to words */
enum GroupingMode {
    y = 'y',
    x = 'x',
    xy = 'xy',  // kmeans for 2d adjacent words
    random = 'random'
}

enum EmotionMode {
    positive = 'positive', 
    negative = 'negative'
}

enum Mode {
    bubble = 'Bubble',
    glisten = 'Glisten',
    vapor = 'Vapor',
    colorful = 'Colorful',
    chill = 'Chill',
    electric = 'Electric',
    split = 'Split',
    wave = 'Wave',
    dance = 'Dance',
    swing = 'Swing'
}

export {
    SimulationData,
    Dataset,
    KeyframeConfig,
    Word,
    Style,
    GroupingMode,
    Mode,
    Direction,
    MetaConfig,
    GroupManagerConfig,
    AnimatorPlayParams,
    EmotionMode,
    DraggableText, DraggableTextProp, Position, TextStyleConfig
}
