const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const returnBtn = document.getElementById('returnBtn');

const GRID_SIZE = 5;

// Базовые размеры (будут масштабироваться)
const BASE_TILE = 80;
const BASE_SOCKET = 60;
const BASE_PC = 70;
const BASE_PIPE = 40;
const BASE_GAP = 25;
const BASE_PADDING = 40;

let TILE_SIZE, SOCKET_SIZE, PC_SIZE, PIPE_LENGTH, GAP, PADDING;
let OFFSET_X, OFFSET_Y;
let canvasWidth, canvasHeight;

function calculateDimensions() {
    const isMobile = window.innerWidth < 768;
    
    // Общая ширина конструкции
    const totalWidth = BASE_SOCKET + BASE_GAP + BASE_PIPE + 
                       (GRID_SIZE * BASE_TILE) + 
                       BASE_PIPE + BASE_GAP + BASE_PC;
    const totalHeight = BASE_PADDING + (GRID_SIZE * BASE_TILE) + BASE_PADDING;
    
    if (isMobile) {
        const maxWidth = window.innerWidth - 20;
        const maxHeight = window.innerHeight - 200;
        const scale = Math.min(maxWidth / totalWidth, maxHeight / totalHeight, 1);
        
        TILE_SIZE = BASE_TILE * scale;
        SOCKET_SIZE = BASE_SOCKET * scale;
        PC_SIZE = BASE_PC * scale;
        PIPE_LENGTH = BASE_PIPE * scale;
        GAP = BASE_GAP * scale;
        PADDING = BASE_PADDING * scale;
        
        canvasWidth = totalWidth * scale;
        canvasHeight = totalHeight * scale;
    } else {
        TILE_SIZE = BASE_TILE;
        SOCKET_SIZE = BASE_SOCKET;
        PC_SIZE = BASE_PC;
        PIPE_LENGTH = BASE_PIPE;
        GAP = BASE_GAP;
        PADDING = BASE_PADDING;
        
        canvasWidth = totalWidth + PADDING * 2;
        canvasHeight = totalHeight + PADDING * 2;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // OFFSET_X: отступ слева = PADDING + SOCKET_SIZE + GAP + PIPE_LENGTH
    OFFSET_X = PADDING + SOCKET_SIZE + GAP + PIPE_LENGTH;
    OFFSET_Y = PADDING;
}

const TYPES = {
    I: [0, 2],
    L: [0, 1]
};

const sprites = {};
const spriteSources = {
    pipe_I: 'details/Прямая труба.png',
    pipe_L: 'details/Загнутая труба.png',
    socket: 'details/Розетка.png',
    pipe_static: 'details/Прямая труба1.png',
    pc: 'details/ПК.png'
};

let loadedImages = 0;
const totalImages = Object.keys(spriteSources).length;

function loadSprites(callback) {
    for (let key in spriteSources) {
        sprites[key] = new Image();
        sprites[key].src = spriteSources[key];
        sprites[key].onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) callback();
        };
        sprites[key].onerror = () => {
            console.error("Не удалось загрузить: " + spriteSources[key]);
            loadedImages++;
            if (loadedImages === totalImages) callback();
        };
    }
}

let grid = [];
let isWin = false;
let isAnimating = false;

function generateLevel() {
    grid = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ 
            type: 'I', 
            rotation: 0,
            connected: false,
            targetRotation: 0,
            currentRotation: 0
        }))
    );

    let path = [];
    let visited = new Set();

    function findPath(x, y) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || visited.has(`${x},${y}`)) return false;
        path.push({x, y});
        visited.add(`${x},${y}`);
        if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) return true;
        let dirs = [[0,1], [1,0], [0,-1], [-1,0]].sort(() => Math.random() - 0.5);
        for (let [dx, dy] of dirs) {
            if (findPath(x + dx, y + dy)) return true;
        }
        path.pop();
        return false;
    }

    findPath(0, 0);
    let fullPath = [{x: -1, y: 0}, ...path, {x: GRID_SIZE, y: GRID_SIZE - 1}];

    for (let i = 1; i < fullPath.length - 1; i++) {
        let prev = fullPath[i-1];
        let curr = fullPath[i];
        let next = fullPath[i+1];
        let inDir = getDir(curr, prev);
        let outDir = getDir(curr, next);
        setTileByExits(curr.x, curr.y, inDir, outDir);
    }

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!visited.has(`${x},${y}`)) {
                grid[y][x].type = Math.random() > 0.5 ? 'L' : 'I';
            }
            const randomQuarter = Math.floor(Math.random() * 4);
            grid[y][x].rotation = randomQuarter * 90;
            grid[y][x].targetRotation = grid[y][x].rotation;
            grid[y][x].currentRotation = grid[y][x].rotation;
        }
    }
    checkConnections();
}

function getDir(from, to) {
    if (to.x < from.x) return 3;
    if (to.x > from.x) return 1;
    if (to.y < from.y) return 0;
    if (to.y > from.y) return 2;
    return -1;
}

function setTileByExits(x, y, d1, d2) {
    let rotationDegrees;
    if (Math.abs(d1 - d2) === 2) {
        grid[y][x].type = 'I';
        rotationDegrees = (d1 % 2 === 0) ? 0 : 90;
    } else {
        grid[y][x].type = 'L';
        let dirs = [d1, d2].sort();
        if (dirs[0] === 0 && dirs[1] === 1) rotationDegrees = 0;
        if (dirs[0] === 1 && dirs[1] === 2) rotationDegrees = 90;
        if (dirs[0] === 2 && dirs[1] === 3) rotationDegrees = 180;
        if (dirs[0] === 0 && dirs[1] === 3) rotationDegrees = 270;
    }
    grid[y][x].rotation = rotationDegrees;
    grid[y][x].targetRotation = rotationDegrees;
    grid[y][x].currentRotation = rotationDegrees;
}

function getExits(tile) {
    const quarter = (tile.rotation / 90) % 4;
    return TYPES[tile.type].map(e => (e + quarter) % 4);
}

function checkConnections() {
    grid.forEach(row => row.forEach(t => t.connected = false));
    let queue = [];
    if (getExits(grid[0][0]).includes(3)) {
        grid[0][0].connected = true;
        queue.push({x: 0, y: 0});
    }
    while (queue.length > 0) {
        let {x, y} = queue.shift();
        let exits = getExits(grid[y][x]);
        [[0,-1], [1,0], [0,1], [-1,0]].forEach(([dx, dy], dir) => {
            if (exits.includes(dir)) {
                let nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                    let nextTile = grid[ny][nx];
                    if (!nextTile.connected && getExits(nextTile).includes((dir + 2) % 4)) {
                        nextTile.connected = true;
                        queue.push({x: nx, y: ny});
                    }
                }
            }
        });
    }
    const last = grid[GRID_SIZE-1][GRID_SIZE-1];
    if (last.connected && getExits(last).includes(1)) {
        statusText.innerText = "✅ Питание восстановлено!";
        statusText.style.color = "#4ecca3";
        if (!isWin) {
            isWin = true;
            localStorage.setItem('puzzleSolved', 'true');
            if (returnBtn) returnBtn.style.display = 'block';
            celebrateWin();
        }
    } else {
        statusText.innerText = "🔌 Восстановите цепь питания";
        statusText.style.color = "#e94560";
        isWin = false;
    }
}

function celebrateWin() {
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        flashCount++;
        draw();
        if (flashCount >= 6) clearInterval(flashInterval);
    }, 200);
}

function rotateTile(x, y) {
    if (isWin || isAnimating) return;
    
    const tile = grid[y][x];
    tile.targetRotation = tile.targetRotation + 90;
    isAnimating = true;
    
    const startTime = Date.now();
    const duration = 200;
    const startRotation = tile.currentRotation;
    const targetRotation = tile.targetRotation;
    
    function animateRotation() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        tile.currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
        
        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            tile.currentRotation = targetRotation;
            tile.rotation = targetRotation;
            isAnimating = false;
            checkConnections();
        }
        draw();
    }
    
    animateRotation();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Труба к розетке
    const isStartConnected = grid[0][0].connected && getExits(grid[0][0]).includes(3);
    ctx.globalAlpha = isStartConnected ? 1.0 : 0.3;
    ctx.shadowBlur = isStartConnected ? 20 : 0;
    ctx.shadowColor = isStartConnected ? "#4ecca3" : "transparent";

    ctx.save();
    ctx.translate(OFFSET_X, OFFSET_Y + TILE_SIZE / 2);
    ctx.rotate(Math.PI / 2);
    if (sprites.pipe_static) {
        ctx.drawImage(sprites.pipe_static, 0, 0, TILE_SIZE, PIPE_LENGTH, 
                     -TILE_SIZE / 6, 0, TILE_SIZE, PIPE_LENGTH);
    }
    ctx.restore();

    // Розетка (позиция: PADDING, центрирована по вертикали с первой строкой)
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#4ecca3";
    if (sprites.socket) {
        ctx.drawImage(sprites.socket, 
                     PADDING, 
                     OFFSET_Y + (TILE_SIZE - SOCKET_SIZE) / 2, 
                     SOCKET_SIZE, SOCKET_SIZE);
    }
    ctx.restore();

    ctx.globalAlpha = isStartConnected ? 1.0 : 0.3;
    ctx.save();
    ctx.translate(OFFSET_X, OFFSET_Y + TILE_SIZE / 2);
    ctx.rotate(Math.PI / 2);
    if (sprites.pipe_static) {
        ctx.drawImage(sprites.pipe_static, 0, 0, TILE_SIZE, PIPE_LENGTH, 
                     -TILE_SIZE / 6, 0, TILE_SIZE, PIPE_LENGTH);
    }
    ctx.restore();
    ctx.globalAlpha = 1.0;

    // Труба к ПК
    const isWinState = grid[GRID_SIZE-1][GRID_SIZE-1].connected && getExits(grid[GRID_SIZE-1][GRID_SIZE-1]).includes(1);
    const lastRowY = OFFSET_Y + (GRID_SIZE - 1) * TILE_SIZE;
    const gridEndX = OFFSET_X + GRID_SIZE * TILE_SIZE;

    ctx.globalAlpha = isWinState ? 1.0 : 0.3;
    ctx.save();
    ctx.translate(gridEndX, lastRowY + TILE_SIZE / 2);
    ctx.rotate(-Math.PI / 2);
    if (sprites.pipe_static) {
        ctx.drawImage(sprites.pipe_static, 0, 0, TILE_SIZE, PIPE_LENGTH, 
                     -TILE_SIZE / 6, 0, TILE_SIZE, PIPE_LENGTH);
    }
    ctx.restore();

    // ПК (позиция: gridEndX + PIPE_LENGTH + GAP)
    const pcX = gridEndX + PIPE_LENGTH + GAP;
    ctx.globalAlpha = isWinState ? 1.0 : 0.6;
    ctx.shadowBlur = isWinState ? 30 : 0;
    ctx.shadowColor = isWinState ? "#4ecca3" : "transparent";
    if (sprites.pc) {
        ctx.drawImage(sprites.pc, 
                     pcX, 
                     lastRowY + (TILE_SIZE - PC_SIZE) / 2, 
                     PC_SIZE, PC_SIZE);
    }
    ctx.globalAlpha = 1.0;

    // Сетка плиток
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tile = grid[y][x];
            const tx = x * TILE_SIZE + OFFSET_X;
            const ty = y * TILE_SIZE + OFFSET_Y;

            ctx.save();
            ctx.translate(tx + TILE_SIZE / 2, ty + TILE_SIZE / 2);
            ctx.rotate(tile.currentRotation * Math.PI / 180);

            const sprite = tile.type === 'I' ? sprites.pipe_I : sprites.pipe_L;

            if (tile.connected) {
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = isWin ? 25 : 15;
                ctx.shadowColor = isWin ? "#4ecca3" : "white";
                
                if (isWin) {
                    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                    ctx.globalAlpha = pulse;
                }
            } else {
                ctx.globalAlpha = 0.4;
                ctx.shadowBlur = 0;
                ctx.shadowColor = "transparent";
            }

            if (sprite) {
                ctx.drawImage(sprite, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
            }
            ctx.restore();
        }
    }
}

function handleInput(clientX, clientY) {
    if (isWin) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor(((clientX - rect.left) * scaleX - OFFSET_X) / TILE_SIZE);
    const y = Math.floor(((clientY - rect.top) * scaleY - OFFSET_Y) / TILE_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        rotateTile(x, y);
    }
}

canvas.addEventListener('mousedown', (e) => {
    handleInput(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY);
}, { passive: false });

function resetGame() {
    isWin = false;
    isAnimating = false;
    if (returnBtn) returnBtn.style.display = 'none';
    generateLevel();
    draw();
}

function returnToLevel() {
    window.location.href = 'IKNT-dialog.html';
}

function goBackWithoutWin() {
    localStorage.setItem('puzzleQuit', 'true');
    window.location.href = 'IKNT-dialog.html';
}

function gameLoop() {
    if (isWin) {
        draw();
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    calculateDimensions();
    draw();
});

loadSprites(() => {
    calculateDimensions();
    resetGame();
    gameLoop();
});

// Применяем настройки на всех страницах
document.addEventListener('DOMContentLoaded', () => {
    try {
        const settings = JSON.parse(localStorage.getItem('smartPiggy_settings')) || {};
        
        // Применяем тёмную тему
        if (settings.darkTheme) {
            document.body.classList.add('dark-theme');
        }
        
        // Применяем отключение анимаций
        if (!settings.animations) {
            document.body.classList.add('no-animations');
        }
    } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
    }
});