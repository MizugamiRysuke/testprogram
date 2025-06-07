class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'playing';
        this.score = 0;
        this.keys = {};
        this.gravity = 0.8;
        this.groundY = this.height - 60;
        
        this.player = new Player(100, this.groundY - 60);
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.particles = [];
        
        this.createLevel();
        this.bindEvents();
        this.gameLoop();
    }
    
    createLevel() {
        // Ground
        this.platforms.push(new Platform(0, this.groundY, this.width, 60));
        
        // Platforms
        this.platforms.push(new Platform(200, this.groundY - 100, 150, 20));
        this.platforms.push(new Platform(400, this.groundY - 180, 150, 20));
        this.platforms.push(new Platform(600, this.groundY - 120, 150, 20));
        this.platforms.push(new Platform(150, this.groundY - 260, 100, 20));
        this.platforms.push(new Platform(500, this.groundY - 300, 150, 20));
        
        // Coins
        this.coins.push(new Coin(250, this.groundY - 140));
        this.coins.push(new Coin(450, this.groundY - 220));
        this.coins.push(new Coin(650, this.groundY - 160));
        this.coins.push(new Coin(200, this.groundY - 300));
        this.coins.push(new Coin(550, this.groundY - 340));
        this.coins.push(new Coin(300, this.groundY - 40));
        this.coins.push(new Coin(500, this.groundY - 40));
        
        // Enemies
        this.enemies.push(new Enemy(300, this.groundY - 30, 200, 350));
        this.enemies.push(new Enemy(450, this.groundY - 200, 400, 550));
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && this.gameState === 'gameOver') {
                this.restart();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    restart() {
        this.gameState = 'playing';
        this.score = 0;
        this.player = new Player(100, this.groundY - 60);
        this.coins = [];
        this.enemies = [];
        this.particles = [];
        this.createLevel();
        document.getElementById('gameOver').style.display = 'none';
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.vx = -5;
            this.player.direction = -1;
        } else if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
            this.player.vx = 5;
            this.player.direction = 1;
        } else {
            this.player.vx *= 0.8; // Friction
        }
        
        // Jump
        if ((this.keys['ArrowUp'] || this.keys[' ']) && this.player.grounded) {
            this.player.vy = -15;
            this.player.grounded = false;
        }
        
        this.player.update(this.gravity);
        
        // Platform collisions
        this.player.grounded = false;
        for (let platform of this.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + 10 &&
                this.player.vy >= 0) {
                
                this.player.y = platform.y - this.player.height;
                this.player.vy = 0;
                this.player.grounded = true;
            }
        }
        
        // Coin collection
        for (let i = this.coins.length - 1; i >= 0; i--) {
            let coin = this.coins[i];
            coin.update();
            
            if (this.player.x < coin.x + coin.width &&
                this.player.x + this.player.width > coin.x &&
                this.player.y < coin.y + coin.height &&
                this.player.y + this.player.height > coin.y) {
                
                this.coins.splice(i, 1);
                this.score += 100;
                
                // Particle effect
                for (let j = 0; j < 5; j++) {
                    this.particles.push(new Particle(coin.x + coin.width/2, coin.y + coin.height/2));
                }
            }
        }
        
        // Enemy movement and collision
        for (let enemy of this.enemies) {
            enemy.update();
            
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                this.gameOver();
            }
        }
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        
        // Win condition
        if (this.coins.length === 0) {
            this.gameWin();
        }
        
        // Fall death
        if (this.player.y > this.height) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('gameOver').innerHTML = 'ゲームオーバー<br>スペースキーでリスタート';
    }
    
    gameWin() {
        this.gameState = 'gameOver';
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('gameOver').innerHTML = 'クリア！<br>スコア: ' + this.score + '<br>スペースキーでリスタート';
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw platforms
        for (let platform of this.platforms) {
            platform.draw(this.ctx);
        }
        
        // Draw coins
        for (let coin of this.coins) {
            coin.draw(this.ctx);
        }
        
        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // Draw particles
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Update score
        document.getElementById('score').textContent = `スコア: ${this.score} | コイン: ${this.coins.length}`;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.direction = 1;
    }
    
    update(gravity) {
        this.x += this.vx;
        this.y += this.vy;
        
        if (!this.grounded) {
            this.vy += gravity;
        }
    }
    
    draw(ctx) {
        // Body
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Hat
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x + 5, this.y - 5, this.width - 10, 10);
        
        // Face
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 8, this.y + 5, this.width - 16, 15);
        
        // Mustache
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 10, this.y + 12, this.width - 20, 4);
        
        // Overalls
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(this.x + 3, this.y + 20, this.width - 6, this.height - 20);
        
        // Buttons
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 8, this.y + 25, 4, 4);
        ctx.fillRect(this.x + this.width - 12, this.y + 25, 4, 4);
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        if (this.height === 60) { // Ground
            ctx.fillStyle = '#8B4513';
        } else { // Platform
            ctx.fillStyle = '#228B22';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.height !== 60) {
            // Platform edge highlight
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(this.x, this.y, this.width, 3);
        }
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.rotation = 0;
    }
    
    update() {
        this.rotation += 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Coin body
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Inner circle
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(-this.width/2 + 3, -this.height/2 + 3, this.width - 6, this.height - 6);
        
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, leftBound, rightBound) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 1;
        this.direction = 1;
        this.leftBound = leftBound;
        this.rightBound = rightBound;
    }
    
    update() {
        this.x += this.speed * this.direction;
        
        if (this.x <= this.leftBound || this.x >= this.rightBound - this.width) {
            this.direction *= -1;
        }
    }
    
    draw(ctx) {
        // Body
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Spikes
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < this.width; i += 5) {
            ctx.fillRect(this.x + i, this.y - 3, 3, 3);
        }
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 5, this.y + 8, 3, 3);
        ctx.fillRect(this.x + this.width - 8, this.y + 8, 3, 3);
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * -3 - 1;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillRect(this.x, this.y, 3, 3);
    }
}

// Start the game
window.onload = () => {
    new Game();
};