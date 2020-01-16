interface IPath {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    w: number;
    h: number;
}

export default class Path implements IPath {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    w: number;
    h: number;

    constructor(x1: number, y1: number, x2: number, y2: number, w: number, h: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.w = w;
        this.h = h;
    }
}