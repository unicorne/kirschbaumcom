(function() {
  'use strict';

  /* ════════════════════════════════════════════
     FLAG MASTER — Game Engine (embeddable)
     ════════════════════════════════════════════ */

  // Detect path: if loaded from /interests/, point to own_projects/flaggame/
  const API_URL = (function() {
    const s = document.currentScript || document.querySelector('script[src*="game.js"]');
    if (s && s.src) {
      const base = s.src.substring(0, s.src.lastIndexOf('/') + 1);
      return base + 'api.php';
    }
    return 'api.php';
  })();
  const GAME_DURATION = 30;
  const FLAG_CDN = 'https://flagcdn.com/w320/';
  const DEFAULT_KEYS = ['d', 'k', 'c', 'm'];

  // ── Root element ──
  const root = document.getElementById('flaggame');

  // ── Scoped selectors ──
  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => root.querySelectorAll(sel);

  // ── Keybindings ──
  let keyBindings = loadKeyBindings();

  function loadKeyBindings() {
    try {
      const saved = JSON.parse(localStorage.getItem('flagmaster_keys'));
      if (saved && saved.length === 4) return saved;
    } catch(e) {}
    return [...DEFAULT_KEYS];
  }

  function saveKeyBindings() {
    localStorage.setItem('flagmaster_keys', JSON.stringify(keyBindings));
    updateKeyHints();
  }

  function updateKeyHints() {
    $$('.flag-card .key-hint').forEach((hint, i) => {
      hint.textContent = keyBindings[i].toUpperCase();
    });
  }

  // ── State ──
  const state = {
    screen: 'menu',
    user: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
    timeLeft: GAME_DURATION,
    timer: null,
    currentQ: null,
    nextQ: null,
    answering: false,
    questionStart: 0,
    preloaded: [],
  };

  // ── Init ──
  const saved = localStorage.getItem('flagmaster_user');
  if (saved) {
    try {
      state.user = JSON.parse(saved);
      updateAuthUI();
    } catch(e) { localStorage.removeItem('flagmaster_user'); }
  }

  $('#btn-login').addEventListener('click', handleLogin);
  $('#btn-register').addEventListener('click', handleRegister);
  $('#btn-guest').addEventListener('click', playAsGuest);
  $('#btn-logout').addEventListener('click', logout);
  $('#btn-play').addEventListener('click', startGame);
  $('#btn-again').addEventListener('click', startGame);
  $('#btn-menu').addEventListener('click', () => showScreen('menu'));

  $('#input-pass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  $$('.flag-card').forEach((card, i) => {
    card.addEventListener('click', () => handleAnswer(i));
  });

  // Settings button
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-settings-close').addEventListener('click', closeSettings);
  $('#btn-reset-keys').addEventListener('click', () => {
    keyBindings = [...DEFAULT_KEYS];
    saveKeyBindings();
    renderKeyBindingInputs();
  });

  // Key binding inputs
  $$('.key-bind-input').forEach((input, i) => {
    input.addEventListener('keydown', (e) => {
      e.preventDefault();
      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'tab' || key === 'enter') return;
      // Check for duplicates
      const dupe = keyBindings.indexOf(key);
      if (dupe !== -1 && dupe !== i) {
        keyBindings[dupe] = keyBindings[i]; // swap
        $$('.key-bind-input')[dupe].value = keyBindings[dupe].toUpperCase();
      }
      keyBindings[i] = key;
      input.value = key.toUpperCase();
      saveKeyBindings();
    });
  });

  document.addEventListener('keydown', handleKeydown);

  updateKeyHints();
  renderKeyBindingInputs();
  loadLeaderboard();
  showScreen('menu');

  // ── Settings ──
  function openSettings() {
    $('#settings-overlay').classList.add('open');
    renderKeyBindingInputs();
  }

  function closeSettings() {
    $('#settings-overlay').classList.remove('open');
  }

  function renderKeyBindingInputs() {
    $$('.key-bind-input').forEach((input, i) => {
      input.value = keyBindings[i].toUpperCase();
    });
  }

  // ── Keyboard ──
  function handleKeydown(e) {
    // Close settings on Escape
    if (e.key === 'Escape' && $('#settings-overlay').classList.contains('open')) {
      closeSettings();
      return;
    }

    if (state.screen === 'game' && !state.answering) {
      const key = e.key.toLowerCase();
      const idx = keyBindings.indexOf(key);
      if (idx !== -1) {
        e.preventDefault();
        handleAnswer(idx);
      }
    }
    if (state.screen === 'results' && e.key === 'Enter') {
      startGame();
    }
    if (state.screen === 'menu' && e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
      startGame();
    }
  }

  // ── Screen Management ──
  function showScreen(name) {
    state.screen = name;
    $$('.screen').forEach(s => s.classList.remove('active'));
    $(`#screen-${name}`).classList.add('active');
  }

  // ── Auth ──
  async function handleLogin() {
    const username = $('#input-user').value.trim();
    const password = $('#input-pass').value;
    if (!username || !password) return showMsg('Enter username and password', 'error');

    try {
      const res = await apiCall({ action: 'login', username, password });
      if (res.error) return showMsg(res.error, 'error');
      state.user = { username: res.username, token: res.token, password };
      localStorage.setItem('flagmaster_user', JSON.stringify(state.user));
      updateAuthUI();
      showMsg(`Welcome back, ${res.username}!`, 'success');
    } catch(e) {
      state.user = { username, token: null, password };
      localStorage.setItem('flagmaster_user', JSON.stringify(state.user));
      updateAuthUI();
      showMsg('Offline mode — scores saved locally', 'success');
    }
  }

  async function handleRegister() {
    const username = $('#input-user').value.trim();
    const password = $('#input-pass').value;
    if (!username || !password) return showMsg('Enter username and password', 'error');

    try {
      const res = await apiCall({ action: 'register', username, password });
      if (res.error) return showMsg(res.error, 'error');
      state.user = { username: res.username, token: res.token, password };
      localStorage.setItem('flagmaster_user', JSON.stringify(state.user));
      updateAuthUI();
      showMsg(`Account created! Welcome, ${res.username}!`, 'success');
    } catch(e) {
      state.user = { username, token: null, password };
      localStorage.setItem('flagmaster_user', JSON.stringify(state.user));
      updateAuthUI();
      showMsg('Offline mode — scores saved locally', 'success');
    }
  }

  function playAsGuest() {
    state.user = { username: 'Guest', token: null };
    updateAuthUI();
    showMsg('Playing as Guest — scores saved locally', 'success');
  }

  function logout() {
    state.user = null;
    localStorage.removeItem('flagmaster_user');
    updateAuthUI();
  }

  function updateAuthUI() {
    const authForm = $('#auth-form');
    const authLogged = $('#auth-logged');
    if (state.user) {
      authForm.style.display = 'none';
      authLogged.style.display = 'flex';
      $('#logged-username').textContent = state.user.username;
    } else {
      authForm.style.display = 'block';
      authLogged.style.display = 'none';
    }
  }

  function showMsg(text, type) {
    const el = $('#auth-msg');
    el.textContent = text;
    el.className = 'msg ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.textContent = ''; el.className = 'msg'; }, 4000);
  }

  // ── API ──
  async function apiCall(data) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  // ── Leaderboard ──
  async function loadLeaderboard() {
    try {
      const res = await fetch(`${API_URL}?action=leaderboard`);
      const data = await res.json();
      if (data.leaderboard) {
        renderLeaderboard(data.leaderboard);
        return;
      }
    } catch(e) {}

    const local = JSON.parse(localStorage.getItem('flagmaster_scores') || '[]');
    renderLeaderboard(local);
  }

  function renderLeaderboard(scores) {
    $$('.lb-list').forEach(el => {
      if (!scores.length) {
        el.innerHTML = '<div class="lb-empty">No scores yet. Be the first!</div>';
        return;
      }
      el.innerHTML = scores.slice(0, 10).map((s, i) => `
        <div class="lb-row">
          <span class="lb-rank">${i + 1}</span>
          <span class="lb-name">${escHtml(s.username)}</span>
          <span class="lb-score">${s.score.toLocaleString()}</span>
        </div>
      `).join('');
    });
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── Question Generation ──
  function generateQuestion() {
    const correct = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const wrongSet = new Set([correct.code]);
    const options = [correct];

    while (options.length < 4) {
      const c = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      if (!wrongSet.has(c.code)) {
        wrongSet.add(c.code);
        options.push(c);
      }
    }

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      country: correct,
      options,
      correctIndex: options.indexOf(correct),
    };
  }

  function preloadFlags(question) {
    return question.options.map(c => {
      const img = new Image();
      img.src = FLAG_CDN + c.code + '.png';
      return img;
    });
  }

  // ── Game Flow ──
  function startGame() {
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;
    state.wrong = 0;
    state.timeLeft = GAME_DURATION;
    state.answering = false;

    showScreen('game');
    updateHUD();

    state.currentQ = generateQuestion();
    state.nextQ = generateQuestion();
    state.preloaded = preloadFlags(state.nextQ);

    showQuestion(state.currentQ);
    startTimer();
  }

  function showQuestion(q) {
    state.answering = false;
    state.questionStart = performance.now();

    $('.country-name').textContent = q.country.name;

    const cards = $$('.flag-card');
    cards.forEach((card, i) => {
      card.className = 'flag-card';
      const img = card.querySelector('.flag-img');
      img.src = FLAG_CDN + q.options[i].code + '.png';
      img.alt = 'Flag option ' + (i + 1);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.classList.add('visible');
        });
      });
    });
  }

  function handleAnswer(index) {
    if (state.answering || state.screen !== 'game') return;
    state.answering = true;

    const q = state.currentQ;
    const cards = $$('.flag-card');
    const isCorrect = index === q.correctIndex;
    const responseTime = performance.now() - state.questionStart;

    if (isCorrect) {
      cards[index].classList.add('correct');
      state.streak++;
      state.correct++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;

      const speedBonus = Math.max(0, Math.round((3000 - responseTime) / 30));
      const multiplier = 1 + Math.min(state.streak - 1, 9) * 0.1;
      const points = Math.round((100 + speedBonus) * multiplier);
      state.score += points;

      showScorePopup(cards[index], '+' + points);
    } else {
      cards[index].classList.add('wrong');
      cards[q.correctIndex].classList.add('correct');
      state.streak = 0;
      state.wrong++;
    }

    updateHUD();

    const delay = isCorrect ? 180 : 500;
    setTimeout(() => {
      if (state.screen !== 'game') return;

      cards.forEach(c => c.classList.remove('visible', 'correct', 'wrong'));

      state.currentQ = state.nextQ;
      state.nextQ = generateQuestion();
      state.preloaded = preloadFlags(state.nextQ);

      setTimeout(() => {
        if (state.screen !== 'game') return;
        showQuestion(state.currentQ);
      }, 40);
    }, delay);
  }

  function showScorePopup(card, text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    const rect = card.getBoundingClientRect();
    popup.style.left = rect.left + rect.width / 2 - 30 + 'px';
    popup.style.top = rect.top - 10 + 'px';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 600);
  }

  // ── Timer ──
  function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timeLeft = GAME_DURATION;
    updateTimerBar();

    state.timer = setInterval(() => {
      state.timeLeft = Math.max(0, state.timeLeft - 0.1);
      updateTimerBar();

      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        endGame();
      }
    }, 100);
  }

  function updateTimerBar() {
    const pct = (state.timeLeft / GAME_DURATION) * 100;
    const bar = $('.timer-bar');
    bar.style.width = pct + '%';
    bar.classList.toggle('urgent', state.timeLeft <= 8);
    $('.time-value').textContent = Math.ceil(state.timeLeft) + 's';
  }

  function updateHUD() {
    $('.score-value').textContent = state.score.toLocaleString();

    const streakEl = $('.streak-value');
    streakEl.textContent = state.streak + 'x';
    streakEl.classList.toggle('streak-hot', state.streak >= 5 && state.streak < 10);
    streakEl.classList.toggle('streak-fire', state.streak >= 10);
  }

  // ── End Game ──
  async function endGame() {
    showScreen('results');

    const finalScore = state.score;
    $('.final-score').textContent = '0';
    animateCounter($('.final-score'), 0, finalScore, 800);

    const total = state.correct + state.wrong;
    const accuracy = total > 0 ? Math.round((state.correct / total) * 100) : 0;
    $('#stat-correct').textContent = state.correct;
    $('#stat-accuracy').textContent = accuracy + '%';
    $('#stat-streak').textContent = state.bestStreak;

    await saveScore(finalScore);
    loadLeaderboard();
  }

  function animateCounter(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  async function saveScore(score) {
    const entry = {
      username: state.user?.username || 'Guest',
      score,
      correct: state.correct,
      wrong: state.wrong,
      bestStreak: state.bestStreak,
      date: new Date().toISOString(),
    };

    if (state.user?.username) {
      try {
        const payload = {
          action: 'submit',
          username: state.user.username,
          score,
          correct: state.correct,
          wrong: state.wrong,
          bestStreak: state.bestStreak,
        };
        if (state.user.token) payload.token = state.user.token;
        if (state.user.password) payload.password = state.user.password;

        const res = await apiCall(payload);
        if (res.ok) {
          if (res.token) {
            state.user.token = res.token;
            localStorage.setItem('flagmaster_user', JSON.stringify(state.user));
          }
          return;
        }
      } catch(e) {}
    }

    saveScoreLocally(entry);
  }

  function saveScoreLocally(entry) {
    const scores = JSON.parse(localStorage.getItem('flagmaster_scores') || '[]');
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    scores.splice(50);
    localStorage.setItem('flagmaster_scores', JSON.stringify(scores));
  }

})();
