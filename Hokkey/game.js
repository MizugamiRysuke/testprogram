const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('reset-btn');
const playerScoreEl = document.getElementById('player-points');
const cpuScoreEl = document.getElementById('cpu-points');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

let gameState = {
    player: {
        x: 100,
        y: CANVAS_HEIGHT / 2,
        width: 40,
        height: 20,
        speed: 5
    },
    cpu: {
        x: CANVAS_WIDTH - 140,
        y: CANVAS_HEIGHT / 2,
        width: 40,
        height: 20,
        speed: 3
    },
    puck: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: 8,
        dx: 0,
        dy: 0,
        speed: 7,
        maxSpeed: 12,
        acceleration: 1.03
    },
    score: {
        player: 0,
        cpu: 0
    },
    keys: {}
};

function drawRink() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 60, 20, 120);
    ctx.fillRect(CANVAS_WIDTH - 20, CANVAS_HEIGHT / 2 - 60, 20, 120);
}

function drawPlayer(player, color) {
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + player.width / 2 - 2, player.y - 10, 4, 30);
}

function drawPuck() {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(gameState.puck.x, gameState.puck.y, gameState.puck.radius, 0, Math.PI * 2);
    ctx.fill();
}

function updatePlayer() {
    if (gameState.keys['ArrowUp'] && gameState.player.y > 0) {
        gameState.player.y -= gameState.player.speed;
    }
    if (gameState.keys['ArrowDown'] && gameState.player.y < CANVAS_HEIGHT - gameState.player.height) {
        gameState.player.y += gameState.player.speed;
    }
    if (gameState.keys['ArrowLeft'] && gameState.player.x > 0) {
        gameState.player.x -= gameState.player.speed;
    }
    if (gameState.keys['ArrowRight'] && gameState.player.x < CANVAS_WIDTH / 2 - gameState.player.width) {
        gameState.player.x += gameState.player.speed;
    }
}

function updateCPU() {
    const puck = gameState.puck;
    const cpu = gameState.cpu;
    
    if (puck.x > CANVAS_WIDTH / 2 - 50) {
        if (puck.y < cpu.y + cpu.height / 2) {
            cpu.y -= cpu.speed;
        } else if (puck.y > cpu.y + cpu.height / 2) {
            cpu.y += cpu.speed;
        }
        
        if (Math.abs(puck.x - (cpu.x + cpu.width / 2)) < 100 && Math.abs(puck.dx) < 2) {
            if (puck.x < cpu.x + cpu.width / 2) {
                cpu.x -= cpu.speed * 0.5;
            } else {
                cpu.x += cpu.speed * 0.5;
            }
        }
    } else {
        if (cpu.y + cpu.height / 2 < CANVAS_HEIGHT / 2) {
            cpu.y += cpu.speed * 0.3;
        } else if (cpu.y + cpu.height / 2 > CANVAS_HEIGHT / 2) {
            cpu.y -= cpu.speed * 0.3;
        }
        
        if (cpu.x < CANVAS_WIDTH - 140) {
            cpu.x += cpu.speed * 0.2;
        }
    }
    
    cpu.y = Math.max(0, Math.min(CANVAS_HEIGHT - cpu.height, cpu.y));
    cpu.x = Math.max(CANVAS_WIDTH / 2, Math.min(CANVAS_WIDTH - cpu.width, cpu.x));
}

function updatePuck() {
    const puck = gameState.puck;
    
    puck.x += puck.dx;
    puck.y += puck.dy;
    
    if (puck.y <= puck.radius || puck.y >= CANVAS_HEIGHT - puck.radius) {
        if (Math.random() < 0.15) {
            const currentSpeed = Math.sqrt(puck.dx * puck.dx + puck.dy * puck.dy);
            const randomAngle = Math.random() * Math.PI * 2;
            const boostSpeed = currentSpeed * 1.15;
            puck.dx = Math.cos(randomAngle) * boostSpeed;
            puck.dy = Math.sin(randomAngle) * boostSpeed;
        } else {
            puck.dy = -puck.dy;
        }
        puck.y = Math.max(puck.radius, Math.min(CANVAS_HEIGHT - puck.radius, puck.y));
    }
    
    if (puck.x <= puck.radius) {
        if (puck.y >= CANVAS_HEIGHT / 2 - 60 && puck.y <= CANVAS_HEIGHT / 2 + 60) {
            gameState.score.cpu++;
            cpuScoreEl.textContent = gameState.score.cpu;
            resetPuck();
        } else {
            if (Math.random() < 0.1) {
                const currentSpeed = Math.sqrt(puck.dx * puck.dx + puck.dy * puck.dy);
                const randomAngle = Math.random() * Math.PI * 2;
                const boostSpeed = currentSpeed * 1.1;
                puck.dx = Math.cos(randomAngle) * boostSpeed;
                puck.dy = Math.sin(randomAngle) * boostSpeed;
            } else {
                puck.dx = -puck.dx;
            }
            puck.x = puck.radius;
        }
    }
    
    if (puck.x >= CANVAS_WIDTH - puck.radius) {
        if (puck.y >= CANVAS_HEIGHT / 2 - 60 && puck.y <= CANVAS_HEIGHT / 2 + 60) {
            gameState.score.player++;
            playerScoreEl.textContent = gameState.score.player;
            resetPuck();
        } else {
            if (Math.random() < 0.1) {
                const currentSpeed = Math.sqrt(puck.dx * puck.dx + puck.dy * puck.dy);
                const randomAngle = Math.random() * Math.PI * 2;
                const boostSpeed = currentSpeed * 1.1;
                puck.dx = Math.cos(randomAngle) * boostSpeed;
                puck.dy = Math.sin(randomAngle) * boostSpeed;
            } else {
                puck.dx = -puck.dx;
            }
            puck.x = CANVAS_WIDTH - puck.radius;
        }
    }
    
    checkCollision(gameState.player, '#00ff00');
    checkCollision(gameState.cpu, '#ff4444');
    
    const currentSpeed = Math.sqrt(puck.dx * puck.dx + puck.dy * puck.dy);
    if (currentSpeed > 0.1 && currentSpeed < puck.maxSpeed) {
        puck.dx *= puck.acceleration;
        puck.dy *= puck.acceleration;
    } else if (currentSpeed <= 0.1) {
        puck.dx = 0;
        puck.dy = 0;
    }
}

function checkCollision(player, color) {
    const puck = gameState.puck;
    
    if (puck.x + puck.radius > player.x &&
        puck.x - puck.radius < player.x + player.width &&
        puck.y + puck.radius > player.y &&
        puck.y - puck.radius < player.y + player.height) {
        
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        
        const currentSpeed = Math.sqrt(puck.dx * puck.dx + puck.dy * puck.dy);
        const baseSpeed = Math.max(currentSpeed * 0.9, puck.speed * 0.6);
        
        const newDx = (puck.x - centerX) * 0.1;
        const newDy = (puck.y - centerY) * 0.1;
        
        const magnitude = Math.sqrt(newDx * newDx + newDy * newDy);
        if (magnitude > 0) {
            puck.dx = (newDx / magnitude) * baseSpeed;
            puck.dy = (newDy / magnitude) * baseSpeed;
        }
    }
}

function resetPuck() {
    gameState.puck.x = CANVAS_WIDTH / 2;
    gameState.puck.y = CANVAS_HEIGHT / 2;
    gameState.puck.dx = 0;
    gameState.puck.dy = 0;
}

function shootPuck() {
    if (gameState.puck.dx === 0 && gameState.puck.dy === 0) {
        const player = gameState.player;
        const puck = gameState.puck;
        
        const dx = puck.x - (player.x + player.width / 2);
        const dy = puck.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
            puck.dx = puck.speed * 0.3;
            puck.dy = (Math.random() - 0.5) * puck.speed * 0.2;
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawRink();
    drawPlayer(gameState.player, '#00ff00');
    drawPlayer(gameState.cpu, '#ff4444');
    drawPuck();
    
    updatePlayer();
    updateCPU();
    updatePuck();
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
        shootPuck();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
});

resetBtn.addEventListener('click', () => {
    gameState.score.player = 0;
    gameState.score.cpu = 0;
    playerScoreEl.textContent = '0';
    cpuScoreEl.textContent = '0';
    
    gameState.player.x = 100;
    gameState.player.y = CANVAS_HEIGHT / 2;
    gameState.cpu.x = CANVAS_WIDTH - 140;
    gameState.cpu.y = CANVAS_HEIGHT / 2;
    
    resetPuck();
});

gameLoop();