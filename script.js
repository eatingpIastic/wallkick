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
    const PLAYER_SIZE = 25;
    const OBSTACLE_WIDTH = 60;
    const OBSTACLE_HEIGHT = 20;

    // --- Physics & Gameplay ---
    const SLIDE_SPEED = 2;
    const WORLD_SCROLL_SPEED = 2.5;
    const JUMP_HORIZONTAL_SPEED = 6;
    const JUMP_VERTICAL_POWER = -8;
    const GRAVITY = 0.35;
    const OBSTACLE_SPAWN_INTERVAL = 750; // ms

    // --- Game State ---
    let player, playerElement, obstacles, score, isGameOver;
    let playerState, playerWall;
    let gameLoopInterval, obstacleInterval;

    function setupGame() {
        gameScreen.innerHTML = ''; // Clear old elements
        obstacles = [];
        score = 0;
        isGameOver = false;
        playerState = 'sliding';
        playerWall = 'left';

        player = {
            x: 0, // Start on the left edge
            y: GAME_HEIGHT / 3,
            vx: 0, vy: 0
        };

        playerElement = document.createElement('div');
        playerElement.id = 'player';
        gameScreen.appendChild(playerElement);
        
        // Update UI
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        scoreDisplay.textContent = `Score: 0`;
        scoreDisplay.style.display = 'block';

        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);
        gameLoopInterval = setInterval(gameLoop, 16);
        obstacleInterval = setInterval(createObstacle, OBSTACLE_SPAWN_INTERVAL);
    }
    
    function endGame() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        clearInterval(obstacleInterval);
        finalScore.textContent = score;
        gameOverScreen.style.display = 'flex'; // Show game over screen
    }

    function gameLoop() {
        updatePlayer();
        updateObstacles();
        checkCollisions();
        render();
    }

    function updatePlayer() {
        if (playerState === 'sliding') {
            player.y += SLIDE_SPEED;
        } else if (playerState === 'jumping') {
            player.vy += GRAVITY;
            player.x += player.vx;
            player.y += player.vy;

            // Check if player hits the opposite side boundary
            if (player.vx > 0 && player.x >= GAME_WIDTH - PLAYER_SIZE) {
                landOnWall('right');
            } else if (player.vx < 0 && player.x <= 0) {
                landOnWall('left');
            }
        }

        if (player.y + PLAYER_SIZE > GAME_HEIGHT) endGame();
    }
    
    function landOnWall(side) {
        playerState = 'sliding';
        playerWall = side;
        player.vx = 0;
        player.vy = 0;
        player.x = (side === 'left') ? 0 : GAME_WIDTH - PLAYER_SIZE;
    }

    function updateObstacles() {
        obstacles.forEach(obs => {
            obs.y -= WORLD_SCROLL_SPEED;
        });

        obstacles = obstacles.filter(obs => {
            if (obs.y + OBSTACLE_HEIGHT < 0) {
                obs.element.remove();
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                return false;
            }
            return true;
        });
    }

    function checkCollisions() {
        const pRect = { left: player.x, right: player.x + PLAYER_SIZE, top: player.y, bottom: player.y + PLAYER_SIZE };
        for (const obs of obstacles) {
            const oRect = { left: obs.x, right: obs.x + OBSTACLE_WIDTH, top: obs.y, bottom: obs.y + OBSTACLE_HEIGHT };
            if (pRect.left < oRect.right && pRect.right > oRect.left && pRect.top < oRect.bottom && pRect.bottom > oRect.top) {
                endGame();
                return;
            }
        }
    }

    function render() {
        playerElement.style.transform = `translate(${player.x}px, ${player.y}px)`;
        obstacles.forEach(obs => {
            obs.element.style.transform = `translate(${obs.x}px, ${obs.y}px)`;
        });
    }

    function jump() {
        if (isGameOver || playerState !== 'sliding') return;
        playerState = 'jumping';
        player.vy = JUMP_VERTICAL_POWER;
        player.vx = (playerWall === 'left') ? JUMP_HORIZONTAL_SPEED : -JUMP_HORIZONTAL_SPEED;
    }

    function createObstacle() {
        const obsElement = document.createElement('div');
        obsElement.classList.add('obstacle');
        obsElement.style.width = `${OBSTACLE_WIDTH}px`;
        obsElement.style.height = `${OBSTACLE_HEIGHT}px`;

        const side = Math.random() < 0.5 ? 'left' : 'right';
        const xPos = (side === 'left') ? 0 : GAME_WIDTH - OBSTACLE_WIDTH;
        
        const obstacleData = { element: obsElement, x: xPos, y: GAME_HEIGHT };
        obstacles.push(obstacleData);
        gameScreen.appendChild(obsElement);
    }
    
    // --- Event Listeners ---
    function handleUserAction() {
        if (isGameOver) return;
        
        // If start screen is visible, clicking start button is handled separately
        if (startScreen.style.display !== 'none') return;
        
        jump();
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleUserAction();
        }
    });
    
    document.addEventListener('mousedown', handleUserAction);

    startButton.addEventListener('click', setupGame);
    restartButton.addEventListener('click', setupGame);
});
