import Room from './Room';

enum SplitDirection {
    VERTICAL,
    HORIZONTAL
}

const canvas: any = document.querySelector('.screen');
const ctx: any = canvas.getContext('2d');

interface INodeChunk {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface INode {
    chunk: INodeChunk;
    left: Node | null;
    right: Node | null;
    room: Room | null;
    isSplit: boolean;
    RNG: seedrandom.prng;

    random(min: number, max: number): number;
    split(iterationCount: number, RNG: seedrandom.prng): void;
    getChunks(): INodeChunk[];
    generateRoom(): void;
}

export default class Node implements INode {
    chunk: INodeChunk;
    left: Node | null;
    right: Node | null;
    room: Room | null;
    isSplit: boolean;
    RNG: seedrandom.prng;

    constructor(chunk: INodeChunk, RNG: seedrandom.prng) {
        this.chunk = chunk;
        this.left = null;
        this.right = null;
        this.room = null;
        this.isSplit = false;
        this.RNG = RNG;

        ctx.font = "18px Arial";
        ctx.fillStyle = 'red'
        // ctx.fillText(this.chunk.w / this.chunk.h, this.chunk.x + this.chunk.w / 2, this.chunk.y + this.chunk.h / 2);
    }

    random(min: number, max: number): number {

        return 1;
    }

    split(iterationCount: number): void {
        this.isSplit = true;

        let direction: SplitDirection = (this.RNG() > 0.5) ? 
        SplitDirection.VERTICAL : 
        SplitDirection.HORIZONTAL;
        // console.log((direction == SplitDirection.VERTICAL) ? 'v' : 'h');

        let ratio: number = this.chunk.w / this.chunk.h;

        if (ratio <= 0.5) {
            direction = SplitDirection.HORIZONTAL;
        } else if (ratio >= 2) {
            direction = SplitDirection.VERTICAL;
        }

        let shiftOffset: number = (direction == SplitDirection.VERTICAL) ? 
        Math.floor(this.RNG() * (this.chunk.w / 4) * 2) - this.chunk.w / 4: 
        Math.floor(this.RNG() * (this.chunk.h / 4) * 2) - this.chunk.h / 4;

        this.left = new Node({
            x: this.chunk.x,

            y: (direction == SplitDirection.VERTICAL) ? 
            this.chunk.y : 
            this.chunk.y + this.chunk.h / 2 - shiftOffset,

            w: (direction == SplitDirection.VERTICAL) ? 
            this.chunk.w / 2 + shiftOffset : 
            this.chunk.w,

            h: (direction == SplitDirection.VERTICAL) ? 
            this.chunk.h : 
            this.chunk.h / 2 + shiftOffset
        }, this.RNG);

        this.right = new Node({
            x: (direction == SplitDirection.VERTICAL) ? 
            this.chunk.x + this.chunk.w / 2 + shiftOffset : 
            this.chunk.x,

            y: this.chunk.y,
            
            w: (direction == SplitDirection.VERTICAL) ? 
            this.chunk.w / 2 - shiftOffset : 
            this.chunk.w,

            h: (direction == SplitDirection.VERTICAL) ? 
            this.chunk.h : 
            this.chunk.h / 2 - shiftOffset
        }, this.RNG);

        if (iterationCount > 0) {
            if (this.left.chunk.w > 50 && this.left.chunk.h > 50) {
                this.left.split(iterationCount - 1);
            }
            
            if (this.right.chunk.w > 50 && this.right.chunk.h > 50) {
                this.right.split(iterationCount - 1);
            }
        }

        // if (!this.left.isSplit) {
        //     this.left.generateRoom(this.RNG());
        // }

        // if (!this.right.isSplit) {
        //     this.right.generateRoom(RNG);
        // }
    }

    getChunks(): INodeChunk[] {
        let chunkArr: INodeChunk[] = [ this.chunk ];

        if (this.left != null && this.right != null) {
            chunkArr = [ ...chunkArr, ...this.left.getChunks(), ...this.right.getChunks() ];
        }

        return chunkArr;
    }

    generateRoom(): void {
        // let x: number = this.chunk.x + Math.floor(RNG() * (this.chunk.w / 6 - 5)) + 5;
        // let y: number = this.chunk.y + Math.floor(RNG() * (this.chunk.h / 6 - 5)) + 5;
        // let w: number = Math.floor(RNG() * (this.chunk.w - 6 - (x - this.chunk.x) - this.chunk.w / 4)) + this.chunk.w / 4;
        // let h: number = Math.floor(RNG() * (this.chunk.h - 6 - (y - this.chunk.y) - this.chunk.h / 4)) + this.chunk.h / 4;

        // this.room = new Room(x, y, w, h);
    }
}