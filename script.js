// Game elements
const elements = {
    target: document.getElementById('target'),
    gameArea: document.querySelector('.game-area'),
    startScreen: document.getElementById('startScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    startButton: document.getElementById('startButton'),
    restartButton: document.getElementById('restartButton'),
    saveResultButton: document.getElementById('saveResult'),
    timeLeftElement: document.getElementById('timeLeft'),
    scoreElement: document.getElementById('score'),
    bestScoreElement: document.getElementById('bestScore'),
    finalScoreElement: document.getElementById('finalScore'),
    avgReactionTimeElement: document.getElementById('avgReactionTime'),
    playerNameInput: document.getElementById('playerName'),
    leaderboardBody: document.getElementById('leaderboardBody')
};

// Game state
const gameState = {
    isActive: false,
    score: 0,
    timeLeft: 15,
    timer: null,
    startTime: null,
    reactionTimes: [],
    bestScore: 0
};

// Images
const images = [
    'images/original.png',
    'images/telegram-peer-photo-size-2-6299579313137914-1-0-0.jpg',
    'images/telegram-peer-photo-size-2-3758195624491173-1-0-0.jpg',
    'images/telegram-peer-photo-size-2-376647638515298409-1-0-0.jpg',
    'images/telegram-peer-photo-size-2-441875268184942645-1-0-0.jpg',
    'images/telegram-peer-photo-size-2-422224306747058198-1-0-0.jpg',
    'images/telegram-cloud-photo-size-2-315165533860374848-c.jpg'
];

// Debug function
function debug(message) {
    console.log(`[DEBUG] ${message}`);
}

// Check if all required elements exist
function checkElements() {
    const elements = {
        target,
        gameArea,
        startScreen,
        gameOverScreen,
        startButton,
        restartButton,
        saveResultButton,
        timeLeftElement,
        scoreElement,
        bestScoreElement,
        finalScoreElement,
        avgReactionTimeElement,
        playerNameInput,
        leaderboardBody
    };

    let allElementsExist = true;
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            debug(`Element not found: ${name}`);
            allElementsExist = false;
        }
    }
    return allElementsExist;
}

// Preload images
function preloadImages() {
    debug('Preloading images...');
    let loadedCount = 0;
    const totalImages = images.length;

    images.forEach(src => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            debug(`Image loaded: ${src} (${loadedCount}/${totalImages})`);
            if (loadedCount === totalImages) {
                debug('All images loaded successfully');
            }
        };
        img.onerror = () => {
            debug(`Error loading image: ${src}`);
        };
        img.src = src;
    });
}

// Initialize game
function initGame() {
    console.log('Initializing game...');
    
    // Reset game state
    gameState.isActive = false;
    gameState.score = 0;
    gameState.timeLeft = 15;
    gameState.reactionTimes = [];
    
    // Clear timer if exists
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Update UI
    updateStats();
    elements.target.style.display = 'none';
    elements.startScreen.classList.remove('hidden');
    elements.gameOverScreen.classList.add('hidden');
    
    // Load best score
    loadBestScore();
}

// Start game
function startGame() {
    console.log('Starting game...');
    
    if (gameState.isActive) return;
    
    gameState.isActive = true;
    gameState.score = 0;
    gameState.timeLeft = 15;
    gameState.startTime = Date.now();
    gameState.reactionTimes = [];
    
    // Update UI
    elements.startScreen.classList.add('hidden');
    elements.gameOverScreen.classList.add('hidden');
    updateStats();
    
    // Start timer
    startTimer();
    
    // Show first target
    moveTarget();
}

// Move target
function moveTarget() {
    if (!gameState.isActive) return;
    
    const gameArea = elements.gameArea.getBoundingClientRect();
    const targetSize = elements.target.offsetWidth;
    
    // Calculate random position
    const maxX = gameArea.width - targetSize;
    const maxY = gameArea.height - targetSize;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    // Update target position
    elements.target.style.left = `${randomX}px`;
    elements.target.style.top = `${randomY}px`;
    elements.target.style.display = 'block';
    
    // Record start time for reaction time calculation
    gameState.startTime = Date.now();
}

// Handle target click
function handleTargetClick() {
    if (!gameState.isActive) return;
    
    // Calculate reaction time
    const reactionTime = Date.now() - gameState.startTime;
    gameState.reactionTimes.push(reactionTime);
    
    // Update score
    gameState.score++;
    updateStats();
    
    // Hide target
    elements.target.style.display = 'none';
    
    // Move to next target
    setTimeout(moveTarget, 100);
}

// Start timer
function startTimer() {
    updateTimer();
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Update timer display
function updateTimer() {
    elements.timeLeftElement.textContent = gameState.timeLeft;
}

// Update stats
function updateStats() {
    elements.scoreElement.textContent = gameState.score;
    elements.bestScoreElement.textContent = gameState.bestScore;
    elements.finalScoreElement.textContent = gameState.score;
}

// End game
function endGame() {
    console.log('Ending game...');
    
    gameState.isActive = false;
    clearInterval(gameState.timer);
    elements.target.style.display = 'none';
    
    // Calculate average reaction time
    const avgReactionTime = gameState.reactionTimes.length > 0
        ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b) / gameState.reactionTimes.length)
        : 0;
    
    // Update game over screen
    elements.avgReactionTimeElement.textContent = avgReactionTime;
    elements.gameOverScreen.classList.remove('hidden');
    
    // Update best score
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        saveBestScore();
    }
}

// Save best score
function saveBestScore() {
    localStorage.setItem('bestScore', gameState.bestScore);
}

// Load best score
function loadBestScore() {
    const savedScore = localStorage.getItem('bestScore');
    if (savedScore) {
        gameState.bestScore = parseInt(savedScore);
        updateStats();
    }
}

// Save result
function saveResult() {
    const playerName = elements.playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    // Get existing results
    const results = JSON.parse(localStorage.getItem('gameResults') || '[]');
    
    // Add new result
    results.push({
        name: playerName,
        score: gameState.score,
        time: gameState.reactionTimes.length > 0
            ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b) / gameState.reactionTimes.length)
            : 0,
        date: new Date().toISOString()
    });
    
    // Sort and keep top 10
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, 10);
    
    // Save results
    localStorage.setItem('gameResults', JSON.stringify(topResults));
    
    // Update leaderboard
    updateLeaderboard();
    
    // Reset game
    initGame();
}

// Update leaderboard
function updateLeaderboard() {
    const results = JSON.parse(localStorage.getItem('gameResults') || '[]');
    elements.leaderboardBody.innerHTML = '';
    
    results.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${result.name}</td>
            <td>${result.score}</td>
            <td>${result.time}</td>
        `;
        elements.leaderboardBody.appendChild(row);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Setting up event listeners...');
    
    // Initialize game
    initGame();
    
    // Set up event listeners
    elements.startButton.addEventListener('click', startGame);
    elements.restartButton.addEventListener('click', initGame);
    elements.saveResultButton.addEventListener('click', saveResult);
    elements.target.addEventListener('click', handleTargetClick);
    
    // Update leaderboard
    updateLeaderboard();
});

// Debug target element
debug(`Target element: ${elements.target ? 'found' : 'not found'}`);
if (elements.target) {
    debug(`Target styles: ${window.getComputedStyle(elements.target).display}`);
} 