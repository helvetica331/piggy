// common.js - Универсальный скрипт для всех страниц
const SETTINGS_KEY = 'smartPiggy_settings';

const defaultSettings = {
    darkTheme: false,
    animations: true,
    musicVolume: 50,
    sfxVolume: 70
};

// 1. Загрузка настроек
function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
        return defaultSettings;
    }
}

// 2. Сохранение настроек
function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// 3. Применение темы и анимаций (работает на ЛЮБОЙ странице)
document.addEventListener('DOMContentLoaded', () => {
    const settings = loadSettings();

    // Применяем тёмную тему
    if (settings.darkTheme) document.body.classList.add('dark-theme');
    
    // Применяем отключение анимаций
    if (!settings.animations) document.body.classList.add('no-animations');

    // === БЛОК ДЛЯ СТРАНИЦЫ НАСТРОЕК (settings.html) ===
    // Этот код сработает ТОЛЬКО если на странице есть эти элементы
    const darkThemeToggle = document.getElementById('dark-theme');
    const animToggle = document.getElementById('animations-enabled');
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');

    if (darkThemeToggle) {
        darkThemeToggle.checked = settings.darkTheme;
        darkThemeToggle.addEventListener('change', (e) => {
            settings.darkTheme = e.target.checked;
            saveSettings(settings);
            document.body.classList.toggle('dark-theme', settings.darkTheme);
        });
    }

    if (animToggle) {
        animToggle.checked = settings.animations;
        animToggle.addEventListener('change', (e) => {
            settings.animations = e.target.checked;
            saveSettings(settings);
            document.body.classList.toggle('no-animations', !settings.animations);
        });
    }

    if (musicSlider) {
        musicSlider.value = settings.musicVolume;
        musicSlider.addEventListener('input', (e) => {
            settings.musicVolume = e.target.value;
            saveSettings(settings);
        });
    }

    if (sfxSlider) {
        sfxSlider.value = settings.sfxVolume;
        sfxSlider.addEventListener('input', (e) => {
            settings.sfxVolume = e.target.value;
            saveSettings(settings);
        });
    }
    
    // Блокировка перетаскивания картинок (полезно везде)
    document.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', e => e.preventDefault());
    });
});