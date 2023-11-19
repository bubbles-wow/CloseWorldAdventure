import { canvas } from "./Core.js";

// 粒子特效
export class BloodParticle {
    constructor(x, y, radius, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = radius;
        this.velocity = {
            x: (Math.random() - 0.5) * 5, // 随机水平速度
            y: (Math.random() - 0.5) * 5, // 随机垂直速度
        };
        this.alpha = 1;// 初始透明度
    }

    // 更新粒子的位置和透明度
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }

    // 渲染粒子
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }
}

export const particles = [];

export function generateBloodSplash(x, y) {
    for (let i = 0; i < 50; i++) {
        const radius = Math.random() * 5 + 2;
        const particle = new BloodParticle(x, y, radius, canvas);
        particles.push(particle);
    }
}

export function moveBloodSplash() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}