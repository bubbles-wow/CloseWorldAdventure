import { player, updatePlayerSpeed, handleKeyDown, handleKeyUp } from "./Player.js";
import { handleRightClick, handleMouseUp, handleMouseMove, handleMouseDown } from "./Player.js";
import { canvas, isStart, isPause, isHelp, monsterWave, maxMonsters, setMonsterWave, setIsStart, setIsHelp } from "./Core.js";

import { obstacles, generateObstacles } from "./Obstacle.js";
import { littlePlants, generateGrass } from "./Obstacle.js";

import { Bullet, bullets, moveBullets, checkBulletMonsterCollision } from "./Bullet.js";
import { monsterBullets, moveMonsterBullets, checkMonsterBulletPlayerCollision } from "./MonsterBullet.js";

import { monsters, generateMonster } from "./Monster.js";
import { rangedMonsters, generateRangedMonster } from "./RangedMonster.js";
import { bombers, generateBomber } from "./Bomber.js";
import { bomberExplosions, updateBomberExplosions } from "./Bomber.js";

import { speedItems, shieldItems } from "./item.js";
import { generateItem, generateShieldItem, collectItem } from "./item.js";
import { dropLoots, getDropLoot } from "./DropLoot.js";
import { rewards } from "./Reward.js";

import { strengthenedBullets } from "./Skill.js";
import { moveStrengthenedBullets, checkStrengthenedBulletMonsterCollision } from "./Skill.js";
import { bulletExplosions, updateBulletExplosions } from "./Skill.js";
import { particles, moveBloodSplash } from "./BloodParticle.js";
import { portal, generatePortal, checkPlayerInPortal, refreshScene } from "./Portal.js";

import { HeadTips, headTips } from "./Tips.js";

let fps = 60; // 目标帧率
let interval = 1000 / fps; // 每帧的时间间隔
let then = Date.now(); // 上一帧的时间戳

// 鼠标左键按下玩家准备蓄力射箭
canvas.addEventListener("mousedown", handleMouseDown);

// 玩家蓄力状态下方向跟随鼠标
canvas.addEventListener("mousemove", handleMouseMove);

// 鼠标左键松开时射箭
canvas.addEventListener("mouseup", handleMouseUp);

// 鼠标右键玩家近战攻击
canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    handleRightClick(event);
})

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// 生成怪物
function generateMonsters() {
    if (monsters.length == 0 && rangedMonsters.length == 0) {
        //monsterWave++;
        setMonsterWave(monsterWave + 1);
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

            if (type < 40) {
                generateMonster(x, y, pursuitPlayerDistance)
            }
            else if (type < 80) {
                generateRangedMonster(x, y, pursuitPlayerDistance);
            }
            else {
                generateBomber(x, y, pursuitPlayerDistance);
            }
        }
    }
}

function updateScene() {
    updateBomberExplosions();
    updateBulletExplosions();
    bombers.forEach((bomber) => bomber.move());
    monsters.forEach((monster) => monster.move());
    rangedMonsters.forEach((rangedMonster) => rangedMonster.move());
    moveBullets();
    moveBloodSplash();
    moveMonsterBullets();
    moveStrengthenedBullets();
}

function checkDamage() {
    checkBulletMonsterCollision();
    checkMonsterBulletPlayerCollision()
    checkStrengthenedBulletMonsterCollision();
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
    headTips.forEach((headTip) => {
        headTip.draw();
        if (headTip.animationFrame >= headTip.animationFrameTime) {
            headTips.splice(0, 1);
        }
    });
    player.ctx.save();
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
    player.ctx.restore();
}

// 游戏奖励机制
function reward() {
    for (let reward of rewards) {
        if (player.score >= reward.threshold && !player.rewardReceived[reward.type]) {
            player.receiveReward(reward.type, reward.value, reward.message);
            headTips.push(new HeadTips(reward.message, canvas));
        }
    }
}

// 游戏循环
function gameLoop() {
    // 帧数控制为60
    const now = Date.now();
    const delta = now - then;
    if (!isPause && !isHelp && delta > interval) {
        updatePlayerSpeed()
        generateObstacles();
        generateGrass();
        if (player.health > 0) {
            if (portal.length != 0) {
                if (!portal[0].isActivated) {
                    player.move();
                }
            }
            else {
                player.move();
            }
        }
        updateScene();
        reward();
        collectItem();
        getDropLoot();
        checkDamage()
        // if (isStart) {
        //     const ctx = canvas.getContext("2d");
        //     ctx.save();
        //     ctx.fillStyle = "rgb(0, 0, 0, 0)";
        //     ctx.fillRect(0, 0, canvas.width, canvas.height);
        //     ctx.fillStyle = "blue";
        //     ctx.font = "30px Arial";
        //     ctx.fillText("玩家可通过wasd移动角色，通过鼠标左键或右键进行攻击", canvas.width / 2 - 410, canvas.height / 2 - 200);
        //     ctx.fill();
        //     ctx.restore();
        //     setTimeout(() => {
        //         isStart = false;
        //     }, 10000);
        // }
    }
    draw();
    if (monsterWave % 4 == 0 && monsterWave != 0 && monsters.length == 0 &&
        rangedMonsters.length == 0 && bombers.length == 0) {
        if (portal.length == 0) {
            generatePortal();
        }
        checkPlayerInPortal();
        if (portal[0].isActivated) {
            refreshScene();
        }
        if (portal.length == 0) {
            //monsterWave++;
            setMonsterWave(monsterWave + 1);
            let count = Math.floor(monsterWave / 4 + 1);
            headTips.push(new HeadTips("第 " + count + " 间", canvas));
        }
    }
    else if (monsterWave == 0) {
        headTips.push(new HeadTips("第 1 间", canvas));
        //monsterWave++;
        setMonsterWave(monsterWave + 1);
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
    //isStart = true;
    setIsStart(true);
    gameLoop();
});
// 帮助界面
helpButton.addEventListener("click", () => {
    helpScreen.style.display = "block";
    helpButton.style.display = "none";
    setIsHelp(true);
});
// 关闭帮助界面
closeButton.addEventListener("click", () => {
    helpScreen.style.display = "none";
    helpButton.style.display = "block";
    setIsHelp(false);
});