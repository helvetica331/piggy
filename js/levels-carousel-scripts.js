// Инициализация переменных
let currentSlide = 0; // Индекс текущего слайда
const slides = document.querySelectorAll('.slide'); // Получение всех слайдов
const indicators = document.querySelectorAll('.indicator'); // Получение всех индикаторов
const carousel = document.getElementById('carousel'); // Получение элемента карусели
const largeCardImage = document.getElementById('largeCardImage'); // Получение элемента большой карты

// Массив с изображениями для большой карты
const largeCardImages = [
    'details/referens/Дизайн ИКНТ.png',       // Вместо 'details/IKNT_Cards/Rectangle 3.png'
    'details/referens/Дизайн Биохим.png',      // Для первой маленькой картинки
    'details/referens/Дизайн последней карточки.png',
    'details/referens/Дизайн последней карточки.png'
];

// Функция обновления карусели
function updateCarousel() {
    // Обновление индикаторов
    indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
            // Добавление класса активного индикатора
            indicator.classList.add('active');
        } else {
            // Удаление класса активного индикатора
            indicator.classList.remove('active');
        }
    });
    
    // Обновление большой карты сверху
    updateLargeCard(currentSlide);
}

// Функция обновления большой карты
function updateLargeCard(slideIndex) {
    // Изменяем изображение большой карты в зависимости от выбранной маленькой карты
    largeCardImage.src = largeCardImages[slideIndex];
    largeCardImage.alt = `Большая карта ${slideIndex + 1}`;
}

// Функция для перехода к следующему слайду
function nextSlide() {
    // Циклический переход к следующему слайду
    currentSlide = (currentSlide + 1) % largeCardImages.length;
    updateCarousel();
}

// Функция для перехода к предыдущему слайду
function prevSlide() {
    // Циклический переход к предыдущему слайду
    currentSlide = (currentSlide - 1 + largeCardImages.length) % largeCardImages.length;
    updateCarousel();
}

// Функция для перехода к конкретному слайду по индексу
function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

// Функция для выбора карты кликом
function selectCard(index) {
    currentSlide = index;
    updateCarousel();
}

// Функция начала игры
function startGame() {
    // Отображение сообщения с номером выбранной карточки
    alert("Запуск игры с карточкой #" + (currentSlide + 1));
}

// Функция перехода на страницу предмета
function goToSubjectPage() {
    // Определяем текущий индекс слайда для определения нужной страницы
    switch(currentSlide) {
        case 0:
            window.location.href = 'IKNT-dialog.html'; // Страница химии
            break;
        case 1:
            window.location.href = 'task-biology.html'; // Страница биологии
            break;
        case 2:
            // Выводим сообщение для 3-й картинки (предпоследней)
            alert("Извините, ещё не готов...");
            break;
        case 3:
            // Выводим сообщение для 4-й картинки (последней)
            alert("Извините, ещё не готов...");
            break;
        default:
            window.location.href = 'task-biology.html'; // По умолчанию страница биологии
    }
}

// Функция возврата на главную страницу
function goBack() {
    // Перенаправление на главную страницу
    window.location.href = 'index.html';
}

// Обработка клавиатурных сокращений для навигации по карусели
document.addEventListener('keydown', (e) => {
    const isCarouselFocused = document.activeElement === carousel || carousel.contains(document.activeElement);
    
    if (isCarouselFocused) {
        if (e.key === 'ArrowRight') {
            nextSlide(); // Переход к следующему слайду
        } else if (e.key === 'ArrowLeft') {
            prevSlide(); // Переход к предыдущему слайду
        }
    }
});

// Инициализация карусели при загрузке окна
window.addEventListener('load', () => {
    updateCarousel();
});