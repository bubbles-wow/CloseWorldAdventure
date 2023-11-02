import { obstacles } from "./Obstacle.js";
import { Bullet } from "./Bullet.js";

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.x = canvas.width / 2; // 玩家初始 x 坐标
        this.y = canvas.height / 2; // 玩家初始 y 坐标
        this.radius = 10; // 玩家半径
        this.shield = 0; // 玩家目前所持护盾
        this.speed = 5; // 玩家移动速度
        this.health = 100; // 玩家生命值
        this.currentHealth = 100; // 玩家的生命值上限
        this.score = 0; // 玩家得分
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.rewardReceived = {
            damage: false,
            current: false,
        };
    }

    // 函数处理玩家受到击退效果
    knockback(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
        const newX = this.x + knockbackDistance * knockbackDirectionX;
        const newY = this.y + knockbackDistance * knockbackDirectionY;

        // 检查是否越界，如果不越界，更新玩家的位置
        if (newX >= 0 && newX <= this.canvas.width && newY >= 0 && newY <= this.canvas.height) {
            this.x = newX;
            this.y = newY;
        }

        this.avoidObstacles();
    }

    damageByMonsterBullet(monsterbullet) {
        if (player.shield == 0) {
            player.health -= 10;
        }
        else {
            player.shield -= 10;
        }
        let directionX = monsterbullet.vx / monsterbullet.speed;
        let directionY = monsterbullet.vy / monsterbullet.speed;
        this.knockback(20, directionX, directionY);
    }

    // 处理玩家的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;

        // 检查是否越界，如果越界，限制玩家在画布内
        if (this.x < this.radius) {
            this.x = this.radius;
        } else if (this.x > this.canvas.width - this.radius) {
            this.x = this.canvas.width - this.radius;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
        } else if (this.y > this.canvas.height - this.radius) {
            this.y = this.canvas.height - this.radius;
        }

        this.avoidObstacles();
    }

    // 避开障碍物
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

    // 绘制玩家
    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#f0149c";
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 是否接受奖励
    receiveReward(type, value, message) {
        if (!this.rewardReceived[type]) {
            if (type === 'current') {
                this.increaseCurrentHealth(value);
            } else {
                this.applyDamageBoost(value);
            }
            this.rewardReceived[type] = true;
            alert(message);
        }
    }

    // 实现伤害提升逻辑
    applyDamageBoost(value) {
        Bullet.damage += value;
    }

    // 实现生命上限提升逻辑
    increaseCurrentHealth(value) {
        this.currentHealth += value;
    }
}

export const canvas = document.getElementById("Canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const player = new Player(canvas);