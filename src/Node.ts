import Room from './Room';
import Path from './Path';

enum SplitDirection {
    VERTICAL,
    HORIZONTAL
}

interface IPoint {
    x: number;
    y: number;
}

interface INodeChunk extends IPoint {
    w: number;
    h: number;
    minRatio: number;
    maxRatio: number;
    minWidth: number;
    minHeight: number;
}

interface INode {
    chunk: INodeChunk;
    left: Node | null;
    right: Node | null;
    room: Room | null;
    paths: Path[] | null;
    splitDirection: SplitDirection;
    isSplit: boolean;
    RNG: seedrandom.prng;

    random(min: number, max: number): number;
    split(iterationCount: number, RNG: seedrandom.prng): void;
    generateRooms(): void;
    constructPath(a: IPoint, b: IPoint, direction: SplitDirection, pathWidh: number): Path;
    createPaths(chunkLeft: INodeChunk, chunkRight: INodeChunk): void;
    getChunks(): INodeChunk[];
    getRooms(): Room[];
    getPaths(): Path[];
}

export default class Node implements INode {
    chunk: INodeChunk;
    left: Node | null;
    right: Node | null;
    room: Room | null;
    splitDirection: SplitDirection;
    paths: Path[];
    isSplit: boolean;
    RNG: seedrandom.prng;

    constructor(chunk: INodeChunk, RNG: seedrandom.prng) {
        this.chunk = chunk;
        this.left = null;
        this.right = null;
        this.room = null;
        this.paths = [];
        this.splitDirection = SplitDirection.VERTICAL;
        this.isSplit = false;
        this.RNG = RNG;
    }

    random(min: number, max: number): number {
        return Math.floor(this.RNG() * (max - min)) + min
    }

    split(iterationCount: number): void {
        this.isSplit = true;

        this.splitDirection = (this.RNG() > 0.5) ? 
        SplitDirection.VERTICAL : 
        SplitDirection.HORIZONTAL;

        let ratio: number = this.chunk.w / this.chunk.h;

        if (ratio <= this.chunk.minRatio) {
            this.splitDirection = SplitDirection.HORIZONTAL;
        } else if (ratio >= this.chunk.maxRatio) {
            this.splitDirection = SplitDirection.VERTICAL;
        }

        let shiftOffset: number = (this.splitDirection == SplitDirection.VERTICAL) ? 
        this.random(-this.chunk.w / 4, this.chunk.w / 4) : 
        this.random(-this.chunk.h / 4, this.chunk.h / 4);

        this.left = new Node({
            x: this.chunk.x,

            y: this.chunk.y,

            w: (this.splitDirection == SplitDirection.VERTICAL) ? 
            this.chunk.w / 2 + shiftOffset : 
            this.chunk.w,

            h: (this.splitDirection == SplitDirection.VERTICAL) ? 
            this.chunk.h : 
            this.chunk.h / 2 + shiftOffset,

            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
        }, this.RNG);

        this.right = new Node({
            x: (this.splitDirection == SplitDirection.VERTICAL) ? 
            this.chunk.x + this.chunk.w / 2 + shiftOffset : 
            this.chunk.x,

            y: (this.splitDirection == SplitDirection.VERTICAL) ? 
            this.chunk.y : 
            this.chunk.y + this.chunk.h / 2 + shiftOffset,
            
            w: (this.splitDirection == SplitDirection.VERTICAL) ? 
            this.chunk.w / 2 - shiftOffset : 
            this.chunk.w,

            h: (this.splitDirection == SplitDirection.VERTICAL) ? 
            this.chunk.h : 
            this.chunk.h / 2 - shiftOffset,

            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
        }, this.RNG);

        if (iterationCount > 0) {
            if (this.left.chunk.w > this.left.chunk.minWidth && this.left.chunk.h > this.left.chunk.minHeight) {
                this.left.split(iterationCount - 1);
            }
            
            if (this.right.chunk.w > this.right.chunk.minWidth && this.right.chunk.h > this.right.chunk.minHeight) {
                this.right.split(iterationCount - 1);
            }
        }
    }

    generateRooms(): void {

        if (!this.isSplit) {
            let x: number = Math.floor(this.chunk.x + this.random(this.chunk.w * 0.2, this.chunk.w * 0.3));
            let y: number = Math.floor(this.chunk.y + this.random(this.chunk.h * 0.2, this.chunk.h * 0.3));

            let w: number = Math.floor(this.random(this.chunk.w * 0.5, this.chunk.w * 0.65));
            let h: number = Math.floor(this.random(this.chunk.h * 0.5, this.chunk.h * 0.65));

            this.room = new Room(x, y, w, h);
        }

        if (this.left != null) {
            this.left.generateRooms();
        }
        
        if (this.right != null) {
            this.right.generateRooms();
        }
    }

    constructPath(a: IPoint, b: IPoint, direction: SplitDirection, pathWidh: number): Path {
        let x1: number = Math.floor(a.x);
        let y1: number = Math.floor(a.y);

        let x2: number = Math.floor(b.x);
        let y2: number = Math.floor(b.y);

        let w: number = (direction == SplitDirection.VERTICAL) ? x2 - x1 : pathWidh;
        let h: number = (direction == SplitDirection.VERTICAL) ? pathWidh : y2 - y1;

        return new Path(x1, y1, x2, y2, w, h);
    }

    createPaths(): void {

        if (this.left != null && this.right != null) {
            this.paths.push(this.constructPath(
                {
                    x: this.left.chunk.x + this.left.chunk.w / 2,
                    y: this.left.chunk.y + this.left.chunk.h / 2,
                },

                {
                    x: this.right.chunk.x + this.right.chunk.w / 2,
                    y: this.right.chunk.y + this.right.chunk.h / 2,
                },

                this.splitDirection,
                1
            ));

            this.left.createPaths();
            this.right.createPaths();
        }
    }

    getChunks(): INodeChunk[] {
        let chunkArr: INodeChunk[] = [ this.chunk ];

        if (this.left != null && this.right != null) {
            chunkArr = [ ...chunkArr, ...this.left.getChunks(), ...this.right.getChunks() ];
        }

        return chunkArr;
    }

    getRooms(): Room[] {
        let roomArr: Room[] = [];

        if (this.room != null) {
            roomArr.push(this.room);
        }

        if (this.left != null && this.right != null) {
            roomArr = [ ...roomArr, ...this.left.getRooms(), ...this.right.getRooms() ];
        }

        return roomArr;
    }

    getPaths(): Path[] {
        let pathArr: Path[] = this.paths;

        if (this.left != null && this.right != null) {
            pathArr = [ ...pathArr, ...this.left.getPaths(), ...this.right.getPaths() ];
        }

        return pathArr;
    }
}