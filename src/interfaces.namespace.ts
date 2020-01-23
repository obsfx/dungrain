export namespace Interfaces {
    export interface Room {
        topLeftCorner: Point;
        floors: Point[];
    }

    export interface RoomChunk {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    export interface Path {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        w: number;
        h: number;
    }

    export enum SplitDirection {
        VERTICAL,
        HORIZONTAL
    }
    
    export interface Point {
        x: number;
        y: number;
    }
    
    export interface NodeChunk extends Point {
        w: number;
        h: number;
        minRatio: number;
        maxRatio: number;
        minWidth: number;
        minHeight: number;
    }
    
    export interface Node {
        chunk: NodeChunk;
        left: Node | null;
        right: Node | null;
        roomChunk: RoomChunk | null;
        paths: Path[] | null;
        splitDirection: SplitDirection;
        isSplit: boolean;
        RNG: seedrandom.prng;
    
        random(min: number, max: number): number;
        split(iterationCount: number): void;
        generateRoomChunks(): void;
        constructPath(a: Point, b: Point, direction: SplitDirection, pathWidh: number): Path;
        createPaths(): void;
        getChunks(): NodeChunk[];
        getRoomChunks(): RoomChunk[];
        getPaths(): Path[];
    }

    export interface Main {
        seed: string | undefined;
        column: number;
        row: number;
        minimumWHRatio: number;
        maximumWHRatio: number;
        minimumChunkWidth: number;
        minimumChunkHeight: number;
        indexMap: {
            WALL: number,
            Path: number,
            Room: number
        };

        RNG: seedrandom.prng;
        arrayMap: number[][];
        root: Node;
        roomChunks: RoomChunk[];
        Paths: Path[];

        placeWalls(): void;
        placePaths(): void;
        placeRoomChunks(): void;

        constructArrayMap(): void;
    }
}