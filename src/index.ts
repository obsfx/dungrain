import seedrandom from 'seedrandom';
import Node from './Node'
import Room from './Room';
import Path from './Path';
import Visualization from './Visulization';

const canvas: HTMLCanvasElement = document.querySelector('.screen') || new HTMLCanvasElement();
const ctx: CanvasRenderingContext2D = canvas.getContext('2d') || new CanvasRenderingContext2D();

const RNG = seedrandom();

const root: Node = new Node({
    x: 0,
    y: 0,
    w: 50,
    h: 50,
    minRatio: 0.5,
    maxRatio: 2,
    minWidth: 15,
    minHeight: 15
}, RNG);

let map: number[][] = [];
for (let i = 0; i < root.chunk.h; i++) {
    map.push([]);
    for (let j = 0; j < root.chunk.w; j++) { 
        map[i].push(0);
    }
}

root.split(8);
root.generateRooms();
root.createPaths();

const rooms: Room[] = root.getRooms();
const paths: Path[] = root.getPaths();

const placeWalls = () => {
    rooms.forEach(room => {
        let yStart = (room.h > 2) ? room.y : room.y - 1;
        let yTarget = (room.h > 2) ? room.y + room.h : room.y + room.h + 1;
    
        let xStart = (room.w > 2) ? room.x : room.x - 1;
        let xTarget = (room.w > 2) ? room.x + room.w : room.x + room.w + 1;
        
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
                map[i][j] = 3;
            }
        }
    });
}

const placePaths = () => {
    paths.forEach(path => {
        for (let i = path.y1; i < path.y1 + path.h; i++) {
            for (let j = path.x1; j < path.x1 + path.w; j++) { 
                map[i][j] = 2;
            }
        }
    });
}

const placeRooms = () => {
    rooms.forEach(room => {
        let yStart = (room.h > 2) ? room.y + 1 : room.y;
        let yTarget = (room.h > 2) ? room.y + room.h - 1 : room.y + room.h;
    
        let xStart = (room.w > 2) ? room.x + 1: room.x;
        let xTarget = (room.w > 2) ? room.x + room.w - 1 : room.x + room.w;
    
        for (let i = yStart; i < yTarget; i++) {
            for (let j = xStart; j < xTarget; j++) { 
                map[i][j] = 1;
            }
        }
    });
}

placeWalls();
placePaths();
placeRooms();

let v = new Visualization(root, map, canvas, ctx, {
    wall: '#0BF8F1',
    asciiPath: 'orange',
    prePath: 'green',
    asciiRoom: '#4eff3c',
    preRoom: 'red',
    chunkLine: 'purple'
})

const loop = () => {
    v.tick(5);
    requestAnimationFrame(loop);
};

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
loop();