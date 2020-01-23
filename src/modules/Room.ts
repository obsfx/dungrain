import { Interfaces } from '../interfaces.namespace';

export default class Room implements Interfaces.Room {
    topLeftCorner: Interfaces.Point;
    floors: Interfaces.Point[];

    constructor(topLeftCorner: Interfaces.Point, floors: Interfaces.Point[]) {
        this.topLeftCorner = topLeftCorner;
        this.floors = floors;
    }
}