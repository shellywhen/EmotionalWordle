import { TextStyleConfig, DraggableTextProp, DraggableText, Position, Word } from "../types"
import { defaultStyleSheet } from "./layout";
import * as d3 from 'd3';
const WIDTH = defaultStyleSheet.width;
const HEIGHT = defaultStyleSheet.height;

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
 function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arrayToCSV <T>(objArray: Array<T>) {
  const array = objArray;
  const str = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}` + '\r\n';

  return array.reduce((obj, next: T) => {
      obj += `${Object.values(next).map(value => `"${value}"`).join(",")}` + '\r\n';
      return obj;
     }, str);
}

/**
 * Check how to preprocess the uploaded data.
 * @param obj raw csv string
 */
function sanityChecknFill (obj: Word[]) {
  if('frequency' in obj[0] && 'text' in obj[0]) {
    if('x' in obj[0]) {
      return  { data: true, compute: false };
    } else {
      return { data: true, compute: true };
    }
  } else {
    alert('Wrong Data');
    return { data: false, compute: false };
  }

}
function applyStyle(obj: HTMLDivElement, style: TextStyleConfig) {
    obj.style.position = "absolute";
    obj.textContent = style.text;
    obj.style.left = `${style.left}px`;
    obj.style.top = `${style.top}px`;
    obj.style.color = `${style.color}`;
    obj.style.fontFamily = style.fontFamily;
    obj.style.fontWeight = `${style.fontWeight}`;
    obj.style.fontSize = `${style.fontSize}px`;
}

/**
 * Get the width and height of the text element
 * @param config 
 * @returns 
 */
function testSize(config: TextStyleConfig) {
  const elem: HTMLDivElement = document.createElement("div")
  elem.style.opacity = "0";
  applyStyle(elem, config);
  document.body.appendChild(elem);
  const rect = elem.getBoundingClientRect();
  const rectCopy = Object.assign(rect, {});
  elem.remove();
  return rectCopy;
}

function initDraggableText(data:TextStyleConfig[], divId="emordle-container") {
    const draggableTexts = [] as DraggableText[]
    const container = document.querySelector("#" + divId) as HTMLDivElement;
    container.innerHTML = "";
    data.sort((a: TextStyleConfig, b: TextStyleConfig) => a.fontSize! > b.fontSize! ? 1 : ( a.fontSize == b.fontSize ? 0: -1));
    data.reverse();
    for (let index = 0; index < data.length; index++) {
        const style: TextStyleConfig = data[index];
        //  initial text data from mock data
        const elem: HTMLDivElement = document.createElement("div");
        elem.classList.add("text-node");
        applyStyle(elem, style);

        // assign properties to enable draggablity
        const draggableTextProp: DraggableTextProp = {
        mousePosition: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        isDown: false
        };
        draggableTexts.push({
        initData: style,
        elem: elem,
        textProp: draggableTextProp
        } as DraggableText);

        const mouseEnterCallBack = function(e: MouseEvent) {
        // prevents mousemove event to lose to overlapping element
        elem.parentNode?.appendChild(elem);
        elem.classList.add("active");
        };
        const mouseLeaveCallBack = function() {
        elem.classList.remove("active");
        };
        const mouseMoveCallBack = function(e: MouseEvent) {
        // e.preventDefault();
        if (draggableTextProp.isDown) {
            // this ensures that the isDown property sets to false when the mouse speed is too fast
            // and the mouse leaves the div during mousemove
            elem.onmouseleave = function() {
            draggableTextProp.isDown = false;
            };
            draggableTextProp.mousePosition.x = e.clientX;
            draggableTextProp.mousePosition.y = e.clientY;

            const leftMouseDrag =
            draggableTextProp.mousePosition.x + draggableTextProp.offset.x;
            const topMouseDrag =
            draggableTextProp.mousePosition.y + draggableTextProp.offset.y;

            if (leftMouseDrag <= WIDTH - elem.offsetWidth && leftMouseDrag > 0) {
            elem.style.left = leftMouseDrag + "px";
            }
            if (topMouseDrag <= HEIGHT - elem.offsetHeight && topMouseDrag > 0) {
            elem.style.top = topMouseDrag + "px";
            }
            console.log(elem.style.left)
        }
        };
        const mouseDownCallBack = function(e: MouseEvent) {
        elem.style.cursor = "grabbing";
        draggableTextProp.isDown = true;
        draggableTextProp.offset.x = elem.offsetLeft - e.clientX;
        draggableTextProp.offset.y = elem.offsetTop - e.clientY;
        elem.onmousemove = mouseMoveCallBack;
        };

        const mouseUpCallBack = function() {
        elem.style.cursor = "grab";
        draggableTextProp.isDown = false;
        };
        elem.addEventListener("mouseleave", mouseLeaveCallBack);
        elem.addEventListener("mouseenter", mouseEnterCallBack);
        elem.addEventListener("mousedown", mouseDownCallBack);
        elem.addEventListener("mouseup", mouseUpCallBack);
        container?.appendChild(elem);
    }
    return draggableTexts
}

function csvToJson(data: string) {
    const lines = data.split("\n");
    const result = [];
    const headers = lines[0].split(",");

    const strings = ['text','weight', 'color','font','style','rotate'];
    const numbers = ['frequency','size','padding','x','y','width','height','xoff','yoff','x1','y1','x0','y0'];
    const booleans = ['hasText'];

    for(let i=1;i<lines.length;i++){
      const obj = {} as any;
      const currentline = lines[i].split(";");

      for(let j=0;j<headers.length;j++){
        const header = headers[j];
        let dt = currentline[j]  as any;
        if(numbers.includes(header)) {
          dt = Number(dt);
        } else if(booleans.includes(header)) {
          dt = header == "TRUE" ? true : false;
        }
        obj[headers[j]] = dt;
      }
      result.push(obj);
    }
    return result;
}

function draw(elem: HTMLElement, position: Position) {
    elem.style.left = `${position.x}px`;
    elem.style.top = `${position.y}px`;
}

function createPoint(): HTMLElement {
    const point = document.createElement("div");
    point.classList.add("point");
    point.style.background = `rgb(${Math.random() * 255},${Math.random() *
      255},${Math.random() * 255})`;
    return point;
}

/**
 * Get the center point of a given list of positions.
 * @param positions x, y
 * @returns  center position
 */
function calculateCenter(positions: Position[]): Position {
    const center: Position = { x: 0, y: 0 };
    for (let index = 0; index < positions.length; index++) {
      const element = positions[index];
      center.x += element.x;
      center.y += element.y;
    }
    center.x = center.x / positions.length;
    center.y = center.y / positions.length;
    return center;
}

/**
 * Get the center of a list of texts by getting their corner positions and draw the center if neccessary.
 */
function getTextCenter(draggableTexts: DraggableText[], needDraw=false, divId="emordle-container"): Position {
    const leftTops: Position[] = [],
      rightBots: Position[] = [];
    draggableTexts.forEach(val => {
      const leftTopX = val.elem.offsetLeft;
      const leftTopY = val.elem.offsetTop;
      const rightTopX = leftTopX + val.elem.offsetWidth;
      const leftBotY = leftTopY + val.elem.offsetHeight;
      const rightBotX = rightTopX;
      const rightBotY = leftBotY;
      leftTops.push({ x: leftTopX, y: leftTopY });
      rightBots.push({ x: rightBotX, y: rightBotY });
    });
    const centerLeftTop = calculateCenter(leftTops);
    const centerRightBots = calculateCenter(rightBots);
    const center = calculateCenter([centerLeftTop, centerRightBots]);
    if (needDraw) {
      const container = document.querySelector("#" + divId);
      const centerMid = createPoint();
      const leftTopMid = createPoint();
      const rightBotMid = createPoint();
      container?.appendChild(centerMid);
      container?.appendChild(leftTopMid);
      container?.appendChild(rightBotMid);
      draw(centerMid, center);
      draw(leftTopMid, centerLeftTop);
      draw(rightBotMid, centerRightBots);
    }
    return center;
  }

/**
 * Format the old data.
 * @param rawData 
 */
function preprocessData(rawData: Word[]) {
    rawData.forEach((d) => {
        d.left = -d.width! / 2 + d.x!;
        d.top = -d.height! * 0.5 + d.y!;
        d.x = d.left;
        d.fontSize = d.size;
        d.fontFamily = d.font;
        d.fontWeight = 100;
        d.color = "black";
      });
    return rawData
}

function textToChars(textElem: Element) {
    const text = textElem.textContent!;
    textElem.textContent = "";
    const charElems: HTMLElement[] = [];
    for (let index = 0; index < text.length; index++) {
      const charEl = document.createElement("span");
      charEl.textContent = text[index];
      textElem.appendChild(charEl);
      charElems.push(charEl);
    }
    return charElems;
  }


export {
    getRandomInt,
    arrayToCSV,
    sanityChecknFill,
    preprocessData,
    applyStyle,
    initDraggableText,
    createPoint,
    draw,
    calculateCenter,
    getTextCenter,
    csvToJson,
    textToChars,
    testSize
}