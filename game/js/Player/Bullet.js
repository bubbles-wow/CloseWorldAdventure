import { canvas, killedMonsters, setKilledMonsters } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { monsters } from "../Monster/Monster.js";
import { rangedMonsters } from "../Monster/RangedMonster.js";
import { bombers } from "../Monster/Bomber.js";

import { obstacles } from "../Scene/Obstacle.js";
import { generateDropLoot } from "../Scene/DropLoot.js";

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

export const bullets = []; // 存储所有子弹的数组
let arrowImage = new Image();
arrowImage.src = "./res/arrow.png"

// 处理子弹的移动
export function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].move();

        if (
            bullets[i].x < 0 ||
            bullets[i].x > canvas.width ||
            bullets[i].y < 0 ||
            bullets[i].y > canvas.height
        ) {
            bullets.splice(i, 1); // 移除超出画布的子弹
            i--;
            continue;
        }

        for (let j = 0; j < obstacles.length; j++) {
            let dx = bullets[i].x - obstacles[j].x;
            let dy = bullets[i].y - obstacles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bullets[i].radius + obstacles[j].radius) {
                bullets.splice(i, 1); // 移除击中的子弹
                i--;
                break;
            }
        }
    }
}

// 检查子弹和怪物的碰撞
export function checkBulletMonsterCollision() {
    for (let i = 0; i < bullets.length; i++) {
        let killed = false; // 记录子弹是否击中怪物
        for (let j = 0; j < monsters.length; j++) {
            let dx = bullets[i].x - monsters[j].x;
            let dy = bullets[i].y - monsters[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bullets[i].radius + monsters[j].radius) {
                monsters[j].damageByBullet(bullets[i]);
                // playSound(monsterHitSoundBuffer);
                if (monsters[j].health <= 0) {
                    player.score += monsters[j].score; // 增加玩家得分
                    generateDropLoot(monsters[j].x, monsters[j].y);
                    monsters.splice(j, 1); // 移除生命值为 0 的怪物
                    setKilledMonsters(killedMonsters + 1);
                }
                bullets.splice(i, 1); // 移除击中的子弹
                i--;
                killed = true;
                break;
            }
        }
        // 子弹击中怪物后，不再检查子弹和其他怪物的碰撞
        if (killed) {
            break;
        }
        for (let j = 0; j < rangedMonsters.length; j++) {
            let dx = bullets[i].x - rangedMonsters[j].x;
            let dy = bullets[i].y - rangedMonsters[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bullets[i].radius + rangedMonsters[j].radius) {
                rangedMonsters[j].damageByBullet(bullets[i]);
                if (rangedMonsters[j].health <= 0) {
                    player.score += rangedMonsters[j].score; // 增加玩家得分
                    generateDropLoot(rangedMonsters[j].x, rangedMonsters[j].y);
                    rangedMonsters.splice(j, 1); // 移除生命值为 0 的怪物
                    setKilledMonsters(killedMonsters + 1);
                }
                bullets.splice(i, 1); // 移除击中的子弹
                i--;
                killed = true;
                break;
            }
        }
        if (killed) {
            break;
        }
        // 检查子弹是否击中炸弹人
        for (let j = 0; j < bombers.length; j++) {
            if (bombers[j].isDead || bombers[j].health <= 0) {
                bombers.splice(j, 1);
                j--;
                continue;
            }
            let dx = bullets[i].x - bombers[j].x;
            let dy = bullets[i].y - bombers[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bullets[i].radius + bombers[j].radius) {
                bombers[j].damageByBullet(bullets[i]);
                if (bombers[j].health <= 0) {
                    player.score += bombers[j].score; // 增加玩家得分
                    generateDropLoot(bombers[j].x, bombers[j].y);
                    bombers.splice(j, 1); // 移除生命值为 0 的怪物
                    setKilledMonsters(killedMonsters + 1);
                }
                bullets.splice(i, 1); // 移除击中的子弹
                i--;
                killed = true;
                break;
            }
        }
        if (killed) {
            break;
        }
    }
}