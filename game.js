const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

// Puntuaciones y vidas
const scoreboard = document.getElementById('score');
const curr = document.getElementById('currscore');
const livesDisplay = document.getElementById('lives');
const restartButton = document.getElementById('restart'); // Botón de reinicio
const startButton = document.getElementById('start'); // Botón de inicio

// Tamaño del bloque
const box = 30;

// Inicializa el juego
let snake, food, score, lives, d, game;
let immune = false; // Estado de inmunidad
let immuneTimeout; // Temporizador para la inmunidad

// Función para crear y mostrar corazones
function createHearts() {
    livesDisplay.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        livesDisplay.appendChild(heart);
    }
}

// Función para reiniciar el juego
function restartGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
    score = 0;
    lives = 3;
    d = undefined;
    immune = false; // Reiniciar estado de inmunidad

    curr.innerHTML = '0';
    scoreboard.innerHTML = 'HIGH SCORE: ' + (localStorage.getItem('score') || 0);
    createHearts(); // Crear y mostrar los corazones

    restartButton.style.display = 'none'; // Ocultar botón de reinicio
    startButton.style.display = 'none'; // Ocultar botón de inicio
    clearInterval(game); // Limpiar intervalos previos
    game = setInterval(draw, 150); // Reiniciar el juego
}

// Capturamos el evento del botón de inicio
startButton.addEventListener('click', restartGame);

// Capturamos el evento del botón de reinicio
restartButton.addEventListener('click', restartGame);

// Controles del juego
document.addEventListener('keydown', direction);

function direction(event) {
    let key = event.keyCode;
    if (key == 37 && d != 'RIGHT') d = 'LEFT';
    else if (key == 38 && d != 'DOWN') d = 'UP';
    else if (key == 39 && d != 'LEFT') d = 'RIGHT';
    else if (key == 40 && d != 'UP') d = 'DOWN';
}

// Función para dibujar el juego
function draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 600);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(0, 0, 600, 600);

    // Dibujamos la serpiente del jugador
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i == 0 ? (immune ? "lightgreen" : "green") : "white"; // Cambia de color si está inmune
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "red";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);

        // Dibujar ojos en la cabeza de la serpiente del jugador
        if (i == 0) drawEyes(snake[i].x, snake[i].y);
    }

    // Dibujamos la comida
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Movimiento de la serpiente del jugador
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Si el jugador come la comida
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        curr.innerHTML = score;
        playSound('eat'); // Sonido al comer
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
    } else {
        snake.pop();
    }

    // Nueva cabeza para el jugador
    let newHead = { x: snakeX, y: snakeY };

    // Colisiones del jugador con los límites o con su cuerpo
    if (snakeX < 0 || snakeX >= 600 || snakeY < 0 || snakeY >= 600 || collision(newHead, snake)) {
        if (!immune) { // Solo restar vida si no está inmune
            lives--; // Perder una vida
            createHearts(); // Actualizar corazones
            immune = true; // Activar inmunidad
            playSound('loseLife'); // Sonido al perder vida
            startImmunePeriod(); // Iniciar periodo de inmunidad

            // Animación de pérdida de vida
            animateHeartLoss(); // Llamar a la función de animación
        }

        if (lives <= 0) {
            clearInterval(game);
            playSound('gameOver'); // Sonido al terminar
            restartButton.style.display = 'block'; // Mostrar botón de reinicio
            return;
        }
    }

    snake.unshift(newHead);
}

// Función para detectar colisiones
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Función para dibujar los ojos en la serpiente
function drawEyes(x, y) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + 5, y + 5, 3, 0, Math.PI * 2);
    ctx.arc(x + 20, y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Función para reproducir sonidos
function playSound(action) {
    const audio = new Audio(`${action}.mp3`);
    audio.play();
}

// Función para iniciar el periodo de inmunidad
function startImmunePeriod() {
    immuneTimeout = setTimeout(() => {
        immune = false; // Desactivar inmunidad
    }, 5000); // 5 segundos
}

// Función para animar la pérdida de vida
function animateHeartLoss() {
    const hearts = livesDisplay.querySelectorAll('.heart');
    if (hearts.length > 0) {
        hearts[lives].classList.add('lost'); // Añadir clase para animar
    }
}

// Inicializamos el juego
createHearts(); // Crear y mostrar los corazones al cargar el juego
