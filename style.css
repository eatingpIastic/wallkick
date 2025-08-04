document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameScreen = document.getElementById('game-screen');
    const levelContainer = document.getElementById('level-container');
    const scoreDisplay = document.getElementById('score-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScore = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    // --- Game Constants ---
    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;
    const PLAYER_SIZE = 30;
    const OBSTACLE_SIZE = 40;

    // --- Physics and Gameplay Constants ---
    const CLIMB_SPEED = 1.5;
    const JUMP_HORIZONTAL_SPEED = 4;
    const JUMP_INITIAL_VERTICAL_SPEED = -6; // Negative is up
    const GRAVITY = 0.25;

    // --- Game State ---
    let player, playerElement, obstacles, score, isGameOver, animationFrameId;
    let playerState; // 'climbing' or 'jumping'
    let levelScrollY; // How much the level has scrolled
    let lastObstacleY; // Position of the highest generated obstacle

    // --- Core Game Functions ---

    function setupGame() {
        levelContainer.innerHTML = '';
        obstacles = [];
        score = 0;
        levelScrollY = 0;
        lastObstacleY = GAME_HEIGHT - 100;
        isGameOver = false;
        playerState = 'climbing';

        player = {
            x: 0,
            y: GAME_HEIGHT / 2,
            vx: 0, // Horizontal velocity
            vy: 0, // Vertical velocity
            onWall: 'left'
        };

        playerElement = document.createElement('div');
        playerElement.id = 'player';
        levelContainer.appendChild(playerElement);

        // Generate initial safe platforms
        for (let i = 0; i < 20; i++) {
            generateObstacleRow(true); // isInitial = true
        }

        // Hide UI
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        scoreDisplay.style.display = 'block';
    }
    
    function startGame() {
        setupGame();
        // Use requestAnimationFrame for smoother animation
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function endGame() {
        isGameOver = true;
        cancelAnimationFrame(animationFrameId);
        finalScore.textContent = Math.floor(score);
        gameOverScreen.style.display = 'flex';
    }

    // --- Game Loop ---

    function gameLoop() {
        if (isGameOver) return;

        updatePlayerPosition();
        checkCollisions();
        updateCamera();
        manageObstacles();
        render();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // --- Update Functions ---

    function updatePlayerPosition() {
        if (playerState === 'climbing') {
            player.y -= CLIMB_SPEED;
            // Check if player has climbed off the top of a wall block
            if (!isSupported()) {
                playerState = 'jumping';
                player.vy = 0; // Start falling gently
            }
        } else if (playerState === 'jumping') {
            player.vy += GRAVITY;
            player.y += player.vy;
            player.x += player.vx;
        }

        // Game over if player falls off the bottom of the screen
        if (player.y > levelScrollY + GAME_HEIGHT) {
            endGame();
        }
    }

    function updateCamera() {
        // Keep the player in the upper half of the screen
        const cameraTarget = player.y - GAME_HEIGHT / 3;
        if (cameraTarget < levelScrollY) {
            levelScrollY = cameraTarget;
        }
        score = -levelScrollY / 10; // Update score based on height
    }

    function manageObstacles() {
        // Generate new obstacles if the top of the screen gets close
        while (lastObstacleY > levelScrollY - 100) {
            generateObstacleRow();
        }
        // Remove obstacles that are way off the bottom of the screen
        obstacles = obstacles.filter(obs => {
            if (obs.y > levelScrollY + GAME_HEIGHT + 100) {
                obs.element.remove();
                return false;
            }
            return true;
        });
    }

    // --- Rendering ---
    
    function render() {
        levelContainer.style.transform = `translateY(${-levelScrollY}px)`;
        playerElement.style.transform = `translate(${player.x}px, ${player.y}px)`;
        scoreDisplay.textContent = `Height: ${Math.floor(score)}m`;
    }

    // --- Actions & Collision ---

    function jump() {
        if (isGameOver || playerState !== 'climbing') return;

        playerState = 'jumping';
        player.vy = JUMP_INITIAL_VERTICAL_SPEED;
        player.vx = (player.onWall === 'left') ? JUMP_HORIZONTAL_SPEED : -JUMP_HORIZONTAL_SPEED;
    }
    
    function checkCollisions() {
        if (playerState !== 'jumping') return;

        // Wall boundaries
        if (player.x < 0) {
            player.x = 0; // Hit left boundary
        } else if (player.x + PLAYER_SIZE > GAME_WIDTH) {
            player.x = GAME_WIDTH - PLAYER_SIZE; // Hit right boundary
        }

        // Check against obstacles
        for (const obs of obstacles) {
            if (
                player.x < obs.x + OBSTACLE_SIZE &&
                player.x + PLAYER_SIZE > obs.x &&
                player.y < obs.y + OBSTACLE_SIZE &&
                player.y + PLAYER_SIZE > obs.y
            ) {
                if (obs.type === 'spike') {
                    endGame();
                    return;
                }
                if (obs.type === 'wall') {
                    // Check if landing on the side, not top/bottom
                    if (player.vx > 0 && player.x + PLAYER_SIZE < obs.x + OBSTACLE_SIZE / 2) { // Moving right, hit left side of block
                        landOnWall('left', obs);
                    } else if (player.vx < 0 && player.x > obs.x + OBSTACLE_SIZE / 2) { // Moving left, hit right side of block
                        landOnWall('right', obs);
                    }
                }
            }
        }
    }

    function landOnWall(side, wall) {
        playerState = 'climbing';
        player.vx = 0;
        player.vy = 0;
        if (side === 'left') { // Landed on left wall
            player.onWall = 'left';
            player.x = wall.x - PLAYER_SIZE;
        } else { // Landed on right wall
            player.onWall = 'right';
            player.x = wall.x + OBSTACLE_SIZE;
        }
    }
    
    // Checks if there is a wall block directly under the player to support them
    function isSupported() {
        const wallX = (player.onWall === 'left') ? player.x + PLAYER_SIZE : player.x - OBSTACLE_SIZE;
        for (const obs of obstacles) {
            if (obs.type === 'wall' && Math.abs(obs.x - wallX) < 1 && player.y + PLAYER_SIZE > obs.y && player.y < obs.y + OBSTACLE_SIZE) {
                return true;
            }
        }
        return false;
    }

    // --- Obstacle Generation ---

    function generateObstacleRow(isInitial = false) {
        lastObstacleY -= OBSTACLE_SIZE * 2; // Spacing between rows
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const type = isInitial ? 'wall' : (Math.random() < 0.7 ? 'wall' : 'spike');

        const xPos = (side === 'left') ? 0 : GAME_WIDTH - OBSTACLE_SIZE;
        createObstacle(xPos, lastObstacleY, type);
        
        // Sometimes, add an obstacle on the other side too
        if (!isInitial && Math.random() < 0.3) {
            const otherType = Math.random() < 0.3 ? 'wall' : 'spike';
            const otherXPos = (side === 'left') ? GAME_WIDTH - OBSTACLE_SIZE : 0;
            // Prevent two spikes directly opposite each other
            if (type === 'spike' && otherType === 'spike') return;
            createObstacle(otherXPos, lastObstacleY, otherType);
        }
    }

    function createObstacle(x, y, type) {
        const element = document.createElement('div');
        element.classList.add('obstacle', type === 'wall' ? 'wall-block' : 'spike');
        element.style.transform = `translate(${x}px, ${y}px)`;

        levelContainer.appendChild(element);
        obstacles.push({ x, y, type, element });
    }

    // --- Event Listeners ---
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent page from scrolling
            if (!isGameOver && startScreen.style.display === 'none') {
                jump();
            }
        }
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
