import { state } from './state.js';
import { showScreen, escapeHtml } from './ui.js';
import { db } from './firebase.js';

export function renderCurrentItem(code, isHost, itemIndex, timerEndsAt) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (state.answerCountRef) { state.answerCountRef.off(); state.answerCountRef = null; }

  var item = state.gameItems[itemIndex];
  if (!item) return;

  var prefix = isHost ? 'host' : 'player';
  var isSlide = item.type === 'slide';

  if (isSlide) {
    document.getElementById('game-' + prefix + '-round').textContent = item.title || '';
    document.getElementById('game-' + prefix + '-progress').textContent = 'Слайд ' + (itemIndex + 1) + ' / ' + state.gameItemCount;
    document.getElementById('game-' + prefix + '-question').textContent = item.description || '';
  } else {
    var rn = item.roundName || '';
    document.getElementById('game-' + prefix + '-round').textContent = rn;
    document.getElementById('game-' + prefix + '-progress').textContent = (rn ? rn + ' · ' : '') + 'Вопрос ' + (itemIndex + 1) + ' / ' + state.gameItemCount;
    document.getElementById('game-' + prefix + '-question').textContent = item.question;
  }

  renderMedia(item.media, 'game-' + prefix + '-media');

  var optsContainer = document.getElementById('game-' + prefix + '-options');
  optsContainer.innerHTML = '';

  if (isSlide) {
    if (isHost) {
      var nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary';
      nextBtn.textContent = 'Далее →';
      nextBtn.addEventListener('click', function() { advanceNext(code); });
      optsContainer.appendChild(nextBtn);
    }
  } else if (item.questionType === 'choice' && item.options) {
    item.options.forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.textContent = opt;
      if (!isHost) {
        btn.addEventListener('click', function() { selectAnswer(code, itemIndex, opt); });
      }
      optsContainer.appendChild(btn);
    });
  } else if (item.questionType === 'text') {
    if (!isHost) {
      var area = document.createElement('div');
      area.className = 'text-answer-area';
      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Ваш ответ...';
      input.maxLength = 100;
      input.autocomplete = 'off';
      var submitBtn = document.createElement('button');
      submitBtn.className = 'btn btn-primary';
      submitBtn.textContent = 'Ответить';
      submitBtn.addEventListener('click', function() {
        selectAnswer(code, itemIndex, input.value.trim());
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправлено';
      });
      area.appendChild(input);
      area.appendChild(submitBtn);
      optsContainer.appendChild(area);
    }
  }

  if (!isSlide && timerEndsAt) {
    var timerEl = document.getElementById('game-' + prefix + '-timer');
    if (isHost) {
      startTimer(timerEndsAt, timerEl, function() {
        computeScores(code, itemIndex).then(function() {
          db.ref('rooms/' + code).update({ state: 'reveal' });
        });
      });
    } else {
      startTimer(timerEndsAt, timerEl);
    }
    timerEl.style.display = '';
  } else if (isSlide) {
    document.getElementById('game-' + prefix + '-timer').style.display = 'none';
  }

  if (isHost && !isSlide) {
    listenAnswerCount(code, itemIndex);
  } else if (isHost) {
    document.getElementById('game-host-answered').textContent = '';
  }
}

export function advanceNext(code) {
  var newIdx = (state.gameStateCurrentItem || 0) + 1;
  var nextItem = state.gameItems[newIdx];
  if (!nextItem) {
    db.ref('rooms/' + code).update({ state: 'finished' });
    return;
  }
  var update = { currentItem: newIdx, state: 'playing' };
  if (nextItem.type === 'question') {
    update.timerEndsAt = Date.now() + (nextItem.timeLimit || 20) * 1000;
  } else {
    update.timerEndsAt = null;
  }
  db.ref('rooms/' + code).update(update);
}

export function showFinished(code, isHost) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (state.answerCountRef) { state.answerCountRef.off(); state.answerCountRef = null; }

  var prefix = isHost ? 'host' : 'player';
  document.getElementById('game-' + prefix + '-timer').style.display = 'none';
  if (isHost) document.getElementById('game-host-answered').textContent = '';
  document.getElementById('game-' + prefix + '-round').textContent = '';
  document.getElementById('game-' + prefix + '-progress').textContent = 'Игра завершена!';
  document.getElementById('game-' + prefix + '-question').textContent = '';

  db.ref('rooms/' + code + '/players').once('value', function(snap) {
    var players = snap.val() || {};
    var sorted = Object.keys(players)
      .map(function(id) { return { id: id, nickname: players[id].nickname, score: players[id].score || 0 }; })
      .sort(function(a, b) { return b.score - a.score; });

    var opts = document.getElementById('game-' + prefix + '-options');
    opts.innerHTML = '';

    if (sorted.length > 0) {
      var podium = document.createElement('div');
      podium.className = 'podium';
      var podiumOrder = sorted.length >= 3 ? [1, 0, 2] : (sorted.length === 2 ? [1, 0] : [0]);
      podiumOrder.forEach(function(pi) {
        var p = sorted[pi];
        if (!p) return;
        var item = document.createElement('div');
        var cls = pi === 0 ? 'podium-1' : (pi === 1 ? 'podium-2' : 'podium-3');
        item.className = 'podium-item ' + cls;
        var medals = { 0: '🥇', 1: '🥈', 2: '🥉' };
        item.innerHTML = '<div class="podium-medal">' + (medals[pi] || '') + '</div><div class="podium-name">' + escapeHtml(p.nickname) + '</div><div class="podium-score">' + p.score + '</div>';
        podium.appendChild(item);
      });
      opts.appendChild(podium);
    }

    var table = document.createElement('div');
    table.className = 'rank-table';
    sorted.forEach(function(p, i) {
      var row = document.createElement('div');
      var cls = i === 0 ? 'top1' : (i === 1 ? 'top2' : (i === 2 ? 'top3' : ''));
      row.className = 'rank-row ' + cls;
      row.innerHTML = '<span class="rank-pos">' + (i + 1) + '</span><span class="rank-name">' + escapeHtml(p.nickname) + '</span><span class="rank-score">' + p.score + '</span>';
      table.appendChild(row);
    });
    opts.appendChild(table);

    if (isHost) {
      var newBtn = document.createElement('button');
      newBtn.className = 'btn btn-primary';
      newBtn.textContent = 'Новая игра';
      newBtn.addEventListener('click', function() {
        db.ref('rooms/' + code).remove().then(function() {
          sessionStorage.clear();
          window.location.href = window.location.pathname;
        });
      });
      opts.appendChild(newBtn);
    }
  });
}

export function renderMedia(media, containerId) {
  var container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!media || !media.url) return;
  if (media.type === 'youtube') {
    var iframe = document.createElement('iframe');
    iframe.src = media.url;
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
  } else if (media.type === 'image') {
    var img = document.createElement('img');
    img.src = media.url;
    img.alt = '';
    container.appendChild(img);
  } else if (media.type === 'audio') {
    var audio = document.createElement('audio');
    audio.src = media.url;
    audio.controls = true;
    container.appendChild(audio);
  } else if (media.type === 'video') {
    var video = document.createElement('video');
    video.src = media.url;
    video.controls = true;
    video.style.width = '100%';
    container.appendChild(video);
  }
}

export function startTimer(endsAt, displayEl, onExpire) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  function tick() {
    var remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
    var min = Math.floor(remaining / 60);
    var sec = remaining % 60;
    displayEl.textContent = '⏱ ' + min + ':' + (sec < 10 ? '0' : '') + sec;
    if (remaining <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      if (onExpire) onExpire();
    }
  }
  tick();
  state.timerInterval = setInterval(tick, 1000);
}

export function computeScores(code, itemIndex) {
  var item = state.gameItems[itemIndex];
  if (!item || item.type !== 'question') return Promise.resolve();

  var timeLimitMs = (item.timeLimit || 20) * 1000;
  var correctAnswers = Array.isArray(item.correctAnswer)
    ? item.correctAnswer.map(function(ca) { return ca.toLowerCase(); })
    : [item.correctAnswer.toLowerCase()];

  return db.ref('rooms/' + code).once('value').then(function(snap) {
    var room = snap.val();
    var answers = (room.answers && room.answers[itemIndex]) || {};
    var players = room.players || {};
    var questionStartedAt = (room.timerEndsAt || 0) - timeLimitMs;

    var updates = {};
    Object.keys(answers).forEach(function(playerId) {
      var a = answers[playerId];
      var isCorrect = correctAnswers.indexOf((a.answer || '').toLowerCase()) !== -1;
      var points = 0;
      if (isCorrect && a.answeredAt) {
        var elapsed = a.answeredAt - questionStartedAt;
        var ratio = elapsed / timeLimitMs;
        points = Math.round(item.maxScore * Math.max(0, 1 - ratio * 0.85));
      }
      updates['answers/' + itemIndex + '/' + playerId + '/correct'] = isCorrect;
      updates['answers/' + itemIndex + '/' + playerId + '/points'] = points;
      updates['players/' + playerId + '/score'] = ((players[playerId] && players[playerId].score) || 0) + points;
    });
    return Object.keys(updates).length > 0 ? db.ref('rooms/' + code).update(updates) : Promise.resolve();
  });
}

export function showReveal(code, isHost) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (state.answerCountRef) { state.answerCountRef.off(); state.answerCountRef = null; }

  var item = state.gameItems[state.gameStateCurrentItem];
  if (!item) return;

  var prefix = isHost ? 'host' : 'player';
  var correctLabel = Array.isArray(item.correctAnswer) ? item.correctAnswer[0] : item.correctAnswer;

  document.getElementById('game-' + prefix + '-timer').style.display = 'none';
  if (isHost) document.getElementById('game-host-answered').textContent = '';

  db.ref('rooms/' + code).once('value').then(function(snap) {
    var room = snap.val();
    var answers = (room.answers && room.answers[state.gameStateCurrentItem]) || {};
    var players = room.players || {};

    if (isHost) { renderHostReveal(prefix, item, answers, players, correctLabel, code); }
    else { renderPlayerReveal(prefix, item, answers, players, correctLabel); }
  });
}

function renderHostReveal(prefix, item, answers, players, correctLabel, code) {
  var opts = document.getElementById('game-' + prefix + '-options');
  opts.innerHTML = '';

  var totalPlayers = Object.keys(players).length;
  var answeredCount = Object.keys(answers).length;

  var answerHeader = document.createElement('div');
  answerHeader.className = 'reveal-header';
  answerHeader.textContent = 'Правильный ответ: ' + correctLabel;
  opts.appendChild(answerHeader);

  if (item.questionType === 'choice' && item.options) {
    var counts = {};
    item.options.forEach(function(opt) { counts[opt] = 0; });
    Object.keys(answers).forEach(function(pid) { var a = answers[pid].answer; if (counts[a] !== undefined) counts[a]++; });
    var maxCount = Math.max.apply(null, Object.keys(counts).map(function(k) { return counts[k]; }), 1);

    item.options.forEach(function(opt) {
      var bar = document.createElement('div');
      bar.className = 'reveal-dist-bar';
      var label = document.createElement('span');
      label.className = 'reveal-dist-label';
      label.textContent = opt;
      var fillWrap = document.createElement('div');
      fillWrap.style.cssText = 'flex:1;background:rgba(255,255,255,0.08);border-radius:6px;height:22px;';
      var fill = document.createElement('div');
      fill.className = 'reveal-dist-fill ' + (opt === correctLabel ? 'correct' : 'wrong');
      fill.style.cssText = 'width:' + Math.round(counts[opt] / maxCount * 100) + '%;display:flex;align-items:center;padding-left:6px;font-size:0.85em;white-space:nowrap;';
      fill.textContent = counts[opt] > 0 ? counts[opt] : '';
      fillWrap.appendChild(fill);
      bar.appendChild(label);
      bar.appendChild(fillWrap);
      opts.appendChild(bar);
    });
  } else if (item.questionType === 'text') {
    var correctCount = 0;
    Object.keys(answers).forEach(function(pid) { if (answers[pid].correct) correctCount++; });
    var pct = answeredCount > 0 ? Math.round(correctCount / answeredCount * 100) : 0;
    var info = document.createElement('p');
    info.style.cssText = 'width:100%;max-width:320px;text-align:left;margin:4px 0;font-size:0.95em;';
    info.textContent = 'Правильно: ' + correctCount + ' из ' + answeredCount + ' (' + pct + '%)';
    opts.appendChild(info);
  }

  var summary = document.createElement('p');
  summary.style.cssText = 'width:100%;max-width:320px;text-align:left;margin:8px 0 4px;font-size:0.9em;opacity:0.8;';
  summary.textContent = 'Ответило: ' + answeredCount + ' / ' + totalPlayers;
  opts.appendChild(summary);

  renderTop3(opts, players);

  var nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-primary';
  nextBtn.textContent = 'Далее →';
  nextBtn.addEventListener('click', function() { advanceNext(code); });
  opts.appendChild(nextBtn);
}

function renderPlayerReveal(prefix, item, answers, players, correctLabel) {
  var opts = document.getElementById('game-' + prefix + '-options');
  opts.innerHTML = '';

  var myAnswerData = answers[state.currentPlayerId];
  var myAnswer = myAnswerData ? myAnswerData.answer : '—';
  var points = myAnswerData ? myAnswerData.points : 0;
  var isCorrect = myAnswerData ? myAnswerData.correct : false;

  var myRow = document.createElement('div');
  myRow.className = 'reveal-row ' + (isCorrect ? 'correct' : 'wrong');
  myRow.innerHTML = '<span>Ваш ответ: <strong>' + escapeHtml(myAnswer) + '</strong></span><span>' + (isCorrect ? '✅' : '❌') + '</span>';
  opts.appendChild(myRow);

  var correctRow = document.createElement('div');
  correctRow.className = 'reveal-row correct';
  correctRow.innerHTML = '<span>Правильный: <strong>' + escapeHtml(correctLabel) + '</strong></span>';
  opts.appendChild(correctRow);

  var ptsEl = document.createElement('div');
  ptsEl.style.cssText = 'font-size:1.1em;font-weight:700;margin:8px 0;width:100%;max-width:320px;text-align:left;';
  ptsEl.textContent = (isCorrect ? '+' : '') + points + ' баллов';
  opts.appendChild(ptsEl);

  renderTop3(opts, players);
}

function renderTop3(container, players) {
  var sorted = Object.keys(players)
    .map(function(id) { return { id: id, nickname: players[id].nickname, score: players[id].score || 0 }; })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, 3);

  if (sorted.length === 0) return;

  var header = document.createElement('div');
  header.className = 'reveal-header';
  header.textContent = 'Топ-3';
  container.appendChild(header);

  sorted.forEach(function(p, i) {
    var row = document.createElement('div');
    row.className = 'reveal-top3-item';
    row.innerHTML = '<span>' + (i + 1) + '. ' + escapeHtml(p.nickname) + '</span><span>' + p.score + '</span>';
    container.appendChild(row);
  });
}

function selectAnswer(code, itemIndex, answer) {
  if (!state.currentPlayerId || !answer) return;
  var answerRef = db.ref('rooms/' + code + '/answers/' + itemIndex + '/' + state.currentPlayerId);
  answerRef.once('value').then(function(snap) {
    if (snap.exists()) return;
    answerRef.set({ answer: answer, answeredAt: firebase.database.ServerValue.TIMESTAMP }).then(function() {
      showAnswerWaiting(code, itemIndex);
    });
  });
}

function showAnswerWaiting(code, itemIndex) {
  var container = document.getElementById('game-player-options');
  container.innerHTML = '<p style="font-size:1.1em;opacity:0.9;">Ответ принят!</p><p class="waiting" style="margin-top:4px;">Ждём остальных...</p>';
  var inputs = container.querySelectorAll('input, button');
  inputs.forEach(function(el) { el.disabled = true; });
}

function listenAnswerCount(code, itemIndex) {
  var ref = db.ref('rooms/' + code + '/answers/' + itemIndex);
  state.answerCountRef = ref;
  ref.on('value', function(snapshot) {
    var count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    document.getElementById('game-host-answered').textContent = 'Ответило: ' + count;
  });
}
