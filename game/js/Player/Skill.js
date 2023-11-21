import { canvas, killedMonsters, setKilledMonsters } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { monsters } from "../Monster/Monster.js";
import { rangedMonsters } from "../Monster/RangedMonster.js";
import { bombers } from "../Monster/Bomber.js";

import { generateDropLoot } from "../Scene/DropLoot.js";
import { obstacles } from "../Scene/Obstacle.js";

import { generateBloodSplash } from "../Particle/BloodParticle.js";

// 强化子弹
export class StrengthenedBullet {
    constructor(x, y, vx, vy, speed, canvas) {
        this.x = x; // 子弹 x 坐标
        this.y = y; // 子弹 y 坐标
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.speed = speed; // 子弹速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 10; // 子弹半径
        this.bombRadius = 50; //爆炸半径
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
        this.ctx.drawImage(bombArrowImage, -bombArrowImage.width / 2, -bombArrowImage.height / 2);
        this.ctx.restore();
    }
}

export class BulletExplosion {
    constructor(x, y, radius, canvas) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.color = "red";
        this.opacity = 1;
        this.expandRate = 2;
        this.knockbackDistance = 40; // 爆炸击退距离
        this.damage = 30; // 爆炸伤害
        this.bombRadius = 50;
    }

    update() {
        this.radius += this.expandRate;
        this.opacity -= 0.02;
        if (this.opacity <= 0) {
            return;
        }
    }

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

export const strengthenedBullets = [];
export const bulletExplosions = [];
export let isBoost = false;
let bombArrowImage = new Image();
bombArrowImage.src = "./res/arrow.png";

export function moveStrengthenedBullets() {
    for (let i = 0; i < strengthenedBullets.length; i++) {
        strengthenedBullets[i].move();

        if (
            strengthenedBullets[i].x < 0 ||
            strengthenedBullets[i].x > canvas.width ||
            strengthenedBullets[i].y < 0 ||
            strengthenedBullets[i].y > canvas.height
        ) {
            strengthenedBullets.splice(i, 1); // 移除超出画布的子弹
            i--;
            continue;
        }

        for (let j = 0; j < obstacles.length; j++) {
            let dx = strengthenedBullets[i].x - obstacles[j].x;
            let dy = strengthenedBullets[i].y - obstacles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < strengthenedBullets[i].radius + obstacles[j].radius) {
                strengthenedBullets.splice(i, 1); // 移除击中的子弹
                i--;
                break;
            }
        }
    }
}

export function checkStrengthenedBulletMonsterCollision() {
    for (let i = 0; i < strengthenedBullets.length; i++) {
        let hit = false;
        for (let j = 0; j < monsters.length; j++) {
            let dx = strengthenedBullets[i].x - monsters[j].x;
            let dy = strengthenedBullets[i].y - monsters[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < strengthenedBullets[i].radius + monsters[j].radius) {
                bulletExplosions.push(new BulletExplosion(strengthenedBullets[i].x, strengthenedBullets[i].y, strengthenedBullets[i].bombRadius, canvas));
                strengthenedBullets.splice(i, 1);
                i--;
                hit = true;
                break;
            }
        }
        if (hit) {
            break;
        }
        for (let j = 0; j < rangedMonsters.length; j++) {
            let dx = strengthenedBullets[i].x - rangedMonsters[j].x;
            let dy = strengthenedBullets[i].y - rangedMonsters[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < strengthenedBullets[i].radius + rangedMonsters[j].radius) {
                bulletExplosions.push(new BulletExplosion(strengthenedBullets[i].x, strengthenedBullets[i].y, strengthenedBullets[i].bombRadius, canvas));
                strengthenedBullets.splice(i, 1);
                i--;
                hit = true;
                break;
            }
        }
        if (hit) {
            break;
        }
        for (let j = 0; j < bombers.length; j++) {
            let dx = strengthenedBullets[i].x - bombers[j].x;
            let dy = strengthenedBullets[i].y - bombers[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < strengthenedBullets[i].radius + bombers[j].radius) {
                bulletExplosions.push(new BulletExplosion(strengthenedBullets[i].x, strengthenedBullets[i].y, strengthenedBullets[i].bombRadius, canvas));
                strengthenedBullets.splice(i, 1);
                i--;
                hit = true;
                break;
            }
        }
        if (hit) {
            break;
        }
    }
}

// 爆炸范围伤害判定和爆炸特效更新
export function updateBulletExplosions() {
    for (let i = 0; i < bulletExplosions.length; i++) {
        for (let j = 0; j < monsters.length; j++) {
            const dx = monsters[j].x - bulletExplosions[i].x;
            const dy = monsters[j].y - bulletExplosions[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < monsters[j].radius + bulletExplosions[i].bombRadius) {
                if (monsters[j].isAttackedByStrengthenedBullets == false) {
                    monsters[j].health -= bulletExplosions[i].damage;
                    generateBloodSplash(monsters[j].x, monsters[j].y);
                    let directionX = dx / distance;
                    let directionY = dy / distance;
                    monsters[j].knockback(bulletExplosions[i].knockbackDistance, directionX, directionY);
                    monsters[j].isAttackedByStrengthenedBullets = true;
                }
                if (monsters[j].health <= 0) {
                    player.score += monsters[j].score;
                    generateDropLoot(monsters[j].x, monsters[j].y);
                    monsters.splice(j, 1);
                    setKilledMonsters(killedMonsters + 1);
                }
            }
        }
        for (let j = 0; j < rangedMonsters.length; j++) {
            const dx = rangedMonsters[j].x - bulletExplosions[i].x;
            const dy = rangedMonsters[j].y - bulletExplosions[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < rangedMonsters[j].radius + bulletExplosions[i].bombRadius) {
                if (rangedMonsters[j].isAttackedByStrengthenedBullets == false) {
                    rangedMonsters[j].health -= bulletExplosions[i].damage;
                    generateBloodSplash(rangedMonsters[j].x, rangedMonsters[j].y);
                    let directionX = dx / distance;
                    let directionY = dy / distance;
                    rangedMonsters[j].knockback(bulletExplosions[i].knockbackDistance, directionX, directionY);
                    rangedMonsters[j].isAttackedByStrengthenedBullets = true;
                }
                if (rangedMonsters[j].health <= 0) {
                    player.score += rangedMonsters[j].score;
                    generateDropLoot(rangedMonsters[j].x, rangedMonsters[j].y);
                    rangedMonsters.splice(j, 1);
                    setKilledMonsters(killedMonsters + 1);
                }
            }
        }
        for (let j = 0; j < bombers.length; j++) {
            const dx = bombers[j].x - bulletExplosions[i].x;
            const dy = bombers[j].y - bulletExplosions[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bombers[j].radius + bulletExplosions[i].bombRadius) {
                if (bombers[j].isAttackedByStrengthenedBullets == false) {
                    bombers[j].health -= bulletExplosions[i].damage;
                    generateBloodSplash(bombers[j].x, bombers[j].y);
                    let directionX = dx / distance;
                    let directionY = dy / distance;
                    bombers[j].knockback(bulletExplosions[i].knockbackDistance, directionX, directionY);
                    bombers[j].isAttackedByStrengthenedBullets = true;
                }
                if (bombers[j].health <= 0) {
                    player.score += bombers[j].score;
                    generateDropLoot(bombers[j].x, bombers[j].y);
                    bombers.splice(j, 1);
                    setKilledMonsters(killedMonsters + 1);
                }
            }
        }
        bulletExplosions[i].update();
        if (bulletExplosions[i].opacity <= 0) {
            monsters.forEach(function (obj) {
                obj.isAttackedByStrengthenedBullets = false;
            });
            rangedMonsters.forEach(function (obj) {
                obj.isAttackedByStrengthenedBullets = false;
            });
            bombers.forEach(function (obj) {
                obj.isAttackedByStrengthenedBullets = false;
            });
            bulletExplosions.splice(i, 1);
            i--;
        }
    }
}