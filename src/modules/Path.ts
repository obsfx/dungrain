import { Interfaces } from '../interfaces.namespace';

export default class Path implements Interfaces.Path {
    startPoint: Interfaces.Point;
    floors: Interfaces.Point[];
    direction: Interfaces.Direction;
    width: number;
    
    constructor(args: {
        startPoint: Interfaces.Point,
        floors: Interfaces.Point[],
        direction: Interfaces.Direction,
        width: number
    }) {
        this.startPoint = args.startPoint;
        this.floors = args.floors;
        this.direction = args.direction;
        this.width = args.width;
    }
}