import { obstacles } from "./Obstacle.js";
import { canvas } from "./Player.js";
export class SpeedItem {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 10;
        this.duration = 0;// 增幅时间
        this.isAmplified = false;
    }

    // 绘制道具
    draw() {
        this.ctx.save();
        this.ctx.drawImage(speedItemImage, 710, 450, 91, 220, this.x - 10, this.y - 20, 20, 40);
        this.ctx.restore();
    }
    // 避开障碍物生成
    avoidObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            let dx = this.x - obstacles[i].x;
            let dy = this.y - obstacles[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.radius + obstacles[i].radius) {
                let avoidDistance = this.radius + obstacles[i].radius - distance;
                let directionX = dx / distance;
                let directionY = dy / distance;
                let newX = this.x + directionX * avoidDistance;
                let newY = this.y + directionY * avoidDistance;
                this.x = newX;
                this.y = newY;
            }
        }
    }
}

export class ShieldsItem {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.shieldValue = 20;
        this.collected = false;
    }

    // 绘制护盾类道具
    draw() {
        this.ctx.save();
        this.ctx.drawImage(shieldItemImage, 160, 0, 724, 1080, this.x - 7.24, this.y - 10.8, 14.48, 21.6);
        this.ctx.restore();
    }

    avoidObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            let dx = this.x - obstacles[i].x;
            let dy = this.y - obstacles[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.radius + obstacles[i].radius) {
                let avoidDistance = this.radius + obstacles[i].radius - distance;
                let directionX = dx / distance;
                let directionY = dy / distance;
                let newX = this.x + directionX * avoidDistance;
                let newY = this.y + directionY * avoidDistance;
                this.x = newX;
                this.y = newY;
            }
        }
    }
}

export const speedItems = [];
export const shieldItems = [];
const speedItemImage = new Image();
speedItemImage.src = "./res/speedItem.png";
const shieldItemImage = new Image();
shieldItemImage.src = "./res/shieldItem.png";