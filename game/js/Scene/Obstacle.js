import { canvas } from "../Game/Core.js";

import { player} from "../Player/Player.js";

import { portal } from "../Scene/Portal.js";

export class Obstacle {
    constructor(x, y, radius, type, canvas) {
        this.x = x;
        this.y = y;
        this.type = type; // 0: 果树，1: 大树，2: 小树，3: 灌木丛，4: 树桩
        this.radius = radius;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    // 绘制障碍物
    draw() {
        this.ctx.imageSmoothingEnabled = false; // 关闭抗锯齿
        let scale;
        let imageWidth;
        let imageHeight;
        let imagePositionX;
        let imagePositionY;
        let offset;
        if (this.radius == 18) {
            scale = 1.5;
            if (this.type == 1) {
                imageWidth = 45;
                imageHeight = 64;
                imagePositionX = 0;
                imagePositionY = 0;
                offset = this.radius * 3 / 2;
            }
            else if (this.type == 2) {
                imageWidth = 23;
                imageHeight = 42;
                imagePositionX = 46;
                imagePositionY = 0;
                offset = this.radius / 2;
            }
        }
        else if (this.radius == 36) {
            scale = 3;
            imageWidth = 45;
            imageHeight = 64;
            offset = this.radius * 3 / 2;
            if (this.type == 1) {
                imagePositionX = 0;
                imagePositionY = 0;
            }
            else if (this.type == 0) {
                imagePositionX = 102;
                imagePositionY = 0;
            }

        }
        else {
            scale = 1.5;
            if (this.radius == 48) {
                scale = 3;
            }
            else {
                this.type = 3;
            }
            if (this.type == 3) {
                imageWidth = 31;
                imageHeight = 31;
                imagePositionX = 70;
                imagePositionY = 0;
                offset = 0;
            }
            else if (this.type == 4) {
                imageWidth = 32;
                imageHeight = 24;
                imagePositionX = 69;
                imagePositionY = 32;
                offset = 0;
            }
        }
        let drawX = scale * imageWidth;
        let drawY = scale * imageHeight;
        if (player.x > this.x - drawX / 2 && player.x < this.x + drawX / 2 && player.y > this.y - drawY / 2 - offset && player.y < this.y + drawY / 2 - offset - 2 * this.radius) {
            this.ctx.globalAlpha = 0.6;
        }
        if (portal.length != 0) {
            if (portal[0].x > this.x - drawX / 2 && portal[0].x < this.x + drawX / 2 && portal[0].y > this.y - drawY / 2 - offset && portal[0].y < this.y + drawY / 2 - offset - 2 * this.radius) {
                this.ctx.globalAlpha = 0.6;
            }
        }
        this.ctx.drawImage(
            tree,
            imagePositionX,
            imagePositionY,
            imageWidth,
            imageHeight,
            this.x - drawX / 2,
            this.y - drawY / 2 - offset,
            drawX, drawY
        );
        this.ctx.globalAlpha = 1;

        // 实际碰撞位置显示
        // this.ctx.fillStyle = "gray";
        // this.ctx.beginPath();
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
    }
}

export class LittlePlant {
    constructor(x, y, type, canvas) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    draw() {
        this.ctx.imageSmoothingEnabled = false; // 关闭抗锯齿
        this.ctx.beginPath();
        this.ctx.drawImage(littlePlant, 13 * this.type, 0, 13, 13, this.x, this.y, 26, 26)
        this.ctx.fill();
    }
}

export const obstacles = []; // 存储所有障碍物的数组
export const littlePlants = [];
const tree = new Image();
tree.src = "./res/tree.png";
const littlePlant = new Image();
littlePlant.src = "./res/littlePlant.png";
let max;
if (window.innerWidth > window.innerHeight) {
    max = window.innerWidth / 30;
}
else {
    max = window.innerHeight / 30;
}
export const maxObstacles = max; // 障碍物的最大数量

// 生成障碍物
export function generateObstacles() {
    if (obstacles.length == 0) {
        for (let i = 0; i < maxObstacles; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let type = Math.random() * 100;
            if (type < 40) {
                type = 1;
            }
            else if (type < 90) {
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

export function generateGrass() {
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