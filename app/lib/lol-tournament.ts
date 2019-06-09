import { DataType, Region } from './config';

export const regions: Region[] = [
    {
        name: 'Time',
        dimensions: [930, 75, 100, 25],
        type: DataType.time,
    },
    {
        name: 'Kills: Blue team',
        dimensions: [910, 5, 40, 60],
        type: DataType.number,
    },
    {
        name: 'Kills: Red team',
        dimensions: [985, 5, 40, 60],
        type: DataType.number,
    },
    {
        name: 'Gold: Blue team',
        dimensions: [760, 5, 85, 35],
        type: DataType.gold,
    },
    {
        name: 'Gold: Red team',
        dimensions: [1140, 5, 85, 35],
        type: DataType.gold,
    },
    {
        name: 'Name: Blue team',
        dimensions: [450, 5, 120, 35],
        type: DataType.text,
    },
    {
        name: 'Name: Red team',
        dimensions: [1350, 5, 120, 35],
        type: DataType.text,
    },
];
