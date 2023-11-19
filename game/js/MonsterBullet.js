import { canvas } from "./Core.js";
import { player } from "./Player.js";
import { obstacles } from "./Obstacle.js";
import { generateBloodSplash } from "./BloodParticle.js";

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
        this.ctx.drawImage(redArrowImage, -redArrowImage.width / 2, -redArrowImage.height / 2);
        this.ctx.restore();

        // 实际碰撞位置显示
        // this.ctx.fillStyle = "black";
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
    }
}

export const monsterBullets = []; // 存储所有子弹的数组
let redArrowImage = new Image();
redArrowImage.src = "./res/red_arrow.png"

// 处理怪物子弹的移动
export function moveMonsterBullets() {
    for (let i = 0; i < monsterBullets.length; i++) {
        monsterBullets[i].move();

        if (
            monsterBullets[i].x < 0 ||
            monsterBullets[i].x > canvas.width ||
            monsterBullets[i].y < 0 ||
            monsterBullets[i].y > canvas.height
        ) {
            monsterBullets.splice(i, 1); // 移除超出画布的子弹
            i--;
            continue;
        }

        for (let j = 0; j < obstacles.length; j++) {
            let dx = monsterBullets[i].x - obstacles[j].x;
            let dy = monsterBullets[i].y - obstacles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < monsterBullets[i].radius + obstacles[j].radius) {
                monsterBullets.splice(i, 1); // 移除击中的子弹
                i--;
                break;
            }
        }
    }
}

// 检查怪物子弹和玩家的碰撞
export function checkMonsterBulletPlayerCollision() {
    if (player.health <= 0) {
        player.health = 0;
        return;
    }
    for (let i = 0; i < monsterBullets.length; i++) {
        let dx = monsterBullets[i].x - player.x;
        let dy = monsterBullets[i].y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < monsterBullets[i].radius + player.radius) {
            player.damageByMonsterBullet(monsterBullets[i]);
            generateBloodSplash(player.x, player.y);
            monsterBullets.splice(i, 1); // 移除击中的子弹
            i--;
            break;
        }
    }
}