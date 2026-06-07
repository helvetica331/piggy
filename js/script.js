// ============================================
// БЛОКИРОВКА ПЕРЕТАСКИВАНИЯ КАРТИНОК
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Отключаем drag на всех картинках
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', e => e.preventDefault());
    });

    // Блокируем контекстное меню на картинках
    document.addEventListener('contextmenu', e => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // Блокируем перетаскивание файлов из браузера
    document.addEventListener('drop', e => e.preventDefault());
    document.addEventListener('dragover', e => e.preventDefault());
});

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let levelsData = [];
let pathsData = [];
let gameProgress = {
    completedLevels: [],
    totalScore: 0,
    settings: {
        musicVolume: 50,
        sfxVolume: 70,
        darkTheme: false,
        animations: true
    }
};

let currentLevel = null;
let currentQuestion = 0;
let levelScore = 0;
let selectedPopupLevel = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    loadLevelsData();
    initSettings();
    
    // Скрываем экран загрузки без задержки
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
});

// Загрузка данных уровней из JSON
async function loadLevelsData() {
    try {
        const response = await fetch('levels.json');
        const data = await response.json();
        levelsData = data.levels;
        pathsData = data.paths;
        console.log('Уровни загружены:', levelsData.length);
    } catch (error) {
        console.error('Ошибка загрузки уровней:', error);
        // Fallback данные если JSON не загрузился
        loadFallbackLevels();
    }
}

function loadFallbackLevels() {
    levelsData = [
        { id: 1, name: "Математический корпус", description: "Решай задачи по алгебре и геометрии", position: { x: 50, y: 80 }, icon: "🏛️", requiredScore: 0, tasks: [{ question: "2 + 2 × 2 = ?", options: ["6", "8", "4", "10"], correct: 0 }] },
        { id: 2, name: "Физический корпус", description: "Законы Ньютона и электродинамика", position: { x: 25, y: 60 }, icon: "⚛️", requiredScore: 1, tasks: [{ question: "Единица силы тока?", options: ["Вольт", "Ампер", "Ватт", "Ом"], correct: 1 }] },
        { id: 3, name: "Химическая лаборатория", description: "Реакции, элементы и соединения", position: { x: 75, y: 60 }, icon: "🧪", requiredScore: 2, tasks: [{ question: "Формула воды?", options: ["CO2", "H2O", "O2", "NaCl"], correct: 1 }] },
        { id: 4, name: "Биологический факультет", description: "Ботаника, зоология и генетика", position: { x: 15, y: 35 }, icon: "🧬", requiredScore: 4, tasks: [{ question: "Органелла фотосинтеза?", options: ["Митохондрия", "Хлоропласт", "Ядро", "Рибосома"], correct: 1 }] },
        { id: 5, name: "Библиотека знаний", description: "История, литература и искусство", position: { x: 85, y: 35 }, icon: "📚", requiredScore: 6, tasks: [{ question: "Кто написал 'Войну и мир'?", options: ["Достоевский", "Пушкин", "Толстой", "Чехов"], correct: 2 }] },
        { id: 6, name: "Компьютерный центр", description: "Программирование и алгоритмы", position: { x: 50, y: 45 }, icon: "💻", requiredScore: 8, tasks: [{ question: "Язык для веб-страниц?", options: ["Python", "C++", "JavaScript", "Java"], correct: 2 }] },
        { id: 7, name: "Спортивный комплекс", description: "Физкультура и здоровье", position: { x: 35, y: 20 }, icon: "🏃", requiredScore: 10, tasks: [{ question: "Игроков в футбольной команде?", options: ["9", "10", "11", "12"], correct: 2 }] },
        { id: 8, name: "Главный Ректорат", description: "Финальное испытание!", position: { x: 50, y: 15 }, icon: "🎓", requiredScore: 12, tasks: [{ question: "Столица Франции?", options: ["Лондон", "Берлин", "Париж", "Мадрид"], correct: 2 }] }
    ];
    pathsData = [
        { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 },
        { from: 3, to: 5 }, { from: 2, to: 6 }, { from: 3, to: 6 },
        { from: 4, to: 7 }, { from: 5, to: 7 }, { from: 6, to: 7 }, { from: 7, to: 8 }
    ];
}

// ============================================
// СИСТЕМА ПРОГРЕССА (localStorage)
// ============================================
function loadProgress() {
    const saved = localStorage.getItem('piglet_progress');
    if (saved) {
        try {
            gameProgress = JSON.parse(saved);
        } catch (e) {
            console.error('Ошибка загрузки прогресса:', e);
        }
    }
}

function saveProgress() {
    localStorage.setItem('piglet_progress', JSON.stringify(gameProgress));
}

function resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
        gameProgress = {
            completedLevels: [],
            totalScore: 0,
            settings: gameProgress.settings
        };
        saveProgress();
        alert('Прогресс сброшен!');
        location.reload();
    }
}

// ============================================
// НАСТРОЙКИ
// ============================================
function initSettings() {
    const musicVol = document.getElementById('music-volume');
    const sfxVol = document.getElementById('sfx-volume');
    const darkTheme = document.getElementById('dark-theme');
    const animations = document.getElementById('animations-enabled');

    if (musicVol) {
        musicVol.value = gameProgress.settings.musicVolume;
        musicVol.addEventListener('input', (e) => {
            gameProgress.settings.musicVolume = e.target.value;
            document.getElementById('music-volume-value').textContent = e.target.value + '%';
            saveProgress();
        });
    }

    if (sfxVol) {
        sfxVol.value = gameProgress.settings.sfxVolume;
        sfxVol.addEventListener('input', (e) => {
            gameProgress.settings.sfxVolume = e.target.value;
            document.getElementById('sfx-volume-value').textContent = e.target.value + '%';
            saveProgress();
        });
    }

    if (darkTheme) {
        darkTheme.checked = gameProgress.settings.darkTheme;
        if (gameProgress.settings.darkTheme) {
            toggleDarkTheme();
        }
    }

    if (animations) {
        animations.checked = gameProgress.settings.animations;
        if (!gameProgress.settings.animations) {
            toggleAnimations();
        }
    }
}

function applySettings() {
    if (gameProgress.settings.darkTheme) {
        document.body.classList.add('dark-theme');
    }
    if (!gameProgress.settings.animations) {
        document.body.classList.add('no-animations');
    }
}

function toggleDarkTheme() {
    gameProgress.settings.darkTheme = document.getElementById('dark-theme').checked;
    document.body.classList.toggle('dark-theme', gameProgress.settings.darkTheme);
    saveProgress();
}

function toggleAnimations() {
    gameProgress.settings.animations = document.getElementById('animations-enabled').checked;
    document.body.classList.toggle('no-animations', !gameProgress.settings.animations);
    saveProgress();
}

// ============================================
// НАВИГАЦИЯ
// ============================================
function openScreen(screenName) {
    const screen = document.getElementById(screenName + '-screen');
    if (screen) {
        screen.classList.add('active');
    }
}

function closeScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeScreens();
        closeLevelPopup();
        closeLockedPopup();
        hideCampusMap();
    }
});

// ============================================
// КАРТА КАМПУСА
// ============================================
function showCampusMap() {
    const map = document.getElementById('campus-map');
    const menu = document.getElementById('main-menu');
    if (!map) return;

    map.classList.add('active');
    if (menu) menu.style.display = 'none';
    renderMap();
    updatePlayerInfo();
}

function hideCampusMap() {
    const map = document.getElementById('campus-map');
    const menu = document.getElementById('main-menu');
    if (map) {
        map.classList.remove('active');
    }
    if (menu) menu.style.display = 'flex';
}

function renderMap() {
    const levelsContainer = document.getElementById('map-levels');
    const pathsContainer = document.getElementById('map-paths');
    
    if (!levelsContainer || !pathsContainer) return;
    
    levelsContainer.innerHTML = '';
    pathsContainer.innerHTML = '';
    
    // Рисуем пути
    pathsData.forEach(path => {
        const fromLevel = levelsData.find(l => l.id === path.from);
        const toLevel = levelsData.find(l => l.id === path.to);
        
        if (!fromLevel || !toLevel) return;
        
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        const x1 = (fromLevel.position.x / 100) * pathsContainer.clientWidth;
        const y1 = (fromLevel.position.y / 100) * pathsContainer.clientHeight;
        const x2 = (toLevel.position.x / 100) * pathsContainer.clientWidth;
        const y2 = (toLevel.position.y / 100) * pathsContainer.clientHeight;
        
        pathElement.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        
        // Определяем стиль пути
        const fromCompleted = gameProgress.completedLevels.includes(path.from);
        const toCompleted = gameProgress.completedLevels.includes(path.to);
        
        if (fromCompleted && toCompleted) {
            pathElement.classList.add('path-completed');
        } else if (isLevelUnlocked(path.to)) {
            pathElement.classList.add('path-unlocked');
        }
        
        pathsContainer.appendChild(pathElement);
    });
    
    // Рисуем уровни
    levelsData.forEach(level => {
        const node = document.createElement('div');
        node.classList.add('level-node');
        node.dataset.levelId = level.id;
        
        // Определяем состояние
        const state = getLevelState(level);
        node.classList.add(`level-${state}`);
        
        // Позиционирование
        node.style.left = level.position.x + '%';
        node.style.top = level.position.y + '%';
        
        // Содержимое
        node.innerHTML = `
            <span class="level-icon">${level.icon}</span>
            <span class="level-number">${level.id}</span>
            <span class="level-name">${level.name}</span>
        `;
        
        // Обработчик клика
        node.addEventListener('click', () => handleLevelClick(level));
        
        levelsContainer.appendChild(node);
    });
}

function getLevelState(level) {
    if (gameProgress.completedLevels.includes(level.id)) {
        return 'completed';
    }
    if (isLevelUnlocked(level.id)) {
        return 'open';
    }
    return 'locked';
}

function isLevelUnlocked(levelId) {
    const level = levelsData.find(l => l.id === levelId);
    if (!level) return false;
    
    // Первый уровень всегда открыт
    if (level.requiredScore === 0) return true;
    
    // Проверяем, набран ли нужный счёт
    return gameProgress.totalScore >= level.requiredScore;
}

function handleLevelClick(level) {
    const state = getLevelState(level);
    
    if (state === 'locked') {
        showLockedPopup(level);
    } else {
        showLevelPopup(level);
    }
}

function updatePlayerInfo() {
    const totalScoreEl = document.getElementById('total-score');
    const levelsCompletedEl = document.getElementById('levels-completed');
    const levelsTotalEl = document.getElementById('levels-total');
    
    if (totalScoreEl) totalScoreEl.textContent = gameProgress.totalScore;
    if (levelsCompletedEl) levelsCompletedEl.textContent = gameProgress.completedLevels.length;
    if (levelsTotalEl) levelsTotalEl.textContent = levelsData.length;
}

// ============================================
// ПОПАП УРОВНЯ
// ============================================
function showLevelPopup(level) {
    selectedPopupLevel = level;
    
    const overlay = document.getElementById('level-popup-overlay');
    const nameEl = document.getElementById('popup-level-name');
    const iconEl = document.getElementById('popup-level-icon');
    const descEl = document.getElementById('popup-level-description');
    const statusEl = document.getElementById('popup-level-status');
    const startBtn = document.getElementById('popup-start-btn');
    
    if (!overlay || !nameEl) return;
    
    nameEl.textContent = level.name;
    iconEl.textContent = level.icon;
    descEl.textContent = level.description;
    
    const state = getLevelState(level);
    statusEl.className = 'popup-status';
    
    if (state === 'completed') {
        statusEl.classList.add('status-completed');
        statusEl.textContent = '✅ Пройден!';
        startBtn.textContent = 'ПРОЙТИ СНОВА';
    } else {
        statusEl.classList.add('status-open');
        statusEl.textContent = '🟢 Доступен';
        startBtn.textContent = 'НАЧАТЬ';
    }
    
    overlay.classList.add('active');
}

function closeLevelPopup() {
    const overlay = document.getElementById('level-popup-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    selectedPopupLevel = null;
}

// ============================================
// ПОПАП ЗАКРЫТОГО УРОВНЯ
// ============================================
function showLockedPopup(level) {
    const overlay = document.getElementById('locked-popup-overlay');
    const messageEl = document.getElementById('locked-message');
    
    if (!overlay || !messageEl) return;
    
    messageEl.textContent = `Нужно набрать ${level.requiredScore} очков, чтобы открыть этот уровень. Ваш счёт: ${gameProgress.totalScore}`;
    
    overlay.classList.add('active');
}

function closeLockedPopup() {
    const overlay = document.getElementById('locked-popup-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// ============================================
// ИГРОВОЙ ПРОЦЕСС
// ============================================
function startLevel() {
    if (!selectedPopupLevel) return;
    
    closeLevelPopup();
    
    currentLevel = selectedPopupLevel;
    currentQuestion = 0;
    levelScore = 0;
    
    // Показываем экран игры
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;
    
    // Скрываем карту
    hideCampusMap();
    
    // Устанавливаем заголовок
    document.getElementById('game-level-name').textContent = currentLevel.name;
    document.getElementById('game-level-icon').textContent = currentLevel.icon;
    
    // Показываем вопрос
    showQuestion();
    
    // Показываем экран
    gameScreen.classList.add('active');
    
    // Скрываем результат, показываем вопросы
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
}

function showQuestion() {
    if (!currentLevel || currentQuestion >= currentLevel.tasks.length) {
        showResult();
        return;
    }
    
    const task = currentLevel.tasks[currentQuestion];
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const progressFill = document.getElementById('level-progress-fill');
    
    if (questionNumber) questionNumber.textContent = `Вопрос ${currentQuestion + 1} из ${currentLevel.tasks.length}`;
    if (questionText) questionText.textContent = task.question;
    
    // Обновляем прогресс
    if (progressFill) {
        progressFill.style.width = ((currentQuestion) / currentLevel.tasks.length * 100) + '%';
    }
    
    // Создаём кнопки вариантов
    optionsContainer.innerHTML = '';
    task.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(btn);
    });
    
    // Анимация персонажа - задумчивость
    updateGameCharacter('thinking');
}

function selectAnswer(selectedIndex) {
    const task = currentLevel.tasks[currentQuestion];
    const optionBtns = document.querySelectorAll('.option-btn');
    
    // Отключаем все кнопки
    optionBtns.forEach(btn => btn.disabled = true);
    
    // Показываем правильный/неправильный ответ
    optionBtns.forEach((btn, index) => {
        if (index === task.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== task.correct) {
            btn.classList.add('wrong');
        }
    });
    
    // Обновляем счёт
    if (selectedIndex === task.correct) {
        levelScore++;
        updateGameCharacter('happy');
    } else {
        updateGameCharacter('sad');
    }
    
    // Переходим к следующему вопросу
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}

function showResult() {
    const questionContainer = document.getElementById('question-container');
    const resultContainer = document.getElementById('result-container');
    const progressFill = document.getElementById('level-progress-fill');
    
    // Скрываем вопросы, показываем результат
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    
    // Полный прогресс
    if (progressFill) progressFill.style.width = '100%';
    
    const totalQuestions = currentLevel.tasks.length;
    const percentage = Math.round((levelScore / totalQuestions) * 100);
    
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const resultScore = document.getElementById('result-score');
    const nextBtn = document.querySelector('.next-btn');
    
    // Определяем результат
    const passed = percentage >= 50;
    
    if (passed) {
        resultIcon.textContent = '🎉';
        resultTitle.textContent = 'Поздравляем!';
        resultMessage.textContent = `Вы прошли "${currentLevel.name}"!`;
        resultTitle.style.color = '#4CAF50';
        
        // Обновляем прогресс
        if (!gameProgress.completedLevels.includes(currentLevel.id)) {
            gameProgress.completedLevels.push(currentLevel.id);
            gameProgress.totalScore += levelScore;
            saveProgress();
        }
        
        // Конфетти!
        createConfetti();
        
        // Персонаж радуется
        updateGameCharacter('happy');
        
        // Проверяем, есть ли следующий уровень
        const nextLevel = levelsData.find(l => l.id === currentLevel.id + 1);
        if (nextLevel && isLevelUnlocked(nextLevel.id)) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = '➡ Следующий уровень';
        } else if (nextLevel) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = '➡ Далее';
        } else {
            // Последний уровень
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = '🏆 Вы победили!';
        }
    } else {
        resultIcon.textContent = '😢';
        resultTitle.textContent = 'Не получилось...';
        resultMessage.textContent = 'Попробуйте ещё раз!';
        resultTitle.style.color = '#f44336';
        
        // Персонаж грустит
        updateGameCharacter('sad');
        
        nextBtn.style.display = 'none';
    }
    
    resultScore.textContent = `Правильных ответов: ${levelScore} из ${totalQuestions} (${percentage}%)`;
}

function retryLevel() {
    if (!currentLevel) return;
    currentQuestion = 0;
    levelScore = 0;
    
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
    
    showQuestion();
}

function nextLevel() {
    const nextLevel = levelsData.find(l => l.id === currentLevel.id + 1);
    
    if (nextLevel) {
        currentLevel = nextLevel;
        currentQuestion = 0;
        levelScore = 0;
        
        document.getElementById('game-level-name').textContent = currentLevel.name;
        document.getElementById('game-level-icon').textContent = currentLevel.icon;
        
        document.getElementById('question-container').style.display = 'block';
        document.getElementById('result-container').style.display = 'none';
        
        showQuestion();
    } else {
        // Нет следующего уровня - возвращаемся на карту
        goToMap();
    }
}

function goToMap() {
    closeScreens();
    setTimeout(() => {
        showCampusMap();
    }, 300);
}

// ============================================
// ПЕРСОНАЖ
// ============================================
function updateGameCharacter(mood) {
    const character = document.getElementById('game-character');
    if (!character) return;
    
    // Удаляем предыдущие классы
    character.classList.remove('happy', 'sad', 'thinking');
    
    switch (mood) {
        case 'happy':
            character.classList.add('happy');
            break;
        case 'sad':
            character.classList.add('sad');
            break;
        case 'thinking':
            character.classList.add('thinking');
            break;
    }
}

// ============================================
// КОНФЕТТИ
// ============================================
function createConfetti() {
    const container = document.createElement('div');
    container.classList.add('confetti-container');
    document.body.appendChild(container);
    
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7AA', '#FF9800', '#2196F3'];
    const shapes = ['■', '●', '▲', '★', '♦'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            container.appendChild(confetti);
            
            // Удаляем после анимации
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 50);
    }
    
    // Удаляем контейнер
    setTimeout(() => {
        container.remove();
    }, 5000);
}

// ============================================
// АДАПТИВНОСТЬ - ПЕРЕРИСОВКА КАРТЫ
// ============================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const map = document.getElementById('campus-map');
        if (map && map.classList.contains('active')) {
            renderMap();
        }
    }, 250);
});

// ============================================
// УТИЛИТЫ
// ============================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
