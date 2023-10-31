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
        this.ctx.fillStyle = "green";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
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
        this.ctx.fillstyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
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