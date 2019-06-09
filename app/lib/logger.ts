export enum LogLevel {
    log,
    info,
    warn,
    error,
    none,
}

export class Logger {
    static LogLevel: LogLevel = LogLevel.warn;
    static LogImages = false;

    static logImage(buffer: HTMLCanvasElement) {
        if (Logger.LogImages && cv) {
            openImageInNewTab(buffer);
        }
    }

    static log(...args: any[]) {
        if (Logger.LogLevel <= LogLevel.log) {
            console.log(...args);
        }
    }

    static info(...args: any[]) {
        if (Logger.LogLevel <= LogLevel.info) {
            console.info(...args);
        }
    }

    static warn(...args: any[]) {
        if (Logger.LogLevel <= LogLevel.warn) {
            console.warn(...args);
        }
    }

    static error(...args: any[]) {
        if (Logger.LogLevel <= LogLevel.error) {
            console.error(...args);
        }
    }
}

function openImageInNewTab(canvas: HTMLCanvasElement) {
    const dataUri = canvas.toDataURL('image/jpeg');
    const newTab = window.open();

    if (!newTab) {
        return;
    }

    newTab.document.body.innerHTML = `<img src="${dataUri}">`;
}
