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

// Game state
let gameState = {
    isActive: false,
    clicksCount: 0,
    bestScore: 0,
    timeLeft: 15,
    timer: null
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

function updateLeaderboard(time) {
    const leaderboard = getLeaderboard();
    const date = new Date().toLocaleDateString();
    
    leaderboard.push({
        time: time,
        date: date
    });
    
    // Сортируем по времени (от меньшего к большему)
    leaderboard.sort((a, b) => a.time - b.time);
    
    // Оставляем только топ-10
    const top10 = leaderboard.slice(0, 10);
    
    saveLeaderboard(top10);
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardBody.innerHTML = '';
    
    leaderboard.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${result.time}</td>
            <td>${result.date}</td>
        `;
        leaderboardBody.appendChild(row);
    });
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
    // Reset game state
    gameState = {
        isActive: false,
        clicksCount: 0,
        bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
        timeLeft: 15,
        timer: null
    };

    // Update UI
    updateStats();
    target.style.display = 'none';
    rulesScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // Clear timer if exists
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
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

    // Hide target immediately
    target.style.display = 'none';

    // Update game state
    gameState.clicksCount++;
    if (gameState.clicksCount > gameState.bestScore) {
        gameState.bestScore = gameState.clicksCount;
        localStorage.setItem('bestScore', gameState.bestScore);
    }

    // Update UI
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
    gameState.isActive = false;
    clearInterval(gameState.timer);
    target.style.display = 'none';
    gameOverScreen.classList.remove('hidden');
}

// Save result
function saveResult() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) return;

    const result = {
        name: playerName,
        score: gameState.clicksCount,
        date: new Date().toISOString()
    };

    let results = JSON.parse(localStorage.getItem('gameResults') || '[]');
    results.push(result);
    results.sort((a, b) => b.score - a.score);
    results = results.slice(0, 10);
    localStorage.setItem('gameResults', JSON.stringify(results));

    updateLeaderboard();
    initGame();
}

// Update leaderboard
function updateLeaderboard() {
    const results = JSON.parse(localStorage.getItem('gameResults') || '[]');
    leaderboardBody.innerHTML = '';

    results.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${result.name}</td>
            <td>${result.score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
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