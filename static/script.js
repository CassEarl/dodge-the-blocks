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
let blockSpeedMultiplier = 1;
let spawnInterval = 1000;
let spawnTimer;
let chaosThreshold = 20;
let timeElapsed = 0;
let animationFrameId;

let health = 3;
const healthDisplay = document.getElementById("health");
const scoreDisplay = document.getElementById("scoreDisplay");
const restartButton = document.getElementById("restartButton");
const muteButton = document.getElementById("muteButton");

const sfx = {
    spawn: new Audio("/static/sounds/spawn.wav"),
    hit: new Audio("/static/sounds/hit.wav"),
    chaos: new Audio("/static/sounds/chaos.flac"),
    gameOver: new Audio("/static/sounds/gameOver.wav")
};

let isMuted = false;

function spawnBlock() {
    const width = 50;
    const height = 50;
    const x = Math.random() * (canvas.width - width);
    blocks.push({
        x: x,
        y: -height,
        width: width,
        height: height,
        speed: 4 + Math.random() * 3 * blockSpeedMultiplier,
        color: "red"
    });
    playSound(sfx.spawn);
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
            playSound(sfx.hit);
            blocks.splice(i, 1);
            health--;
            updateHealthDisplay();
            if(health <= 0) {
                gameOver = true;
                playSound(sfx.gameOver);

                const best = localStorage.getItem("bestScore") || 0;
                if(score > best) {
                  localStorage.setItem("bestScore", score);
                  console.log("🎉 New local high score: ", score);
                }

                Object.values(sfx).forEach(sound => {
                    sound.pause();
                    sound.currentTime = 0;
                });

                document.getElementById("submitScore").style.display = "block";
                clearInterval(spawnTimer);
                cancelAnimationFrame(animationFrameId);

                restartButton.style.display = "inline-block";
            }
            continue;
        }

        if(b.y > canvas.height) {
            blocks.splice(i, 1);
            i--;
        }
    }
}

function updateHealthDisplay() {
    healthDisplay.textContent = "Health: " + "❤️".repeat(health);
}

function updateScoreDisplay() {
    scoreDisplay.textContent = "Score: " + score;
}

function restartGame() {
    health = 3;
    score = 0;
    timeElapsed = 0;
    blockSpeedMultiplier = 1;
    blocks = [];
    gameOver = false;
    updateHealthDisplay();
    updateScoreDisplay();
    restartButton.style.display = "none";
    clearInterval(spawnTimer);
    startSpawner();
    update();
}

function submitScore() {
    const name = document.getElementById("playerName").value;

    fetch("/api/save-score", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, score})
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById("submitScore").style.display = "none";
            fetchHighScores();
        })
}

function fetchHighScores() {
    fetch("/api/highscores")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("scoreList");
            list.innerHTML ="";
            data.forEach(entry => {
                const li = document.createElement("li");
                li.textContent = `${entry.name}: ${entry.score}`;
                list.appendChild(li);
            })
        })
}

function startSpawner() {
    spawnTimer = setInterval(() => {
        timeElapsed++;
        score++;

        if(timeElapsed % 5 == 0 && spawnInterval > 300) {
            clearInterval(spawnTimer);
            spawnInterval -= 100;
            blockSpeedMultiplier += 0.2;
            startSpawner();
        }

        if(timeElapsed === chaosThreshold) {
            playSound(sfx.chaos);
            canvas.classList.add("flash");
            setTimeout(() => canvas.classList.remove("flash"), 1000);
        }

        if(timeElapsed >= chaosThreshold) {
            spawnBlock();
            spawnBlock();
        }
        spawnBlock();
    }, spawnInterval);
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
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width/2, canvas.offsetHeight/2);
    ctx.fillText("Final Score: " + score, canvas.width/2, canvas.height/2+50);
    ctx.textAlign = "start";
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
    animationFrameId = requestAnimationFrame(update);
    fetchHighScores();
}

document.addEventListener("keydown", (e) => {
    if(gameOver) return;

    if(e.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed;
    }
    if(e.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
});

function toggleMute() {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? "🔇Unmute" : "🔊Mute";
}

function playSound(audio) {
    if(!isMuted) audio.play();
}
document.getElementById("bestScore").textContent = "🏆 Best: " + (localStorage.getItem("bestScore") || 0);

clearInterval(spawnTimer);
updateHealthDisplay();
updateScoreDisplay();
startSpawner();
update();