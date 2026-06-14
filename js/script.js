// ============================================
// КОНФИГУРАЦИЯ И СОСТОЯНИЕ
// ============================================
const SETTINGS_KEY = 'smartPiggy_settings';
const PROGRESS_KEY = 'piglet_progress';

const defaultSettings = {
    darkTheme: false,
    animations: true,
    musicVolume: 50,
    sfxVolume: 70
};

let settings = { ...defaultSettings };

// ============================================
// РАБОТА С LOCALSTORAGE
// ============================================
function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            settings = { ...defaultSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ============================================
// ПРИМЕНЕНИЕ НАСТРОЕК К UI
// ============================================
function applyTheme() {
    if (settings.darkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function applyAnimations() {
    if (!settings.animations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }
}

function updateUI() {
    const darkThemeCheckbox = document.getElementById('dark-theme');
    const animCheckbox = document.getElementById('animations-enabled');
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    const musicValue = document.getElementById('music-value');
    const sfxValue = document.getElementById('sfx-value');
    
    if (darkThemeCheckbox) darkThemeCheckbox.checked = settings.darkTheme;
    if (animCheckbox) animCheckbox.checked = settings.animations;
    if (musicSlider) {
        musicSlider.value = settings.musicVolume;
        if (musicValue) musicValue.textContent = settings.musicVolume;
    }
    if (sfxSlider) {
        sfxSlider.value = settings.sfxVolume;
        if (sfxValue) sfxValue.textContent = settings.sfxVolume;
    }
}

// ============================================
// НАВИГАЦИЯ (МОДАЛЬНЫЕ ОКНА)
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
    }
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Загружаем и применяем настройки при старте
    loadSettings();
    applyTheme();
    applyAnimations();
    updateUI();

    // 2. Переключение тёмной темы
    const darkThemeToggle = document.getElementById('dark-theme');
    if (darkThemeToggle) {
        darkThemeToggle.addEventListener('change', (e) => {
            settings.darkTheme = e.target.checked;
            applyTheme();
            saveSettings();
        });
    }

    // 3. Переключение анимаций
    const animToggle = document.getElementById('animations-enabled');
    if (animToggle) {
        animToggle.addEventListener('change', (e) => {
            settings.animations = e.target.checked;
            applyAnimations();
            saveSettings();
        });
    }

    // 4. Громкость музыки
    const musicSlider = document.getElementById('music-volume');
    const musicValue = document.getElementById('music-value');
    if (musicSlider) {
        musicSlider.addEventListener('input', (e) => {
            settings.musicVolume = e.target.value;
            if (musicValue) musicValue.textContent = e.target.value;
            saveSettings();
        });
    }

    // 5. Громкость эффектов
    const sfxSlider = document.getElementById('sfx-volume');
    const sfxValue = document.getElementById('sfx-value');
    if (sfxSlider) {
        sfxSlider.addEventListener('input', (e) => {
            settings.sfxVolume = e.target.value;
            if (sfxValue) sfxValue.textContent = e.target.value;
            saveSettings();
        });
    }

    // 6. Сброс прогресса
    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
                localStorage.removeItem(PROGRESS_KEY);
                localStorage.removeItem(SETTINGS_KEY);
                alert('Прогресс сброшен!');
                location.reload();
            }
        });
    }

    // 7. Блокировка перетаскивания картинок
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', e => e.preventDefault());
    });
});