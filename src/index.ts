import seedrandom from 'seedrandom';
import Node from './Node'

const RNG = seedrandom();

const canvas: any = document.querySelector('.screen');
const ctx: any = canvas.getContext('2d');

const root: Node = new Node({
    x: 0,
    y: 0,
    w: 64,
    h: 64,
    minRatio: 0.8,
    maxRatio: 1.6,
    minWidth: 15,
    minHeight: 15
}, RNG);

root.split(6);
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
let b = root.getPaths();

console.log(b, "vvvv");

a.forEach(e => {
    let yStart = (e.h > 2) ? e.y : e.y - 1;
    let yTarget = (e.h > 2) ? e.y + e.h : e.y + e.h + 1;

    let xStart = (e.w > 2) ? e.x : e.x - 1;
    let xTarget = (e.w > 2) ? e.x + e.w : e.x + e.w + 1;
    
    for (let i = yStart; i < yTarget; i++) {
        for (let j = xStart; j < xTarget; j++) { 

            if (i > -1 && i < root.chunk.h && j > -1 && j < root.chunk.w) {
                map[i][j] = 3;
            }
        }
    }
})

b.forEach(e => {
    for (let i = e.y1 - 1; i < e.y1 + e.h + 1; i++) {
        for (let j = e.x1 - 1; j < e.x1 + e.w + 1; j++) { 
            map[i][j] = 3;
        }
    }
})

b.forEach(e => {
    for (let i = e.y1; i < e.y1 + e.h; i++) {
        for (let j = e.x1; j < e.x1 + e.w; j++) { 
            map[i][j] = 2;
        }
    }
})

a.forEach(e => {
    let yStart = (e.h > 2) ? e.y + 1 : e.y;
    let yTarget = (e.h > 2) ? e.y + e.h - 1 : e.y + e.h;

    let xStart = (e.w > 2) ? e.x + 1: e.x;
    let xTarget = (e.w > 2) ? e.x + e.w - 1 : e.x + e.w;

    for (let i = yStart; i < yTarget; i++) {
        for (let j = xStart; j < xTarget; j++) { 
            map[i][j] = 1;
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


const putChar = (char: string, x: number ,y: number) => {
    ctx.font = "12px Consolas";

    let k = char;

    ctx.fillText(k, x, y);
}


// console.log(ctx.measureText(k));

// ctx.font = "16px Arial";
// ctx.fillStyle = 'red'

for (let i = 0; i < root.chunk.h; i++) {
    for (let j = 0; j < root.chunk.w; j++) { 
        let x = j * 10;
        let y = i * 10;

        if (map[i][j] == 0) {
            ctx.fillStyle = '#ddd';
            // ctx.fillText('0', j, i);
            putChar('0', x, y);
        } else if (map[i][j] == 1) {
            ctx.fillStyle = 'red';
            // ctx.fillText('.', j, i);
            putChar('.', x, y);
        } else if (map[i][j] == 2) {
            ctx.fillStyle = 'black';
            // ctx.fillText('-', j, i);
            putChar('-', x, y);
        } else if (map[i][j] == 3) {
            ctx.fillStyle = 'blue';
            // ctx.fillText('#', j, i);
            putChar('#', x, y);
        }

        // ctx.fillRect(j, i, 1, 1);
    }
}

// ctx.strokeStyle = 'purple';
// ctx.lineWidth = 1;
// root.getChunks().forEach(e => ctx.strokeRect(e.x, e.y, e.w, e.h));