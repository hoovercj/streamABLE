import { Logger } from './logger';

export enum DataType {
    time = 'time',
    number= 'number',
    text = 'text',
    gold = 'gold',
}

export function processResult(result: string, type: DataType): string {
    result = result.trim();
    switch (type) {
        case DataType.time:
            // Time should have a colon. If it does, we assume a proper time,
            // otherwise we add one
            if (result.indexOf(':') < 0) {
                if (result.length > 4) {
                    // Sometimes Tesseract reads the colon as a number,
                    // so if the time is longer than 4 digits and is
                    // missing a colon, we assume the 3rd character from
                    // the end was actually a colon
                    Logger.info('Replacing result: ' + result);
                    return replaceAt(result, result.length - 3, ':');
                } else {
                    Logger.info('Replacing result: ' + result);
                    return insertAt(result, result.length - 2, ':');
                }
            }

            return result;
        case DataType.gold:
            // Gold must end in 'k'
            if (result.charAt(result.length - 1) !== 'k') {
                Logger.info('Replacing result: ' + result);
                result = result + 'k';
            }

            // The period is often missed by tesseract but the display
            // has 1 decimal place, so we can insert it
            if (result.indexOf('.') < 0) {
                Logger.info('Replacing result: ' + result);
                return insertAt(result, result.length - 2, '.');
            }

            return result;
        default:
            return result;
    }
}

export const DataTypeToWhitelist: {[key: string]: string} = {
    time: '1234567890:',
    number: '1234567890',
    text: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    gold: '1234567890.k',
};

export interface Region {
    name: string;
    dimensions: [number, number, number, number];
    type: DataType;
}

function replaceAt(input: string, index: number, replacement: string) {
    return input.substr(0, index) + replacement + input.substr(index + replacement.length);
}

function insertAt(input: string, index: number, insertion: string) {
    return input.substr(0, index) + insertion + input.substr(index);
}