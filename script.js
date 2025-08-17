class Game {
  constructor() {
    this.svg = document.getElementById('game');
    this.toastSymbolId = '#toast';
    this.scoreEl = document.getElementById('score');
    this.livesEl = document.getElementById('lives');
    this.finalScoreInfoEl = document.getElementById('final-score-info');
    this.gameOverScreenEl = document.getElementById('game-over-screen');
    this.startScreenEl = document.getElementById('start-screen');
    this.startButton = document.getElementById('start-button');
    this.restartButton = document.getElementById('restart-button');
    this.toasts = [];
    this.score = 0;
    this.spawnInterval = 2000;
    this.remainingLives = 5;
    this.gameOver = false;
    this.gameStarted = false;
    this.gameStartTime = 0;
    this.clickSound = new Audio('https://cdn.pixabay.com/audio/2023/08/08/audio_d47d0b9b25.mp3');
    this.missSound = new Audio('https://cdn.pixabay.com/audio/2023/08/08/audio_6e7d2e4b6b.mp3');

    this.loop = this.loop.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.startButton.addEventListener('click', this.handleStart);
    this.restartButton.addEventListener('click', this.handleRestart);
  }

  handleStart() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.gameStartTime = performance.now();
      this.startScreenEl.setAttribute('visibility', 'hidden');
      this.startSpawnTimer();
      requestAnimationFrame(this.loop);
    }
  }

  handleRestart() {
    this.gameOver = false;
    this.score = 0;
    this.remainingLives = 5;
    this.spawnInterval = 2000;
    this.gameStartTime = performance.now();
    this.scoreEl.textContent = '00000000';
    this.updateLives();
    this.gameOverScreenEl.setAttribute('visibility', 'hidden');
    this.toasts.forEach(toast => toast.el.remove());
    this.toasts = [];
    this.startSpawnTimer();
    requestAnimationFrame(this.loop);
  }

  startSpawnTimer() {
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer);
    }

    const gameTimeSeconds = (performance.now() - this.gameStartTime) / 1000;
    this.spawnInterval = Math.max(500, 2000 - Math.floor(gameTimeSeconds / 10) * 150);

    this.spawnTimer = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        this.spawnToast();
        this.startSpawnTimer();
      }
    }, this.spawnInterval);
  }

  spawnToast() {
    if (this.gameOver || !this.gameStarted) return;

    const startX = Math.random() * 350 + 50;
    const endX = Math.random() * 350 + 50;
    const peakY = 150 + Math.random() * 100;
    const duration = 2500 + Math.random() * 1000;

    const toast = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    toast.setAttribute('href', this.toastSymbolId);
    toast.setAttribute('class', 'toast');
    toast.setAttribute('x', startX);
    toast.setAttribute('y', 680);
    this.svg.appendChild(toast);

    const toastObj = {
      el: toast,
      startX,
      endX,
      startY: 680,
      peakY,
      startTime: performance.now(),
      duration,
      clicked: false,
      upwardSpeed: -10,
      reachedBottom: false
    };

    toast.addEventListener('pointerdown', () => {
      if (!this.gameOver && !toastObj.clicked) {
        this.score += 1;
        this.scoreEl.textContent = this.score.toString().padStart(8, '0');
        toastObj.clicked = true;
        this.clickSound.play().catch(() => {});
        toast.setAttribute('opacity', '0.7');
      }
    });

    this.toasts.push(toastObj);
  }

  checkGameOver() {
    if (this.remainingLives <= 0 && !this.gameOver) {
      this.gameOver = true;
      clearInterval(this.spawnTimer);
      this.gameOverScreenEl.setAttribute('visibility', 'visible');
      this.finalScoreInfoEl.textContent = `Final Score: ${this.score}`;
    }
  }

  loop(timestamp) {
    if (!this.gameStarted) {
      requestAnimationFrame(this.loop);
      return;
    }

    this.toasts = this.toasts.filter(toast => {
      const t = Math.min((timestamp - toast.startTime) / toast.duration, 1);

      if (toast.clicked) {
        const currentY = parseFloat(toast.el.getAttribute('y'));
        const newY = currentY + toast.upwardSpeed;
        toast.el.setAttribute('y', newY);
        toast.el.setAttribute('pointer-events', 'none');
        if (newY < -100) {
          toast.el.remove();
          return false;
        }
      } else {
        if (t >= 1) {
          if (!toast.reachedBottom) {
            this.remainingLives--;
            this.updateLives();
            this.checkGameOver();
            toast.reachedBottom = true;
            this.missSound.play().catch(() => {});
          }
          toast.el.remove();
          return false;
        }

        const x = toast.startX + (toast.endX - toast.startX) * t;
        const y = toast.startY - (4 * t * (1 - t)) * (toast.startY - toast.peakY);
        toast.el.setAttribute('x', x);
        toast.el.setAttribute('y', y);
      }

      return true;
    });

    if (!this.gameOver) {
      requestAnimationFrame(this.loop);
    }
  }

  updateLives() {
    this.livesEl.textContent = `${this.remainingLives}X`;
  }
}

const game = new Game();