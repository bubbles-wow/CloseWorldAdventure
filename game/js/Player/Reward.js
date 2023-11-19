export class Reward {
    constructor(threshold, type, value, message) {
        this.threshold = threshold;
        this.type = type;
        this.value = value;
        this.message = message;
    }
}

export const rewards = [new Reward(100, 'current', 20, "玩家的生命上限提高了！"), new Reward(120, 'damage', 10, "箭头的伤害提高了！")];