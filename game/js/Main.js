import { Player, player } from "./Player.js";
import { canvas } from "./Player.js";

import { Obstacle } from "./Obstacle.js";
import { obstacles } from "./Obstacle.js";
import { littlePlants } from "./Obstacle.js";
import { LittlePlant } from "./Obstacle.js";

import { Bullet } from "./Bullet.js";
import { MonsterBullet } from "./Bullet.js";
import { bullets } from "./Bullet.js";
import { monsterBullets } from "./Bullet.js";

import { Monster } from "./Monster.js";
import { monsters } from "./Monster.js";

import { RangedMonster } from "./RangedMonster.js";
import { rangedMonsters } from "./RangedMonster.js";


import { Bomber } from "./Bomber.js";
import { BomberExplosion } from "./Bomber.js";
import { bombers } from "./Bomber.js";
import { bomberExplosions } from "./Bomber.js";

import { BloodParticle } from "./BloodParticle.js";
import { particles } from "./BloodParticle.js";

import { SpeedItem } from "./item.js";
import { ShieldsItem } from "./item.js";
import { speedItems } from "./item.js";
import { shieldItems } from "./item.js";

import { DropLoot } from "./DropLoot.js";
import { dropLoots } from "./DropLoot.js";

import { Reward } from "./Reward.js";
import { rewards } from "./Reward.js";

import { StrengthenedBullet } from "./Skill.js";
import { strengthenedBullets } from "./Skill.js";
import { BulletExplosion } from "./Skill.js";
import { bulletExplosions } from "./Skill.js";
import { portal, Portal, generatePortal, checkPlayerInPortal, refreshScene } from "./Portal.js";

let max;
if (window.innerWidth > window.innerHeight) {
    max = window.innerWidth / 30;
}
else {
    max = window.innerHeight / 30;
}
export const maxObstacles = max; // 障碍物的最大数量
export const maxMonsters = 5;
let monsterwave = 0;
let isPause = false; // 是否暂停游戏
let isHelp = false; // 是否打开帮助界面
let isStart = false;
let isTheFirst1 = true;
let isTheFirst2 = true;
let isTheFirst3 = true;
const maxSpeedItem = 1;
const maxShieldItem = 1;

// 玩家准备蓄力射箭
canvas.addEventListener("mousedown", (event) => {
    if (player.attackCooldown != 0 || player.isCloseAttack || player.health <= 0 || event.button != 0) {
        return;
    }
    else {
        // 挥刀与射箭不共存
        player.isCloseAttack = false;
        player.isShootArrow = true;
        player.attackCooldown++;
    }
    if (event.clientX - player.x < 0) {
        player.direction = "a";
    }
    else {
        player.direction = "d";
    }
});

// 玩家准备蓄力射箭
canvas.addEventListener("mousedown", (event) => {
    if (player.attackCooldown != 0 || 
        player.isCloseAttack || 
        player.health <= 0 || 
        event.button != 0 || // 鼠标右键不触发射箭
        isHelp || isPause) {
        return;
    }
    else {
        // 挥刀与射箭不共存
        player.isCloseAttack = false;
        player.isShootArrow = true;
        player.attackCooldown++;
    }
    if (event.clientX - player.x < 0) {
        player.direction = "a";
    }
    else {
        player.direction = "d";
    }
});

// 玩家蓄力状态下方向跟随鼠标
canvas.addEventListener("mousemove", (event) => {
    if (!player.isShootArrow || isHelp || isPause) {
        return;
    }
    if (event.clientX - player.x < 0) {
        player.direction = "a";
    }
    else {
        player.direction = "d";
    }
});

// 松开按键时射箭
canvas.addEventListener("mouseup", (event) => {
    if (!player.isShootArrow || 
        player.health <= 0 || 
        event.button != 0 || // 鼠标左键松开触发射箭
        player.isCloseAttack || 
        isHelp || isPause) {
        return;
    }
    player.shootArrow(event.clientX, event.clientY);
    player.isShootArrow = false;
    // 蓄满力后下次蓄力无需等待
    if (player.attackCooldown >= 60) {
        player.attackCooldown = 0;
    }
});

// 玩家近战攻击
canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    // 攻击冷却时间
    if (player.attackCooldown != 0 || 
        player.health <= 0 || 
        player.isShootArrow || 
        isPause || isHelp) {
        return;
    }
    // 两种攻击方式不共存
    else {
        player.isCloseAttack = true;
        player.isShootArrow = false;
        player.attackCooldown++;
    }
    //确保玩家的方向与鼠标点击的大致方向相同，每个方向为90度
    if (Math.abs(event.clientY - player.y) - Math.abs(event.clientX - player.x) > 0) {
        if (event.clientY - player.y < 0) {
            player.direction = "w";
        }
        else {
            player.direction = "s";
        }
    }
    else {
        if (event.clientX - player.x < 0) {
            player.direction = "a";
        }
        else {
            player.direction = "d";
        }
    }

    for (let i = 0; i < monsters.length; i++) {
        let dx = monsters[i].x - player.x;
        let dy = monsters[i].y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        // 以鼠标点击方向为中心的160度扇形为近战攻击判定范围
        if (distance < monsters[i].radius + player.radius + player.closeAttackDistance) {
            let center = (event.clientX - player.x) / Math.sqrt((event.clientX - player.x) * (event.clientX - player.x) + (event.clientY - player.y) * (event.clientY - player.y));
            let centerAngle = Math.acos(center) * (180 / Math.PI);
            let monsterAngle = Math.acos(dx / distance) * (180 / Math.PI);
            let minAngle = centerAngle - 80;
            let maxAngle = centerAngle + 80;
            if (minAngle < 0) {
                if (monsterAngle >= 360 + minAngle) {
                    minAngle += 360;
                }
                else {
                    minAngle = 0;
                }
            }
            if (maxAngle > 360) {
                if (monsterAngle <= maxAngle - 360) {
                    monsterAngle += 360;
                }
                else {
                    maxAngle = 360;
                }
            }
            if (monsterAngle >= minAngle && monsterAngle <= maxAngle) {
                generateBloodSplash(monsters[i].x, monsters[i].y);
                // 打断攻击
                if (monsters[i].attackCooldown <= 0) {
                    monsters[i].attackCooldown = monsters[i].attackCooldownTime;
                }
                monsters[i].knockback(player.knockbackDistance, dx / distance, dy / distance);
                monsters[i].health -= player.damage;
                if (monsters[i].health <= 0) {
                    player.score += monsters[i].score; // 增加玩家得分
                    monsters.splice(i, 1); // 移除生命值为 0 的怪物
                    i--;
                }
            }
        }
    }
    for (let i = 0; i < rangedMonsters.length; i++) {
        let dx = rangedMonsters[i].x - player.x;
        let dy = rangedMonsters[i].y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < rangedMonsters[i].radius + player.radius + player.closeAttackDistance) {
            let center = (event.clientX - player.x) / Math.sqrt((event.clientX - player.x) * (event.clientX - player.x) + (event.clientY - player.y) * (event.clientY - player.y));
            let centerAngle = Math.acos(center) * (180 / Math.PI);
            let monsterAngle = Math.acos(dx / distance) * (180 / Math.PI);
            let minAngle = centerAngle - 80;
            let maxAngle = centerAngle + 80;
            if (minAngle < 0) {
                if (monsterAngle >= 360 + minAngle) {
                    minAngle += 360;
                }
                else {
                    minAngle = 0;
                }
            }
            if (maxAngle > 360) {
                if (monsterAngle <= maxAngle - 360) {
                    monsterAngle += 360;
                }
                else {
                    maxAngle = 360;
                }
            }
            if (monsterAngle >= minAngle && monsterAngle <= maxAngle) {
                generateBloodSplash(rangedMonsters[i].x, rangedMonsters[i].y);
                // 打断攻击
                if (rangedMonsters[i].attackCooldown <= 0) {
                    rangedMonsters[i].attackCooldown = rangedMonsters[i].attackCooldownTime;
                }
                rangedMonsters[i].knockback(player.knockbackDistance, dx / distance, dy / distance);
                rangedMonsters[i].health -= player.damage;
                if (rangedMonsters[i].health <= 0) {
                    player.score += rangedMonsters[i].score; // 增加玩家得分
                    rangedMonsters.splice(i, 1); // 移除生命值为 0 的怪物
                    i--;
                }
            }
        }
    }
    for (let i = 0; i < bombers.length; i++) {
        if (bombers[i].isDead || bombers[i].health <= 0) {
            bombers.splice(i, 1);
            i--;
            continue;
        }
        let dx = bombers[i].x - player.x;
        let dy = bombers[i].y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bombers[i].radius + player.radius + player.closeAttackDistance) {
            let center = (event.clientX - player.x) / Math.sqrt((event.clientX - player.x) * (event.clientX - player.x) + (event.clientY - player.y) * (event.clientY - player.y));
            let centerAngle = Math.acos(center) * (180 / Math.PI);
            let monsterAngle = Math.acos(dx / distance) * (180 / Math.PI);
            let minAngle = centerAngle - 80;
            let maxAngle = centerAngle + 80;
            if (minAngle < 0) {
                if (monsterAngle >= 360 + minAngle) {
                    minAngle += 360;
                }
                else {
                    minAngle = 0;
                }
            }
            if (maxAngle > 360) {
                if (monsterAngle <= maxAngle - 360) {
                    monsterAngle += 360;
                }
                else {
                    maxAngle = 360;
                }
            }
            if (monsterAngle >= minAngle && monsterAngle <= maxAngle) {
                generateBloodSplash(bombers[i].x, bombers[i].y);
                bombers[i].knockback(player.knockbackDistance, dx / distance, dy / distance);
                bombers[i].health -= player.damage;
                if (bombers[i].health <= 0) {
                    player.score += bombers[i].score; // 增加玩家得分
                    bombers.splice(i, 1); // 移除生命值为 0 的怪物
                    i--;
                }
            }
        }
    }
});

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
let keyState = {}; // 存储按下的键的信息

// 确定玩家移动方向和暂停功能实现，按下按键即改变玩家的方向
function handleKeyDown(event) {
    if (player.health <= 0 || isHelp || isPause && event.key != " ") {
        return;
    }
    keyState[event.key] = true;
    switch (event.key) {
        // 往上走
        case "w":
        case "W":
            // 特殊状态下不能改变方向
            if (!player.isCloseAttack && !player.isShootArrow) {
                player.direction = "w";
            }
            break;
        // 往下走
        case "s":
        case "S":
            if (!player.isCloseAttack && !player.isShootArrow) {
                player.direction = "s";
            }
            break;
        // 往左走
        case "a":
        case "A":
            if (!player.isCloseAttack && !player.isShootArrow) {
                player.direction = "a";
            }
            break;
        // 往右走
        case "d":
        case "D":
            if (!player.isCloseAttack && !player.isShootArrow) {
                player.direction = "d";
            }
            break;
        // 按下空格键暂停游戏
        case " ": 
            if (!isHelp) {
                isPause = !isPause;
            }
            else {
                return;
            }
            break;
    }
}

// 按键松开时停止玩家某方向的移动
function handleKeyUp(event) {
    keyState[event.key] = false;
    switch (event.key) {
        case "w":
        case "W":
        case "s":
        case "S":
            player.vy = 0; // 停止垂直移动
            if (!player.isCloseAttack && !player.isShootArrow) {
                if (player.vx > 0) {
                    player.direction = "d";
                }
                else if (player.vx < 0) {
                    player.direction = "a";
                }
            }
            break;
        case "a":
        case "A":
        case "d":
        case "D":
            player.vx = 0; // 停止水平移动
            if (!player.isCloseAttack && !player.isShootArrow) {
                if (player.vy > 0) {
                    player.direction = "s";
                }
                else if (player.vy < 0) {
                    player.direction = "w";
                }
            }
            break;
    }
}

// 更新玩家速度状态
function updatePlayerSpeed() {
    if (player.health <= 0) {
        return;
    }
    let speed = player.speed;
    if (player.isShootArrow) {
        speed = player.shootingSpeed;
    }
    if (keyState["w"] || keyState["W"]) {
        // 走斜线
        if (Math.abs(player.vx) != 0) {
            player.vx = (player.vx / Math.abs(player.vx)) * speed / Math.sqrt(2);
            player.vy = -speed / Math.sqrt(2);
        }
        else {
            player.vx = 0;
            // 回头看效果
            if (player.vy != speed) {
                player.vy = -speed;
            }
        }
    }
    if (keyState["s"] || keyState["S"]) {
        // 走斜线
        if (Math.abs(player.vx) != 0) {
            player.vx = (player.vx / Math.abs(player.vx)) * speed / Math.sqrt(2);
            player.vy = speed / Math.sqrt(2);
        }
        else {
            player.vx = 0;
            // 回头看效果
            if (player.vy != -speed) {
                player.vy = speed;
            }
        }
    }
    if (keyState["a"] || keyState["A"]) {
        // 走斜线
        if (Math.abs(player.vy) != 0) {
            player.vx = -speed / Math.sqrt(2);
            player.vy = (player.vy / Math.abs(player.vy)) * speed / Math.sqrt(2);
        }
        else {
            // 回头看效果
            if (player.vx != speed) {
                player.vx = -speed;
            }
            player.vy = 0;
        }
    }
    if (keyState["d"] || keyState["D"]) {
        // 走斜线
        if (Math.abs(player.vy) != 0) {
            player.vx = speed / Math.sqrt(2);
            player.vy = (player.vy / Math.abs(player.vy)) * speed / Math.sqrt(2);
        }
        else {
            // 回头看效果
            if (player.vx != -speed) {
                player.vx = speed;
            }
            player.vy = 0;
        }
    }
}

// 处理子弹的移动
function moveBullets() {
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

function moveStrengthenedBullets() {
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

export function generateBloodSplash(x, y) {
    for (let i = 0; i < 50; i++) {
        const radius = Math.random() * 5 + 2;
        const particle = new BloodParticle(x, y, radius, canvas);
        particles.push(particle);
    }
}

function moveBloodSplash() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

// 掉落物生成
function generateDropLoot(x, y) {
    const dropChance = Math.random();
    if (dropChance < 0.6) {
        dropLoots.push(new DropLoot(x, y, canvas));
        if (isTheFirst3) {
            alert("击败怪物，有一定的概率会生成掉落物，拾取会增加人物生命值");
            isTheFirst3 = false;
        }
    }
}

// 拾取掉落物
function getDropLoot() {
    for (let i = 0; i < dropLoots.length; i++) {
        const dx2 = player.x - dropLoots[i].x;
        const dy2 = player.y - dropLoots[i].y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance2 < player.radius + dropLoots[i].radius) {
            player.health += 10;
            if (player.health > player.currentHealth) {
                player.health = player.health - (player.health - player.currentHealth);
            }
            dropLoots.splice(i, 1);
            i--;
        }
    }
}

// 生成道具
function generateItem() {
    if (speedItems.length == 0) {
        for (let i = 0; i < maxSpeedItem; i++) {
            for (let j = 0; j < obstacles.length; j++) {
                if (obstacles[j].type == 0) {
                    let x = (obstacles[j].x + obstacles[j].radius + 5) - (obstacles[j].x - obstacles[j].radius - 5) * Math.random();
                    let y = (obstacles[j].y + obstacles[j].radius + 5) - (obstacles[j].y - obstacles[j].radius - 5) * Math.random();
                    const dx = x - obstacles[j].x;
                    const dy = y - obstacles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < speedItems.radius + obstacles[j].radius) {
                        if (dx < 0) {
                            x -= (speedItems.radius - distance + 5);
                        }
                        else {
                            x += (speedItems.radius - distance + 5);
                        }
                        if (dy < 0) {
                            y -= (speedItems.radius - distance + 5);
                        }
                        else {
                            y += (speedItems.radius - distance + 5);
                        }
                    }
                    if (
                        x < speedItems.radius ||
                        x > canvas.width - speedItems.radius ||
                        y < speedItems.radius ||
                        y > canvas.height - speedItems.radius
                    ) {
                        continue;
                    }
                    if (!speedItems.length && speedItems.length <= maxSpeedItem) {
                        speedItems.push(new SpeedItem(x, y, canvas));
                    }
                }
            }
        }
    }
}

// 虽然是刷在树下，但有时候只会刷在一颗特定的树下，且有被树的图案挡住的情况
function generateShieldItem() {
    if (shieldItems.length == 0) {
        for (let i = 0; i < maxShieldItem; i++) {
            for (let j = 0; j < obstacles.length; j++) {
                if (obstacles[j].type == 0) {
                    let x = (obstacles[j].x + obstacles[j].radius + 10) - (obstacles[j].x - obstacles[j].radius - 10) * Math.random();
                    let y = (obstacles[j].y + obstacles[j].radius + 10) - (obstacles[j].y - obstacles[j].radius - 10) * Math.random();
                    const dx = x - obstacles[j].x;
                    const dy = y - obstacles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < shieldItems.radius + obstacles[j].radius) {
                        if (dx < 0) {
                            x -= (shieldItems.radius - distance + 5);
                        }
                        else {
                            x += (shieldItems.radius - distance + 5);
                        }
                        if (dy < 0) {
                            y -= (shieldItems.radius - distance + 5);
                        }
                        else {
                            y += (shieldItems.radius - distance + 5);
                        }
                    }
                    if (
                        x < shieldItems.radius ||
                        x > canvas.width - shieldItems.radius ||
                        y < shieldItems.radius ||
                        y > canvas.height - shieldItems.radius
                    ) {
                        continue;
                    }
                    if (!shieldItems.length && shieldItems.length <= maxShieldItem) {
                        shieldItems.push(new ShieldsItem(x, y, canvas));
                    }
                }
            }
        }
    }
}

// 拾取道具
function collectItem() {
    for (let i = 0; i < speedItems.length; i++) {
        const dx = player.x - speedItems[i].x;
        const dy = player.y - speedItems[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + speedItems[i].radius) {
            // 人物和道具碰撞
            if (isTheFirst1) {
                alert("拾取该道具后，将获得5s的速度加成");
                isTheFirst1 = false;
            }
            speedItems.splice(i, 1); // 移除道具
            if (!SpeedItem.isAmplified) {
                SpeedItem.isAmplified = true;
                SpeedItem.duration = 5;
                player.speed += 3;
                const timer2 = setInterval(function () {
                    SpeedItem.duration--;
                    if (SpeedItem.duration <= 0) {
                        clearInterval(timer2);
                        SpeedItem.isAmplified = false;
                        player.speed = 5;
                    }
                }, 1000);
            }
        }
    }
    for (let j = 0; j < shieldItems.length; j++) {
        const dx2 = player.x - shieldItems[j].x;
        const dy2 = player.y - shieldItems[j].y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance2 < player.radius + shieldItems[j].radius) {
            if (isTheFirst2) {
                alert("拾取该道具时，获得一定量的护盾");
                isTheFirst2 = false;
            }
            if (player.shield < 100) {
                player.shield += 20;
                if (player.shield > 100) {
                    player.shield = player.shield - (player.shield - 100);
                }
                shieldItems.splice(j, 1);
            }
        }
    }
}

// 生成障碍物
function generateObstacles() {
    if (obstacles.length == 0) {
        for (let i = 0; i < maxObstacles; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let type = Math.random() * 100;
            if (type < 30) {
                type = 1;
            }
            else if (type < 85) {
                type = 2;
            }
            else {
                type = 3;
            }

            let radius;
            if (type == 1) {
                radius = 18;
            }
            else if (type == 2) {
                radius = 24;
            }
            else {
                radius = 36;
            }

            if (radius == 18) {
                let random = Math.random() * 100;
                if (random < 50) {
                    type = 1;
                }
                else {
                    type = 2;
                }
            }
            else if (radius == 36) {
                let random = Math.random() * 100;
                if (random < 50) {
                    type = 0;
                }
                else {
                    type = 1;
                }
            }
            else {
                let random = Math.random() * 100;
                if (random < 50) {
                    type = 3;
                }
                else {
                    type = 4;
                }
            }


            let isOverlapping = false;
            for (const obstacle of obstacles) {
                const distance = Math.sqrt((x - obstacle.x) ** 2 + (y - obstacle.y) ** 2);
                if (distance < radius + obstacle.radius + 20) {
                    isOverlapping = true;
                    break;
                }
            }

            if (isOverlapping) {
                i--;
                continue;
            }

            obstacles.push(new Obstacle(x, y, radius, type, canvas));
        }
        // 按照障碍物的y坐标，避免遮挡
        for (let i = 0; i < obstacles.length - 1; i++) {
            for (let j = 0; j < obstacles.length - 1 - i; j++) {
                if (obstacles[j].y > obstacles[j + 1].y) {
                    let temp = obstacles[j];
                    obstacles[j] = obstacles[j + 1];
                    obstacles[j + 1] = temp;
                }
            }
        }
    }
}

function generateGrass() {
    if (littlePlants.length == 0) {
        let count;
        if (canvas.width < canvas.height) {
            count = canvas.height / 20;
        }
        else {
            count = canvas.width / 20;
        }
        for (let i = 0; i < count; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            if (x < 10 || x > canvas.width - 10 || y < 10 || y > canvas.height - 10) {
                i--;
                continue;
            }
            let type = Math.floor(Math.random() * 7);
            littlePlants.push(new LittlePlant(x, y, type, canvas));
        }
    }

}

// 生成怪物
function generateMonsters() {
    if (monsters.length == 0 && rangedMonsters.length == 0) {
        monsterwave++;
        let pursuitPlayerDistance;
        if (canvas.width < canvas.height) {
            pursuitPlayerDistance = canvas.width / 2;
        }
        else {
            pursuitPlayerDistance = canvas.height / 2;
        }
        for (let i = 0; i < maxMonsters; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let type = Math.random() * 100;

            if (
                Math.abs(x - player.x) < 100 &&
                Math.abs(y - player.y) < 100
            ) {
                i--;
                continue;
            }

            if (
                x < monsters.radius ||
                x > canvas.width - monsters.radius ||
                y < monsters.radius ||
                y > canvas.height - monsters.radius
            ) {
                i--;
                continue;
            }

            for (let j = 0; j < obstacles.length; j++) {
                let dx = x - obstacles[j].x;
                let dy = y - obstacles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < monsters.radius + obstacles[j].radius) {
                    if (dx < 0) {
                        x -= obstacles[j].radius;
                    }
                    else {
                        x += obstacles[j].radius;
                    }
                    if (dy < 0) {
                        y -= obstacles[j].radius;
                    }
                    else {
                        y += obstacles[j].radius;
                    }
                }
            }

            if (type < 40) {
                monsters.push(new Monster(x, y, pursuitPlayerDistance, canvas));
            }
            else if (type < 80) {
                rangedMonsters.push(new RangedMonster(x, y, pursuitPlayerDistance * 1.5, canvas));
            }
            else {
                bombers.push(new Bomber(x, y, pursuitPlayerDistance, canvas));
            }
        }
    }
}

// 处理怪物的移动
function moveMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        monsters[i].move();
    }
}

// 处理远程怪物的移动
function moveRangedMonsters() {
    for (let i = 0; i < rangedMonsters.length; i++) {
        rangedMonsters[i].move();
    }
}

// 处理炸弹人的移动
function moveBombers() {
    for (let i = 0; i < bombers.length; i++) {
        bombers[i].move();
    }
}

// 炸弹特效
function updateBomberExplosions() {
    for (let i = 0; i < bomberExplosions.length; i++) {
        bomberExplosions[i].update();
        if (bomberExplosions[i].opacity <= 0) {
            bomberExplosions.splice(i, 1);
            i--;
        }
    }
}

// 爆炸范围伤害判定和爆炸特效更新
function updateBulletExplosions() {
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

// 处理怪物子弹的移动
function moveMonsterBullets() {
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

// 检查子弹和怪物的碰撞
function checkBulletMonsterCollision() {
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

function checkStrengthenedBulletMonsterCollision() {
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

// 检查怪物子弹和玩家的碰撞
function checkMonsterBulletPlayerCollision() {
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

// 绘制画面
function draw() {
    player.ctx.imageSmoothingEnabled = false;
    player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
    if (portal.length != 0 && !portal[0].isActivated || portal.length == 0) {
        littlePlants.forEach((littlePlant) => littlePlant.draw());
    }
    if (portal.length != 0) {
        portal[0].draw();
    }
    player.draw();
    if (portal.length != 0 && portal[0].isActivated) {
        return;
    }
    shieldItems.forEach((shieldItem) => shieldItem.draw());
    speedItems.forEach((speedItem) => speedItem.draw());
    shieldItems.forEach((shieldItem) => shieldItem.draw());
    dropLoots.forEach((dropLoot) => dropLoot.draw());
    bullets.forEach((bullet) => bullet.draw());
    strengthenedBullets.forEach((strengthenedBullet) => strengthenedBullet.draw());
    monsters.forEach((monster) => monster.draw());
    rangedMonsters.forEach((rangedMonster) => rangedMonster.draw());
    monsterBullets.forEach((monsterBullet) => monsterBullet.draw());
    bombers.forEach((bomber) => bomber.draw());
    obstacles.forEach((obstacle) => obstacle.draw());
    bomberExplosions.forEach((bomberExplosion) => bomberExplosion.draw());
    bulletExplosions.forEach((bulletExplosion) => bulletExplosion.draw());
    particles.forEach((particle) => particle.draw());
    player.ctx.fillStyle = "black";
    player.ctx.font = "20px Arial";
    player.ctx.fillText("Health: " + player.health + "/" + player.currentHealth, 10, 30);
    player.ctx.fillText("Shield: " + player.shield, 10, 60);
    player.ctx.fillText("Score: " + player.score, 10, 90);
    if (isPause) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "30px Arial";
        ctx.fillText("游戏已暂停", canvas.width / 2 - 100, canvas.height / 2);
        ctx.fill();
    }
}

// 游戏奖励机制
function reward() {
    for (let reward of rewards) {
        if (player.score >= reward.threshold && !player.rewardReceived[reward.type]) {
            player.receiveReward(reward.type, reward.value, reward.message);
        }
    }
}

// 游戏循环
function gameLoop() {
    if (!isPause && !isHelp) {
        updatePlayerSpeed()
        generateObstacles();
        generateGrass();
        if (player.health > 0) {
            if (portal.length != 0) {
                if (!portal[0].isActivated){
                    player.move();
                }
            }
            else {
                player.move();
            }
        }
        moveBombers();
        reward();
        moveBullets();
        moveMonsters();
        moveRangedMonsters();
        moveBloodSplash();
        moveMonsterBullets();
        moveStrengthenedBullets();
        collectItem();
        getDropLoot();
        updateBomberExplosions();
        checkBulletMonsterCollision();
        checkMonsterBulletPlayerCollision()
        checkStrengthenedBulletMonsterCollision();
        updateBulletExplosions();
        draw();
        if (isStart) {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgb(0, 0, 0, 0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "blue";
            ctx.font = "30px Arial";
            ctx.fillText("玩家可通过wasd移动角色，通过鼠标左键或右键进行攻击", canvas.width / 2 - 410, canvas.height / 2 - 200);
            ctx.fill();
            setTimeout(() => {
                isStart = false;
            }, 10000);
        }
    }
    draw();
    if (monsterwave % 3 == 0 && monsterwave != 0 && monsters.length == 0 && 
        rangedMonsters.length == 0 && bombers.length == 0) {
        if (portal.length == 0) {
            generatePortal();
        }
        checkPlayerInPortal();
        if (portal[0].isActivated) {
            refreshScene();
        }
        if (portal.length == 0) {
            monsterwave++;
        }
    }
    if (monsters.length == 0 && rangedMonsters.length == 0 && bombers.length == 0 && portal.length == 0) {
        setTimeout(() => {
            generateMonsters();
        }, 5000);
    }
    if (player.isDead == true) {
        //cancelAnimationFrame(animationFrameId);
        player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
        gameOver();
    }
    if (speedItems.length == 0) {
        setTimeout(() => {
            generateItem();
        }, 2000);
    }
    if (shieldItems.length == 0) {
        setTimeout(() => {
            generateShieldItem();
        }, 2000);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    // 显示游戏结束屏幕
    cancelAnimationFrame(animationFrameId);
    let canvas = document.getElementById("Canvas");
    canvas.style.display = "none";
    gameOverScreen.style.display = "block";
    gameOverScreen.style.width = canvas.width + "px";
    gameOverScreen.style.height = canvas.height + "px";

    // 显示玩家的分数
    let scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.textContent = player.score;

    // 监听重新开始按钮的点击事件
    let restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", () => {

        // 隐藏游戏结束屏幕
        gameOverScreen.style.display = "none";
        canvas.style.display = "block";
        // 重置游戏状态
        player.isDead = false;
        player.currentHealth = 100;
        player.animationFrame = 0;
        player.animationFrameTime = 59;
        player.attackCooldown = 0;
        player.isCloseAttack = false;
        player.isShootArrow = false;
        player.health = 100;
        player.score = 0;
        player.speed = 2;
        player.shield = 0;
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        bullets.length = 0;
        strengthenedBullets.length = 0;
        Bullet.damage = 10;
        monsters.length = 0;
        rangedMonsters.length = 0;
        monsterBullets.length = 0;
        bombers.length = 0;
        bomberExplosions.length = 0;
        particles.length = 0;
        dropLoots.length = 0;
        obstacles.length = 0;
        speedItems.length = 0;
        shieldItems.length = 0;
        isPause = false;
        isHelp = false;
        // 重新开始游戏循环
    });
}

let animationFrameId;
let gameStartScreen = document.getElementById("gameStartScreen");
let gameOverScreen = document.getElementById("gameOverScreen");
let startButton = document.getElementById("startButton");
let helpButton = document.getElementById("helpButton");
let helpScreen = document.getElementById("helpScreen");
let closeButton = document.getElementById("closeButton");
gameStartScreen.style.paddingTop = window.innerHeight / 1.5 + "px";
gameOverScreen.style.paddingTop = window.innerHeight / 1.5 + "px";
// 开始游戏
startButton.addEventListener("click", () => {
    gameStartScreen.style.display = "none";
    canvas.style.display = "block";
    isStart = true;
    gameLoop();
});
// 帮助界面
helpButton.addEventListener("click", () => {
    helpScreen.style.display = "block";
    helpButton.style.display = "none";
    isHelp = true;
});
// 关闭帮助界面
closeButton.addEventListener("click", () => {
    helpScreen.style.display = "none";
    helpButton.style.display = "block";
    isHelp = false;
});