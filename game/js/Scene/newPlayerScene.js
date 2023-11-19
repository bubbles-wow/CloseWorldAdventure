import { canvas, setIsStart, setMonsterWave, monsterWave, skipButton } from "../Game/Core.js";

import { player } from "../Player/Player.js";

import { generateMonster, monsters } from "../Monster/Monster.js";
import { rangedMonsters, generateRangedMonster } from "../Monster/RangedMonster.js";
import { bombers, generateBomber } from "../Monster/Bomber.js";

import { Portal, generatePortal, portal, checkPlayerInPortal, refreshScene } from "../Scene/Portal.js";
import { generateObstacles, generateGrass } from "../Scene/Obstacle.js";

import { HeadTips, headTips } from "../Particle/Tips.js";
import { bullets } from "../Player/Bullet.js";

let step = 0;
let task = "";
let showTips = [];
let waitTime = 240;
let totalWaitTime = 240;
let stepDone = false;

export let isSkip = false;
export function setIsSkip(bool) {
    isSkip = bool;
}

export function gameStart() {
    if (waitTime == totalWaitTime) {
        if (step == 0 && !showTips[0]) {
            headTips.push(new HeadTips("按 WASD 移动", canvas));
            task = "按键盘上的 WASD 键，移动人物。"
            showTips[step] = true;
        }
        if (step == 1 && !showTips[1]) {
            headTips.push(new HeadTips("按 鼠标左键 进行弓箭射击！", canvas));
            task = "按下鼠标左键，尝试弓箭射击。"
            showTips[step] = true;
        }
        if (step == 2 && !showTips[2]) {
            headTips.push(new HeadTips("长按 鼠标左键 可进行力量更强的弓箭射击！", canvas));
            task = "长按鼠标左键，尝试力量更强的弓箭射击。"
            showTips[step] = true;
        }
        if (step == 3 && !showTips[3]) {
            headTips.push(new HeadTips("按 鼠标右键 进行近战攻击！", canvas));
            task = "按下鼠标右键，尝试近战攻击。"
            showTips[step] = true;
        }
        if (step == 4 && !showTips[4]) {
            headTips.push(new HeadTips("出现敌人了！使用刚学会的战斗方式击败它！", canvas));
            task = "击败敌人。"
            let position = generatePosition();
            generateMonster(position.x, position.y, position.pursuitPlayerDistance);
            showTips[step] = true;
        }
        if (step == 5 && !showTips[5]) {
            headTips.push(new HeadTips("似乎出现不一样的敌人了！继续击败它！", canvas));
            task = "击败敌人。"
            let position = generatePosition();
            generateRangedMonster(position.x, position.y, position.pursuitPlayerDistance);
            showTips[step] = true;
        }
        if (step == 6 && !showTips[6]) {
            headTips.push(new HeadTips("出现了一个危险的家伙！在远处击败它！", canvas));
            task = "击败敌人。"
            let position = generatePosition();
            generateBomber(position.x, position.y, position.pursuitPlayerDistance);
            showTips[step] = true;
        }
        if (step == 7 && !showTips[7]) {
            headTips.push(new HeadTips("任务完成！出现了一个传送门！进入它，就能进入新的冒险了！", canvas));
            task = "进入传送门。"
            generatePortal();
            showTips[step] = true;
        }
    }
    generateGrass();
    generateObstacles();
    if (headTips.length == 0 && !isSkip) {
        player.move();
    }
    if (headTips.length == 0) {
        if (step == 0) {
            if (player.vx != 0 || player.vy != 0) {
                stepDone = true;
                player.health = player.currentHealth;
            }
        }
        if (step == 1) {
            if (player.isShootArrow) {
                stepDone = true;
                player.health = player.currentHealth;
            }
        }
        if (step == 2) {
            if (player.attackCooldown > player.attackCooldownTime + 20) {
                stepDone = true;
                player.health = player.currentHealth;
            }
        }
        if (step == 3) {
            if (player.isCloseAttack) {
                stepDone = true;
                player.health = player.currentHealth;
            }
        }
        if (step == 4) {
            if (monsters.length == 0) {
                stepDone = true;
                player.health = player.currentHealth;
                player.score = 0;
                headTips.push(new HeadTips("干得漂亮！", canvas));
            }
        }
        if (step == 5) {
            if (rangedMonsters.length == 0) {
                stepDone = true;
                player.health = player.currentHealth;
                player.score = 0;
                headTips.push(new HeadTips("干得漂亮！", canvas));
            }
        }
        if (step == 6) {
            if (bombers.length == 0) {
                stepDone = true;
                player.health = player.currentHealth;
                player.score = 0;
                headTips.push(new HeadTips("干得漂亮！", canvas));
            }
        }
        if (step == 7) {
            checkPlayerInPortal();
            if (portal[0].isActivated) {
                stepDone = true;
                player.health = player.currentHealth;
                headTips.push(new HeadTips("新手教程完成！", canvas));
                skipButton.style.display = "none";
            }
        }
    }

    if (isSkip) {
        step = 8;
        portal.push(new Portal(player.x, player.y, canvas))
        portal[0].isActivated = true;
        stepDone = true;
        player.health = player.currentHealth;
        monsters.length = 0;
        rangedMonsters.length = 0;
        bombers.length = 0;
        headTips.length = 0;
    }

    if ((step >= 8 || stepDone) && portal.length > 0 && portal[0].isActivated) {
        refreshScene();
        if (portal.length == 0) {
            //monsterWave++;
            setMonsterWave(monsterWave + 1);
            let count = Math.floor(monsterWave / 4 + 1);
            headTips.push(new HeadTips("第 " + count + " 间", canvas));
            setIsStart(false);
        }
    }

    player.ctx.save();
    player.ctx.fillStyle = "yellow";
    player.ctx.font = "20px Arial";
    player.ctx.fillText("当前任务: " + task, 10, canvas.height / 2 - 30);
    if (stepDone) {
        player.ctx.fillStyle = "greenyellow";
        player.ctx.fillText("任务完成！", 10, canvas.height / 2);
    }
    player.ctx.restore();

    if (stepDone) {
        waitTime--;
        if (waitTime == 0) {
            step++;
            stepDone = false;
            waitTime = totalWaitTime;
        }
    }
}

function generatePosition() {
    let pursuitPlayerDistance;
    if (canvas.width < canvas.height) {
        pursuitPlayerDistance = canvas.width / 2;
    }
    else {
        pursuitPlayerDistance = canvas.height / 2;
    }
    let flag = true;
    let x;
    let y;
    while (flag) {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        let dx = x - player.x;
        let dy = y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + pursuitPlayerDistance + 50) {
            continue;
        }

        if (x < 15 || x > canvas.width - 15 ||
            y < 15 || y > canvas.height - 15) {
            continue;
        }
        flag = false;
    }
    return { x, y, pursuitPlayerDistance };
}


