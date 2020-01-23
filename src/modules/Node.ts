import { Interfaces } from '../interfaces.namespace';

import PathChunk from './PathChunk';
import RoomChunk from './RoomChunk';

export default class Node implements Interfaces.Node {
    chunk: Interfaces.NodeChunk;
    left: Interfaces.Node | null;
    right: Interfaces.Node | null;
    roomChunk: RoomChunk | null;
    pathChunks: PathChunk[];
    pathWidth: number;
    Direction: Interfaces.Direction;
    isSplit: boolean;
    RNG: seedrandom.prng;

    constructor(chunk: Interfaces.NodeChunk, RNG: seedrandom.prng) {
        this.chunk = chunk;
        this.left = null;
        this.right = null;
        this.roomChunk = null;
        this.pathChunks = [];
        this.pathWidth = 1;
        this.Direction = Interfaces.Direction.VERTICAL;
        this.isSplit = false;
        this.RNG = RNG;
    }

    random(min: number, max: number): number {
        return Math.floor(this.RNG() * (max - min)) + min
    }

    split(iterationCount: number): void {
        this.isSplit = true;

        this.Direction = (this.RNG() > 0.5) ? 
        Interfaces.Direction.VERTICAL : 
        Interfaces.Direction.HORIZONTAL;

        let ratio: number = this.chunk.w / this.chunk.h;

        if (ratio <= this.chunk.minRatio) {
            this.Direction = Interfaces.Direction.HORIZONTAL;
        } else if (ratio >= this.chunk.maxRatio) {
            this.Direction = Interfaces.Direction.VERTICAL;
        }

        let shiftOffset: number = (this.Direction == Interfaces.Direction.VERTICAL) ? 
        this.random(-this.chunk.w / 4, this.chunk.w / 4) : 
        this.random(-this.chunk.h / 4, this.chunk.h / 4);

        this.left = new Node({
            x: this.chunk.x,

            y: this.chunk.y,

            w: (this.Direction == Interfaces.Direction.VERTICAL) ? 
            this.chunk.w / 2 + shiftOffset : 
            this.chunk.w,

            h: (this.Direction == Interfaces.Direction.VERTICAL) ? 
            this.chunk.h : 
            this.chunk.h / 2 + shiftOffset,

            minRatio: this.chunk.minRatio,
            maxRatio: this.chunk.maxRatio,
            minWidth: this.chunk.minWidth,
            minHeight: this.chunk.minHeight
        }, this.RNG);

        this.right = new Node({
            x: (this.Direction == Interfaces.Direction.VERTICAL) ? 
            this.chunk.x + this.chunk.w / 2 + shiftOffset : 
            this.chunk.x,

            y: (this.Direction == Interfaces.Direction.VERTICAL) ? 
            this.chunk.y : 
            this.chunk.y + this.chunk.h / 2 + shiftOffset,
            
            w: (this.Direction == Interfaces.Direction.VERTICAL) ? 
            this.chunk.w / 2 - shiftOffset : 
            this.chunk.w,

            h: (this.Direction == Interfaces.Direction.VERTICAL) ? 
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

    generateRoomChunks(): void {

        if (!this.isSplit) {
            let x: number = Math.floor(this.chunk.x + this.random(this.chunk.w * 0.2, this.chunk.w * 0.25));
            let y: number = Math.floor(this.chunk.y + this.random(this.chunk.h * 0.2, this.chunk.h * 0.25));

            let w: number = Math.floor(this.random(this.chunk.w * 0.6, this.chunk.w * 0.7));
            let h: number = Math.floor(this.random(this.chunk.h * 0.6, this.chunk.h * 0.7));

            this.roomChunk = new RoomChunk(x, y, w, h);
        }

        if (this.left != null) {
            this.left.generateRoomChunks();
        }
        
        if (this.right != null) {
            this.right.generateRoomChunks();
        }
    }

    constructPathChunks(a: Interfaces.Point, b: Interfaces.Point, direction: Interfaces.Direction, pathWidth: number): PathChunk {
        let x1: number = Math.floor(a.x);
        let y1: number = Math.floor(a.y);

        let x2: number = Math.floor(b.x);
        let y2: number = Math.floor(b.y);

        let w: number = (direction == Interfaces.Direction.VERTICAL) ? x2 - x1 : pathWidth;
        let h: number = (direction == Interfaces.Direction.VERTICAL) ? pathWidth : y2 - y1;

        return new PathChunk(x1, y1, x2, y2, w, h);
    }

    createPathChunks(): void {

        if (this.left != null && this.right != null) {
            this.pathChunks.push(this.constructPathChunks(
                {
                    x: this.left.chunk.x + this.left.chunk.w / 4,
                    y: this.left.chunk.y + this.left.chunk.h / 4,
                },

                {
                    x: this.right.chunk.x + this.right.chunk.w / 1.5,
                    y: this.right.chunk.y + this.right.chunk.h / 1.5,
                },

                this.Direction,
                this.pathWidth
            ));

            this.left.createPathChunks();
            this.right.createPathChunks();
        }
    }

    getChunks(): Interfaces.NodeChunk[] {
        let chunkArr: Interfaces.NodeChunk[] = [ this.chunk ];

        if (this.left != null && this.right != null) {
            chunkArr = [ ...chunkArr, ...this.left.getChunks(), ...this.right.getChunks() ];
        }

        return chunkArr;
    }

    getRoomChunks(): RoomChunk[] {
        let roomArr: RoomChunk[] = [];

        if (this.roomChunk != null) {
            roomArr.push(this.roomChunk);
        }

        if (this.left != null && this.right != null) {
            roomArr = [ ...roomArr, ...this.left.getRoomChunks(), ...this.right.getRoomChunks() ];
        }

        return roomArr;
    }

    getPathChunks(): PathChunk[] {
        let pathArr: PathChunk[] = this.pathChunks;

        if (this.left != null && this.right != null) {
            pathArr = [ ...pathArr, ...this.left.getPathChunks(), ...this.right.getPathChunks() ];
        }

        return pathArr;
    }
}