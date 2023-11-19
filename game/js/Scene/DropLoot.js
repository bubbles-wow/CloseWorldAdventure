import { canvas, isStart, isTheFirst3, setIsTheFirst3 } from "../Game/Core.js";

import { player } from "../Player/Player.js";

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

    draw() {
        this.ctx.save();
        this.ctx.drawImage(dropLootImage, 22, 42, 173, 138, this.x - 173 / 12, this.y - 15, 173 / 6, 23);
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
    const dropChance = Math.random();
    if (dropChance < 0.6) {
        dropLoots.push(new DropLoot(x, y, canvas));
        if (isTheFirst3) {
            headTips.push(new HeadTips("击败怪物，有一定的概率会生成掉落物，拾取会增加人物生命值", canvas));
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