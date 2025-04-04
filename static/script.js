const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 7,
    color: "blue"
};

let blocks = [];
let score = 0;
let gameOver = false;

function spawnBlock() {
    const width = 50;
    const height = 50;
    const x = Math.random() * (canvas.width - width);
    blocks.push({
        x: x,
        y: -height,
        width: width,
        height: height,
        speed: 4 + Math.random() * 3,
        color: "red"
    });
}

function updateBlocks() {
    for(let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        b.y += b.speed;

        if (
            b.x < player.x + player.width &&
            b.x + b.width > player.x &&
            b.y < player.y + player.height &&
            b.y + b.height > player.y
        ) {
            gameOver = true;
        }

        if(b.y > canvas.height) {
            blocks.splice(i, 1);
            i--;
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBlocks() {
    for(const b of blocks) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
    }
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

function drawGameOver() {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over: " + canvas.width / 2 - 120, canvas.height / 2);
}

function update() {
    if(gameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBlocks();
    drawScore();
    updateBlocks();
    requestAnimationFrame(update);
}

setInterval(() => {
    if(!gameOver) {
        spawnBlock();
        score++;
    }
}, 1000);

document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed;
    }
    if(e.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
});

update();