import seedrandom from 'seedrandom';
import Node from './Node'

const RNG = seedrandom('240753');

const canvas: any = document.querySelector('.screen');
const ctx: any = canvas.getContext('2d');

const root: Node = new Node({
    x: 0,
    y: 0,
    w: 512,
    h: 512,
}, RNG);

root.split(10);

ctx.strokeStyle = 'black';

root.getChunks().forEach(e => ctx.strokeRect(e.x, e.y, e.w, e.h));

console.log(root, root.getChunks());