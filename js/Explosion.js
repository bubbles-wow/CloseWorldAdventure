export class Explosion {
    constructor(canvas, x, y, radius, color) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.opacity = 1; // 初始透明度
        this.expandRate = 2; // 扩散速度
    }

    // 更新爆炸特效
    update() {
        this.radius += this.expandRate;
        this.opacity -= 0.02;

        if (this.opacity <= 0) {
            this.destroy();
        }
    }

    // 绘制爆炸特效
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    // 销毁爆炸特效
    destroy() {
        // 在游戏中移除这个爆炸特效实例
        // 你可以在游戏中的管理器中进行处理
        this.opacity = 0;
    }
}
