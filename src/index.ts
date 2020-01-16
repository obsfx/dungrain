import seedrandom from 'seedrandom';
import Node from './Node'

const RNG = seedrandom('a');

const canvas: any = document.querySelector('.screen');
const ctx: any = canvas.getContext('2d');

const root: Node = new Node({
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
    minRatio: 0.8,
    maxRatio: 1.6,
    minWidth: 20,
    minHeight: 20
}, RNG);

root.split(300);
root.generateRooms();
root.createPaths();

let map: number[][] = [];

for (let i = 0; i < root.chunk.h; i++) {
    map.push([]);
    for (let j = 0; j < root.chunk.w; j++) { 
        map[i].push(0);
    }
}

console.log(map);
// console.log(root, root.getChunks());
// console.log(root.getRooms());

let a = root.getRooms();

a.forEach(e => {
    for (let i = e.y; i < e.y + e.h; i++) {
        for (let j = e.x; j < e.x + e.w; j++) { 
            map[i][j] = 1;
        }
    }
})

let b = root.getPaths();

console.log(b, "vvvv");

b.forEach(e => {
    for (let i = e.y1; i < e.y1 + e.h; i++) {
        for (let j = e.x1; j < e.x1 + e.w; j++) { 
            map[i][j] = 2;
        }
    }
})

// let b = a.sort((a, b) => (a.x + a.y * canvas.width) - (b.x + b.y * canvas.width));

// root.getRooms()
//     .sort((a, b) => (a.x + a.y * canvas.width) - (b.x + b.y * canvas.width))
//     .forEach(e => {
//         console.log(e.x + e.y * canvas.width, e);
//     });

//     // .forEach(e => {
//     //     console.log(e.x + e.y * canvas.width);
//     // });

for (let i = 0; i < root.chunk.h; i++) {
    for (let j = 0; j < root.chunk.w; j++) { 
        if (map[i][j] == 0) {
            ctx.fillStyle = '#ddd';
        } else if (map[i][j] == 1) {
            ctx.fillStyle = 'red';
        } else if (map[i][j] == 2) {
            ctx.fillStyle = 'black';
        }
        ctx.fillRect(j, i, 1, 1);
    }
}

// ctx.strokeStyle = 'purple';
// ctx.lineWidth = 1;
// root.getChunks().forEach(e => ctx.strokeRect(e.x, e.y, e.w, e.h));