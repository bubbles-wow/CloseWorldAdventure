import { canvas, isStart, isTheFirst3, setIsTheFirst3 } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { obstacles } from "./Obstacle.js";

import { HeadTips, headTips } from "../Particle/Tips.js";

// 掉落物
export class DropLoot {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.radius = 15;
        this.ctx = canvas.getContext("2d");
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

    draw() {
        let scale = 1.8;
        this.ctx.save();
        this.ctx.drawImage(dropLootImage, 0, 0, 16, 16, this.x - 8 * scale, this.y - 8 * scale, 16 * scale, 16 * scale);
        this.ctx.restore();
    }
}

export const dropLoots = [];
const dropLootImage = new Image();
dropLootImage.src = "./res/dropLoot.png"

// 掉落物生成
export function generateDropLoot(x, y) {
    // 新手教程不掉落
    if (isStart) {
        return;
    }
    let dropChance = Math.random();
    if (dropChance < 0.3) {
        dropLoots.push(new DropLoot(x, y, canvas));
        dropLoots[dropLoots.length - 1].avoidObstacles();
        if (isTheFirst3) {
            headTips.push(new HeadTips("击败怪物，有一定的概率会生成掉落物，拾取会增加玩家生命值", canvas));
            //alert("击败怪物，有一定的概率会生成掉落物，拾取会增加人物生命值");
            setIsTheFirst3(false);
        }
    }
}

// 拾取掉落物
export function getDropLoot() {
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