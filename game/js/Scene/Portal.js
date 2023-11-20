import { canvas } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { obstacles, littlePlants } from "../Scene/Obstacle.js";

import { dropLoots } from "./DropLoot.js";
import { shieldItems, speedItems } from "./item.js";

export class Portal {
    constructor(x, y, canvas) {
        this.x = x; // 传送门 x 坐标
        this.y = y; // 传送门 y 坐标
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 20; // 传送门半径
        this.isActivated = false; // 传送门是否激活
        this.waitRefreshSceneTime = 300; // 等待刷新场景时间
        this.animationFrame = 0; // 动画帧
        this.animationFrameTime = 63; // 动画帧阈值
        this.RefreshSceneRadius = 1;
    }

    // 绘制传送门
    draw() {
        let imageDirectionX = 32 * Math.floor(this.animationFrame / 8);
        let imageDirectionY = 0;
        // 更新动画帧
        if (this.animationFrame < this.animationFrameTime) {
            this.animationFrame++;
        }
        else {
            this.animationFrame = 0;
        }

        this.ctx.save();
        if (this.isActivated) {
            // 绘制刷新场景特效
            for (let i = 0; i < 6; i++) {
                this.ctx.beginPath();
                this.ctx.fillStyle = "rgba(252, 246, 96, 0.3)";
                this.ctx.arc(this.x, this.y, this.RefreshSceneRadius * i, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
            let max = canvas.height;
            if (canvas.width > canvas.height) {
                max = canvas.width;
            }
            if (this.waitRefreshSceneTime < 150) {
                this.RefreshSceneRadius -= max / 120;
            }
            else {
                this.RefreshSceneRadius += max / 120;
            }

        }
        this.ctx.drawImage(portalImage, imageDirectionX, imageDirectionY, 32, 32, this.x - this.radius - 12, this.y - this.radius - 12, 32 * 2, 32 * 2);
        // 实际碰撞位置显示
        // this.ctx.fillStyle = "yellow";
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
        this.ctx.restore();
    }
}

export const portal = [];
const portalImage = new Image();
portalImage.src = "./res/portal.png";

// 处理传送门与玩家的碰撞
export function checkPlayerInPortal() {
    let dx = player.x - portal[0].x;
    let dy = player.y - portal[0].y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < portal[0].radius) {
        portal[0].isActivated = true;
    }
}

// 生成传送门
export function generatePortal() {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    obstacles.forEach(obstacle => {
        let dx = obstacle.x - x;
        let dy = obstacle.y - y;
        let distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < obstacle.radius + Portal.radius) {
            if (dx < 0) {
                x -= obstacle.radius + Portal.radius;
            }
            else {
                x += obstacle.radius + Portal.radius;
            }
            if (dy < 0) {
                y -= obstacle.radius + Portal.radius;
            }
            else {
                y += obstacle.radius + Portal.radius;
            }
        }
    });
    if (x < 32) {
        x += 32;
    }
    else if (x > canvas.width - 32) {
        x -= 32;
    }
    else {
    }
    if (y < 32) {
        y += 32;
    }
    else if (y > canvas.height - 32) {
        y -= 32;
    }
    portal.push(new Portal(x, y, canvas));
}

export function refreshScene() {
    obstacles.length = 0;
    littlePlants.length = 0;
    dropLoots.length = 0;
    speedItems.length = 0;
    shieldItems.length = 0;
    if (portal[0].waitRefreshSceneTime > 0) {
        portal[0].waitRefreshSceneTime--;
    }
    else {
        portal.length = 0;
    }
}