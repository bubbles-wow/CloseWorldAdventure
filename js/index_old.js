const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");

// 设置Canvas的尺寸与窗口大小保持一致
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 初始位置
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;

// 玩家半径
const playerRadius = 10;

// 子弹数组
const bullets = [];

// 子弹半径
const bulletRadius = 5;

// 玩家速度
const playerSpeed = 5;

// 当前玩家速度
let vPlayerX = 0;
let vPlayerY = 0;

// 玩家血量
let playerHealth = 100;

// 玩家分数
let playerScore = 0;

// 怪物数组
const monsters = [];

// 怪物半径
const monsterRadius = 15;

// 怪物速度
const monsterSpeed = 2;

// 怪物上限
const maxMonsters = 5; // 设置怪物的最大数量

// 怪物默认血量
const monsterHealth = 100;

// 监听窗口大小变化事件
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 监听鼠标点击事件
canvas.addEventListener("click", shootBullet);

function shootBullet(event) {
    // 获取鼠标点击位置
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 计算子弹方向
    const dx = mouseX - playerX;
    const dy = mouseY - playerY;

    // 计算子弹速度，可以根据需要调整
    const bulletSpeed = 15;

    // 计算子弹的单位方向向量
    const length = Math.sqrt(dx * dx + dy * dy);
    const bulletVX = (dx / length) * bulletSpeed;
    const bulletVY = (dy / length) * bulletSpeed;

    // 创建子弹对象并加入数组
    bullets.push({ x: playerX, y: playerY, vx: bulletVX, vy: bulletVY });
}

function drawBullets() {
    ctx.fillStyle = "red";
    for (let i = 0; i < bullets.length; i++) {
        ctx.beginPath();
        ctx.arc(bullets[i].x, bullets[i].y, bulletRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 监听键盘事件
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    switch (event.key) {
        case "w":
            vPlayerY = -playerSpeed;
            break;
        case "s":
            vPlayerY = playerSpeed;
            break;
        case "a":
            vPlayerX = -playerSpeed;
            break;
        case "d":
            vPlayerX = playerSpeed;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case "w":
        case "s":
            vPlayerY = 0;
            break;
        case "a":
        case "d":
            vPlayerX = 0;
            break;
    }
}

function movePlayer() {
    // 更新位置
    playerX += vPlayerX;
    playerY += vPlayerY;

    // 边界检测
    if (playerX < 0) {
        playerX = 0;
    } else if (playerX > canvas.width) {
        playerX = canvas.width;
    }
    if (playerY < 0) {
        playerY = 0;
    } else if (playerY > canvas.height) {
        playerY = canvas.height;
    }
}

function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;

        // 移除超出画布的子弹
        if (bullets[i].x < 0 || bullets[i].x > canvas.width ||
            bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

// 随机生成怪物
function generateMonster() {

    if (monsters.length != 0) {
        return; // 如果已经有怪物，不生成
    }
    else {
        for (let i = 0; i < maxMonsters; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            if (Math.abs(x - playerX) < 100 && Math.abs(y - playerY) < 100) {
                i--;
                continue; // 如果生成的怪物与玩家距离太近，不生成
            }
            if (x < monsterRadius || x > canvas.width - monsterRadius || y < monsterRadius || y > canvas.height - monsterRadius) {
                i--;
                continue; // 如果生成的怪物在画布边缘，不生成
            }
            const health = monsterHealth;
            monsters.push({ x, y, health, attackCooldown: 0, attackCooldownTime: 1000 });
        }
    }
}

// 移动怪物
function moveMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];

        // 计算怪物与玩家的距离
        const dx = playerX - monster.x;
        const dy = playerY - monster.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        // 如果怪物距离玩家小于某个阈值，开始追击
        if (distanceToPlayer < 200) { // 调整阈值以控制触发追击的距离
            const directionX = (playerX - monster.x) / distanceToPlayer;
            const directionY = (playerY - monster.y) / distanceToPlayer;
            if (distanceToPlayer > playerRadius + monsterRadius + 5) { // 调整阈值以控制触发追击的距离
                monster.x += directionX * monsterSpeed;
                monster.y += directionY * monsterSpeed;
            }
        } else {
            //moveMonsterTo(monster, targetX, targetY, monsterSpeed);
        }
    }
}

// 函数用于击退怪物
function knockbackMonster(monster, knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
    // 计算怪物的新位置
    const newX = monster.x + knockbackDistance * knockbackDirectionX;
    const newY = monster.y + knockbackDistance * knockbackDirectionY;

    // 边界检测
    if (newX < monsterRadius || newX > canvas.width - monsterRadius || newY < monsterRadius || newY > canvas.height - monsterRadius) {
        return; // 如果怪物的新位置在画布边缘，不更新怪物的位置
    }

    // 更新怪物的位置
    monster.x = newX;
    monster.y = newY;
}

// ...

// 在怪物受到伤害时调用击退函数
function damageMonster(monster) {
    // 计算击退的距离和方向，可以根据需要调整
    const knockbackDistance = 20; // 击退距离
    const dx = playerX - monster.x;
    const dy = playerY - monster.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    const knockbackDirectionX = (dx / distanceToPlayer) * -1; // 反方向
    const knockbackDirectionY = (dy / distanceToPlayer) * -1; // 反方向

    // 调用击退函数
    knockbackMonster(monster, knockbackDistance, knockbackDirectionX, knockbackDirectionY);
}

// 绘制怪物
function drawMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(monsters[i].x, monsters[i].y, monsterRadius, 0, Math.PI * 2);
        ctx.fill();

        // 绘制血条底部
        ctx.fillStyle = "gray";
        ctx.fillRect(monsters[i].x - 15, monsters[i].y - monsterRadius - 10, 30, 5);

        // 绘制血条
        ctx.fillStyle = "green"; // 使用绿色表示血条
        const healthBarWidth = (monsters[i].health / 100) * 30; // 根据血量计算血条的宽度
        ctx.fillRect(monsters[i].x - 15, monsters[i].y - monsterRadius - 10, healthBarWidth, 5);
    }
}

// 在游戏循环中检测子弹与怪物的碰撞
function checkBulletMonsterCollision() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < monsters.length; j++) {
            const dx = bullets[i].x - monsters[j].x;
            const dy = bullets[i].y - monsters[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bulletRadius + monsterRadius) {
                // 子弹与怪物碰撞
                bullets.splice(i, 1); // 移除子弹
                monsters[j].health -= 10; // 减少怪物的血量
                damageMonster(monsters[j]); // 击退怪物
                if (monsters[j].health <= 0) {
                    monsters.splice(j, 1); // 如果怪物血量小于等于0，移除怪物
                    playerScore += 10; // 增加玩家分数
                }
                i--; // 减少i以避免跳过下一个子弹
                break;
            }
        }
    }
}

function updateMonsterCooldown() {
    for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];
        if (monster.attackCooldown > 0) {
            monster.attackCooldown -= 16; // 减少冷却计时器，单位为帧数
        }
    }
}

// 函数用于怪物的近战攻击和玩家的击退
function monsterMeleeAttack(monster) {
    if (monster.attackCooldown > 0) {
        // 怪物攻击冷却中，无法再次攻击
        return;
    }

    // 计算怪物与玩家的距离
    const dx = playerX - monster.x;
    const dy = playerY - monster.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    // 如果怪物距离玩家小于某个阈值，进行近战攻击
    if (distanceToPlayer < 30) { // 调整阈值以控制触发攻击的距离
        // 计算攻击击退的距离和方向，可以根据需要调整
        const knockbackDistance = 20; // 击退距离
        const knockbackDirectionX = (dx / distanceToPlayer);
        const knockbackDirectionY = (dy / distanceToPlayer);

        // 击退玩家
        knockbackPlayer(knockbackDistance, knockbackDirectionX, knockbackDirectionY);

        // 在这里可以执行伤害逻辑，例如扣除玩家的生命值

        playerHealth -= 10; // 减少玩家的血量
        monster.attackCooldown = monster.attackCooldownTime; // 重置攻击冷却计时器
    }
}

// 击退玩家的函数
function knockbackPlayer(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
    // 计算玩家的新位置
    const newX = playerX + knockbackDistance * knockbackDirectionX;
    const newY = playerY + knockbackDistance * knockbackDirectionY;

    // 边界检测
    if (newX < playerRadius || newX > canvas.width - playerRadius || newY < playerRadius || newY > canvas.height - playerRadius) {
        return; // 如果玩家的新位置在画布边缘，不更新玩家的位置
    }

    // 更新玩家的位置
    playerX = newX;
    playerY = newY;
}

function checkMonsterPlayerCollision() {
    // 遍历怪物数组
    for (let i = 0; i < monsters.length; i++) {
        const monster = monsters[i];

        // 计算怪物与玩家的距离并进行攻击和击退
        monsterMeleeAttack(monster);
    }
}

function draw() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制玩家血量
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Health: " + playerHealth, 10, 30);
    ctx.fillText("Score: " + playerScore, 10, 60);

    // 绘制玩家
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制怪物
    drawMonsters();

    drawBullets();
}

function gameLoop() {

    movePlayer();
    moveBullets();
    moveMonsters();
    checkBulletMonsterCollision();
    checkMonsterPlayerCollision();
    updateMonsterCooldown();
    draw();


    setTimeout(generateMonster, 5000); // 5秒后再次生成怪物

    requestAnimationFrame(gameLoop);
}

// 启动游戏循环
gameLoop();