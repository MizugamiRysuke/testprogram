class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'playing'; // 'playing', 'gameOver'
        this.score = 0;
        this.keys = {};
        
        this.player = new Player(this.width / 2 - 25, this.height - 60);
        this.bullets = [];
        this.enemyBullets = [];
        this.invaders = [];
        this.boss = null;
        this.level = 1;
        this.lastShot = 0;
        this.enemyShootTimer = 0;
        
        this.createInvaders();
        this.bindEvents();
        this.gameLoop();
    }
    
    createInvaders() {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.invaders.push(new Invader(
                    col * 60 + 100,
                    row * 40 + 50
                ));
            }
        }
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
        this.player = new Player(this.width / 2 - 25, this.height - 60);
        this.bullets = [];
        this.enemyBullets = [];
        this.invaders = [];
        this.boss = null;
        this.level = 1;
        this.createInvaders();
        document.getElementById('gameOver').style.display = 'none';
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Player shooting
        if (this.keys[' '] && Date.now() - this.lastShot > 200) {
            this.bullets.push(new Bullet(
                this.player.x + this.player.width / 2 - 2,
                this.player.y,
                -8
            ));
            this.lastShot = Date.now();
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.y > -10;
        });
        
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.y < this.height + 10;
        });
        
        // Update invaders
        let shouldMoveDown = false;
        for (let invader of this.invaders) {
            invader.update();
            if (invader.x <= 0 || invader.x >= this.width - invader.width) {
                shouldMoveDown = true;
            }
        }
        
        if (shouldMoveDown) {
            for (let invader of this.invaders) {
                invader.moveDown();
            }
        }
        
        // Enemy shooting
        if (this.invaders.length > 0 && Math.random() < 0.005) {
            const shooter = this.invaders[Math.floor(Math.random() * this.invaders.length)];
            this.enemyBullets.push(new Bullet(
                shooter.x + shooter.width / 2 - 2,
                shooter.y + shooter.height,
                4
            ));
        }
        
        this.checkCollisions();
        
        // Check win condition
        if (this.invaders.length === 0 && !this.boss) {
            if (this.level % 5 === 0) {
                this.spawnBoss();
            } else {
                this.level++;
                this.createInvaders();
            }
        }
        
        // Update boss
        if (this.boss) {
            this.boss.update();
            
            // Boss shooting
            if (Math.random() < 0.02) {
                this.enemyBullets.push(new Bullet(
                    this.boss.x + this.boss.width / 2 - 2,
                    this.boss.y + this.boss.height,
                    5
                ));
            }
        }
        
        // Check game over
        for (let invader of this.invaders) {
            if (invader.y + invader.height >= this.player.y) {
                this.gameOver();
                break;
            }
        }
        
        if (this.boss && this.boss.y + this.boss.height >= this.player.y) {
            this.gameOver();
        }
    }
    
    checkCollisions() {
        // Player bullets vs invaders
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.invaders.length - 1; j >= 0; j--) {
                if (this.bullets[i] && this.invaders[j] && 
                    this.bullets[i].x < this.invaders[j].x + this.invaders[j].width &&
                    this.bullets[i].x + this.bullets[i].width > this.invaders[j].x &&
                    this.bullets[i].y < this.invaders[j].y + this.invaders[j].height &&
                    this.bullets[i].y + this.bullets[i].height > this.invaders[j].y) {
                    
                    this.bullets.splice(i, 1);
                    this.invaders.splice(j, 1);
                    this.score += 10;
                    break;
                }
            }
        }
        
        // Player bullets vs boss
        if (this.boss) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                if (this.bullets[i] &&
                    this.bullets[i].x < this.boss.x + this.boss.width &&
                    this.bullets[i].x + this.bullets[i].width > this.boss.x &&
                    this.bullets[i].y < this.boss.y + this.boss.height &&
                    this.bullets[i].y + this.bullets[i].height > this.boss.y) {
                    
                    this.bullets.splice(i, 1);
                    this.boss.takeDamage();
                    this.score += 50;
                    
                    if (this.boss.hp <= 0) {
                        this.score += 500;
                        this.boss = null;
                        this.level++;
                        this.createInvaders();
                    }
                    break;
                }
            }
        }
        
        // Enemy bullets vs player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            if (this.enemyBullets[i] &&
                this.enemyBullets[i].x < this.player.x + this.player.width &&
                this.enemyBullets[i].x + this.enemyBullets[i].width > this.player.x &&
                this.enemyBullets[i].y < this.player.y + this.player.height &&
                this.enemyBullets[i].y + this.enemyBullets[i].height > this.player.y) {
                
                this.enemyBullets.splice(i, 1);
                this.gameOver();
                break;
            }
        }
    }
    
    spawnBoss() {
        this.boss = new Boss(this.width / 2 - 60, 50);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOver').style.display = 'block';
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw invaders
        for (let invader of this.invaders) {
            invader.draw(this.ctx);
        }
        
        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx);
        }
        
        // Draw bullets
        for (let bullet of this.bullets) {
            bullet.draw(this.ctx);
        }
        
        for (let bullet of this.enemyBullets) {
            bullet.draw(this.ctx);
        }
        
        // Update score and level
        document.getElementById('score').textContent = `スコア: ${this.score} | レベル: ${this.level}`;
        
        // Draw boss HP bar
        if (this.boss) {
            const barWidth = 200;
            const barHeight = 20;
            const barX = (this.width - barWidth) / 2;
            const barY = 20;
            
            // Background
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // HP bar
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(barX, barY, (this.boss.hp / this.boss.maxHp) * barWidth, barHeight);
            
            // Border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('BOSS', this.width / 2, barY + 35);
        }
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
        this.width = 50;
        this.height = 30;
        this.speed = 5;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw cannon
        ctx.fillRect(this.x + this.width/2 - 3, this.y - 10, 6, 10);
    }
}

class Invader {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.speed = 1;
        this.direction = 1;
    }
    
    update() {
        this.x += this.speed * this.direction;
    }
    
    moveDown() {
        this.y += 20;
        this.direction *= -1;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw simple invader shape
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y + 5, 10, 10);
        ctx.fillRect(this.x + 25, this.y + 5, 10, 10);
        ctx.fillRect(this.x + 15, this.y + 15, 10, 5);
    }
}

class Bullet {
    constructor(x, y, velocityY) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.velocityY = velocityY;
    }
    
    update() {
        this.y += this.velocityY;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.velocityY < 0 ? '#ffff00' : '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 80;
        this.speed = 2;
        this.direction = 1;
        this.maxHp = 20;
        this.hp = this.maxHp;
        this.shootTimer = 0;
    }
    
    update() {
        this.x += this.speed * this.direction;
        
        if (this.x <= 0 || this.x >= 800 - this.width) {
            this.direction *= -1;
        }
        
        this.shootTimer++;
    }
    
    takeDamage() {
        this.hp--;
    }
    
    draw(ctx) {
        // Main body
        ctx.fillStyle = '#800080';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Details
        ctx.fillStyle = '#ff0080';
        ctx.fillRect(this.x + 10, this.y + 10, 20, 20);
        ctx.fillRect(this.x + 90, this.y + 10, 20, 20);
        ctx.fillRect(this.x + 50, this.y + 30, 20, 30);
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 20, this.y + 15, 8, 8);
        ctx.fillRect(this.x + 92, this.y + 15, 8, 8);
        
        // Cannons
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 15, this.y + this.height, 10, 15);
        ctx.fillRect(this.x + 95, this.y + this.height, 10, 15);
    }
}

// Start the game
window.onload = () => {
    new Game();
};