import { canvas } from "./Core.js";
import { MonsterBullet, monsterBullets } from "./MonsterBullet.js";
import { obstacles } from "./Obstacle.js";
import { player } from "./Player.js";
import { generateBloodSplash } from "./BloodParticle.js";

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
        this.speed = 1.2; // 怪物移动速度
        this.health = 100; // 怪物生命值
        this.attackCooldown = 0; // 攻击冷却时间
        this.attackCooldownTime = 120; // 攻击冷却时间阈值
        this.pursuitPlayerDistance = distance; // 怪物追踪玩家的距离阈值
        this.isWander = false; // 怪物是否游荡
        this.wanderCooldown = Math.random() * 100; // 游荡冷却时间
        this.wanderCooldownTime = 300; // 游荡冷却时间阈值
        this.isAttackedByStrengthenedBullets = false; // 是否受到爆炸箭伤害
        this.isAttack = false; // 怪物是否攻击
        this.animationFrame = Math.random() * 59; // 怪物动画帧
        this.animationFrameTime = 59; // 怪物动画帧阈值
    }

    // 处理怪物攻击玩家
    shootPlayer(directionX, directionY) {
        let bulletSpeed = 5;
        let bulletVX = directionX * bulletSpeed;
        let bulletVY = directionY * bulletSpeed;
        monsterBullets.push(new MonsterBullet(this.x, this.y, bulletVX, bulletVY, bulletSpeed, this.canvas));
    }

    //追击玩家或者逃离玩家
    pursuitPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let directionX = dx / distanceToPlayer;
        let directionY = dy / distanceToPlayer;

        if (distanceToPlayer < this.pursuitPlayerDistance / 4) {
            this.avoidPlayer();
            this.isAttack = false;
        }
        else {
            if (this.attackCooldown == 0) {
                this.isAttack = true;
                this.attackCooldown++;
            }
            if (directionX > 0) {
                this.direction = "d";
            }
            else {
                this.direction = "a";
            }
            if (this.isAttack && this.attackCooldown == 45) {
                this.shootPlayer(directionX, directionY);
            }
            if (distanceToPlayer > this.pursuitPlayerDistance / 2 && distanceToPlayer < this.pursuitPlayerDistance) {
                let speed = 0.5;
                if (distanceToPlayer > this.pursuitPlayerDistance / 1.5) {
                    speed = this.speed;
                    this.isAttack = false;
                }
                else {
                    this.isAttack = true;
                }
                this.vx = directionX * speed;
                this.vy = directionY * speed;
                this.x += this.vx;
                this.y += this.vy;
            }
        }
    }

    avoidPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let directionX = dy / distanceToPlayer;
        let directionY = dx / distanceToPlayer;

        this.vx = directionX * this.speed;
        this.vy = directionY * this.speed;
        this.x += this.vx;
        this.y += this.vy;
    }

    // 处理怪物的游荡
    wander() {
        this.wanderCooldown++;
        // 现在怪物会随机往某个方向移动一段时间后停止，而不是一直在动
        if (this.wanderCooldown == this.wanderCooldownTime / 2) {
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
        // 添加游荡效果
        let distanceToPlayer = this.getDistanceToPlayer(player);

        // 攻击冷却时间计算
        if (this.attackCooldown > 0) {
            this.attackCooldown++;
        }
        if (this.attackCooldown > this.attackCooldownTime) {
            this.attackCooldown = 0;
        }

        // 如果距离玩家很近，怪物会追踪玩家
        if (distanceToPlayer < this.pursuitPlayerDistance && player.health > 0) {
            this.pursuitPlayer();
        }
        else {
            this.wander();
            this.isAttack = false;
        }

        this.avoidObstacles();

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
        let imageDirectionX = 48 * Math.floor(this.animationFrame / 10);
        let imageDirectionY = 0;
        let isMove = false;
        if ((this.vx != 0 || this.vy != 0) && !this.isAttack) {
            if (this.getDistanceToPlayer() < this.pursuitPlayerDistance && player.health > 0 || this.isWander) {
                isMove = true;
            }
            else {
                this.vx = 0;
                this.vy = 0;
            }
        }
        // 攻击动作
        if (this.isAttack) {
            if (this.direction === "a") {
                imageDirectionY = 48 * 5;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 4;
            }
            imageDirectionX = 48 * Math.floor(this.attackCooldown / 15);
            if (this.attackCooldown >= 59) {
                //this.isAttack = false;
                imageDirectionX = 48 * 3;
            }
        }
        else {
            if (this.vx > 0) {
                this.direction = "d";
            }
            else if (this.vx < 0) {
                this.direction = "a";
            }
            // 走路时动作
            if (isMove) {
                if (this.direction === "a") {
                    imageDirectionY = 48 * 3;
                }
                else if (this.direction === "d") {
                    imageDirectionY = 48 * 2;
                }
            }
            // 在原地的动作
            else {
                if (this.direction === "a") {
                    imageDirectionY = 48 * 1;
                }
                else if (this.direction === "d") {
                    imageDirectionY = 48 * 0;
                }
                imageDirectionX = 48 * Math.floor(this.animationFrame / 15);
            }
        }
        // 更新动画帧
        if (this.animationFrame < this.animationFrameTime) {
            this.animationFrame++;
        }
        else {
            this.animationFrame = 0;
        }

        this.ctx.drawImage(skeletonImage, imageDirectionX, imageDirectionY, 48, 48, this.x - this.radius - 17 * 2, this.y - this.radius - 28 * 2, 48 * 2, 48 * 2);

        this.ctx.save();
        this.ctx.beginPath();
        // 绘制生命值条
        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, 30, 5);
        this.ctx.fillStyle = "black"
        this.ctx.strokeRect(this.x - 15, this.y - this.radius - 10, 30, 5);
        // 绘制生命值
        this.ctx.fillStyle = "green";
        let healthBarWidth = (this.health / 100) * 30;
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, healthBarWidth, 5);
        // 碰撞箱显示
        // this.ctx.fillStyle = "yellow";
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
        this.ctx.restore();
    }
}

export const rangedMonsters = []; // 存储所有怪物的数组
const skeletonImage = new Image();
skeletonImage.src = "./res/skeleton2.png";

export function generateRangedMonster(x, y, pursuitPlayerDistance) {
    obstacles.forEach(obstacle => {
        let dx = obstacle.x - x;
        let dy = obstacle.y - y;
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < obstacle.radius + 30) {
            if (dx < 0) {
                x -= obstacle.radius;
            }
            else {
                x += obstacle.radius;
            }
            if (dy < 0) {
                y -= obstacle.radius;
            }
            else {
                y += obstacle.radius;
            }
        }
    });
    rangedMonsters.push(new RangedMonster(x, y, pursuitPlayerDistance, canvas));
}