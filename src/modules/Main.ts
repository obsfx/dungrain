import { Interfaces } from '../interfaces.namespace';

import seedrandom from 'seedrandom';

import Node from './Node';
import RoomChunk from './RoomChunk';
import Room from './Room';
import PathChunk from './PathChunk';
import Path from './Path';
import InputErrorHandler from './InputErrorHandler';

export default class Main implements Interfaces.Main {
    seed: string;
    iterationCount: number;
    column: number;
    row: number;
    minimumWHRatio: number;
    maximumWHRatio: number;
    minimumChunkWidth: number;
    minimumChunkHeight: number;
    indexMap: {
        Wall: number,
        Path: number,
        Room: number,
        Empty: number
    }

    RNG: seedrandom.prng;
    arrayMap: number[][];
    root: Node;
    allFloors: Interfaces.Floor[];
    roomChunks: RoomChunk[];
    pathChunks: PathChunk[];
    rooms: Room[];
    paths: Path[];

    constructor(args: {
        seed: string | undefined,
        iterationCount: number,
        column: number,
        row: number,
        minimumWHRatio: number | undefined,
        maximumWHRatio: number | undefined,
        minimumChunkWidth: number | undefined,
        minimumChunkHeight: number | undefined,
        indexMap: {
            Wall: number,
            Path: number,
            Room: number,
            Empty: number
        }
    }) {
        // args.seed = args.seed || Date.now().toString(16);
        // args.minimumWHRatio = args.minimumWHRatio || 0.5;
        // args.maximumWHRatio = args.maximumWHRatio || 2.0;
        // args.minimumChunkWidth = args.minimumChunkWidth || 8;
        // args.minimumChunkHeight = args.minimumChunkHeight || 8;

        let errors: string[] = InputErrorHandler(args);

        if (errors.length > 0) {
            throw new Error('dungrain error: please check your arguments. \n' + errors.join('\n'));
        }

        this.seed = args.seed || Date.now().toString(16);
        this.iterationCount = args.iterationCount;
        this.column = args.column;
        this.row = args.row;
        this.minimumWHRatio = args.minimumWHRatio || 0.5;
        this.maximumWHRatio = args.maximumWHRatio || 2.0;
        this.minimumChunkWidth = args.minimumChunkWidth || 8;
        this.minimumChunkHeight = args.minimumChunkHeight || 8;
        this.indexMap = args.indexMap;
        this.RNG = seedrandom(this.seed);
        this.arrayMap = this.createEmptyArrayMap(this.column, this.row);

        this.root = new Node({
            x: 0,
            y: 0,
            w: this.column,
            h: this.row,
            minRatio: this.minimumWHRatio,
            maxRatio: this.maximumWHRatio,
            minWidth: this.minimumChunkWidth,
            minHeight: this.minimumChunkHeight
        }, this.RNG);

        this.root.split(this.iterationCount);
        this.root.generateRoomChunks();
        this.root.createPathChunks();

        this.allFloors = [];

        this.roomChunks = this.root.getRoomChunks();
        this.pathChunks = this.root.getPathChunks();
        this.rooms = [];
        this.paths = [];

        this.constructArrayMap();
    }

    createEmptyArrayMap(col: number, row: number): number[][] {
        let arrayMap: number[][] = [];

        for (let i: number = 0; i < row; i++) {
            arrayMap.push([]);
            for (let j: number = 0; j < col; j++) { 
                arrayMap[i].push(this.indexMap.Empty);
            }
        }

        return arrayMap;
    }

    placeWalls(): void {
        this.roomChunks.forEach((chunk: RoomChunk) => {
            let yStart = (chunk.h > 3) ? chunk.y : chunk.y - 1;
            let yTarget = (chunk.h > 3) ? chunk.y + chunk.h : chunk.y + chunk.h + 1;
        
            let xStart = (chunk.w > 3) ? chunk.x : chunk.x - 1;
            let xTarget = (chunk.w > 3) ? chunk.x + chunk.w : chunk.x + chunk.w + 1;

            for (let i = yStart; i < yTarget; i++) {
                for (let j = xStart; j < xTarget; j++) {       
                    if (i > -1 && i < this.row && j > -1 && j < this.column) {
                        this.arrayMap[i][j] = this.indexMap.Wall;
                    }
                }
            }
        });

        this.pathChunks.forEach((path: PathChunk) => {
            for (let i = path.y1 - 1; i < path.y1 + path.h + 1; i++) {
                for (let j = path.x1 - 1; j < path.x1 + path.w + 1; j++) {
                    if (i > -1 && i < this.row && j > -1 && j < this.column) {
                        this.arrayMap[i][j] = this.indexMap.Wall;
                    }
                }
            }
        });
    }

    placePaths(): void {
        this.pathChunks.forEach((path: PathChunk) => {
            let startPoint: Interfaces.Point | null = null;
            let floors: Interfaces.Point[] = [];

            for (let i = path.y1; i < path.y1 + path.h; i++) {
                for (let j = path.x1; j < path.x1 + path.w; j++) { 
                    if (i == 0 || i == this.row - 1 || j == 0 || j == this.column - 1) {
                        this.arrayMap[i][j] = this.indexMap.Wall;
                    } else {
                        if (startPoint == null) {
                            startPoint = {
                                x: j,
                                y: i
                            }
                        }

                        floors.push({ x: j, y: i });

                        this.arrayMap[i][j] = this.indexMap.Path;
                        this.allFloors.push({ x: j, y: i, type: this.indexMap.Path });
                    }
                }
            }

            if (startPoint != null) {
                this.paths.push(new Path({
                    startPoint,
                    floors,
                    direction: (path.w == this.root.pathWidth) ? 
                        Interfaces.Direction.VERTICAL : 
                        Interfaces.Direction.HORIZONTAL,
                    width: (path.w == this.root.pathWidth) ?
                        path.h :
                        path.w
                }));
            }
        });
    }

    placeRooms(): void {
        this.roomChunks.forEach((chunk: RoomChunk) => {
            let yStart = (chunk.h > 3) ? chunk.y + 1 : chunk.y;
            let yTarget = (chunk.h > 3) ? chunk.y + chunk.h - 1 : chunk.y + chunk.h;
        
            let xStart = (chunk.w > 3) ? chunk.x + 1 : chunk.x;
            let xTarget = (chunk.w > 3) ? chunk.x + chunk.w - 1 : chunk.x + chunk.w;

            let roomTopLeft: Interfaces.Point | null = null;
            let floors: Interfaces.Point[] = [];

            for (let i = yStart; i < yTarget; i++) {
                for (let j = xStart; j < xTarget; j++) {
                    if (i == 0 || i == this.row - 1 || j == 0 || j == this.column - 1) { 
                        this.arrayMap[i][j] = this.indexMap.Wall;
                    } else {
                        if (roomTopLeft == null) {
                            roomTopLeft = {
                                x: j,
                                y: i
                            }
                        }

                        floors.push({ x: j, y: i });

                        this.arrayMap[i][j] = this.indexMap.Room;
                        this.allFloors.push({ x: j, y: i, type: this.indexMap.Room });
                    }
                }
            }

            if (roomTopLeft != null) {
                this.rooms.push(new Room(roomTopLeft, floors));
            }
        });
    }

    constructArrayMap(): void {
        this.placeWalls();
        this.placePaths();
        this.placeRooms();
    }

    getSeed(): string {
        return this.seed;
    }

    getRooms(): Room[] {
        return this.rooms;
    }

    getPaths(): Path[] {
        return this.paths;
    }

    getAllFloors(): Interfaces.Floor[] {
        return this.allFloors;
    }

    getMap(): number[][] {
        return this.arrayMap;
    }
}