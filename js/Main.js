import { player } from "./Player.js";
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

export const maxObstacles = 15; // 障碍物的最大数量
export const maxMonsters = 5;

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
            player.vy = -player.speed; // 上
            break;
        case "s":
            player.vy = player.speed; // 下
            break;
        case "a":
            player.vx = -player.speed; // 左
            break;
        case "d":
            player.vx = player.speed; // 右
            break;
    }
}

// 处理按键松开事件
function handleKeyUp(event) {
    switch (event.key) {
        case "w":
        case "s":
            player.vy = 0; // 停止垂直移动
            break;
        case "a":
        case "d":
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
    obstacles.forEach((obstacle) => obstacle.draw());
    bullets.forEach((bullet) => bullet.draw());
    monsters.forEach((monster) => monster.draw());
    rangedMonsters.forEach((rangedMonster) => rangedMonster.draw());
    monsterBullets.forEach((monsterBullet) => monsterBullet.draw());
    bombers.forEach((bomber) => bomber.draw());
    bomberExplosions.forEach((bomberExplosion) => bomberExplosion.draw());

    player.ctx.fillStyle = "black";
    player.ctx.font = "20px Arial";
    player.ctx.fillText("Health: " + player.health, 10, 30);
    player.ctx.fillText("Score: " + player.score, 10, 60);
    player.draw();
}

// 游戏循环
function gameLoop() {
    generateObstacles();
    player.move();
    moveBombers();
    moveBullets();
    moveMonsters();
    moveRangedMonsters()
    moveMonsterBullets();
    updateBomberExplosions();
    checkBulletMonsterCollision();
    checkMonsterBulletPlayerCollision()
    draw();
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