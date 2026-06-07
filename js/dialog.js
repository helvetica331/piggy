        let gameState = 1;
        let isMonitorClickable = false;

        const piggySprite = document.getElementById('piggy-sprite');
        const piggyText = document.getElementById('piggy-text');
        const piggyBubble = document.getElementById('piggy-bubble');
        const calcBubble = document.getElementById('calc-bubble');
        const calcText = document.getElementById('calc-text');
        const pcOff = document.getElementById('pc-off');
        const pcOn = document.getElementById('pc-on');
        const monitorHint = document.getElementById('monitor-hint');
        const nextBtn = document.getElementById('next-btn');
        const calculator = document.getElementById('calculator');
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        const infoOverlay = document.getElementById('info-overlay');

        const sndError = document.getElementById('snd-error');
        const sndPcOn = document.getElementById('snd-pc-on');

        function playSound(audioEl) {
            if(audioEl) { audioEl.currentTime = 0; audioEl.play().catch(e => {}); }
        }

        // Проверка: если головоломка уже решена — сразу запускаем этап 4
        window.addEventListener('DOMContentLoaded', function() {
            // Сценарий 1: Игрок решил головоломку
            if (localStorage.getItem('puzzleSolved') === 'true') {
                localStorage.removeItem('puzzleSolved');
                
                pcOff.style.display = 'none';
                pcOn.style.display = 'block';
                
                piggySprite.src = "details/Happy2.png";
                piggyBubble.style.display = 'block';
                piggyText.innerText = "Ура! Работает! Спасибо вам, господин Калькулятор! Вы гений!";
                calcText.innerText = "Да мы просто монстры!";
                
                calculator.classList.add('visible');
                calcBubble.style.display = 'none';
                
                gameState = 9;
                nextBtn.innerText = "Далее";
                nextBtn.style.display = 'flex';
                
                playSound(sndPcOn);
            }
            // Сценарий 2: Игрок сдался и вернулся без победы
            else if (localStorage.getItem('puzzleQuit') === 'true') {
                localStorage.removeItem('puzzleQuit');
                
                // Свинья грустная
                piggySprite.src = "details/Sad2.png";
                piggyBubble.style.display = 'block';
                calcBubble.style.display = 'block';
                piggyText.innerText = "Эх... Ты так быстро сдаёшься? Давай попробуем ещё раз! Я верю в тебя!";
                calcText.innerText = "Думаю, что стоит попробовать ещё раз...";
                
                // Калькулятор всё ещё виден
                calculator.classList.add('visible');
                calcBubble.style.display = 'none';
                
                // Возвращаем на этап перед головоломкой, чтобы можно было попробовать снова
                gameState = 6;
                nextBtn.innerText = "Попробовать ещё раз";
                nextBtn.style.display = 'flex';
            }
        });

        function nextStep() {
            switch(gameState) {
                case 1:
                    gameState = 2;
                    piggyText.innerText = "Помоги мне включить этот компьютер, мне срочно нужно проверить расписание!";
                    nextBtn.style.display = 'none';
                    monitorHint.style.display = 'block';
                    isMonitorClickable = true;
                    break;

                case 3:
                    gameState = 4;
                    calculator.classList.add('visible');
                    calcBubble.style.display = 'block';
                    calcText.innerText = "Здравствуй, юный студент. Я — Калькулятор. Вижу, у тебя проблемы с электричеством?";
                    piggyBubble.style.display = 'none';
                    nextBtn.innerText = "Далее";
                    nextBtn.style.display = 'flex';
                    break;
            
                case 4:
                    gameState = 5;
                    calcBubble.style.display = 'none';
                    piggyBubble.style.display = 'block';
                    piggyText.innerText = "Ой, здравствуйте! Да, помогите, пожалуйста!";
                    break;
            
                case 5:
                    gameState = 6;
                    piggyBubble.style.display = 'none';
                    calcBubble.style.display = 'block';
                    calcText.innerText = "Тогда слушай внимательно. Нам нужно соединить провода, чтобы пустить ток к системному блоку.";
                    nextBtn.innerText = "Понятно, начать головоломку";
                    break;
            
                case 6:
                    // Если игрок сдался и вернулся — кнопка "Попробовать ещё раз" ведёт сюда
                    puzzleOverlay.style.display = 'flex';
                    calcBubble.style.display = 'block';
                    calcText.innerText = "Думаю, что стоит попробовать ещё раз...";
                    break;
            
                case 8:
                    gameState = 9;
                    calcBubble.style.display = 'none';
                    piggyBubble.style.display = 'block';
                    piggySprite.src = "details/Happy2.png";
                    piggyText.innerText = "Ура! Работает! Спасибо вам, господин Калькулятор! Вы гений!";
                    break;
            
                case 9:
                    gameState = 10;
                    piggyBubble.style.display = 'none';
                    calcBubble.style.display = 'block';
                    calcText.innerText = "Не за что. Логика — основа всего. Теперь ты готов узнать, куда попал.";
                    nextBtn.innerText = "Что это за место?";
                    break;
            
                case 10:
                    infoOverlay.style.display = 'flex';
                    break;
            }
        }

        document.getElementById('main-pc').addEventListener('click', function() {
            if (!isMonitorClickable) return;
            isMonitorClickable = false;
            monitorHint.style.display = 'none';

            pcOff.style.display = 'none';
            pcOn.style.display = 'block';
            playSound(sndError);

            setTimeout(() => {
                pcOn.style.display = 'none';
                pcOff.style.display = 'block';
                
                gameState = 3;
                piggySprite.src = "details/Sad2.png";
                piggyText.innerText = "Ой... Опять сломался. Я ничего не понимаю...";
                piggyBubble.style.display = 'block';
                nextBtn.innerText = "Далее";
                nextBtn.style.display = 'flex';
            }, 1000);
        });

        function startPuzzle() {
            window.location.href = 'task-IKNT.html';
        }

        function solvePuzzle() {
            puzzleOverlay.style.display = 'none';
            gameState = 8;
            pcOff.style.display = 'none';
            pcOn.style.display = 'block';
            playSound(sndPcOn);
            nextBtn.innerText = "Далее";
            nextBtn.style.display = 'flex';
            nextStep();
        }