import { Player, player } from "./Player.js";
import { canvas } from "./Player.js";

import { Obstacle } from "./Obstacle.js";
import { obstacles } from "./Obstacle.js";

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

export const maxObstacles = 15; // 障碍物的最大数量
export const maxMonsters = 5;
let isPause = false; // 是否暂停游戏
const maxSpeedItem = 1;
const maxShieldItem = 1;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

canvas.addEventListener("click", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const bulletSpeed = 15;
    const length = Math.sqrt(dx * dx + dy * dy);
    const bulletVX = (dx / length) * bulletSpeed;
    const bulletVY = (dy / length) * bulletSpeed;
    bullets.push(new Bullet(player.x, player.y, bulletVX, bulletVY, bulletSpeed, canvas));
});

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// 处理按键按下事件
function handleKeyDown(event) {
    switch (event.key) {
        case "w":
        case "W":
            player.vy = -player.speed; // 上
            break;
        case "s":
        case "S":
            player.vy = player.speed; // 下
            break;
        case "a":
        case "A":
            player.vx = -player.speed; // 左
            break;
        case "d":
        case "D":
            player.vx = player.speed; // 右
            break;
    }
}

// 处理按键松开事件
function handleKeyUp(event) {
    switch (event.key) {
        case "w":
        case "W":
        case "s":
        case "S":
            player.vy = 0; // 停止垂直移动
            break;
        case "a":
        case "A":
        case "d":
        case "D":
            player.vx = 0; // 停止水平移动
            break;
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
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            if (Math.abs(x - player.x) < 100 && Math.abs(y - player.y) < 100) {
                i--;
                continue; // 让道具不太靠近人物
            }
            if (x < SpeedItem.radius || x > canvas.width - SpeedItem.radius || y < SpeedItem.radius || y > canvas.height - SpeedItem.radius) {
                i--;
                continue; // 保证道具不生成在画布外
            }
            speedItems.push(new SpeedItem(x, y, canvas));
        }
    }
}

function generateShieldItem() {
    if (shieldItems.length == 0) {
        for (let j = 0; j < maxShieldItem; j++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            if (Math.abs(x - player.x) < 100 && Math.abs(y - player.y) < 100) {
                j--;
                continue;
            }
            if (x < ShieldsItem.radius || x > canvas.width - ShieldsItem.radius || y < ShieldsItem.radius || y > canvas.height - ShieldsItem.radius) {
                j--;
                continue;
            }
            shieldItems.push(new ShieldsItem(x, y, canvas));
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
            speedItems.splice(i, 1); // 移除道具
            if (!SpeedItem.isAmplified) {
                SpeedItem.isAmplified = true;
                SpeedItem.duration = 10;
                player.speed += 10;
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
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 30 + 10; // 障碍物半径

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

            obstacles.push(new Obstacle(x, y, radius, canvas));
        }
    }
}

// 生成怪物
function generateMonsters() {
    if (monsters.length == 0 && rangedMonsters.length == 0) {
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
        monsters[i].move(player, obstacles);
        if (monsters[i].attackCooldown > 0) {
            monsters[i].attackCooldown -= 16; // 每帧减少冷却时间
        }
    }
}

// 处理远程怪物的移动
function moveRangedMonsters() {
    for (let i = 0; i < rangedMonsters.length; i++) {
        rangedMonsters[i].move(player, obstacles, monsterBullets);
        if (rangedMonsters[i].attackCooldown > 0) {
            rangedMonsters[i].attackCooldown -= 16; // 每帧减少冷却时间
        }
    }
}

// 处理炸弹人的移动
function moveBombers() {
    for (let i = 0; i < bombers.length; i++) {
        bombers[i].move(player, obstacles, bomberExplosions);
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

// 检查怪物子弹和玩家的碰撞
function checkMonsterBulletPlayerCollision() {
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
    player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
    if (player.health <= 0) {
        return;
    }
    shieldItems.forEach((shieldItem) => shieldItem.draw());
    speedItems.forEach((speedItem) => speedItem.draw());
    dropLoots.forEach((dropLoot) => dropLoot.draw());
    obstacles.forEach((obstacle) => obstacle.draw());
    bullets.forEach((bullet) => bullet.draw());
    monsters.forEach((monster) => monster.draw());
    rangedMonsters.forEach((rangedMonster) => rangedMonster.draw());
    monsterBullets.forEach((monsterBullet) => monsterBullet.draw());
    bombers.forEach((bomber) => bomber.draw());
    bomberExplosions.forEach((bomberExplosion) => bomberExplosion.draw());
    particles.forEach((particle) => particle.draw());
    player.ctx.fillStyle = "black";
    player.ctx.font = "20px Arial";
    player.ctx.fillText("Health: " + player.health, 10, 30);
    player.ctx.fillText("Shield: " + player.shield, 10, 60);
    player.ctx.fillText("Score: " + player.score, 10, 90);
    player.draw();
}

// 游戏奖励机制
function reward() {

}

// 游戏暂停
document.addEventListener("keydown", function (event) {
    if (event.keyCode === 32) {
        isPause = !isPause;
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
})

// 游戏循环
function gameLoop() {
    if (!isPause) {
        generateObstacles();
        player.move();
        moveBombers();
        moveBullets();
        moveMonsters();
        moveRangedMonsters();
        moveBloodSplash();
        moveMonsterBullets();
        collectItem();
        getDropLoot();
        updateBomberExplosions();
        checkBulletMonsterCollision();
        checkMonsterBulletPlayerCollision()
        draw();
    }
    if (monsters.length == 0 && rangedMonsters.length == 0) {
        setTimeout(function () {
            generateMonsters();

        }, 5000);
    }
    if (player.health <= 0) {
        //cancelAnimationFrame(animationFrameId);
        player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
        gameOver();
    }
    if (speedItems.length == 0) {
        setTimeout(function () {
            generateItem();
        }, 2000);
    }
    if (shieldItems.length == 0) {
        setTimeout(function () {
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
    let gameOverScreen = document.getElementById("gameOverScreen");
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
        player.health = 100;
        player.score = 0;
        player.speed = 5;
        player.shield = 0;
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        bullets.length = 0;
        monsters.length = 0;
        rangedMonsters.length = 0;
        monsterBullets.length = 0;
        bombers.length = 0;
        bomberExplosions.length = 0;
        // 重新开始游戏循环
    });
}

let animationFrameId;
let gameStartScreen = document.getElementById("gameStartScreen");
let startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
    gameStartScreen.style.display = "none";
    canvas.style.display = "block";
    gameLoop();
});