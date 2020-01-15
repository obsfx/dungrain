const canvas: any = document.querySelector('.screen');
const ctx: any = canvas.getContext('2d');
let KKK = 0;
interface IRoom {
    x: number;
    y: number;
    w: number;
    h: number;
}

export default class Room implements IRoom {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        console.log(++KKK)
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = 'blue';
        ctx.strokeRect(x, y, w, h);
    }
}