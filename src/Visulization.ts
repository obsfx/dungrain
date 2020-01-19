import Node from './Node'
import Path from './Path';
import Room from './Room';

interface IVisualization {
    root: Node;
    map: number[][];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    font: string;
    mobCount: number;
    mobChars: string[];
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
    mobCounter: number;

    scaleX: number;
    scaleY: number;

    mobs: { x: number, y: number, char: string }[];

    steps: Function[];

    putChar(char: string, x: number, y: number): void;
    getFloors(): { x: number, y: number }[];
    getMobs(): { x: number, y: number, char: string }[];
    drawChunkLines(): void;
    drawAscii(tile: number, x: number, y: number): void;
    tick(animDelay: number): void;
}

export default class Visualization implements IVisualization {
    root: Node;
    map: number[][];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    font: string;
    mobCount: number;
    mobChars: string[];
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
    mobCounter: number;

    scaleX: number;
    scaleY: number;

    mobs: { x: number, y: number, char: string }[];

    steps: Function[];

    constructor(
        root: Node, 
        map: number[][], 
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        font: string,
        mobCount: number,
        mobChars: string[],
        index: {
            wall: number;
            path: number;
            room: number;
        },

        chars: {
            wall: string;
            path: string;
            room: string;
        },
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
        this.font = font;
        this.mobCount = mobCount;
        this.mobChars = mobChars;
        this.index = index;
        this.chars = chars;
        this.colors = colors;

        this.ctx.font = this.font;

        this.frameCounter = 0;
        this.stepCounter = 0;
        this.pathCounter = 0;
        this.roomCounter = 0;
        this.asciiLineCounter = 0;
        this.mobCounter = 0;

        this.paths = this.root.getPaths();
        this.rooms = this.root.getRooms();

        this.scaleX = this.canvas.width / this.root.chunk.w;
        this.scaleY = this.canvas.height / this.root.chunk.h;

        this.mobs = this.getMobs();

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
                    this.ctx.clearRect(0, y, this.canvas.width, this.scaleY);

                    for (let i: number = 0; i < map[this.asciiLineCounter].length; i++) {
                        let x: number = i * this.scaleX;
                        let tile: number = map[this.asciiLineCounter][i];
    
                        this.drawAscii(tile, x, y);
                    }
    
                    this.drawChunkLines();
                    this.asciiLineCounter++;
                } else {
                    ctx.fillStyle = this.colors.bg;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                    for (let i: number = 0; i < map.length; i++) {
                        let y: number = i * this.scaleY;

                        for (let j: number = 0; j < map[i].length; j++) {
                            let x: number = j * this.scaleX;
                            let tile: number = map[i][j];
    
                            this.drawAscii(tile, x, y);
                        }
                    }
    
                    this.stepCounter++;
                }
            },

            () => {
                if (this.mobCounter < this.mobs.length) {
                    let mob = this.mobs[this.mobCounter];

                    ctx.fillStyle = this.colors.bg;
                    this.ctx.fillRect(mob.x * this.scaleX, mob.y * this.scaleY, this.scaleX, this.scaleY);

                    this.ctx.fillText(mob.char, 
                        -this.ctx.measureText(mob.char).width / 4 + mob.x * this.scaleX, 
                        this.ctx.measureText(mob.char).actualBoundingBoxAscent / 2 + mob.y * this.scaleY
                    );
                    this.mobCounter++;
                } else {
                    this.stepCounter++;
                }
            }
        ]
    }

    putChar(char: string, x: number, y: number): void {
        this.ctx.fillText(char, x, y + this.ctx.measureText(char).actualBoundingBoxAscent);
    }

    getFloors(): { x: number, y: number }[] {
        let floors: { x: number, y: number }[] = [];

        for (let i: number = 0; i < this.map.length; i++) {
            for (let j: number = 0; j < this.map[i].length; j++) {
                if ([this.index.room, this.index.path].indexOf(this.map[i][j]) > -1) {
                    floors.push({
                        x: j,
                        y: i
                    });
                }
            }
        }

        return floors;
    }

    getMobs(): { x: number, y: number, char: string }[] {
        let mobs: { x: number, y: number, char: string }[] = [];
        let floors: { x: number, y: number }[] = this.getFloors();
        for (let i: number = 0; i < this.mobCount; i++) {
            if (floors.length > 0) {
                let floor: { x: number, y: number } = floors.splice(Math.floor(Math.random() * floors.length), 1)[0];
                mobs.push({
                    x: floor.x,
                    y: floor.y,
                    char: this.mobChars[Math.floor(Math.random() * this.mobChars.length)]
                });
            }
        }

        return mobs;
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