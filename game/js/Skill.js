// 强化子弹

export class StrengthenedBullet {
    constructor(x, y, vx, vy, speed, canvas) {
        this.x = x; // 子弹 x 坐标
        this.y = y; // 子弹 y 坐标
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.speed = speed; // 子弹速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 10; // 子弹半径
        this.bombRadius = 50; //爆炸半径
    }

    // 处理子弹的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    // 绘制子弹
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        let direction = Math.atan(this.vy / this.vx);
        this.ctx.rotate(direction);
        if (this.vx < 0) {
            this.ctx.rotate(Math.PI);
        }
        this.ctx.drawImage(bombArrowImage, -bombArrowImage.width / 2, -bombArrowImage.height / 2);
        this.ctx.restore();
    }
}

export class BulletExplosion {
    constructor(x, y, radius, canvas) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.color = "red";
        this.opacity = 1;
        this.expandRate = 2;
        this.knockbackDistance = 40; // 爆炸击退距离
        this.damage = 30; // 爆炸伤害
        this.bombRadius = 50;
    }

    update() {
        this.radius += this.expandRate;
        this.opacity -= 0.02;
        if (this.opacity <= 0) {
            return;
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
}

export const strengthenedBullets = [];
export const bulletExplosions = [];
export let isBoost = false;
let bombArrowImage = new Image();
bombArrowImage.src = "./res/arrow.png";