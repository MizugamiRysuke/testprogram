class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.keys = {};
        this.stage = 1;
        this.world = 1;
        this.gravity = 0.8;
        this.groundY = this.height - 50;
        this.camera = { x: 0, y: 0 };
        this.stageWidth = 3200;
        
        this.player = new Player(100, this.groundY - 50);
        this.enemies = [];
        this.platforms = [];
        this.pipes = [];
        this.coins = [];
        this.powerUps = [];
        this.bosses = [];
        this.fireballs = [];
        this.particles = [];
        
        this.createStage();
        this.bindEvents();
        this.gameLoop();
    }
    
    createStage() {
        this.enemies = [];
        this.platforms = [];
        this.pipes = [];
        this.coins = [];
        this.powerUps = [];
        this.bosses = [];
        this.fireballs = [];
        this.particles = [];
        
        if (this.stage === 4) {
            this.createBossStage();
        } else {
            this.createRegularStage();
        }
    }
    
    createRegularStage() {
        // Ground platforms
        for (let i = 0; i < this.stageWidth / 32; i++) {
            this.platforms.push(new Platform(i * 32, this.groundY, 32, 50, 'ground'));
        }
        
        // Floating platforms
        const platformData = [
            { x: 300, y: this.groundY - 100, w: 128, h: 20 },
            { x: 500, y: this.groundY - 150, w: 96, h: 20 },
            { x: 800, y: this.groundY - 120, w: 160, h: 20 },
            { x: 1200, y: this.groundY - 180, w: 128, h: 20 },
            { x: 1500, y: this.groundY - 100, w: 96, h: 20 },
            { x: 1800, y: this.groundY - 200, w: 128, h: 20 },
            { x: 2200, y: this.groundY - 120, w: 160, h: 20 },
            { x: 2600, y: this.groundY - 150, w: 128, h: 20 }
        ];
        
        platformData.forEach(p => {
            this.platforms.push(new Platform(p.x, p.y, p.w, p.h, 'brick'));
        });
        
        // Pipes
        this.pipes.push(new Pipe(450, this.groundY - 80, 60, 80));
        this.pipes.push(new Pipe(1100, this.groundY - 120, 60, 120));
        this.pipes.push(new Pipe(2000, this.groundY - 100, 60, 100));
        
        // Enemies (Goombas and Koopa Troopas)
        const enemyPositions = [400, 650, 950, 1300, 1650, 2100, 2500, 2800];
        enemyPositions.forEach((x, i) => {
            if (i % 3 === 0) {
                this.enemies.push(new KoopaTroopa(x, this.groundY - 50));
            } else {
                this.enemies.push(new Goomba(x, this.groundY - 30));
            }
        });
        
        // Coins
        for (let i = 0; i < 15; i++) {
            const x = 200 + i * 200 + Math.random() * 100;
            const y = this.groundY - 60 - Math.random() * 100;
            this.coins.push(new Coin(x, y));
        }
        
        // Power-ups
        this.powerUps.push(new PowerUp(350, this.groundY - 130, 'mushroom'));
        this.powerUps.push(new PowerUp(850, this.groundY - 150, 'flower'));
        this.powerUps.push(new PowerUp(1550, this.groundY - 130, 'star'));
    }
    
    createBossStage() {
        // Boss castle ground
        for (let i = 0; i < this.stageWidth / 32; i++) {
            this.platforms.push(new Platform(i * 32, this.groundY, 32, 50, 'castle'));
        }
        
        // Castle platforms
        this.platforms.push(new Platform(200, this.groundY - 100, 200, 20, 'castle'));
        this.platforms.push(new Platform(500, this.groundY - 150, 150, 20, 'castle'));
        this.platforms.push(new Platform(800, this.groundY - 200, 200, 20, 'castle'));
        this.platforms.push(new Platform(1200, this.groundY - 120, 300, 20, 'castle'));
        
        // Bowser boss
        const bowser = new Bowser(1400, this.groundY - 120);
        bowser.game = this; // Give boss reference to game for player targeting
        this.bosses.push(bowser);
        
        // Some minions
        this.enemies.push(new KoopaTroopa(300, this.groundY - 50));
        this.enemies.push(new KoopaTroopa(600, this.groundY - 50));
        
        // Coins for boss stage
        for (let i = 0; i < 8; i++) {
            const x = 300 + i * 150;
            const y = this.groundY - 80;
            this.coins.push(new Coin(x, y));
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
        this.lives = 3;
        this.stage = 1;
        this.world = 1;
        this.player = new Player(100, this.groundY - 50);
        this.enemies = [];
        this.platforms = [];
        this.pipes = [];
        this.coins = [];
        this.powerUps = [];
        this.bosses = [];
        this.fireballs = [];
        this.particles = [];
        this.createStage();
        document.getElementById('gameOver').style.display = 'none';
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Player movement and jumping
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
            this.player.direction = -1;
            this.player.moving = true;
        } else if (this.keys['ArrowRight'] && this.player.x < this.stageWidth - this.player.width) {
            this.player.x += this.player.speed;
            this.player.direction = 1;
            this.player.moving = true;
        } else {
            this.player.moving = false;
        }
        
        if (this.keys['ArrowUp'] && this.player.onGround) {
            this.player.velocityY = -15;
            this.player.onGround = false;
        }
        
        // Fire power (Space key)
        if (this.keys[' '] && this.player.powerState === 'fire' && Date.now() - this.player.lastFireball > 300) {
            this.fireballs.push(new Fireball(
                this.player.x + (this.player.direction > 0 ? this.player.width : 0),
                this.player.y + this.player.height / 2,
                this.player.direction
            ));
            this.player.lastFireball = Date.now();
        }
        
        // Apply gravity and update player physics
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }
        
        // Platform collisions
        for (let platform of this.platforms) {
            if (this.player.velocityY > 0 &&
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + 10) {
                this.player.y = platform.y - this.player.height;
                this.player.velocityY = 0;
                this.player.onGround = true;
            }
        }
        
        // Pipe collisions (as platforms)
        for (let pipe of this.pipes) {
            // Top collision (landing on pipe)
            if (this.player.velocityY > 0 &&
                this.player.x < pipe.x + pipe.width &&
                this.player.x + this.player.width > pipe.x &&
                this.player.y + this.player.height > pipe.y &&
                this.player.y + this.player.height < pipe.y + 15) {
                this.player.y = pipe.y - this.player.height;
                this.player.velocityY = 0;
                this.player.onGround = true;
            }
            
            // Side collisions (prevent walking through pipe)
            if (this.player.x < pipe.x + pipe.width &&
                this.player.x + this.player.width > pipe.x &&
                this.player.y < pipe.y + pipe.height &&
                this.player.y + this.player.height > pipe.y + 15) {
                
                // Push player to the side they came from
                if (this.player.x < pipe.x) {
                    this.player.x = pipe.x - this.player.width;
                } else {
                    this.player.x = pipe.x + pipe.width;
                }
            }
        }
        
        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update();
            if (enemy.x <= 0 || enemy.x >= this.stageWidth - enemy.width) {
                enemy.direction *= -1;
            }
        }
        
        // Update bosses
        for (let boss of this.bosses) {
            boss.update();
            
            // Boss fireball vs player
            for (let i = boss.fireballs.length - 1; i >= 0; i--) {
                if (boss.fireballs[i] &&
                    this.player.x < boss.fireballs[i].x + boss.fireballs[i].width &&
                    this.player.x + this.player.width > boss.fireballs[i].x &&
                    this.player.y < boss.fireballs[i].y + boss.fireballs[i].height &&
                    this.player.y + this.player.height > boss.fireballs[i].y) {
                    
                    if (!this.player.invincible) {
                        boss.fireballs.splice(i, 1);
                        if (this.player.powerState === 'small') {
                            this.playerDied();
                        } else {
                            this.player.powerState = 'small';
                            this.player.invincible = true;
                            this.player.invincibleTime = Date.now() + 2000;
                        }
                    } else {
                        boss.fireballs.splice(i, 1);
                    }
                }
            }
        }
        
        this.checkCollisions();
        
        // Update camera
        this.updateCamera();
        
        // Update fireballs
        this.fireballs = this.fireballs.filter(fireball => {
            fireball.update();
            return fireball.x > -50 && fireball.x < this.stageWidth + 50;
        });
        
        // Update coins
        this.coins.forEach(coin => coin.update());
        
        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update());
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
        
        // Check win condition
        if (this.enemies.length === 0 && this.bosses.length === 0) {
            this.nextStage();
        }
        
        // Check if player fell off the stage
        if (this.player.y > this.height + 100) {
            this.playerDied();
        }
        
        // Update UI
        document.getElementById('score').textContent = `Score: ${this.score} | World: ${this.world}-${this.stage} | Lives: ${this.lives}`;
    }
    
    updateCamera() {
        // Follow player with camera
        this.camera.x = this.player.x - this.width / 2;
        
        // Keep camera within stage bounds
        if (this.camera.x < 0) this.camera.x = 0;
        if (this.camera.x > this.stageWidth - this.width) {
            this.camera.x = this.stageWidth - this.width;
        }
    }
    
    nextStage() {
        this.stage++;
        if (this.stage > 4) {
            this.stage = 1;
            this.world++;
        }
        
        // Reset player position
        this.player.x = 100;
        this.player.y = this.groundY - 50;
        this.player.velocityY = 0;
        this.player.onGround = true;
        
        this.createStage();
    }
    
    playerDied() {
        this.lives--;
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Respawn player
            this.player.x = 100;
            this.player.y = this.groundY - 50;
            this.player.velocityY = 0;
            this.player.onGround = true;
            this.player.powerState = 'small';
        }
    }
    
    checkCollisions() {
        // Player vs enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.player.x < this.enemies[i].x + this.enemies[i].width &&
                this.player.x + this.player.width > this.enemies[i].x &&
                this.player.y < this.enemies[i].y + this.enemies[i].height &&
                this.player.y + this.player.height > this.enemies[i].y) {
                
                // If player is invincible, destroy enemy
                if (this.player.invincible) {
                    this.enemies.splice(i, 1);
                    this.score += 100;
                    this.createParticle(this.enemies[i]?.x || this.player.x, this.enemies[i]?.y || this.player.y, 'enemy');
                    continue;
                }
                
                // Check if jumping on enemy
                if (this.player.velocityY > 0 &&
                    this.player.y < this.enemies[i].y + this.enemies[i].height / 2) {
                    
                    this.enemies.splice(i, 1);
                    this.player.velocityY = -10;
                    this.score += 100;
                    this.createParticle(this.enemies[i]?.x || this.player.x, this.enemies[i]?.y || this.player.y, 'enemy');
                } else {
                    // Side collision - take damage
                    if (this.player.powerState === 'small') {
                        this.playerDied();
                    } else {
                        this.player.powerState = 'small';
                        // Temporary invincibility after taking damage
                        this.player.invincible = true;
                        this.player.invincibleTime = Date.now() + 2000;
                    }
                    break;
                }
            }
        }
        
        // Player vs bosses
        for (let i = this.bosses.length - 1; i >= 0; i--) {
            if (this.player.x < this.bosses[i].x + this.bosses[i].width &&
                this.player.x + this.player.width > this.bosses[i].x &&
                this.player.y < this.bosses[i].y + this.bosses[i].height &&
                this.player.y + this.player.height > this.bosses[i].y) {
                
                // Boss ALWAYS damages player, even when invincible from star
                // (No special protection against boss attacks)
                
                // Check if jumping on boss
                if (this.player.velocityY > 0 &&
                    this.player.y < this.bosses[i].y + this.bosses[i].height / 4) {
                    
                    this.bosses[i].health -= 2; // Reduced damage to make boss harder
                    this.player.velocityY = -12;
                    this.score += 200;
                    this.createParticle(this.bosses[i].x, this.bosses[i].y, 'boss');
                    if (this.bosses[i].health <= 0) {
                        this.bosses.splice(i, 1);
                        this.score += 5000; // Higher reward for beating tough boss
                    }
                } else {
                    // Side collision - ALWAYS take damage from boss (even when star invincible)
                    if (this.player.powerState === 'small') {
                        this.playerDied();
                    } else {
                        this.player.powerState = 'small';
                    }
                    // Temporary invincibility after taking damage
                    this.player.invincible = true;
                    this.player.invincibleTime = Date.now() + 2000;
                    break;
                }
            }
        }
        
        // Fireball vs enemies
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.fireballs[i] && this.enemies[j] &&
                    this.fireballs[i].x < this.enemies[j].x + this.enemies[j].width &&
                    this.fireballs[i].x + this.fireballs[i].width > this.enemies[j].x &&
                    this.fireballs[i].y < this.enemies[j].y + this.enemies[j].height &&
                    this.fireballs[i].y + this.fireballs[i].height > this.enemies[j].y) {
                    
                    this.fireballs.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 200;
                    this.createParticle(this.enemies[j]?.x || 0, this.enemies[j]?.y || 0, 'fire');
                    break;
                }
            }
        }
        
        // Player vs coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (this.player.x < this.coins[i].x + this.coins[i].width &&
                this.player.x + this.player.width > this.coins[i].x &&
                this.player.y < this.coins[i].y + this.coins[i].height &&
                this.player.y + this.player.height > this.coins[i].y) {
                
                this.coins.splice(i, 1);
                this.score += 200;
                this.createParticle(this.coins[i]?.x || this.player.x, this.coins[i]?.y || this.player.y, 'coin');
            }
        }
        
        // Player vs power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            if (this.player.x < this.powerUps[i].x + this.powerUps[i].width &&
                this.player.x + this.player.width > this.powerUps[i].x &&
                this.player.y < this.powerUps[i].y + this.powerUps[i].height &&
                this.player.y + this.player.height > this.powerUps[i].y) {
                
                const powerUp = this.powerUps.splice(i, 1)[0];
                this.score += 1000;
                
                if (powerUp.type === 'mushroom' && this.player.powerState === 'small') {
                    this.player.powerState = 'big';
                } else if (powerUp.type === 'flower') {
                    this.player.powerState = 'fire';
                } else if (powerUp.type === 'star') {
                    this.player.invincible = true;
                    this.player.invincibleTime = Date.now() + 8000; // 8 seconds instead of 10
                }
                
                this.createParticle(powerUp.x, powerUp.y, 'powerup');
            }
        }
    }
    
    createParticle(x, y, type) {
        const colors = {
            enemy: '#ff0000',
            boss: '#ff8800',
            fire: '#ffff00',
            coin: '#ffd700',
            powerup: '#00ff00'
        };
        
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, colors[type] || '#ffffff'));
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameOver').style.display = 'block';
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Save context for camera translation
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        // Draw background
        this.drawBackground();
        
        // Draw platforms
        for (let platform of this.platforms) {
            platform.draw(this.ctx);
        }
        
        // Draw pipes
        for (let pipe of this.pipes) {
            pipe.draw(this.ctx);
        }
        
        // Draw coins
        for (let coin of this.coins) {
            coin.draw(this.ctx);
        }
        
        // Draw power-ups
        for (let powerUp of this.powerUps) {
            powerUp.draw(this.ctx);
        }
        
        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }
        
        // Draw bosses
        for (let boss of this.bosses) {
            boss.draw(this.ctx);
            
            // Draw boss fireballs
            for (let fireball of boss.fireballs) {
                fireball.draw(this.ctx);
            }
        }
        
        // Draw fireballs
        for (let fireball of this.fireballs) {
            fireball.draw(this.ctx);
        }
        
        // Draw particles
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Restore context
        this.ctx.restore();
    }
    
    drawBackground() {
        // Simple sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#5C94FC');
        gradient.addColorStop(1, '#87CEEB');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.camera.x, 0, this.width, this.height);
        
        // Clouds
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            const x = i * 400 + 100;
            const y = 80;
            this.drawCloud(x, y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 10, y - 15, 15, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 15, 15, 0, Math.PI * 2);
        this.ctx.fill();
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
        this.width = 32;
        this.height = 48;
        this.speed = 5;
        this.velocityY = 0;
        this.onGround = true;
        this.direction = 1;
        this.moving = false;
        this.powerState = 'small'; // 'small', 'big', 'fire'
        this.invincible = false;
        this.invincibleTime = 0;
        this.lastFireball = 0;
        this.animFrame = 0;
    }
    
    draw(ctx) {
        // Handle invincibility flashing
        if (this.invincible && Date.now() > this.invincibleTime) {
            this.invincible = false;
        }
        
        // Flashing effect during invincibility
        let shouldFlash = this.invincible && Math.floor(Date.now() / 100) % 2;
        if (shouldFlash) {
            ctx.save();
            ctx.globalAlpha = 0.5;
        }
        
        // Animation
        if (this.moving) {
            this.animFrame += 0.3;
        }
        
        // Mario colors based on power state
        let hatColor = '#ff0000';
        let shirtColor = '#0000ff';
        let overallsColor = '#0000ff';
        
        if (this.powerState === 'fire') {
            hatColor = '#ffffff';
            shirtColor = '#ff0000';
            overallsColor = '#ff0000';
        }
        
        // Adjust size based on power state
        let drawHeight = this.powerState === 'small' ? 32 : 48;
        let drawY = this.powerState === 'small' ? this.y + 16 : this.y;
        
        // Hat
        ctx.fillStyle = hatColor;
        ctx.fillRect(this.x + 8, drawY, 16, 8);
        
        // Face
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(this.x + 8, drawY + 8, 16, 12);
        
        // Shirt
        ctx.fillStyle = shirtColor;
        ctx.fillRect(this.x + 6, drawY + 20, 20, 12);
        
        // Overalls (if big Mario)
        if (this.powerState !== 'small') {
            ctx.fillStyle = overallsColor;
            ctx.fillRect(this.x + 8, drawY + 24, 16, 8);
        }
        
        // Legs
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 6, drawY + drawHeight - 12, 8, 12);
        ctx.fillRect(this.x + 18, drawY + drawHeight - 12, 8, 12);
        
        // Simple walking animation
        if (this.moving) {
            const offset = Math.sin(this.animFrame) * 2;
            ctx.fillRect(this.x + 6, drawY + drawHeight - 12 + offset, 8, 12);
            ctx.fillRect(this.x + 18, drawY + drawHeight - 12 - offset, 8, 12);
        }
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 10, drawY + 10, 2, 2);
        ctx.fillRect(this.x + 20, drawY + 10, 2, 2);
        
        // Mustache
        ctx.fillRect(this.x + 12, drawY + 14, 8, 2);
        
        // Restore alpha if flashing
        if (shouldFlash) {
            ctx.restore();
        }
        
        // Star power rainbow effect
        if (this.invincible) {
            const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'];
            const colorIndex = Math.floor(Date.now() / 100) % colors.length;
            ctx.fillStyle = colors[colorIndex];
            ctx.globalAlpha = 0.3;
            ctx.fillRect(this.x - 2, drawY - 2, this.width + 4, drawHeight + 4);
            ctx.globalAlpha = 1;
        }
    }
}

class Goomba {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.speed = 1;
        this.direction = -1;
    }
    
    update() {
        this.x += this.speed * this.direction;
    }
    
    draw(ctx) {
        // Brown body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Darker brown top
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 2, this.y, this.width - 4, 8);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 6, this.y + 6, 3, 3);
        ctx.fillRect(this.x + 15, this.y + 6, 3, 3);
        
        // Frown
        ctx.fillRect(this.x + 8, this.y + 14, 8, 2);
        
        // Feet
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x, this.y + this.height, 6, 4);
        ctx.fillRect(this.x + this.width - 6, this.y + this.height, 6, 4);
    }
}

class KoopaTroopa {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 32;
        this.speed = 1.5;
        this.direction = -1;
    }
    
    update() {
        this.x += this.speed * this.direction;
    }
    
    draw(ctx) {
        // Shell
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x + 4, this.y + 8, 20, 16);
        
        // Shell pattern
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x + 6, this.y + 10, 16, 4);
        ctx.fillRect(this.x + 8, this.y + 16, 12, 4);
        
        // Head
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 8, this.y, 12, 12);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 10, this.y + 3, 2, 2);
        ctx.fillRect(this.x + 16, this.y + 3, 2, 2);
        
        // Beak
        ctx.fillStyle = '#ffa500';
        ctx.fillRect(this.x + 12, this.y + 6, 4, 2);
        
        // Feet
        ctx.fillStyle = '#ff8c00';
        ctx.fillRect(this.x + 2, this.y + 24, 6, 8);
        ctx.fillRect(this.x + 20, this.y + 24, 6, 8);
    }
}

class Bowser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.width = 80;
        this.height = 80;
        this.speed = 1.5;
        this.direction = -1;
        this.health = 30;
        this.maxHealth = 30;
        this.fireTimer = 0;
        this.jumpTimer = 0;
        this.velocityY = 0;
        this.onGround = true;
        this.attackMode = 'walk'; // 'walk', 'jump', 'fire'
        this.modeTimer = 0;
        this.fireballs = [];
    }
    
    update() {
        this.modeTimer++;
        
        // Switch attack modes more frequently
        if (this.modeTimer > 120) {
            const modes = ['walk', 'jump', 'fire'];
            this.attackMode = modes[Math.floor(Math.random() * modes.length)];
            this.modeTimer = 0;
        }
        
        // Movement based on mode
        if (this.attackMode === 'walk') {
            this.x += this.speed * this.direction;
            if (this.x <= this.startX - 100 || this.x >= this.startX + 100) {
                this.direction *= -1;
            }
        }
        
        // Jump attack - more frequent and higher
        if (this.attackMode === 'jump' && this.onGround && this.modeTimer % 45 === 0) {
            this.velocityY = -15;
            this.onGround = false;
        }
        
        // Fire attack - more frequent and multiple directions
        if (this.attackMode === 'fire' && this.modeTimer % 20 === 0) {
            // Shoot towards player if available
            let targetDirection = this.direction;
            if (this.game && this.game.player) {
                targetDirection = this.game.player.x > this.x ? 1 : -1;
            }
            
            this.fireballs.push(new BossFireball(
                this.x + this.width / 2,
                this.y + this.height / 2,
                targetDirection
            ));
            
            // Sometimes shoot in both directions
            if (this.modeTimer % 40 === 0) {
                this.fireballs.push(new BossFireball(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    -targetDirection
                ));
            }
        }
        
        // Apply gravity
        if (!this.onGround) {
            this.velocityY += 0.8;
            this.y += this.velocityY;
            
            // Ground collision
            if (this.y >= 342) { // groundY - height = 462 - 120 = 342
                this.y = 342;
                this.velocityY = 0;
                this.onGround = true;
            }
        }
        
        // Update fireballs
        this.fireballs = this.fireballs.filter(fireball => {
            fireball.update();
            return fireball.x > -50 && fireball.x < 3250;
        });
    }
    
    draw(ctx) {
        // Main body - dark green
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Shell spikes
        ctx.fillStyle = '#8B4513';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(this.x + 10 + i * 10, this.y - 5, 8, 10);
        }
        
        // Head
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(this.x + 10, this.y + 10, 60, 40);
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + 20, this.y + 20, 8, 8);
        ctx.fillRect(this.x + 52, this.y + 20, 8, 8);
        
        // Eye pupils
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 22, this.y + 22, 4, 4);
        ctx.fillRect(this.x + 54, this.y + 22, 4, 4);
        
        // Mouth
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 30, this.y + 35, 20, 8);
        
        // Teeth
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 32, this.y + 35, 3, 5);
        ctx.fillRect(this.x + 38, this.y + 35, 3, 5);
        ctx.fillRect(this.x + 44, this.y + 35, 3, 5);
        
        // Arms
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x - 15, this.y + 30, 20, 25);
        ctx.fillRect(this.x + 75, this.y + 30, 20, 25);
        
        // Legs
        ctx.fillRect(this.x + 15, this.y + 70, 15, 25);
        ctx.fillRect(this.x + 50, this.y + 70, 15, 25);
        
        // Health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 20, this.width, 8);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 20, (this.health / this.maxHealth) * this.width, 8);
        
        // Health text
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`Bowser: ${this.health}/${this.maxHealth}`, this.x, this.y - 25);
    }
}

class Platform {
    constructor(x, y, width, height, type = 'brick') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    
    draw(ctx) {
        if (this.type === 'ground') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Grass on top
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(this.x, this.y, this.width, 8);
        } else if (this.type === 'brick') {
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Brick pattern
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.width; i += 16) {
                ctx.strokeRect(this.x + i, this.y, 16, this.height);
            }
        } else if (this.type === 'castle') {
            ctx.fillStyle = '#696969';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Castle brick pattern
            ctx.strokeStyle = '#2F4F4F';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.width; i += 20) {
                for (let j = 0; j < this.height; j += 10) {
                    ctx.strokeRect(this.x + i, this.y + j, 20, 10);
                }
            }
        }
    }
}

class Pipe {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        // Pipe body
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Pipe top
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(this.x - 5, this.y, this.width + 10, 15);
        
        // Pipe details
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x - 5, this.y, this.width + 10, 15);
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.animFrame = 0;
    }
    
    update() {
        this.animFrame += 0.2;
    }
    
    draw(ctx) {
        // Coin spinning animation
        const scale = Math.abs(Math.sin(this.animFrame));
        const drawWidth = this.width * scale;
        const offsetX = (this.width - drawWidth) / 2;
        
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.x + offsetX, this.y, drawWidth, this.height);
        
        if (scale > 0.5) {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + offsetX + 2, this.y + 2, drawWidth - 4, this.height - 4);
        }
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type; // 'mushroom', 'flower', 'star'
        this.animFrame = 0;
    }
    
    update() {
        this.animFrame += 0.1;
        this.y += Math.sin(this.animFrame) * 0.5; // Floating effect
    }
    
    draw(ctx) {
        if (this.type === 'mushroom') {
            // Mushroom
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y, this.width, 16);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 4, this.y + 4, 4, 4);
            ctx.fillRect(this.x + 12, this.y + 4, 4, 4);
            
            ctx.fillStyle = '#ffdbac';
            ctx.fillRect(this.x + 6, this.y + 16, 12, 8);
        } else if (this.type === 'flower') {
            // Fire flower
            ctx.fillStyle = '#ff4500';
            ctx.fillRect(this.x + 8, this.y + 8, 8, 8);
            
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 4, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 16, this.y + 8, 4, 4);
            ctx.fillRect(this.x + 8, this.y + 4, 4, 4);
            ctx.fillRect(this.x + 8, this.y + 16, 4, 4);
            
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(this.x + 10, this.y + 20, 4, 4);
        } else if (this.type === 'star') {
            // Star
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 8, this.y, 8, 8);
            ctx.fillRect(this.x + 4, this.y + 8, 16, 8);
            ctx.fillRect(this.x + 8, this.y + 16, 8, 8);
            
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.x + 10, this.y + 2, 4, 4);
            ctx.fillRect(this.x + 6, this.y + 10, 4, 4);
            ctx.fillRect(this.x + 14, this.y + 10, 4, 4);
        }
    }
}

class Fireball {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.direction = direction;
        this.speed = 6;
        this.velocityY = -1;
        this.gravity = 0.4;
        this.bounces = 0;
        this.maxBounces = 2;
    }
    
    update() {
        this.x += this.speed * this.direction;
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // Bounce on ground with reduced velocity
        if (this.y > 450) {
            this.y = 450;
            this.velocityY = -4; // Reduced bounce height
            this.bounces++;
            
            // Reduce speed after each bounce
            this.speed *= 0.8;
        }
        
        // Remove fireball after max bounces
        if (this.bounces > this.maxBounces) {
            this.x = -100; // Mark for removal
        }
    }
    
    draw(ctx) {
        // Fireball
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 2, this.y + 2, 4, 4);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 8;
        this.velocityY = (Math.random() - 0.5) * 8 - 2;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.3;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1;
    }
}

class BossFireball {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.velocityX = direction * 4;
        this.velocityY = -2;
        this.gravity = 0.2;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
    }
    
    draw(ctx) {
        // Large boss fireball
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ff8000';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
    }
}

// Start the game
window.onload = () => {
    new Game();
};