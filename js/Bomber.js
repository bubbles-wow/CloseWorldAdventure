import { Player, player } from "./Player.js";
import { obstacles } from "./Obstacle.js";
import { monsters } from "./Monster.js";
import { rangedMonsters } from "./RangedMonster.js";
import { BloodParticle } from "./BloodParticle.js";
import { particles } from "./BloodParticle.js";
import { generateBloodSplash } from "./Main.js";

export class Bomber {
    constructor(x, y, distance, canvas) {
        this.x = x; // 炸弹人 x 坐标
        this.y = y; // 炸弹人 y 坐标
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.score = 40; // 击杀炸弹人分数
        this.damage = 40; // 炸弹人伤害
        this.knockbackDistance = 60; // 炸弹人击退距离
        this.radius = 15; // 炸弹人半径
        this.speed = 2; // 炸弹人移动速度
        this.health = 100; // 炸弹人生命值
        this.pursuitPlayerDistance = distance; // 怪物追踪玩家的距离阈值
        this.bombRadius = 50; // 炸弹人爆炸半径
        this.bombTime = 1800; // 炸弹人爆炸时间
        this.bombWaitTime = 1800; // 炸弹人爆炸等待时间
        this.isDead = false; // 炸弹人是否死亡
    }

    bomb() {
        let distanceToPlayer = this.getDistanceToPlayer();
        if (distanceToPlayer < this.bombRadius + player.radius + this.bombRadius) {
            if (player.shield > 0) {
                if (this.damage > player.shield) {
                    player.health = player.health - (this.damage - player.shield);
                    player.shield = 0;
                } else {
                    player.shield -= this.damage;
                }
            } else {
                player.health -= this.damage;
            }
            generateBloodSplash(player.x, player.y);
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            let directionX = dx / distanceToPlayer;
            let directionY = dy / distanceToPlayer;
            player.knockback(this.knockbackDistance, directionX, directionY);
        }

        for (let i = 0; i < monsters.length; i++) {
            let dx = this.x - monsters[i].x;
            let dy = this.y - monsters[i].y;
            let distanceToMonster = Math.sqrt(dx * dx + dy * dy);
            if (distanceToMonster < this.bombRadius + monsters[i].radius + this.bombRadius) {
                monsters[i].health -= this.damage;
                if (monsters[i].health <= 0) {
                    monsters.splice(i, 1);
                    i--;
                    continue;
                }
                let directionX = dx / distanceToMonster;
                let directionY = dy / distanceToMonster;
                monsters[i].knockback(this.knockbackDistance, directionX, directionY);
            }
        }

        for (let i = 0; i < rangedMonsters.length; i++) {
            let dx = this.x - rangedMonsters[i].x;
            let dy = this.y - rangedMonsters[i].y;
            let distanceToRangedMonster = Math.sqrt(dx * dx + dy * dy);
            if (distanceToRangedMonster < this.bombRadius + rangedMonsters[i].radius + this.bombRadius) {
                rangedMonsters[i].health -= this.damage;
                if (rangedMonsters[i].health <= 0) {
                    rangedMonsters.splice(i, 1);
                    i--;
                    continue;
                }
                let directionX = dx / distanceToRangedMonster;
                let directionY = dy / distanceToRangedMonster;
                rangedMonsters[i].knockback(this.knockbackDistance, directionX, directionY);
            }
        }

        for (let i = 0; i < bombers.length; i++) {
            if (bombers[i] == this) {
                continue;
            }
            let dx = this.x - bombers[i].x;
            let dy = this.y - bombers[i].y;
            let distanceToBomber = Math.sqrt(dx * dx + dy * dy);
            if (distanceToBomber < this.bombRadius + bombers[i].radius + this.bombRadius) {
                bombers[i].health -= this.damage;
                if (bombers[i].health <= 0) {
                    bombers.splice(i, 1);
                    i--;
                    continue;
                }
                let directionX = dx / distanceToBomber;
                let directionY = dy / distanceToBomber;
                bombers[i].knockback(this.knockbackDistance, directionX, directionY);
            }
        }
        bomberExplosions.push(new BomberExplosion(this.canvas, this.x, this.y, this.bombRadius, "red"));
        this.isDead = true;

    }

    pursuitPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let directionX = dx / distanceToPlayer;
        let directionY = dy / distanceToPlayer;

        if (distanceToPlayer < this.radius + player.radius + this.pursuitPlayerDistance) {
            // 炸弹人和玩家之间没有碰撞，可以直接追击
            if (distanceToPlayer > this.radius + player.radius + 5) {
                this.x += directionX * this.speed;
                this.y += directionY * this.speed;

            }
            if (distanceToPlayer > this.radius + player.radius + this.pursuitPlayerDistance / 2) {
                this.bombWaitTime = this.bombTime;
            }

            if (this.bombWaitTime <= 0 && this.isDead == false) {
                this.bomb();
            }
            else {
                this.bombWaitTime -= 16;
            }
        }
    }

    // 处理炸弹人的游荡
    wander() {
        // 游荡时速度慢一点
        const speed = 1.5;
        // 炸弹人游荡时随机改变方向
        if (Math.random() < 0.05) { // 根据需要调整游荡频率
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
        }

        // 限制炸弹人的游荡范围
        let minX = this.x - 30; // 左边界的 x 坐标
        let minY = this.y - 30; // 上边界的 y 坐标
        let maxX = this.x + 30; // 右边界的 x 坐标
        let maxY = this.y + 30; // 下边界的 y 坐标

        // 检查炸弹人是否越界，如果是，则反向移动
        if (this.x < minX || this.x > maxX) {
            this.vx *= -1;
        }
        if (this.y < minY || this.y > maxY) {
            this.vy *= -1;
        }

        if (this.x + this.vx < this.radius || this.x + this.vx > this.canvas.width - this.radius) {
            this.vx = 0;
        }
        if (this.y + this.vy < this.radius || this.y + this.vy > this.canvas.height - this.radius) {
            this.vy = 0;
        }
        // 移动炸弹人
        this.x += this.vx;
        this.y += this.vy;
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

    // 计算炸弹人到玩家的距离
    getDistanceToPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        return distanceToPlayer;
    }

    // 处理炸弹人的移动
    move() {
        // 添加游荡效果
        const distanceToPlayer = this.getDistanceToPlayer();

        // 如果距离玩家很近，炸弹人会追踪玩家
        if (distanceToPlayer < this.pursuitPlayerDistance) {
            this.pursuitPlayer();
        }
        else {
            this.wander();
        }

        this.avoidObstacles();
    }

    // 处理炸弹人受到击退效果
    knockback(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
        let newX = this.x + knockbackDistance * knockbackDirectionX;
        let newY = this.y + knockbackDistance * knockbackDirectionY;

        if (newX < this.radius || newX > this.canvas.width - this.radius) {
            newX -= knockbackDirectionX * knockbackDistance;
        }
        if (newY < this.radius || newY > this.canvas.height - this.radius) {
            newY -= knockbackDirectionY * knockbackDistance;
        }

        this.x = newX;
        this.y = newY;
    }

    // 处理炸弹人受到子弹伤害
    damageByBullet(bullet) {
        this.health -= bullet.damage;
        generateBloodSplash(this.x, this.y);
        let directionX = bullet.vx / bullet.speed;
        let directionY = bullet.vy / bullet.speed;
        this.knockback(bullet.knockbackDistance, directionX, directionY);
    }

    // 绘制炸弹人
    draw() {
        if (this.isDead) {
            return;
        }
        this.ctx.fillStyle = "blue";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, 30, 5);

        this.ctx.fillStyle = "green";
        let healthBarWidth = (this.health / 100) * 30;
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, healthBarWidth, 5);
    }
}

export class BomberExplosion {
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
            return;
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
}

export const bombers = []; // 存储所有炸弹人的数组
export const bomberExplosions = [] // 存储所有炸弹人爆炸特效的数组