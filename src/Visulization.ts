import Node from './Node'
import Path from './Path';
import Room from './Room';

interface IVisualization {
    root: Node;
    map: number[][];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    colors: {
        wall: string;
        asciiPath: string;
        prePath: string;
        asciiRoom: string;
        preRoom: string;
        chunkLine: string;
        bg: string;
    };

    frameCounter: number;
    stepCounter: number;
    pathCounter: number;
    roomCounter: number;
    asciiLineCounter: number;

    scaleX: number;
    scaleY: number;

    index: {
        wall: number;
        path: number;
        room: number;
    };

    chars: {
        wall: string;
        path: string;
        room: string;
    };

    steps: Function[];

    putChar(char: string, x: number, y: number): void;
    drawChunkLines(): void;
    drawAscii(tile: number, x: number, y: number): void;
    tick(animDelay: number): void;
}

export default class Visualization implements IVisualization {
    root: Node;
    map: number[][];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    colors: {
        wall: string;
        asciiPath: string;
        prePath: string;
        asciiRoom: string;
        preRoom: string;
        chunkLine: string;
        bg: string;
    };

    paths: Path[];
    rooms: Room[];

    frameCounter: number;
    stepCounter: number;
    pathCounter: number;
    roomCounter: number;
    asciiLineCounter: number;

    scaleX: number;
    scaleY: number;

    index: {
        wall: number;
        path: number;
        room: number;
    };

    chars: {
        wall: string;
        path: string;
        room: string; 
    };

    steps: Function[];

    constructor(
        root: Node, 
        map: number[][], 
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        colors: {
            wall: string,
            asciiPath: string,
            prePath: string,
            asciiRoom: string,
            preRoom: string,
            chunkLine: string,
            bg: string
        }
    ) {
        this.root = root;
        this.map = map;
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors;

        this.frameCounter = 0;
        this.stepCounter = 0;
        this.pathCounter = 0;
        this.roomCounter = 0;
        this.asciiLineCounter = 0;

        this.paths = this.root.getPaths();
        this.rooms = this.root.getRooms();

        this.scaleX = this.canvas.width / this.root.chunk.w;
        this.scaleY = this.canvas.height / this.root.chunk.h;

        this.index = {
            wall: 3,
            path: 2,
            room: 1
        }

        this.chars = {
            wall: '#',
            path: '*',
            room: '.'
        }

        this.steps = [    
            () => {
                if (this.pathCounter <= this.paths.length) {
                    for (let i: number = 0; i < this.pathCounter; i++) {
                        ctx.fillStyle = this.colors.prePath;
                        ctx.fillRect(
                            this.paths[i].x1 * this.scaleX, 
                            this.paths[i].y1 * this.scaleY, 
                            this.paths[i].w * this.scaleX, 
                            this.paths[i].h * this.scaleY
                        );
                    }
    
                    this.drawChunkLines();
                    this.pathCounter++;
                } else {
                    this.stepCounter++;
                }
            },
        
            () => {
                if (this.roomCounter <= this.rooms.length) {
                    for (let i: number = 0; i < this.roomCounter; i++) {
                        ctx.fillStyle = this.colors.preRoom;
                        ctx.fillRect(
                            this.rooms[i].x * this.scaleX, 
                            this.rooms[i].y * this.scaleY, 
                            this.rooms[i].w * this.scaleX, 
                            this.rooms[i].h * this.scaleY
                        );
                    }
    
                    this.drawChunkLines();
                    this.roomCounter++;
                } else {
                    this.stepCounter++;
                }
            },
    
            () => {
                if (this.asciiLineCounter < this.root.chunk.h) {
                    let y: number = this.asciiLineCounter * this.scaleY;
    
                    for (let i: number = 0; i < map[this.asciiLineCounter].length; i++) {
                        let x: number = i * this.scaleX;
                        let tile: number = map[this.asciiLineCounter][i];
    
                        this.drawAscii(tile, x, y);
                    }
    
                    this.drawChunkLines();
                    this.asciiLineCounter++;
                } else {
                    ctx.fillStyle = '#031011';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                    for (let i:number = 0; i < map.length; i++) {
                        let y: number = i * this.scaleY;

                        for (let j: number = 0; j < map[i].length; j++) {
                            let x: number = j * this.scaleX;
                            let tile: number = map[i][j];
    
                            this.drawAscii(tile, x, y);
                        }
                    }
    
                    this.stepCounter++;
                }
            }
        ]
    }

    putChar(char: string, x: number, y: number): void {
        this.ctx.font = "bold 10px 'IBM Plex Mono', monospace";
        this.ctx.clearRect(x, y, this.scaleX, this.scaleY);
        this.ctx.fillText(char, x, y + this.ctx.measureText(char).actualBoundingBoxAscent);
    }

    drawChunkLines():void {
        this.ctx.strokeStyle = this.colors.chunkLine;
        this.ctx.lineWidth = 1;

        this.root.getChunks()
        .forEach(e => this.ctx.strokeRect(
            e.x * this.scaleX, 
            e.y * this.scaleY, 
            e.w * this.scaleX, 
            e.h * this.scaleY
        ));
    }

    drawAscii(tile: number, x: number, y: number): void {
        if (tile == this.index.room) {
            this.ctx.fillStyle = this.colors.asciiRoom;
            this.putChar(this.chars.room, x, y);
        } else if (tile == this.index.path) {
            this.ctx.fillStyle = this.colors.asciiPath;
            this.putChar(this.chars.path, x, y);
        } else if (tile == this.index.wall) {
            this.ctx.fillStyle = this.colors.wall;
            this.putChar(this.chars.wall, x, y);
        }
    }

    tick(animDelay: number): void {
        if (this.frameCounter % animDelay == 0 && 
            this.stepCounter < this.steps.length) {
                
                this.steps[this.stepCounter]();
        }
    
        this.frameCounter++;
    }
}


// let Visualization = {
//     frameCounter: 0,
//     stepCounter: 0,
//     pathCounter: 0,
//     roomCounter: 0,
//     asciiLineCounter: 0,

//     scaleX: canvas.width / root.chunk.w,
//     scaleY: canvas.height / root.chunk.h,

//     index: {
//         wall: 3,
//         path: 2,
//         room: 1
//     },

//     chars: {
//         wall: '#',
//         path: '*',
//         room: '.'
//     },

//     colors: {
//         wall: '#0BF8F1',
//         asciiPath: 'orange',
//         prePath: 'green',
//         asciiRoom: '#4eff3c',
//         preRoom: 'red',
//         chunkLine: 'purple'
//     },

//     putChar: (char: string, x: number, y: number) => {
//         ctx.font = "bold 10px 'IBM Plex Mono', monospace";
//         ctx.clearRect(x, y, Visualization.scaleX, Visualization.scaleY);
//         ctx.fillText(char, x, y);
//     },

//     drawChunkLines: () => {
//         ctx.strokeStyle = Visualization.colors.chunkLine;
//         ctx.lineWidth = 1;
//         root.getChunks()
//             .forEach(e => ctx.strokeRect(
//                 e.x * Visualization.scaleX, 
//                 e.y * Visualization.scaleY, 
//                 e.w * Visualization.scaleX, 
//                 e.h * Visualization.scaleY
//             ));
//     },

//     drawAscii: (tile: number, x: number, y: number) => {
//         if (tile == Visualization.index.room) {
//             ctx.fillStyle = Visualization.colors.asciiRoom;
//             Visualization.putChar(Visualization.chars.room, x, y);
//         } else if (tile == Visualization.index.path) {
//             ctx.fillStyle = Visualization.colors.asciiPath;
//             Visualization.putChar(Visualization.chars.path, x, y);
//         } else if (tile == Visualization.index.wall) {
//             ctx.fillStyle = Visualization.colors.wall;
//             Visualization.putChar(Visualization.chars.wall, x, y);
//         }
//     },

//     steps: [    
//         () => {
//             if (Visualization.pathCounter <= paths.length) {
//                 for (let i = 0; i < Visualization.pathCounter; i++) {
//                     ctx.fillStyle = 'green';
//                     ctx.fillRect(
//                         paths[i].x1 * Visualization.scaleX, 
//                         paths[i].y1 * Visualization.scaleY, 
//                         paths[i].w * Visualization.scaleX, 
//                         paths[i].h * Visualization.scaleY
//                     );
//                 }

//                 Visualization.drawChunkLines();
//                 Visualization.pathCounter++;
//             } else {
//                 Visualization.stepCounter++;
//             }
//         },
    
//         () => {
//             if (Visualization.roomCounter <= rooms.length) {
//                 for (let i = 0; i < Visualization.roomCounter; i++) {
//                     ctx.fillStyle = 'red';
//                     ctx.fillRect(
//                         rooms[i].x * Visualization.scaleX, 
//                         rooms[i].y * Visualization.scaleY, 
//                         rooms[i].w * Visualization.scaleX, 
//                         rooms[i].h * Visualization.scaleY
//                     );
//                 }

//                 Visualization.drawChunkLines();
//                 Visualization.roomCounter++;
//             } else {
//                 Visualization.stepCounter++;
//             }
//         },

//         () => {
//             if (Visualization.asciiLineCounter < root.chunk.h) {
//                 let y: number = Visualization.asciiLineCounter * Visualization.scaleY;

//                 for (let i = 0; i < map[Visualization.asciiLineCounter].length; i++) {
//                     let x: number = i * Visualization.scaleX;
//                     let tile: number = map[Visualization.asciiLineCounter][i];

//                     Visualization.drawAscii(tile, x, y);
//                 }

//                 Visualization.drawChunkLines();
//                 Visualization.asciiLineCounter++;
//             } else {
//                 ctx.fillStyle = 'black';
//                 ctx.fillRect(0, 0, canvas.width, canvas.height);

//                 for (let i = 0; i < map.length; i++) {
//                     let y: number = i * Visualization.scaleY;
//                     for (let j = 0; j < map[i].length; j++) {
//                         let x: number = j * Visualization.scaleX;
//                         let tile: number = map[i][j];

//                         Visualization.drawAscii(tile, x, y);
//                     }
//                 }

//                 Visualization.stepCounter++;
//             }
//         }
//     ]
// }