export const canvas = document.getElementById("Canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export let isStart = false;
export let isPause = false; // 是否暂停游戏
export let isHelp = false; // 是否打开帮助界面

export const maxMonsters = 5;
export let isTheFirst1 = true;
export let isTheFirst2 = true;
export let isTheFirst3 = true;
export const maxSpeedItem = 1;
export const maxShieldItem = 1;
export let monsterWave = 0;

export function setMonsterWave(int) {
    monsterWave = int;
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

export function setIsPause(bool) {
    isPause = bool;
}

export function setIsHelp(bool) {
    isHelp = bool;
}

export function setIsStart(bool) {
    isStart = bool;
}