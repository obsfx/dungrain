// import seedrandom from 'seedrandom';
import Node from './Node'
import Room from './Room';
import Path from './Path';
import Visualization from './Visulization';

const canvas: HTMLCanvasElement = document.querySelector('.screen') || new HTMLCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') || new CanvasRenderingContext2D();
const RNG = Math.random

let v: Visualization;

const inputs = {
    COL: 50,
    ROW: 50,
    minWHRatio: 0.8,
    maxWHRatio: 1.8,
    minChunkWidth: 8,
    minChunkHeight: 8,
    iterationCount: 10,
    animDelay: 3
}

const reset = (
        col: number, 
        row: number, 
        minWHRatio: number, 
        maxWHRatio: number,
        minChunkWidth: number, 
        minChunkHeight: number, 
        iterationCount: number
    ) => {

    const root: Node = new Node({
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

reset(
    inputs.COL, 
    inputs.ROW, 
    inputs.minWHRatio, 
    inputs.maxWHRatio, 
    inputs.minChunkWidth, 
    inputs.minChunkHeight, 
    inputs.iterationCount
);

const loop = () => {
    v.tick(inputs.animDelay);
    requestAnimationFrame(loop);
};

window.addEventListener('click', () => {
    reset(
        inputs.COL, 
        inputs.ROW, 
        inputs.minWHRatio, 
        inputs.maxWHRatio, 
        inputs.minChunkWidth, 
        inputs.minChunkHeight, 
        inputs.iterationCount
    );
})

loop();