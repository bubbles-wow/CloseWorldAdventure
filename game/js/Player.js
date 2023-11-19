import { canvas, isHelp, isPause, setIsPause } from "./Core.js";
import { obstacles } from "./Obstacle.js";
import { Bullet, bullets } from "./Bullet.js";
import { StrengthenedBullet, strengthenedBullets } from "./Skill.js";
import { monsters } from "./Monster.js";
import { rangedMonsters } from "./RangedMonster.js";
import { bombers } from "./Bomber.js";
import { generateBloodSplash } from "./BloodParticle.js";

export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.x = canvas.width / 2; // 玩家初始 x 坐标
        this.y = canvas.height / 2; // 玩家初始 y 坐标
        this.radius = 10; // 玩家半径
        this.shield = 0; // 玩家目前所持护盾
        this.speed = 2; // 玩家移动速度
        this.shootingSpeed = 0.5; // 玩家射击时速度
        this.health = 100; // 玩家生命值
        this.currentHealth = 100; // 玩家的生命值上限
        this.score = 0; // 玩家得分
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.isDead = false; // 玩家是否死亡
        this.damage = 10; // 玩家的伤害
        this.closeAttackDistance = 50; // 玩家近战攻击距离
        this.knockbackDistance = 40; // 玩家近战击退距离
        this.attackCooldown = 0; // 攻击冷却时间
        this.isOnCooldown = false; // 爆炸箭冷却时间
        this.attackCooldownTime = 59; // 攻击冷却时间阈值
        this.animationFrame = 0; // 玩家动画帧
        this.animationFrameTime = 59; // 玩家动画帧阈值
        this.isCloseAttack = false; // 玩家是否近战攻击
        this.isShootArrow = false; // 玩家是否射箭
        this.direction = "s"; // 玩家朝向
        this.rewardReceived = {
            damage: false,
            current: false
        };
    }

    // 函数处理玩家受到击退效果
    knockback(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
        const newX = this.x + knockbackDistance * knockbackDirectionX;
        const newY = this.y + knockbackDistance * knockbackDirectionY;

        // 检查是否越界，如果不越界，更新玩家的位置
        if (newX >= 0 && newX <= this.canvas.width && newY >= 0 && newY <= this.canvas.height) {
            this.x = newX;
            this.y = newY;
        }

        this.avoidObstacles();
    }

    damageByMonsterBullet(monsterbullet) {
        if (player.shield == 0) {
            player.health -= 10;
        }
        else {
            player.shield -= 10;
        }
        let directionX = monsterbullet.vx / monsterbullet.speed;
        let directionY = monsterbullet.vy / monsterbullet.speed;
        this.knockback(20, directionX, directionY);
    }

    // 处理玩家的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;

        // 检查是否越界，如果越界，限制玩家在画布内
        if (this.x < this.radius) {
            this.x = this.radius;
        } else if (this.x > this.canvas.width - this.radius) {
            this.x = this.canvas.width - this.radius;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
        } else if (this.y > this.canvas.height - this.radius) {
            this.y = this.canvas.height - this.radius;
        }

        this.avoidObstacles();

        // 攻击冷却时间计算
        if (this.attackCooldown > 0) {
            this.attackCooldown++;
        }
        else if (this.attackCooldown == 0) {
            // 确保蓄力时不会被中断，除非松开鼠标
            if (this.isShootArrow) {
                this.attackCooldown = 60
            }
        }
        if (this.attackCooldown > this.attackCooldownTime) {
            if (!this.isShootArrow) {
                this.attackCooldown = 0;
            }
            this.isCloseAttack = false;
        }
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

    // 玩家射箭
    shootArrow(x, y) {
        let dx = x - player.x;
        let dy = y - player.y;
        let length = Math.sqrt(dx * dx + dy * dy);
        let bulletSpeed = 5;
        let knockbackDistance = this.knockbackDistance - 20;
        let damage = this.damage;
        if (this.attackCooldown < this.attackCooldownTime) {
            damage += this.damage * (this.attackCooldown / this.attackCooldownTime);
            bulletSpeed += 10 * (this.attackCooldown / this.attackCooldownTime);
            knockbackDistance += 20 * (this.attackCooldown / this.attackCooldownTime);
        }
        else {
            bulletSpeed = 15;
            knockbackDistance *= 2;
            damage *= 2;
        }
        let bulletVX = (dx / length) * bulletSpeed;
        let bulletVY = (dy / length) * bulletSpeed;
        if (!this.isOnCooldown) {
            strengthenedBullets.push(new StrengthenedBullet(player.x, player.y, bulletVX, bulletVY, bulletSpeed, canvas));
            this.isOnCooldown = true;
            setTimeout(() => {
                this.isOnCooldown = false;
            }, 10000);
        }
        if (strengthenedBullets.length == 0) {
            bullets.push(new Bullet(player.x, player.y, bulletVX, bulletVY, damage, bulletSpeed, knockbackDistance, canvas));
        }
    }

    // 绘制玩家
    draw() {
        let imageDirectionX = 48 * Math.floor(this.animationFrame / 10);
        let imageDirectionY = 0;
        let isWalking = false;
        if (this.vx != 0 || this.vy != 0) {
            isWalking = true;
        }
        // 走路时动作
        if (isWalking) {
            if (this.direction === "s") {
                imageDirectionY = 48 * 4;
            }
            else if (this.direction === "w") {
                imageDirectionY = 48 * 6;
            }
            else if (this.direction === "a") {
                imageDirectionY = 48 * 7;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 5;
            }
        }
        // 在原地的动作
        else {
            if (this.direction === "s") {
                imageDirectionY = 48 * 0;
            }
            else if (this.direction === "w") {
                imageDirectionY = 48 * 2;
            }
            else if (this.direction === "a") {
                imageDirectionY = 48 * 3;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 1;
            }
        }
        // 死亡动画
        if (this.health <= 0) {
            if (this.animationFrameTime === 59 && this.animationFrame != 0) {
                this.animationFrame = 0;
                this.animationFrameTime = 180;
            }
            imageDirectionY = 48 * 12;
            if (this.animationFrame < 30) {
                imageDirectionX = 48 * 0;
            }
            else if (this.animationFrame < 60) {
                imageDirectionX = 48 * 1;
            }
            else if (this.animationFrame < 180) {
                imageDirectionX = 48 * 2;
            }
            if (this.animationFrame === 180) {
                this.isDead = true;
            }
            this.ctx.drawImage(playerImage, imageDirectionX, imageDirectionY, 48, 48, this.x - this.radius - 14 * 1.5, this.y - this.radius - 22 * 1.5, 72, 72);
            this.animationFrame++;
            return;
        }
        // 近战挥刀动作
        if (this.isCloseAttack) {
            if (this.direction === "s") {
                imageDirectionY = 48 * 8;
            }
            else if (this.direction === "w") {
                imageDirectionY = 48 * 10;
            }
            else if (this.direction === "a") {
                imageDirectionY = 48 * 11;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 9;
            }
            imageDirectionX = 48 * Math.floor(this.attackCooldown / 15);
        }
        // 蓄力拉弓动作
        if (this.isShootArrow) {
            if (this.direction === "a") {
                imageDirectionY = 48 * 14;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 13;
            }
            imageDirectionX = 48 * Math.floor(this.attackCooldown / 15);
            if (this.attackCooldown > 45) {
                imageDirectionX = 48 * 2;
            }
        }
        if (this.animationFrame < this.animationFrameTime) {
            this.animationFrame++;
        }
        else {
            this.animationFrame = 0;
        }

        this.ctx.drawImage(playerImage, imageDirectionX, imageDirectionY, 48, 48, this.x - this.radius - 18 * 1.5, this.y - this.radius - 25 * 1.5, 72, 72);

        // 实际碰撞位置显示
        // this.ctx.beginPath();
        // this.ctx.fillStyle = "#f0149c";
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
    }

    // 是否接受奖励
    receiveReward(type, value, message) {
        if (!this.rewardReceived[type]) {
            if (type === 'current') {
                this.increaseCurrentHealth(value);
            } else {
                this.applyDamageBoost(value);
            }
            this.rewardReceived[type] = true;

            //alert(message);
        }
    }

    // 实现伤害提升逻辑
    applyDamageBoost(value) {
        this.damage += value;
        //Bullet.damage += value;
    }

    // 实现生命上限提升逻辑
    increaseCurrentHealth(value) {
        this.currentHealth += value;
    }
}

export const player = new Player(canvas);
let playerImage = new Image();
playerImage.src = "./res/player.png";

// 玩家准备蓄力射箭
export function handleMouseDown(event) {
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
}

// 玩家蓄力状态下方向跟随鼠标
export function handleMouseMove(event) {
    if (!player.isShootArrow || isHelp || isPause) {
        return;
    }
    if (event.clientX - player.x < 0) {
        player.direction = "a";
    }
    else {
        player.direction = "d";
    }
}

// 松开按键时射箭
export function handleMouseUp(event) {
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
}

// 玩家近战攻击
export function handleRightClick(event) {
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
}

export let keyState = {}; // 存储按下的键的信息

// 确定玩家移动方向和暂停功能实现，按下按键即改变玩家的方向
export function handleKeyDown(event) {
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
                setIsPause(!isPause);
            }
            else {
                return;
            }
            break;
    }
}

// 按键松开时停止玩家某方向的移动
export function handleKeyUp(event) {
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
export function updatePlayerSpeed() {
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