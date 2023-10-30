export class Obstacle {
    constructor(x, y, radius, canvas) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    // 绘制障碍物
    draw() {
        this.ctx.fillStyle = "gray";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

export const obstacles = []; // 存储所有障碍物的数组