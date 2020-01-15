import seedrandom from 'seedrandom';
import Node from './Node'

const RNG = seedrandom();

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

root.split(50);

ctx.strokeStyle = 'purple';
ctx.lineWidth = 1;
root.getChunks().forEach(e => ctx.strokeRect(e.x, e.y, e.w, e.h));

console.log(root, root.getChunks());