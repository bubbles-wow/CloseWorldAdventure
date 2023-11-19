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