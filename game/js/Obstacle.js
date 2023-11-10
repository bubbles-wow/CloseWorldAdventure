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

        this.ctx.fillStyle = "gray";
        this.ctx.beginPath();
        //this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
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
        this.ctx.fill();
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