document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameScreen = document.getElementById('game-screen');
    const scoreDisplay = document.getElementById('score-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScore = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    // --- Game Constants ---
    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const WALL_WIDTH = 80;
    const PLAYER_SIZE = 30;
    const POLE_WIDTH = 20;
    const POLE_HEIGHT = 100;

    // --- Physics & Gameplay ---
    const SLIDE_SPEED = 1.5;
    const WORLD_SCROLL_SPEED = 2;
    const JUMP_HORIZONTAL_SPEED = 5;
    const JUMP_VERTICAL_POWER = -7; // Negative is up
    const GRAVITY = 0.3;
    const OBSTACLE_SPAWN_INTERVAL = 900; // milliseconds

    // --- Game State ---
    let player, playerElement, obstacles, score, isGameOver;
    let playerState; // 'sliding' or 'jumping'
    let playerWall;  // 'left' or 'right'
    let gameLoopInterval, obstacleInterval;

    function setupGame() {
        gameScreen.querySelectorAll('.pole, #player').forEach(el => el.remove());
        obstacles = [];
        score = 0;
        isGameOver = false;
        playerState = 'sliding';
        playerWall = 'left';

        // Player object holds all physics properties
        player = {
            x: WALL_WIDTH, // Start on the edge of the left wall
            y: GAME_HEIGHT / 3,
            vx: 0, // horizontal velocity
            vy: 0  // vertical velocity
        };

        playerElement = document.createElement('div');
        playerElement.id = 'player';
        gameScreen.appendChild(playerElement);
        
        // Hide UI
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        scoreDisplay.textContent = `Score: 0`;
        scoreDisplay.style.display = 'block';

        // Clear any old intervals before starting new ones
        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);

        gameLoopInterval = setInterval(gameLoop, 16); // ~60fps
        obstacleInterval = setInterval(createObstacle, OBSTACLE_SPAWN_INTERVAL);
    }
    
    function endGame() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);
        finalScore.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // The main engine of the game
    function gameLoop() {
        if (isGameOver) return;

        updatePlayer();
        updateObstacles();
        checkCollisions();
        render();
    }

    function updatePlayer() {
        if (playerState === 'sliding') {
            player.y += SLIDE_SPEED; // Slide down the wall
        } else if (playerState === 'jumping') {
            // Apply physics for the jump arc
            player.vy += GRAVITY;
            player.x += player.vx;
            player.y += player.vy;

            // Check if player hits the opposite wall to stick to it
            if (player.vx > 0 && player.x >= GAME_WIDTH - WALL_WIDTH - PLAYER_SIZE) {
                landOnWall('right');
            } else if (player.vx < 0 && player.x <= WALL_WIDTH) {
                landOnWall('left');
            }
        }

        // Check for game over (falling off screen)
        if (player.y + PLAYER_SIZE > GAME_HEIGHT) {
            endGame();
        }
    }
    
    function landOnWall(side) {
        playerState = 'sliding';
        playerWall = side;
        player.vx = 0;
        player.vy = 0;
        player.x = (side === 'left') ? WALL_WIDTH : GAME_WIDTH - WALL_WIDTH - PLAYER_SIZE;
    }

    function updateObstacles() {
        obstacles.forEach(obs => {
            obs.y -= WORLD_SCROLL_SPEED; // Scroll obstacles up
        });

        // Score points and remove obstacles that have scrolled past the top
        obstacles = obstacles.filter(obs => {
            if (obs.y + POLE_HEIGHT < 0) {
                obs.element.remove();
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                return false; // Remove from array
            }
            return true;
        });
    }

    function checkCollisions() {
        // Player's bounding box
        const pRect = {
            left: player.x, right: player.x + PLAYER_SIZE,
            top: player.y, bottom: player.y + PLAYER_SIZE
        };

        for (const obs of obstacles) {
            const oRect = {
                left: obs.x, right: obs.x + POLE_WIDTH,
                top: obs.y, bottom: obs.y + POLE_HEIGHT
            };

            // Simple AABB collision check
            if (pRect.left < oRect.right && pRect.right > oRect.left &&
                pRect.top < oRect.bottom && pRect.bottom > oRect.top) {
                endGame();
                return;
            }
        }
    }

    function render() {
        // Update player position on screen
        playerElement.style.transform = `translate(${player.x}px, ${player.y}px)`;
        // Update all obstacle positions on screen
        obstacles.forEach(obs => {
            obs.element.style.transform = `translateY(${obs.y}px)`;
        });
    }

    function jump() {
        if (isGameOver || playerState !== 'sliding') return;

        playerState = 'jumping';
        player.vy = JUMP_VERTICAL_POWER; // Give an upward boost
        player.vx = (playerWall === 'left') ? JUMP_HORIZONTAL_SPEED : -JUMP_HORIZONTAL_SPEED;
    }

    function createObstacle() {
        const pole = document.createElement('div');
        pole.classList.add('pole');

        const side = Math.random() < 0.5 ? 'left' : 'right';
        const xPos = (side === 'left') ? WALL_WIDTH - POLE_WIDTH : GAME_WIDTH - WALL_WIDTH;
        
        pole.style.left = `${xPos}px`;

        const obstacleData = {
            element: pole,
            x: xPos,
            y: GAME_HEIGHT // Start at the bottom
        };
        obstacles.push(obstacleData);
        gameScreen.appendChild(pole);
    }
    
    // --- Event Listeners ---
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (startScreen.style.display !== 'none') {
                setupGame(); // Start game on first space press
            } else {
                jump();
            }
        }
    });

    startButton.addEventListener('click', setupGame);
    restartButton.addEventListener('click', setupGame);
});
