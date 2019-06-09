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

const SCREENREADER_CONTAINER_ID = 'streamable-screenreader-content';
const BUFFER_CANVAS_ID = 'streamable-buffer';
const NORMALIZED_WIDTH = 1920;
const NORMALIZED_HEIGHT = 1080;
let initialized = false;
let sourceVideo: HTMLVideoElement | null;
let bufferCanvas: HTMLCanvasElement;
let screenreaderContainer: HTMLDivElement;
let canvasContext: CanvasRenderingContext2D | null;

let analyzeInterval: number | undefined;

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

    screenreaderContainer = document.createElement('div');
    screenreaderContainer.id = SCREENREADER_CONTAINER_ID;
    screenreaderContainer.className = 'screenreader';

    exposeApi();

    initialized = true;
    Logger.log('[StreamABLE] Initialized.');
}

function exposeApi() {
    window['analyzeVideo'] = analyzeVideo;
    window['analyzeAndRender'] = analyzeAndRender;
    window['startAnalyzeLoop'] = startAnalyzeLoop;
    window['stopAnalyzeLoop'] = stopAnalyzeLoop;
}

function startAnalyzeLoop() {
    stopAnalyzeLoop();
    analyzeInterval = window.setInterval(analyzeAndRender, 5000);
}

function stopAnalyzeLoop() {
    window.clearInterval(analyzeInterval);
    analyzeInterval = undefined;
}

async function analyzeAndRender(): Promise<void> {
    const results = await analyzeVideo();
    renderResults(screenreaderContainer, results);
}

async function analyzeVideo(): Promise<RegionResult[]> {
    if (!initialized) {
        Logger.log('[StreamABLE] Analyze Video - Not yet initialized.');
        return [];
    }

    sourceVideo = document.querySelector('video');

    if (!canvasContext || !sourceVideo || !sourceVideo.style) {
        Logger.log('[StreamABLE] Analyze Video - Missing canvas or video.');
        return [];
    }

    const videoWidth = sourceVideo.videoWidth;
    const videoHeight = sourceVideo.videoHeight;
    Logger.log(`[StreamABLE] Analyze Video - video is ${videoWidth} by ${videoHeight}`);

    bufferCanvas.width = videoWidth;
    bufferCanvas.height = videoHeight;
    canvasContext.drawImage(sourceVideo, 0, 0, videoWidth, videoHeight);

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

function getResultContainerId(name: string): string {
    return `${SCREENREADER_CONTAINER_ID}-${name.replace(/\W+/g, '-')}`;
}

function renderResults(container: HTMLElement, results: RegionResult[]) {
    if (!container || !results) {
        return;
    }

    let id: string;
    let element: HTMLDivElement | null;
    for (let i = 0; i < results.length; i++) {
        let { name, text } = results[i];
        id = getResultContainerId(name);

        element = container.querySelector(`[id=${id}]`);
        if (!element) {
            element = document.createElement('div');
            element.id = id;
            container.appendChild(element);
        }

        element.textContent = `${name}. ${text}`;
    }

    if (sourceVideo && sourceVideo.parentElement) {
        sourceVideo.parentElement.insertBefore(screenreaderContainer, sourceVideo);
    }
}
