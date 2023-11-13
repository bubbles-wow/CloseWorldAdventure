import { MonsterBullet } from "./Bullet.js";
import { obstacles } from "./Obstacle.js";
import { player } from "./Player.js";
import { canvas } from "./Player.js";
import { monsterBullets } from "./Bullet.js";
import { BloodParticle } from "./BloodParticle.js";
import { particles } from "./BloodParticle.js";
import { generateBloodSplash } from "./Main.js";

export class RangedMonster {
    constructor(x, y, distance, canvas) {
        this.x = x; // 怪物 x 坐标
        this.y = y; // 怪物 y 坐标
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.score = 10; // 击杀怪物分数
        this.radius = 15; // 怪物半径
        this.speed = 1.5; // 怪物移动速度
        this.health = 100; // 怪物生命值
        this.attackCooldown = 0; // 攻击冷却时间
        this.attackCooldownTime = 2000; // 攻击冷却时间阈值
        this.pursuitPlayerDistance = distance; // 怪物追踪玩家的距离阈值
        this.isWander = false; // 怪物是否游荡
        this.wanderCooldown = Math.random() * 100; // 游荡冷却时间
        this.wanderCooldownTime = 300; // 游荡冷却时间阈值
    }

    // 处理怪物攻击玩家
    shootPlayer(directionX, directionY) {
        if (this.attackCooldown > 0 || player.health <= 0) {
            return;
        }
        else {
            this.attackCooldown = this.attackCooldownTime;
            let bulletSpeed = 5;
            let bulletVX = directionX * bulletSpeed;
            let bulletVY = directionY * bulletSpeed;
            monsterBullets.push(new MonsterBullet(this.x, this.y, bulletVX, bulletVY, bulletSpeed, this.canvas));
        }
    }

    //追击玩家或者逃离玩家
    pursuitPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let directionX = dx / distanceToPlayer;
        let directionY = dy / distanceToPlayer;

        if (distanceToPlayer > this.pursuitPlayerDistance / 3 && distanceToPlayer < this.pursuitPlayerDistance) {
            // 怪物和玩家之间没有碰撞，可以直接追击
            this.x += directionX * this.speed;
            this.y += directionY * this.speed;
            this.shootPlayer(directionX, directionY);
        }
        else if (distanceToPlayer < this.pursuitPlayerDistance / 2) {
            this.avoidPlayer();
        }
    }

    avoidPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let directionX = dy / distanceToPlayer;
        let directionY = dx / distanceToPlayer;

        this.x += directionX * this.speed;
        this.y += directionY * this.speed;

        if (this.x < this.radius || this.x > this.canvas.width - this.radius) {
            this.x -= directionX * this.speed;
        }
        if (this.y < this.radius || this.y > this.canvas.height - this.radius) {
            this.y -= directionY * this.speed;
        }
    }

    // 处理怪物的游荡
    wander() {
        this.wanderCooldown++;
        // 现在怪物会随机往某个方向移动一段时间后停止，而不是一直在动
        if (this.wanderCooldown == 180) {
            this.isWander = false;
            this.vx = 0;
            this.vy = 0;
        }
        if (this.wanderCooldown >= this.wanderCooldownTime) {
            this.wanderCooldown = 0;
        }
        if (this.wanderCooldown != 0 && this.isWander == false || this.health <= 0) {
            return;
        }
        else {
            this.isWander = true;
        }

        if (this.vx != 0 || this.vy != 0) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x + this.vx < this.radius || this.x + this.vx > this.canvas.width - this.radius) {
                this.vx *= -1;
            }
            if (this.y + this.vy < this.radius || this.y + this.vy > this.canvas.height - this.radius) {
                this.vy *= -1;
            }
            return;
        }
        else {
            let random = Math.random() * 100;
            if (random < 50) {
                this.isWander = false;
                return;
            }
        }
        
        // 游荡时速度慢一点
        const speed = 1;
        let random = (Math.random() - 0.5) * 2;
        this.vx = speed * Math.sqrt(1 - random * random);
        this.vy = speed * random;
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

    // 计算怪物到玩家的距离
    getDistanceToPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        return distanceToPlayer;
    }

    // 处理怪物的移动
    move() {
        if (player.health <= 0) {
            return;
        }
        // 添加游荡效果
        let distanceToPlayer = this.getDistanceToPlayer(player);

        // 如果距离玩家很近，怪物会追踪玩家
        if (distanceToPlayer < this.pursuitPlayerDistance && player.health >= 0) {
            this.pursuitPlayer(player, obstacles);
        }
        else {
            this.wander(obstacles);
        }

        this.avoidObstacles(obstacles);

        if (this.x > this.canvas.width - this.radius) {
            this.x = this.canvas.width - this.radius;
        }
        else if (this.x < this.radius) {
            this.x = this.radius;
        }
        if (this.y > this.canvas.height - this.radius) {
            this.y = this.canvas.height - this.radius;
        }
        else if (this.y < this.radius) {
            this.y = this.radius;
        }
    }

    // 处理怪物受到击退效果
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

    // 处理怪物受到子弹伤害
    damageByBullet(bullet) {
        this.health -= bullet.damage;
        generateBloodSplash(this.x, this.y);
        let directionX = bullet.vx / bullet.speed;
        let directionY = bullet.vy / bullet.speed;
        this.knockback(bullet.knockbackDistance, directionX, directionY);
    }

    // 绘制怪物
    draw() {
        this.ctx.fillStyle = "yellow";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, 30, 5);

        this.ctx.fillStyle = "black"
        this.ctx.strokeRect(this.x - 15, this.y - this.radius - 10, 30, 5);
        
        this.ctx.fillStyle = "green";
        let healthBarWidth = (this.health / 100) * 30;
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, healthBarWidth, 5);
    }
}

export const rangedMonsters = []; // 存储所有怪物的数组