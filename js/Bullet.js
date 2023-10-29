export class Bullet {
    constructor(x, y, vx, vy, speed, canvas) {
        this.x = x; // 子弹 x 坐标
        this.y = y; // 子弹 y 坐标
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.speed = speed; // 子弹速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 5; // 子弹半径
    }

    // 处理子弹的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    // 绘制子弹
    draw() {
        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}


export class MonsterBullet {
    constructor(x, y, vx, vy, speed, canvas) {
        this.x = x; // 子弹 x 坐标
        this.y = y; // 子弹 y 坐标
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.speed = speed; // 子弹速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 5; // 子弹半径
    }

    // 处理子弹的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    // 绘制子弹
    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

export const bullets = []; // 存储所有子弹的数组
export const monsterBullets = []; // 存储所有子弹的数组