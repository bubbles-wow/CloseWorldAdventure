export const canvas = document.getElementById("Canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export let isStart = false; // 是否进入新手教程
export let isPause = false; // 是否暂停游戏
export let isHelp = false; // 是否打开帮助界面

export const maxMonsters = 5;
export let isTheFirst1 = true;
export let isTheFirst2 = true;
export let isTheFirst3 = true;
export let canGenerateItem = true;
export const maxSpeedItem = 3;
export const maxShieldItem = 3;

export const targetMonsterWave = 4; // 前往下一个区域的目标怪物波数（值减1）
export let monsterWave = 0;
export let killedMonsters = 0;

export let gameStartScreen = document.getElementById("gameStartScreen");
export let gameOverScreen = document.getElementById("gameOverScreen");
export let startButton = document.getElementById("startButton");
export let newPlayerButton = document.getElementById("newPlayerButton");
export let helpButton = document.getElementById("helpButton");
export let helpScreen = document.getElementById("helpScreen");
export let closeButton = document.getElementById("closeButton");
export let skipButton = document.getElementById("skipButton");

gameStartScreen.style.width = canvas.width + "px";
gameStartScreen.style.height = canvas.height + "px";
gameOverScreen.style.width = canvas.width + "px";
gameOverScreen.style.height = canvas.height + "px";

export function setMonsterWave(int) {
    monsterWave = int;
}

export function setKilledMonsters(int) {
    killedMonsters = int;
}

export function setIsTheFirst1(bool) {
    isTheFirst1 = bool;
}

export function setIsTheFirst2(bool) {
    isTheFirst2 = bool;
}

export function setIsTheFirst3(bool) {
    isTheFirst3 = bool;
}

export function setCanGenerateItem(bool) {
    canGenerateItem = bool;
}

export function setIsPause(bool) {
    isPause = bool;
}

export function setIsHelp(bool) {
    isHelp = bool;
}

export function setIsStart(bool) {
    isStart = bool;
}
