import { canvas, isTheFirst1, isTheFirst2, maxShieldItem, maxSpeedItem, setIsTheFirst1, setIsTheFirst2 } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { obstacles } from "../Scene/Obstacle.js";

import { HeadTips, headTips } from "../Particle/Tips.js";

export class SpeedItem {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 10;
        this.duration = 0;// 增幅时间
        this.isAmplified = false;
    }

    // 绘制道具
    draw() {
        this.ctx.save();
        this.ctx.drawImage(speedItemImage, 710, 450, 91, 220, this.x - 10, this.y - 20, 20, 40);
        this.ctx.restore();
    }
    // 避开障碍物生成
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
        this.ctx.save();
        this.ctx.drawImage(shieldItemImage, 160, 0, 724, 1080, this.x - 7.24, this.y - 10.8, 14.48, 21.6);
        this.ctx.restore();
    }

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
}

export const speedItems = [];
export const shieldItems = [];
const speedItemImage = new Image();
speedItemImage.src = "./res/speedItem.png";
const shieldItemImage = new Image();
shieldItemImage.src = "./res/shieldItem.png";

// 生成道具
export function generateItem() {
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
export function generateShieldItem() {
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
export function collectItem() {
    for (let i = 0; i < speedItems.length; i++) {
        const dx = player.x - speedItems[i].x;
        const dy = player.y - speedItems[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + speedItems[i].radius) {
            // 人物和道具碰撞
            if (isTheFirst1) {
                headTips.push(new HeadTips("拾取该道具后，将获得5s的速度加成", canvas))
                //alert("拾取该道具后，将获得5s的速度加成");
                setIsTheFirst1(false);
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
                headTips.push(new HeadTips("拾取该道具时，获得一定量的护盾", canvas));
                //alert("拾取该道具时，获得一定量的护盾");
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