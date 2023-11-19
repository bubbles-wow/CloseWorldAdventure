import { player } from "../Player/Player.js";
import { portal } from "../Scene/Portal.js";
import { obstacles, littlePlants, generateObstacles, generateGrass } from "../Scene/Obstacle.js";
import { Monster, monsters } from "../Monster/Monster.js";
import { RangedMonster, rangedMonsters } from "../Monster/RangedMonster.js";
import { Bomber, bombers } from "../Monster/Bomber.js";

let monsterWave = 0;
function gameStart() {
    generateGrass();
    generateObstacles();

}





