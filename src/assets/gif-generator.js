const fs = require('fs');
const GIFEncoder = require('gifencoder');
// const fabric = require('fabric').fabric;

const { kmeans } = require('./lib/kmeans.js');

const d3Timer = require('d3-timer');
const d3Ease = require('d3-ease');
// const d3Select = require('d3-selection');
const d3Itpl = require('d3-interpolate');

const { createCanvas } = require('canvas');
const { assert } = require('console');
// const { JSDOM } = require('jsdom');

class AnimatorWordle {
    groupManagers;
    constructor(data) {
        this.data = data;
    }
    createManagers(numGroups) {
        this.groupManagers = new Array(numGroups);
        for (var i = 0; i < numGroups; ++i) {
          this.groupManagers[i] = new GroupManager()
        }
    }

    divideGroup(mode) {
        let wordsCopy = this.data;
        let numGroup = this.groupManagers.length;
        let numWordsPerGroup = Math.ceil(this.data.length / numGroup)
        let assignedWords = []
        let shuffle = function(array) {
            let currIdx = array.length, tempVal, randIdx
            while (0 != currIdx) {
                randIdx = Math.floor(Math.random() * currIdx)
                currIdx -= 1
                tempVal = array[currIdx]
                array[currIdx] = array[randIdx]
                array[randIdx] = tempVal
            }
            return array
        }
        
        let getMatrix = function (row, col) {
            let matrix = [];
            for (let i = 0; i < row; i++) {
                if (col !== 0) {
                    matrix.push(new Array(col).fill(0))
                }
                else {
                    let slot = [];
                    matrix.push(slot)
                }
            }
            return matrix
        }
        if (mode !== 'xy') {
            if (mode === GroupingMode.random) {
                assignedWords = shuffle(wordsCopy)
            } else if (mode === 'x') {
                assignedWords = wordsCopy.sort((a, b) => a.x - b.x)
            } else if (mode == 'y') {
                assignedWords = wordsCopy.sort((a, b) => a.y - b.y)
            }
            this.assignWords(numGroup, numWordsPerGroup, assignedWords)
        }
        else {
            let positions = wordsCopy.map((word) => [word.x, word.y])
            let result = kmeans(positions, numGroup, "kmeans")
            let wordBags = getMatrix(numGroup, 0)
            result.indexes.forEach((d, idx) => {
                wordBags[d].push(wordsCopy[idx])
            })
            this.groupManagers.forEach((group, idx) => {
                group.words = wordBags[idx]
            })
        }
    }
    assignWords(groupNum, numWordsPerGroup, wordsCopy) {
        for (let i = 0; i < groupNum; i++) {
            let startIdx = numWordsPerGroup * i;
            let endIdx = startIdx + numWordsPerGroup;
            this.groupManagers[i].words = wordsCopy.slice(startIdx, endIdx);
        }
    }
    assignKeyFrames(kf){
        assert(kf.length == this.groupManagers.length);
        this.groupManagers.forEach((gm, idx) => {
            gm.keyFrames = kf[idx];
        });
    }
}

class GroupManager {
    words;
    keyFrames;
    constructor() {
        this.fc = 0;
    }
    setFrameCounter(fc) {
        this.fc = fc;
    }
    updateWords(ckf, nkf, frameAt) {
        let color = d3Itpl.interpolateHcl(ckf.color, nkf.color)(frameAt);
        this.words.forEach((d) => {
            const xoff = (nkf.x - ckf.x) * d3Ease.easeCubicOut(frameAt);
            const yoff = (nkf.y - ckf.y) * d3Ease.easeCubicOut(frameAt);
            const scale = (nkf.scale - ckf.scale) * d3Ease.easeLinear(frameAt);
            const rotate = (nkf.rotate - ckf.rotate) * d3Ease.easeLinear(frameAt);
            d.x = d.x + xoff;
            d.y = d.y + yoff;
            d.rotate = parseFloat(d.rotate) + rotate;
            d.size = d.size * (1 + scale);
            d.color = color;
        });
    }
}

class FontConfig {
    name = 'Flexa';
    widthRange = [45, 65]; //[0, 200]
    italicRange = [0, 50]; //[0, 200]
    weightRange = [120, 350]; //[0, 700]
    width = 100
    weight = 350
    italic = 100
    constructor() {
    }
    update(configs) {
        Object.assign(this, configs)
    }
    setValWithRatio(type, extent) {
        let range = [0, 0]
        if (type == 'width') range = this.widthRange
        else if (type == 'weight') range = this.weightRange
        else if (type == 'italic') range = this.italicRange
        let val = extent * (range[1] - range[0]) + range[0]
        this.update({ [type]: val })
    }
    getCss() {
        return `"wdth" ${Math.ceil(this.width)}, "wght" ${Math.ceil(this.weight)}, "ital" ${Math.ceil(this.italic)}`
    }
}

class Style {
    colorScheme;
    fontStyle;
    fontWeight;
    fontFamily;
    easeType;
    strokeWidth;
    rotation;
    rotationTotal;
    rotationMin;
    rotationMax;
    spiralType;
    width;
    height;
    font;
    constructor(configs) {
        Object.assign(this, configs);
    }
}

class GifBase {
    ctx;
    constructor(width, height, styleSheet) {
        this.width = width;
        this.height = height;
        this.styleSheet = styleSheet;
    }

    init() {
        const gifCanvas = createCanvas(this.width, this.height);
        this.ctx = gifCanvas.getContext('2d');
    }

    setData(data) {
        this.data = data;
    }
}

// NOTE: unused for now
// for font variation
// class GifSVG extends GifBase {
//     svg;w3e421  
//     dom;
//     init() {
//         super.init();
//         this.dom = new JSDOM(`<!DOCTYPE html><body><qwe432q AFGYU7/body></html>`);
//         console.log(this.dom.window.document.body);
//         let body = d3Select.select(this.dom.window.document.querySelector('body'));
//         console.log(body.node());
//         this.svg = body.append('svg').attr('width', this.width).attr('height', this.height).attr('xlmns', 'http://www.w3.org/2000/svg');
//         this.initSvg();
//     }
//     getGTransform(d) {
//         return `translate(${d.x}, ${d.y}) rotate(${d.rotate})`
//     }

//     initSvg() {
//         this.svg.selectAll('g').remove();
//         let b = this.svg.append('g')
//             .attr('class', `wordcloud ${this.styleSheet.font.name}`)
//             .style('font-family', `${this.styleSheet.font.name}`)
//             .style('font-style', this.styleSheet.fontStyle)
//             .attr('transform', `translate(${this.width / 2},${this.height / 2})`)
//             .selectAll('g')
//             .data(this.data)
//             .enter()
//             .append('g')
//             .attr('transform', this.getGTransform);

//         let texts = b.append('text')
//             .datum((d) => d)
//             .attr('class', 'word')
//             .style('text-anchor', 'middle')
//             .style('fill', (d) => Object.is(undefined, d.color) ? this.styleSheet.colorScheme.color : d.color)
//             .style('font-variation-settings', this.styleSheet.font.getCss())
//             .style('font-size', (d) => d + 'px')
//             .text((d, _) => {
//                 return d.text || ''
//             });
//     }
//     plot() {
//         let container = d3Select.select('.wordcloud')
//             .selectAll('g');
//         container.data(this.data)
//             .attr('transform', this.getGTransform)
//             .select('text')
//             .style('fill', (d) => d.color || this.styleSheet.colorScheme)
//             .style('font-variation-settings', (d) => d.fontString)
//             .style('font-size', (d) => d.size + 'px')
//     }

//     //svg to canvas
//     toCanvas() {
//         console.log(this.svg.node());
//         const img = new Image;
//         const svgStr = xmlserializer.serializeToString(this.svg);
//         img.src = "data:image/svg+xml;utf8," + svgStr;
//         this.ctx.drawImage(img, 0, 0, this.width, this.height);
//     }
// }
class GifCanvas extends GifBase {
    plot(data) {
        if (!this.ctx) return
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillRect(0, 0, this.width, this.height);
        data.forEach((d) => {
            this.ctx.save()
            this.ctx.fillStyle = d.color || this.styleSheet.colorScheme;
            this.ctx.translate(this.width / 3 + d.x, this.height / 2 + d.y);
            this.ctx.rotate((d.rotate * Math.PI / 180) / this.data.length);
            this.ctx.font = `${this.styleSheet.fontWeight} ${d.size}px ${this.styleSheet.fontFamily}`;
            this.ctx.fillText(d.text, 0, 0);
            this.ctx.restore();
        });
    }
}

class FileHandler {
    INPUT_DIR_NAME = '../../public/dataset/layout/';
    OUTPUT_DIR_NAME = './';
    constructor(ifn, ofn) {
        this.ifn = ifn;
        this.ofn = ofn;
    }
    getData() {
        return JSON.parse(fs.readFileSync(this.INPUT_DIR_NAME + this.ifn));
    }
    getOutputFileName() {
        return this.OUTPUT_DIR_NAME + this.ofn;
    }
}

function run() {
    // FS constants
    fh = new FileHandler('layout_thx.json', `animation_${Date.now()}.gif`);
    const data = fh.getData();
    const ofn = fh.getOutputFileName();

    // GIF constants
    const GIF_DURATION = 10000;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 500;

    let is_svg = false;

    // TODO: get keyframes from the client
    const keyFrames = [
        [
            { x: 0, y: -5, rotate: 0, color: 'red', scale: 1, stage: 0 },
            { x: 0, y: -7, rotate: 60, color: 'yellow', scale: 1.0, stage: 50 },
            { x: 0, y: -5, rotate: 30, color: 'green', scale: 1, stage: 100 },
        ],
        [
            { x: 0, y: -2, rotate: 0, color: 'red', scale: 1, stage: 0 },
            { x: 0, y: -10, rotate: 60, color: 'yellow', scale: 1.0, stage: 50 },
            { x: 0, y: -15, rotate: 30, color: 'green', scale: 1, stage: 100 },
        ]
    ];
    const numGroups = keyFrames.length;

    const font = new FontConfig();

    const styleSheet = new Style({
        colorScheme: "black",
        fontStyle: "regular",
        fontWeight: "400",
        fontFamily: font.name,
        strokeWidth: "2px",
        rotation: 0,
        height: 520,
        width: 800,
        font: font
    });
    
    const divideMode = "xy";
    wordle = new AnimatorWordle(data);
    wordle.createManagers(numGroups);
    wordle.divideGroup(divideMode);
    wordle.assignKeyFrames(keyFrames);
    const gms = wordle.groupManagers;

    const gifEncoder = new GIFEncoder(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    gifEncoder.createWriteStream().pipe(fs.createWriteStream(ofn));
    gifEncoder.start();
    gifEncoder.setRepeat(0);
    gifEncoder.setDelay(1);
    gifEncoder.setQuality(10);
    
    // create dom object -> create svg -> convert to canvas -> canvas transform -> canvas plot
    
    const gifDrawer = is_svg
    ? new GifSVG(CANVAS_WIDTH, CANVAS_HEIGHT, styleSheet)
    : new GifCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, styleSheet);
    
    // initial data
    gifDrawer.setData(data);
    gifDrawer.init();
    
    // repeat this process for animation
    let timer = d3Timer.timer((elapsed) => {
        if (elapsed > GIF_DURATION) {
            timer.stop()
            gifEncoder.finish();
            console.log('done');
        }
        let updatedData = [];
        gms.forEach((gm) => {
            let fc = gm.fc; // frame counter
            const keyFrames = gm.keyFrames;
            const ckf = keyFrames[fc]; // current key frame
            const nkf = keyFrames[fc + 1]; // next key frame
            const cfa = nkf.stage / 100 * GIF_DURATION; // change frame at
            if (elapsed >= cfa) { 
                gm.setFrameCounter(fc+=1);
            }
            const fs = ckf.stage / 100 * GIF_DURATION; // frame stage
            const frameAt = (elapsed - fs) / (cfa - fs); 
            gm.updateWords(ckf, nkf, frameAt);
            updatedData.push(...gm.words);
        })
        gifDrawer.plot(updatedData);
        if (is_svg) {
            gifDrawer.toCanvas();    
        }
        gifEncoder.addFrame(gifDrawer.ctx);
    })

}

run();
