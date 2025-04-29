// Game elements
const target = document.getElementById('target');
const gameContainer = document.querySelector('.game-container');
const startScreen = document.querySelector('.start-screen');
const rulesScreen = document.querySelector('.rules-screen');
const gameOverScreen = document.querySelector('.game-over');
const startButton = document.getElementById('startButton');
const startGameButton = document.getElementById('startGame');
const restartButton = document.getElementById('restartButton');
const saveResultButton = document.getElementById('saveResult');
const clearCacheButton = document.getElementById('clearCache');
const leaderboardBody = document.getElementById('leaderboardBody');
const clicksLeftElement = document.getElementById('clicksLeft');
const totalTimeElement = document.getElementById('totalTime');
const avgTimeElement = document.getElementById('avgTime');
const finalTimeElement = document.getElementById('finalTime');
const gameOverMessage = document.getElementById('gameOverMessage');

// Game state
let gameState = {
    isActive: false,
    clicksCount: 0,
    bestScore: 0,
    timeLeft: 15,
    timer: null,
    startTime: null,
    reactionTimes: []
};

// Images
const images = [
    './images/original.png',
    './images/telegram-peer-photo-size-2-6299579313137914-1-0-0.jpg',
    './images/telegram-peer-photo-size-2-3758195624491173-1-0-0.jpg',
    './images/telegram-peer-photo-size-2-376647638515298409-1-0-0.jpg',
    './images/telegram-peer-photo-size-2-441875268184942645-1-0-0.jpg',
    './images/telegram-peer-photo-size-2-422224306747058198-1-0-0.jpg',
    './images/telegram-cloud-photo-size-2-315165533860374848-c.jpg'
];

// Debug function
function debug(message) {
    console.log(`[DEBUG] ${message}`);
}

// Функции для работы с таблицей результатов
function getLeaderboard() {
    const leaderboard = localStorage.getItem('leaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';
    
    // Get all players and their scores
    const players = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('player_')) {
            const playerData = JSON.parse(localStorage.getItem(key));
            players.push({
                name: key.replace('player_', ''),
                score: playerData.score,
                reactionTimes: playerData.reactionTimes || []
            });
        }
    }
    
    // Sort players by score
    players.sort((a, b) => b.score - a.score);
    
    // Display top 10 players
    players.slice(0, 10).forEach((player, index) => {
        const row = document.createElement('tr');
        const avgReactionTime = player.reactionTimes.length > 0 
            ? (player.reactionTimes.reduce((a, b) => a + b, 0) / player.reactionTimes.length).toFixed(2)
            : 'N/A';
            
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.score}</td>
            <td>${avgReactionTime}ms</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

function saveGameResult(score, reactionTimes) {
    const playerName = document.getElementById('playerName').value || 'Anonymous';
    const storageKey = `player_${playerName}`;
    
    // Get existing player data or create new
    const existingData = localStorage.getItem(storageKey);
    const playerData = existingData ? JSON.parse(existingData) : { score: 0, reactionTimes: [] };
    
    // Update score if current score is higher
    if (score > playerData.score) {
        playerData.score = score;
    }
    
    // Add new reaction times
    playerData.reactionTimes = [...playerData.reactionTimes, ...reactionTimes];
    
    // Save updated data
    localStorage.setItem(storageKey, JSON.stringify(playerData));
    
    // Update leaderboard
    updateLeaderboard();
}

// Preload images
function preloadImages() {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => debug(`Image loaded: ${src}`);
        img.onerror = () => debug(`Error loading image: ${src}`);
    });
}

// Initialize game
function initGame() {
    gameState = {
        isActive: false,
        clicksCount: 0,
        bestScore: getBestScore(),
        timeLeft: 15,
        timer: null,
        startTime: null,
        reactionTimes: []
    };

    updateStats();
    target.style.display = 'none';
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');

    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
}

// Get best score from localStorage
function getBestScore() {
    const results = JSON.parse(localStorage.getItem('gameResults') || '[]');
    if (results.length === 0) return 0;
    return Math.max(...results.map(r => r.score));
}

// Start game from rules screen
function startFromRules() {
    rulesScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Start game
function startGame() {
    gameState.isActive = true;
    gameState.clicksCount = 0;
    gameState.timeLeft = 15;
    gameState.startTime = Date.now();
    gameState.reactionTimes = [];
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    updateStats();
    moveTarget();
    startTimer();
}

// Move target
function moveTarget() {
    if (!gameState.isActive) return;

    // Get container dimensions
    const containerRect = gameContainer.getBoundingClientRect();
    const targetSize = 100;

    // Calculate random position
    const maxX = containerRect.width - targetSize;
    const maxY = containerRect.height - targetSize;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Get random image
    const currentImage = target.style.backgroundImage;
    let newImage;
    do {
        newImage = images[Math.floor(Math.random() * images.length)];
    } while (`url('${newImage}')` === currentImage);

    // Update target position and image
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;
    target.style.backgroundImage = `url('${newImage}')`;
    target.style.display = 'block';
}

// Handle target click
function handleTargetClick() {
    if (!gameState.isActive) return;

    // Calculate reaction time
    const reactionTime = Date.now() - gameState.startTime;
    gameState.reactionTimes.push(reactionTime);
    gameState.startTime = Date.now();

    // Hide target immediately
    target.style.display = 'none';

    // Update game state
    gameState.clicksCount++;
    updateStats();

    // Move target after a short delay
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
    document.getElementById('timeLeft').textContent = gameState.timeLeft;
}

// Update stats
function updateStats() {
    document.getElementById('clicksCount').textContent = gameState.clicksCount;
    document.getElementById('bestScore').textContent = gameState.bestScore;
    document.getElementById('finalScore').textContent = gameState.clicksCount;
}

// End game
function endGame() {
    clearInterval(gameState.timer);
    gameState.isActive = false;
    
    // Calculate average reaction time
    const avgReactionTime = gameState.reactionTimes.length > 0 
        ? (gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length).toFixed(2)
        : 0;
    
    // Update game over message
    gameOverMessage.textContent = `Game Over! Average reaction time: ${avgReactionTime}ms`;
    gameOverScreen.style.display = 'block';
    
    // Save game results
    saveGameResult(gameState.clicksCount, gameState.reactionTimes);
    
    // Reset game state
    gameState.clicksCount = 0;
    gameState.timeLeft = 15;
    gameState.reactionTimes = [];
    updateStats();
}

// Save result
function saveResult() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) return;

    const avgReactionTime = gameState.reactionTimes.length > 0 
        ? Math.round(gameState.reactionTimes.reduce((a, b) => a + b) / gameState.reactionTimes.length)
        : 0;

    const result = {
        name: playerName,
        score: gameState.clicksCount,
        avgReactionTime: avgReactionTime,
        date: new Date().toISOString()
    };

    let results = JSON.parse(localStorage.getItem('gameResults') || '[]');
    results.push(result);
    
    // Sort by score (descending) and then by reaction time (ascending)
    results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.avgReactionTime - b.avgReactionTime;
    });
    
    // Keep only top 10 results
    results = results.slice(0, 10);
    
    localStorage.setItem('gameResults', JSON.stringify(results));
    updateLeaderboard();
    initGame();
}

// Event listeners
target.addEventListener('click', handleTargetClick);
startGameButton.addEventListener('click', startFromRules);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', initGame);
saveResultButton.addEventListener('click', saveResult);
clearCacheButton.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

// Debug target element
debug(`Target element: ${target ? 'found' : 'not found'}`);
if (target) {
    debug(`Target styles: ${window.getComputedStyle(target).display}`);
}

// Preload images and initialize game
preloadImages();
initGame();
updateLeaderboard(); 