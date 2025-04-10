
//cons
const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const oranges = document.querySelectorAll('.orange');
const startButtons = document.querySelectorAll('.start_button');
const startOverlay = document.querySelector('.start_dimmed');
const timerBar = document.getElementById('time');
const gameBoard = document.querySelector('.game');
const lifeDisplay = document.querySelector('.life');
const highScoreDisplay = document.querySelector('.highscore');
const endScene = document.querySelector('.end_scene');
const finalScoreDisplay = document.querySelector('.final-score');
const playAgainBtn = document.getElementById('playAgainBtn');
const shareNowBtn = document.getElementById('shareNowBtn');
const endNowBtn = document.getElementById('endNowBtn');
const resumeBtn = document.getElementById('resumeBtn'); 
//let
let lastHole;
let timeUp = false;
let score = 0;
let gameTime = 30000;
let speed = 1000;
let mode = 'classic';
let lives = 3;
let missedHits = 0;
let multiplier = 1;
let endlessInterval;
let isPaused = false; 
let peepInterval;
let timerInterval;
let startTime = Date.now(); 
let elapsedTime = 0; 
//music
// const gameMusic = new Audio();
// gameMusic.preload = 'auto';
const orangePopSound = new Audio('sounds/orange_popp.mp3');
orangePopSound.preload = 'auto';
orangePopSound.volume = 0.05;
const orangeHitSound = new Audio('sounds/orange_hittt.mp3');
orangeHitSound.preload = 'auto';
orangeHitSound.volume = 0.10;
const buttonClickSound = new Audio('sounds/button_click.mp3');
buttonClickSound.preload = 'auto';
const scissorCloseSound = new Audio('sounds/scissor.mp3');
scissorCloseSound.preload = 'auto';
scissorCloseSound.volume = 0.2;
const gameEndSound = new Audio('sounds/game-over.mp3');
gameEndSound.preload = 'auto';
gameEndSound.volume = 0.13;

// gameMusic.loop = true;
// gameMusic.volume = 0.3;

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) return randomHole(holes);
    lastHole = hole;
    return hole;
}
//peep func
function peep() {
    if (timeUp || isPaused) return; 
    const time = randomTime(speed / 2, speed);
    const hole = randomHole(holes);
    const orange = hole.querySelector('.orange');

    hole.classList.add('up');
    orange.classList.add('slide-in');
    orangePopSound.play();

    setTimeout(() => {
        hole.classList.remove('up');
        orange.classList.remove('slide-in');

        if (!timeUp && !isPaused) peep(); 
    }, time);
}
// starter
function startGame() {
    score = 0;
    missedHits = 0;
    scoreBoard.textContent = score;
    timeUp = false;
    multiplier = 1;
    lives = mode === 'survival' ? 3 : Infinity;
    updateLife();
    initializeHighScore();
    timerBar.style.width = '100%';

    peep();
    startTimer();

    elapsedTime = 0; 
    startTime = Date.now(); 

    startOverlay.style.display = 'none'; 
    if (mode === 'classic') {
        let speedInterval = setInterval(() => {
            if (gameTime <= 0) clearInterval(speedInterval);
            else speed -= 45;
        }, 10000);

        setTimeout(() => {
            endGame();
        }, gameTime);

    } else if (mode === 'survival') {
        const survivalInterval = setInterval(() => {
            if (lives <= 0 || missedHits >= 3) { 
                clearInterval(survivalInterval);
                endGame();
            }
        }, 1000);

    } else if (mode === 'endless') {
        endlessInterval = setInterval(() => {
            activateBonusRound();
        }, 20000); 
    }
}

//end func
endNowBtn.addEventListener('click', () => {
    endGame(); 
});

function endGame() {
    gameEndSound.play();
    timeUp = true;
    updateHighScore();
    clearInterval(endlessInterval);
    clearInterval(timerInterval); 
    clearInterval(peepInterval);
    finalScoreDisplay.textContent = score;
    endScene.classList.add('show');
    gameMusic.pause();
    

   
}

function updateLife() {
    lifeDisplay.textContent = (lives === Infinity) ? '∞' : ` ${lives}`;
}

function resetTimer() {
    timerBar.style.width = '100%'; 
    if (timerInterval) {
        clearInterval(timerInterval); 
    }
}
//timer slide
function startTimer() {
    if (mode !== 'classic') return;
    let remainingTime = gameTime - elapsedTime;
    let width = 100;
    const interval = 200;
    const decrement = (interval / gameTime) * 100;

  

    timerInterval = setInterval(() => {
        if (isPaused) return;
        elapsedTime = Date.now() - startTime;
        width -= decrement;
        if (width <= 0) {
            clearInterval(timerInterval);
            timerBar.style.width = '0%';
        } else {
            timerBar.style.width = width + '%';
        }
    }, interval);
}
//scor func
function initializeHighScore() {
    let highScore = localStorage.getItem(mode + '_highScore') || 0;
    highScoreDisplay.textContent = ` ${highScore}`;
}

function updateHighScore() {
    let stored = localStorage.getItem(mode + '_highScore') || 0;
    if (score > stored) {
        localStorage.setItem(mode + '_highScore', score);
        highScoreDisplay.textContent = ` ${score}`;
    }
}
//button func
startButtons.forEach(button => {
    button.addEventListener('click', () => {
        buttonClickSound.play();

        if (button.classList.contains('-classic')) {
            mode = 'classic';
            gameTime = 30000;
            speed = 1000;
        } else if (button.classList.contains('-survival')) {
            mode = 'survival';
            gameTime = 0;
            speed = 1200;
        } else if (button.classList.contains('-endless')) {
            mode = 'endless';
            gameTime = 0;
            speed = 1000;
        }

        startOverlay.style.display = 'none';
        gameBoard.style.cursor = "url('images/scissor3.png'), auto";
        startGame();

        

        
    });
});
//orange up func
oranges.forEach(orange => {
    orange.addEventListener('click', (e) => {
        if (!e.target.closest('.hole.up')) return;

        orangeHitSound.play();
        score += 1 * multiplier;
        scoreBoard.textContent = score;

        orange.style.backgroundImage = "url('images/orange_shocked.png')";
        setTimeout(() => {
            orange.style.backgroundImage = "url('images/orange_smile.png')";
        }, 400);

        
    });
});
//hole func
holes.forEach(hole => {
    hole.addEventListener('click', () => {
        scissorCloseSound.play();
        gameBoard.style.cursor = "url('images/scissor_close.png'), auto";
        setTimeout(() => {
            gameBoard.style.cursor = "url('images/scissor3.png'), auto";
        }, 400);

        if (mode === 'survival' && !hole.querySelector('.orange').classList.contains('up')) {
            missedHits++;
            if (missedHits >= 3) {
                lives--;
                missedHits = 0;
                updateLife();
                if (lives <= 0) endGame();
            }
        }
    });
});
//onus func
function activateBonusRound() {
    multiplier = 2;
    scoreBoard.classList.add('bonus-active');
    const bonusNotice = document.createElement('div');
    bonusNotice.textContent = "🔥 Double Points!";
    bonusNotice.className = 'bonus-alert';
    document.body.appendChild(bonusNotice);

    setTimeout(() => {
        multiplier = 1;
        scoreBoard.classList.remove('bonus-active');
        bonusNotice.remove();
    }, 10000);
}
//play overlay
playAgainBtn.addEventListener('click', () => {
    endScene.classList.remove('show');
    setTimeout(() => {
        startOverlay.style.display = 'flex';
        startOverlay.classList.add('fade-in');
    }, 300);
});

shareNowBtn.addEventListener('click', () => {
    const tweetText = `I just scored ${score} points in Orange Whack game 🍊made by @0xTowhid. Can you beat me?`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
});

//dom act
document.addEventListener('DOMContentLoaded', () => {
    startOverlay.style.display = 'flex';
    startOverlay.classList.add('fade-in'); 
});
//pause
pauseBtn.addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
        pauseBtn.textContent = "Pause";
        gameMusic.play();
        startTime = Date.now() - elapsedTime;
        startTimer(); 
        peep();
    } else {
        isPaused = true;
        pauseBtn.textContent = "Resume";
        gameMusic.pause();
        clearInterval(timerInterval);
        clearInterval(peepInterval); 
    }
});

//rules pop
const gameRuleBtn = document.getElementById('gameRuleBtn');
const gameRulePopup = document.getElementById('gameRulePopup');
const closeBtn = gameRulePopup.querySelector('.close-btn');

gameRuleBtn.addEventListener('click', () => {
  gameRulePopup.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  gameRulePopup.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === gameRulePopup) {
    gameRulePopup.style.display = 'none';
  }
});

