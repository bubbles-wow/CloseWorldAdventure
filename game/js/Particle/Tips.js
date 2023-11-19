export class HeadTips {
    constructor(content, canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.x = canvas.width / 2 - canvas.width / 3;
        this.y = 10;
        this.width = canvas.width / 1.5;
        this.height = 80;
        this.content = content;
        this.opacity = 0; // 初始透明度
        this.animationFrame = 0;
        this.animationFrameTime = 240;
    }

    draw() {
        this.animationFrame++;
    
        if (this.animationFrame < 60) {
            this.opacity += 0.017;
        } else if (this.animationFrame > 180) {
            this.opacity -= 0.016;
        }

        this.ctx.globalAlpha = this.opacity;
    
        let width = 3;
        this.ctx.drawImage(headTipsImage, 0, 0, 6, 6, this.x, this.y, 6 * width, 6 * width); // 左上角
        this.ctx.drawImage(headTipsImage, 0, 26, 6, 6, this.x, this.y + this.height - 6 * width, 6 * width, 6 * width); // 左下角
        this.ctx.drawImage(headTipsImage, 26, 0, 6, 6, this.x + this.width - 6 * width, this.y, 6 * width, 6 * width); // 右上角
        this.ctx.drawImage(headTipsImage, 26, 26, 6, 6, this.x + this.width - 6 * width, this.y + this.height - 6 * width, 6 * width, 6 * width); // 右下角
        this.ctx.drawImage(headTipsImage, 6, 0, 20, 6, this.x + 6 * width, this.y, this.width - 12 * width, 6 * width); // 上边
        this.ctx.drawImage(headTipsImage, 6, 26, 20, 6, this.x + 6 * width, this.y + this.height - 6 * width, this.width - 12 * width, 6 * width); // 下边
        this.ctx.drawImage(headTipsImage, 0, 6, 6, 20, this.x, this.y + 6 * width, 6 * width, this.height - 12 * width); // 左边
        this.ctx.drawImage(headTipsImage, 26, 6, 6, 20, this.x + this.width - 6 * width, this.y + 6 * width, 6 * width, this.height - 12 * width); // 右边
        this.ctx.drawImage(headTipsImage, 6, 6, 20, 20, this.x + 6 * width, this.y + 6 * width, this.width - 12 * width, this.height - 12 * width); // 中间
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
    
        // 计算文本的宽度和高度
        const textWidth = this.ctx.measureText(this.content).width;
        const textHeight = parseInt(this.ctx.font, 10); // 假设字体大小为整数
    
        // 计算文本的位置，使其在矩形中垂直和水平居中
        const textX = this.x + (this.width - textWidth) / 2;
        const textY = this.y + (this.height + textHeight) / 2;
    
        this.ctx.fillText(this.content, textX, textY);
        this.ctx.restore();
        this.ctx.globalAlpha = 1;
    }
    
    
}

export const headTips = [];
const headTipsImage = new Image();
headTipsImage.src = "./res/headTips.png";