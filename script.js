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
    const PLAYER_WIDTH = 40;
    const PLAYER_HEIGHT = 40;
    const WALL_HEIGHT = 30;
    const WALL_GAP_MIN = 120; // Min gap size
    const WALL_GAP_MAX = 160; // Max gap size
    const WALL_SPAWN_INTERVAL = 1400; // Milliseconds between new walls
    const GAME_SPEED = 2; // How fast the walls move up

    // --- Game State Variables ---
    let player = null;
    let score = 0;
    let isGameOver = false;
    let playerSide = 'left'; // 'left' or 'right'
    let gameLoopInterval = null;
    let wallGenerationInterval = null;

    // --- Game Logic Functions ---

    function createPlayer() {
        // --- FIX --- The redundant check for the old player is removed from here.
        player = document.createElement('div');
        player.id = 'player';
        player.style.width = `${PLAYER_WIDTH}px`;
        player.style.height = `${PLAYER_HEIGHT}px`;
        player.style.top = '50px';
        player.style.left = '0px';
        gameScreen.appendChild(player);
        playerSide = 'left';
    }

    function startGame() {
        // Reset state
        isGameOver = false;
        score = 0;
        scoreDisplay.textContent = `Score: 0`;
        
        // --- FIX --- This line now handles all cleanup of old elements.
        gameScreen.innerHTML = ''; 

        // Show/Hide Screens
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        scoreDisplay.style.display = 'block';

        createPlayer();

        // Stop any previous game loops just in case
        clearInterval(gameLoopInterval);
        clearInterval(wallGenerationInterval);

        // Start game loops
        gameLoopInterval = setInterval(gameLoop, 16); // Approx 60 FPS
        wallGenerationInterval = setInterval(createWall, WALL_SPAWN_INTERVAL);
    }

    function endGame() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        clearInterval(wallGenerationInterval);
        
        finalScore.textContent = score;
        gameOverScreen.style.display = 'flex';
        scoreDisplay.style.display = 'none';
    }

    function kick() {
        if (isGameOver || !player) return;

        if (playerSide === 'left') {
            player.style.left = `${GAME_WIDTH - PLAYER_WIDTH}px`;
            playerSide = 'right';
        } else {
            player.style.left = '0px';
            playerSide = 'left';
        }
    }

    function createWall() {
        if (isGameOver) return;

        const wall = document.createElement('div');
        wall.classList.add('wall');
        wall.style.height = `${WALL_HEIGHT}px`;
        wall.style.top = `${GAME_HEIGHT}px`; // Start at the bottom
        wall.dataset.scored = 'false'; // Custom attribute to track scoring

        // Calculate gap
        const gapSize = Math.floor(Math.random() * (WALL_GAP_MAX - WALL_GAP_MIN + 1)) + WALL_GAP_MIN;
        const gapPosition = Math.floor(Math.random() * (GAME_WIDTH - gapSize));

        // Create left segment
        const leftSegment = document.createElement('div');
        leftSegment.classList.add('wall-segment');
        leftSegment.style.width = `${gapPosition}px`;

        // Create right segment
        const rightSegment = document.createElement('div');
        rightSegment.classList.add('wall-segment');
        rightSegment.style.width = `${GAME_WIDTH - gapPosition - gapSize}px`;

        wall.appendChild(leftSegment);
        // The space between segments is the gap
        wall.appendChild(rightSegment);
        
        gameScreen.appendChild(wall);
    }

    function checkCollision(wall) {
        if (!player) return false;
        const playerRect = player.getBoundingClientRect();
        const wallSegments = wall.querySelectorAll('.wall-segment');

        for (const segment of wallSegments) {
            const segmentRect = segment.getBoundingClientRect();
            // Simple AABB (Axis-Aligned Bounding Box) collision detection
            if (
                playerRect.left < segmentRect.right &&
                playerRect.right > segmentRect.left &&
                playerRect.top < segmentRect.bottom &&
                playerRect.bottom > segmentRect.top
            ) {
                return true; // Collision detected
            }
        }
        return false;
    }
    
    function gameLoop() {
        if (isGameOver || !player) return;
        
        // Player slides down
        let playerTop = player.offsetTop + GAME_SPEED;
        if (playerTop + PLAYER_HEIGHT > GAME_HEIGHT) {
            playerTop = GAME_HEIGHT - PLAYER_HEIGHT; // Prevent falling through floor
            endGame();
            return;
        }
        player.style.top = `${playerTop}px`;

        // Move walls up and check for collisions/scoring
        const walls = document.querySelectorAll('.wall');
        walls.forEach(wall => {
            let wallTop = wall.offsetTop - GAME_SPEED;
            wall.style.top = `${wallTop}px`;

            // Check for collision
            if (checkCollision(wall)) {
                endGame();
            }

            // Check for scoring
            if (wall.offsetTop + WALL_HEIGHT < player.offsetTop && wall.dataset.scored === 'false') {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                wall.dataset.scored = 'true';
            }
            
            // Remove walls that are off-screen
            if (wall.offsetTop + WALL_HEIGHT < 0) {
                wall.remove();
            }
        });
    }

    // --- Event Listeners ---
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isGameOver) {
            // Only allow kick if the game is running
            if (gameLoopInterval) {
                 kick();
            }
        }
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});
