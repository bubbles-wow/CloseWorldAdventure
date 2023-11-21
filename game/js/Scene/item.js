import { canvas, isTheFirst1, isTheFirst2, maxShieldItem, maxSpeedItem, setIsTheFirst1, setIsTheFirst2 } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { obstacles } from "../Scene/Obstacle.js";

import { HeadTips, headTips } from "../Particle/Tips.js";

export class SpeedItem {
    constructor(x, y, type, canvas) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 10;
    }

    // 绘制道具
    draw() {
        let scale = 0.8;
        this.ctx.save();
        this.ctx.drawImage(speedItemImage, this.type * 24, 0, 24, 39, this.x - 12 * scale, this.y - 18 * scale, 24 * scale, 39 * scale);
        this.ctx.restore();
    }
}

export class ShieldsItem {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.shieldValue = 20;
        this.collected = false;
    }

    // 绘制护盾类道具
    draw() {
        let scale = 1.5;
        this.ctx.save();
        this.ctx.drawImage(shieldItemImage, 0, 0, 16, 16, this.x - 8 * scale, this.y - 8 * scale, 16 * scale, 16 * scale);
        this.ctx.restore();
    }
}

export const speedItems = [];
export const shieldItems = [];
const speedItemImage = new Image();
speedItemImage.src = "./res/speedItem.png";
const shieldItemImage = new Image();
shieldItemImage.src = "./res/shieldItem.png";

// 生成道具
export function generateItem() {
    speedItems.length = 0;
    shieldItems.length = 0;
    let Flag = [];
    console.log(obstacles.length);
    for (let i = 0; i < maxSpeedItem; i++) {
        let position = Math.floor(Math.random() * obstacles.length);
        if (Flag[position]) {
            i--;
            continue;
        }
        let random = Math.random() * 100;
        let x = obstacles[position].x;
        let y = obstacles[position].y;
        if (random < 50) {
            x -= 10 + obstacles[position].radius;
        }
        else {
            x += 10 + obstacles[position].radius;
        }
        if (x < 10 || x > canvas.width - 10 || y < 10 || y > canvas.height - 10) {
            i--;
            continue;
        }
        generateSpeedItem(x, y);
        Flag[position] = true;
    }
    for (let i = 0; i < maxShieldItem; i++) {
        let position = Math.floor(Math.random() * obstacles.length);
        if (Flag[position]) {
            i--;
            continue;
        }
        let random = Math.random() * 100;
        let x = obstacles[position].x;
        let y = obstacles[position].y;
        if (random < 50) {
            x -= 10 + obstacles[position].radius;
        }
        else {
            x += 10 + obstacles[position].radius;
        }
        if (x < 10 || x > canvas.width - 10 || y < 10 || y > canvas.height - 10) {
            i--;
            continue;
        }
        generateShieldItem(x, y);
        Flag[position] = true;
    }
}

// 生成能量饮料
function generateSpeedItem(x, y) {
    let type = Math.random() * 100;
    if (type < 25) {
        type = 0;
    }
    else if (type < 50) {
        type = 1;
    }
    else if (type < 75) {
        type = 2;
    }
    else {
        type = 3;
    }
    speedItems.push(new SpeedItem(x, y, type, canvas));
}

// 生成护盾药水
function generateShieldItem(x, y) {
    shieldItems.push(new ShieldsItem(x, y, canvas));
}

// 拾取道具
export function collectItem() {
    for (let i = 0; i < speedItems.length; i++) {
        const dx = player.x - speedItems[i].x;
        const dy = player.y - speedItems[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + speedItems[i].radius) {
            // 人物和道具碰撞
            if (isTheFirst1) {
                headTips.push(new HeadTips("拾取能量饮料后，将获得一段时间的速度加成", canvas))
                setIsTheFirst1(false);
            }
            if (speedItems[i].type == 0) {
                player.addSpeed = 3;
                player.speedUpTime = 3600;
            }
            else if (speedItems[i].type == 1) {
                player.addSpeed = 2;
                player.speedUpTime = 1800;
            }
            else if (speedItems[i].type == 2) {
                player.addSpeed = 1;
                player.speedUpTime = 1800;
            }
            else {
                player.addSpeed = 0.5;
                player.speedUpTime = 1800;
            }
            speedItems.splice(i, 1); // 移除道具
        }
    }
    for (let j = 0; j < shieldItems.length; j++) {
        const dx2 = player.x - shieldItems[j].x;
        const dy2 = player.y - shieldItems[j].y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance2 < player.radius + shieldItems[j].radius) {
            if (isTheFirst2) {
                headTips.push(new HeadTips("拾取护盾药水时，获得一定量的护盾", canvas));
                setIsTheFirst2(false);
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