// 掉落物
export class DropLoot {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.radius = 15;
        this.ctx = canvas.getContext("2d");
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#FFC0CB";
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

export const dropLoots = [];