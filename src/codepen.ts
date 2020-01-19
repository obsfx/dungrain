// ---------------- Path
class Path {
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

// ---------------- Room
class Room {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

// ---------------- Node_
enum SplitDirection {
    VERTICAL,
    HORIZONTAL
}

interface IPoint {
    x: number;
    y: number;
}

interface INode_Chunk extends IPoint {
    w: number;
    h: number;
    minRatio: number;
    maxRatio: number;
    minWidth: number;
    minHeight: number;
}

interface INode_ {
    chunk: INode_Chunk;
    left: Node_ | null;
    right: Node_ | null;
    room: Room | null;
    paths: Path[] | null;
    splitDirection: SplitDirection;
    isSplit: boolean;
    // RNG: seedrandom.prng;
    RNG: Function

    random(min: number, max: number): number;
    split(iterationCount: number, RNG: seedrandom.prng): void;
    generateRooms(): void;
    constructPath(a: IPoint, b: IPoint, direction: SplitDirection, pathWidh: number): Path;
    createPaths(chunkLeft: INode_Chunk, chunkRight: INode_Chunk): void;
    getChunks(): INode_Chunk[];
    getRooms(): Room[];
    getPaths(): Path[];
}

class Node_ {
    chunk: INode_Chunk;
    left: Node_ | null;
    right: Node_ | null;
    room: Room | null;
    splitDirection: SplitDirection;
    paths: Path[];
    isSplit: boolean;
    // RNG: seedrandom.prng;
    RNG: Function

    constructor(chunk: INode_Chunk, RNG: Function) {
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

        this.left = new Node_({
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

        this.right = new Node_({
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
            let x: number = Math.floor(this.chunk.x + this.random(this.chunk.w * 0.2, this.chunk.w * 0.25));
            let y: number = Math.floor(this.chunk.y + this.random(this.chunk.h * 0.2, this.chunk.h * 0.25));

            let w: number = Math.floor(this.random(this.chunk.w * 0.6, this.chunk.w * 0.7));
            let h: number = Math.floor(this.random(this.chunk.h * 0.6, this.chunk.h * 0.7));

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
                    x: this.left.chunk.x + this.left.chunk.w / 4,
                    y: this.left.chunk.y + this.left.chunk.h / 4,
                },

                {
                    x: this.right.chunk.x + this.right.chunk.w / 1.5,
                    y: this.right.chunk.y + this.right.chunk.h / 1.5,
                },

                this.splitDirection,
                1
            ));

            this.left.createPaths();
            this.right.createPaths();
        }
    }

    getChunks(): INode_Chunk[] {
        let chunkArr: INode_Chunk[] = [ this.chunk ];

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

// ---------------- Visualization
class Visualization {
    root: Node_;
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
        root: Node_, 
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

// ---------------- Main

const canvas: HTMLCanvasElement = document.querySelector('.screen') || new HTMLCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') || new CanvasRenderingContext2D();
const RNG = Math.random
let v: Visualization;

const inputs: {
    [key: string]: number
} = {
    COL: 50,
    ROW: 50,
    minWHRatio: 0.5,
    maxWHRatio: 2,
    minChunkWidth: 8,
    minChunkHeight: 8,
    iterationCount: 10,
    animDelay: 1
}

const states: string[] = [
    '🌘 placing corridors...',
    '🌗 placing rooms...',
    '🌕 placing walls & some polishing...',
    '👻 some creatures would be cool...',
    '🎉 done'
];

const statusInfo: HTMLElement = document.querySelector('.status') || new HTMLElement();

const reset = (
    col: number, 
    row: number, 
    minWHRatio: number, 
    maxWHRatio: number,
    minChunkWidth: number, 
    minChunkHeight: number, 
    iterationCount: number
): void => {

    const root: Node_ = new Node_({
        x: 0,
        y: 0,
        w: col,
        h: row,
        minRatio: minWHRatio,
        maxRatio: maxWHRatio,
        minWidth: minChunkWidth,
        minHeight: minChunkHeight,
    }, RNG);

    let map: number[][] = [];
    for (let i: number = 0; i < root.chunk.h; i++) {
        map.push([]);
        for (let j: number = 0; j < root.chunk.w; j++) { 
            map[i].push(0);
        }
    }

    root.split(iterationCount);
    root.generateRooms();
    root.createPaths();

    const rooms: Room[] = root.getRooms();
    const paths: Path[] = root.getPaths();

    const placeWalls = () => {
        rooms.forEach(room => {
            let yStart = (room.h > 3) ? room.y : room.y - 1;
            let yTarget = (room.h > 3) ? room.y + room.h : room.y + room.h + 1;
        
            let xStart = (room.w > 3) ? room.x : room.x - 1;
            let xTarget = (room.w > 3) ? room.x + room.w : room.x + room.w + 1;
            
            // let yStart = room.y;
            // let yTarget = room.y + room.h;
        
            // let xStart = room.x;
            // let xTarget = room.x + room.w;

            for (let i = yStart; i < yTarget; i++) {
                for (let j = xStart; j < xTarget; j++) { 
        
                    if (i > -1 && i < root.chunk.h && j > -1 && j < root.chunk.w) {
                        map[i][j] = 3;
                    }
                }
            }
        });
        
        paths.forEach(path => {
            for (let i = path.y1 - 1; i < path.y1 + path.h + 1; i++) {
                for (let j = path.x1 - 1; j < path.x1 + path.w + 1; j++) {
                    if (i > -1 && i < root.chunk.h && j > -1 && j < root.chunk.w) {
                        map[i][j] = 3;
                    }
                }
            }
        });
    }

    const placePaths = () => {
        paths.forEach(path => {
            for (let i = path.y1; i < path.y1 + path.h; i++) {
                for (let j = path.x1; j < path.x1 + path.w; j++) { 
                    if (i == 0 || i == root.chunk.h - 1 || j == 0 || j == root.chunk.w - 1) {
                        map[i][j] = 3;
                    } else {
                        map[i][j] = 2;
                    }
                }
            }
        });
    }

    const placeRooms = () => {
        rooms.forEach(room => {
            let yStart = (room.h > 3) ? room.y + 1 : room.y;
            let yTarget = (room.h > 3) ? room.y + room.h - 1 : room.y + room.h;
        
            let xStart = (room.w > 3) ? room.x + 1 : room.x;
            let xTarget = (room.w > 3) ? room.x + room.w - 1 : room.x + room.w;

            // let yStart = room.y + 1;
            // let yTarget = room.y + room.h - 1;
        
            // let xStart = room.x + 1;
            // let xTarget = room.x + room.w - 1;
        
            for (let i = yStart; i < yTarget; i++) {
                for (let j = xStart; j < xTarget; j++) {
                    if (i == 0 || i == root.chunk.h - 1 || j == 0 || j == root.chunk.w - 1) { 
                        map[i][j] = 3;
                    } else {
                        map[i][j] = 1;
                    }
                }
            }
        });
    }

    placeWalls();
    placePaths();
    placeRooms();

    v = new Visualization(root, map, canvas, ctx, 
        "bold 10px 'IBM Plex Mono', monospace",
        80,
        ["🍎", "🌟", "👻", "👽", "🤡", "🤬", "👀", "🧠", "🔥", "🥩", "🍺"],
        {
            wall: 3,
            path: 2,
            room: 1
        },
        {
            wall: '#',
            path: '*',
            room: '.'
        },
        {
            wall: '#0BF8F1',
            asciiPath: 'orange',
            prePath: '#A0FFFF',
            asciiRoom: '#4eff3c',
            preRoom: '#FF3CFF',
            chunkLine: '#394244',
            bg: '#031011'
        }
    );

    ctx.fillStyle = '#031011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const loop = () => {
    v.tick(inputs.animDelay);
    statusInfo.innerHTML = states[v.stepCounter];
    requestAnimationFrame(loop);
};
reset(
    inputs.COL, 
    inputs.ROW, 
    inputs.minWHRatio, 
    inputs.maxWHRatio, 
    inputs.minChunkWidth, 
    inputs.minChunkHeight, 
    inputs.iterationCount
);
loop();

// ---------------- Dom
const generateBtn: HTMLButtonElement = document.querySelector('.button') || new HTMLButtonElement();
generateBtn.addEventListener('click', () => {
    reset(
        inputs.COL, 
        inputs.ROW, 
        inputs.minWHRatio, 
        inputs.maxWHRatio, 
        inputs.minChunkWidth, 
        inputs.minChunkHeight, 
        inputs.iterationCount
    );
});

const sizeInput: HTMLInputElement = document.querySelector<HTMLInputElement>('.size') || new HTMLInputElement();
sizeInput.addEventListener('input', function() {
    inputs.COL = Number(this.value);
    inputs.ROW = Number(this.value);

    const v_input: HTMLParagraphElement = document.querySelector(`.${this.getAttribute('data-v')}`) || new HTMLParagraphElement();
    v_input.innerHTML = this.value;
});

const otherRanges: HTMLInputElement[] = [...document.querySelectorAll<HTMLInputElement>('.range_input')] || [];
otherRanges.forEach(e => {
    e.addEventListener('input', function() {

        const field: string = this.getAttribute('data-i') || '';
        inputs[field] = Number(this.value);
        
        const v_input: HTMLParagraphElement = document.querySelector(`.${this.getAttribute('data-v')}`) || new HTMLParagraphElement();
        v_input.innerHTML = this.value;
    });
});