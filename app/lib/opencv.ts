import '../app/opencv';

export interface OpenCV extends OpenCVEnums {
    Canny(source: Mat, destination: Mat, threshold1: number, threadhols2: number, apertureSize: number, useL2gradient: boolean): void;
    cvtColor(source: Mat, destination: Mat, color: OpenCVColors): void;
    imshow(destination: string | HTMLCanvasElement, mat: Mat): void;
    matchTemplate(source: Mat, template: Mat, destination: Mat, method: OpenCVMatchModes, mask?: Mat): void;
    matFromImageData(data: {height: number, width: number}): Mat;
    minMaxLoc(source: Mat, mask?: Mat): MinMaxLoc;
    Point: Point;
    Rect: Rect;
    rectangle(source: Mat, corner1: Point, corner2: Point, color: Scalar, thickness: number, type: OpenCVLineType, shift: number): void;
    resize(source: Mat, destination: Mat, destinationSize: Size, scaleX: number, scaleY: number, option: OpenCVInterpolationFlags): void;
    Scalar: Scalar;
    Size: Size;
}

interface Size {
    new(width: number, height: number): Size;
}

interface Rect {
    new(x: number, y: number, width: number, height: number): Rect;
}

interface OpenCVInterpolationFlags {
    INTER_AREA: any;
}

interface OpenCVColors {
    COLOR_RGBA2GRAY: any;
}

interface OpenCVMatchModes {
    TM_CCOEFF: any;
}

interface OpenCVLineType {
    LINE_8: any;
}

export interface MinMaxLoc {
    maxLoc: Point;
    minLoc: Point;
}

interface Point {
    new(x: number, y: number): Point;
    x: number;
    y: number;
}

interface Scalar {
    new(r: number, g: number, b: number, alpha: number): Scalar;
}

export interface Mat {
    // full api: https://docs.opencv.org/3.4/d3/d63/classcv_1_1Mat.html
    cols: number;
    delete(): void;
    roi(rect: Rect): Mat;
    rows: number;
}

interface OpenCVEnums extends
    OpenCVColors,
    OpenCVInterpolationFlags,
    OpenCVMatchModes,
    OpenCVLineType {}