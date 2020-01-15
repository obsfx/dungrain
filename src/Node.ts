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
    isSplit: boolean;
    RNG: seedrandom.prng;

    random(min: number, max: number): number;
    split(iterationCount: number, RNG: seedrandom.prng): void;
    getChunks(): INodeChunk[];
    generateRoom(): void;
    createPath(chunkLeft: INodeChunk, chunkRight: INodeChunk): void
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
        return Math.floor(this.RNG() * (max - min)) + min
    }

    split(iterationCount: number): void {
        this.isSplit = true;

        let direction: SplitDirection = (this.RNG() > 0.5) ? 
        SplitDirection.VERTICAL : 
        SplitDirection.HORIZONTAL;
        // console.log((direction == SplitDirection.VERTICAL) ? 'v' : 'h');

        let ratio: number = this.chunk.w / this.chunk.h;

        if (ratio <= this.chunk.minRatio) {
            direction = SplitDirection.HORIZONTAL;
        } else if (ratio >= this.chunk.maxRatio) {
            direction = SplitDirection.VERTICAL;
        }

        // let shiftOffset: number = (direction == SplitDirection.VERTICAL) ? 
        // Math.floor(this.RNG() * (this.chunk.w / 4) * 2) - this.chunk.w / 4: 
        // Math.floor(this.RNG() * (this.chunk.h / 4) * 2) - this.chunk.h / 4;

        let shiftOffset: number = (direction == SplitDirection.VERTICAL) ? 
        this.random(-this.chunk.w / 4, this.chunk.w / 4) : 
        this.random(-this.chunk.h / 4, this.chunk.h / 4);

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
            this.chunk.h / 2 + shiftOffset,

            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
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
            this.chunk.h / 2 - shiftOffset,

            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
        }, this.RNG);

        // ctx.fillStyle = 'black';
        // ctx.fillRect(this.right.chunk.x - 5, this.right.chunk.y - 5, 10, 10);

        // ctx.fillStyle = 'black';
        // ctx.fillRect(this.left.chunk.x - 5, this.left.chunk.y - 5, 10, 10);

        if (iterationCount > 0) {
            if (this.left.chunk.w > this.left.chunk.minWidth && this.left.chunk.h > this.left.chunk.minHeight) {
                this.left.split(iterationCount - 1);
            }
            
            if (this.right.chunk.w > this.right.chunk.minWidth && this.right.chunk.h > this.right.chunk.minHeight) {
                this.right.split(iterationCount - 1);
            }
        }

        if (!this.left.isSplit) {
            this.left.generateRoom();
        }

        if (!this.right.isSplit) {
            this.right.generateRoom();
        }

        this.createPath(this.left.chunk, this.right.chunk);
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

        let x: number = this.chunk.x + this.random(this.chunk.w / 10, this.chunk.w / 5);
        let y: number = this.chunk.y + this.random(this.chunk.h / 10, this.chunk.h / 5);

        let w: number = this.random(this.chunk.w / 3, this.chunk.w - (x - this.chunk.x));
        let h: number = this.random(this.chunk.h / 3, this.chunk.h - (y - this.chunk.y));

        this.room = new Room(x, y, w, h);
    }

    createPath(chunkLeft: INodeChunk, chunkRight: INodeChunk): void {

        ctx.beginPath();
        ctx.moveTo(chunkLeft.x + chunkLeft.w / 2 - 5, chunkLeft.y + chunkLeft.h / 2 - 5);
        ctx.lineTo(chunkRight.x + chunkRight.w / 2 - 5, chunkRight.y + chunkRight.h / 2 - 5);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.closePath();
    }
}