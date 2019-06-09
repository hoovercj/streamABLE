// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';
import * as Tesseract from 'tesseract.js';
import { OpenCV, Mat } from '../lib/opencv';
import { regions } from '../lib/lol-tournament';
import { DataType, DataTypeToWhitelist, processResult } from '../lib/config';
import { Logger, LogLevel } from '../lib/logger';

declare global {
    const cv: OpenCV;
    interface Window {
        [key: string]: any;
    }
}

interface MatRegion {
    name: string;
    dimensions: [number, number, number, number];
    mat: Mat;
    type: DataType;
}

interface RegionResult {
    name: string;
    text: string;
}

const BUFFER_CANVAS_ID = 'streamable-buffer';
const NORMALIZED_WIDTH = 1920;
const NORMALIZED_HEIGHT = 1080;
let initialized = false;
let bufferCanvas: HTMLCanvasElement;
let canvasContext: CanvasRenderingContext2D | null;

let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === 'complete') {
        clearInterval(readyStateCheckInterval);
        initialize();
    }
}, 10);

async function initialize() {
    Logger.LogLevel = LogLevel.info;

    Logger.log('[StreamABLE] Initializing...');

    bufferCanvas = document.createElement('canvas');
    bufferCanvas.id = BUFFER_CANVAS_ID;
    canvasContext = bufferCanvas.getContext('2d');

    window['analyzeVideo'] = analyzeVideo;

    initialized = true;
    Logger.log('[StreamABLE] Initialized.');
}

async function analyzeVideo(): Promise<RegionResult[]> {
    if (!initialized) {
        Logger.log('[StreamABLE] Analyze Video - Not yet initialized.');
        return [];
    }

    const video = document.querySelector('video');

    if (!canvasContext || !video || !video.style) {
        Logger.log('[StreamABLE] Analyze Video - Missing canvas or video.');
        return [];
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    Logger.log(`[StreamABLE] Analyze Video - video is ${videoWidth} by ${videoHeight}`);

    bufferCanvas.width = videoWidth;
    bufferCanvas.height = videoHeight;
    canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);

    Logger.log('[StreamABLE] Analyze Video - Read mat from image data...');
    const mat = cv.matFromImageData(canvasContext.getImageData(0, 0, videoWidth, videoHeight));
    Logger.log('[StreamABLE] Analyze Video - Convert to grayscale...');
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    Logger.log('[StreamABLE] Analyze Video - Normalize size...');
    cv.resize(mat, mat, new cv.Size(NORMALIZED_WIDTH, NORMALIZED_HEIGHT), 0, 0, cv.INTER_AREA);

    // Note: setting the canvas size and calling cv.imshow
    // is only necessary to log the image
    bufferCanvas.width = 1920;
    bufferCanvas.height = 1080;
    cv.imshow(bufferCanvas, mat);
    Logger.logImage(bufferCanvas);

    Logger.log('[StreamABLE] Analyze Video - Crop regions...');
    const croppedMats: MatRegion[] = regions.map(({name, dimensions, type}) => {
        return {
            name: name,
            dimensions: dimensions,
            mat: mat.roi(new cv.Rect(...dimensions)),
            type: type,
        };
    });

    let croppedMat: MatRegion;
    let result: Tesseract.Page;
    let text: string;
    let name: string;

    let results: RegionResult[] = [];
    Logger.log('[StreamABLE] Analyze Video - Analyze regions...');
    for (let i = 0; i < croppedMats.length; i++) {
        croppedMat = croppedMats[i];
        name = croppedMat.name;
        try {
            result = await analyzeMatRegion(croppedMat, bufferCanvas);
            text = processResult(result.text, croppedMat.type);
        } catch (error) {
            Logger.error(error);
            text = `Could not find ${name}`;
        }

        results.push({ name, text });
        Logger.log(`[StreamABLE] Analyze Video - ${name}: ${text}`);
    }

    Logger.log('[StreamABLE] Analyze Video - Cleaning up mats...');
    mat.delete();
    croppedMats.map(mat => mat.mat.delete());

    return results;
}

async function analyzeMatRegion(region: MatRegion, buffer: HTMLCanvasElement): Promise<Tesseract.Page> {
    const [, , width, height] = region.dimensions;
    Logger.log('[StreamABLE] Analyze Mat region: Copy mat to buffer...');
    buffer.width = width;
    buffer.height = height;
    cv.imshow(buffer, region.mat);
    Logger.logImage(buffer);
    return runOCR(buffer, region.type);
}

async function runOCR(buffer: HTMLCanvasElement, type: DataType): Promise<Tesseract.Page> {
    Logger.log('[StreamABLE] Run OCR...');
    return new Promise((resolve, reject) => {
        Tesseract.recognize(buffer, getTesseractOptions(type))
            .then(resolve)
            .catch(reject);
    });
}

function getTesseractOptions(type: DataType) {
    return {
        lang: 'eng',
        tessedit_char_whitelist: DataTypeToWhitelist[type],
    };
}

function matchTemplate(buffer: Mat, template: Mat) {
    cv.matchTemplate(buffer, template, buffer, cv.TM_CCOEFF);
    let minMaxLoc = cv.minMaxLoc(buffer);
    let maxPoint = minMaxLoc.maxLoc;
    let color = new cv.Scalar(255, 0, 0, 255);
    let point = new cv.Point(maxPoint.x + template.cols, maxPoint.y + template.rows);
    cv.rectangle(buffer, maxPoint, point, color, 2, cv.LINE_8, 0);
    cv.imshow(bufferCanvas, buffer);
}
