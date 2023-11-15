export class Bullet {
    constructor(x, y, vx, vy, damage, speed, knockbackDistance, canvas) {
        this.x = x; // 子弹 x 坐标
        this.y = y; // 子弹 y 坐标
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 5; // 子弹半径
        this.damage = damage; // 子弹伤害
        this.speed = speed;
        this.knockbackDistance = knockbackDistance; // 子弹击退距离
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
        this.ctx.drawImage(arrowImage, -arrowImage.width / 2, -arrowImage.height / 2);
        this.ctx.restore();
        
        // 实际碰撞位置显示
        // this.ctx.fillStyle = "red";
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
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
        this.damage = 10; // 子弹伤害
        this.knockbackDistance = 20; // 子弹击退距离
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
        this.ctx.drawImage(redArrowImage, -arrowImage.width / 2, -arrowImage.height / 2);
        this.ctx.restore();

        // 实际碰撞位置显示
        // this.ctx.fillStyle = "black";
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
    }
}

export const bullets = []; // 存储所有子弹的数组
export const monsterBullets = []; // 存储所有子弹的数组
let arrowImage = new Image();
arrowImage.src = "./res/arrow.png"
let redArrowImage = new Image();
redArrowImage.src = "./res/red_arrow.png"