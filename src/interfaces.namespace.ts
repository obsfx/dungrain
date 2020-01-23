export namespace Interfaces {
    export interface Point {
        x: number;
        y: number;
    }
    
    export interface Floor extends Point {
        type: number;
    }

    export interface Room {
        topLeftCorner: Point;
        floors: Point[];
    }

    export interface Path {
        startPoint: Point;
        floors: Point[];
        direction: Direction;
        width: number;
    }

    export interface RoomChunk {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    export interface PathChunk {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        w: number;
        h: number;
    }

    export enum Direction {
        VERTICAL,
        HORIZONTAL
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
		pathChunks: PathChunk[];
		pathWidth: number;
        Direction: Direction;
        isSplit: boolean;
        RNG: seedrandom.prng;
    
        random(min: number, max: number): number;
        split(iterationCount: number): void;
        generateRoomChunks(): void;
        constructPathChunks(a: Point, b: Point, direction: Direction, pathWidth: number): PathChunk;
        createPathChunks(): void;
        getChunks(): NodeChunk[];
        getRoomChunks(): RoomChunk[];
        getPathChunks(): PathChunk[];
    }

    export interface Main {
        seed: string;
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
        };
		
        RNG: seedrandom.prng;
        arrayMap: number[][];
        root: Node;
        allFloors: Floor[];
        roomChunks: RoomChunk[];
        pathChunks: PathChunk[];
        rooms: Room[];
        paths: Path[];

        createEmptyArrayMap(col: number, row: number): number[][];

        placeWalls(): void;
        placePaths(): void;
        placeRooms(): void;

        constructArrayMap(): void;

        getRooms(): Room[];
        getPaths(): Path[];
        getAllFloors(): Floor[];
        getMap(): number[][];
    }
}