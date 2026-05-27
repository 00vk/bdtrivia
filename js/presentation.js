import { state } from './state.js';
import { showScreen } from './ui.js';
import { renderMedia } from './game.js';
import { db } from './firebase.js';
import { __ } from './locales.js';

var paused = false;
var prevListener = null;

function renderPresentationItem(item, itemIndex) {
  var isSlide = item.type === 'slide';

  document.getElementById('presentation-round').textContent = item.roundName || '';
  document.getElementById('presentation-timer').textContent = '';

  if (isSlide) {
    document.getElementById('presentation-question').textContent = item.title || '';
    document.getElementById('presentation-options').innerHTML = item.description
      ? '<p style="font-size:1.3em;opacity:0.7;max-width:80%;">' + item.description + '</p>'
      : '';
  } else {
    document.getElementById('presentation-question').textContent = item.question || '';
    var optsContainer = document.getElementById('presentation-options');
    optsContainer.innerHTML = '';
    if (item.questionType === 'choice' && item.options) {
      item.options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt;
        btn.disabled = true;
        optsContainer.appendChild(btn);
      });
    }
  }

  renderMedia(item.media, 'presentation-media');
}

export function enterPresentation(code, itemIndex) {
  paused = false;
  document.getElementById('presentation-pause-overlay').classList.remove('active');
  showScreen('screen-presentation');

  if (prevListener) { prevListener.off(); prevListener = null; }

  var roomRef = db.ref('rooms/' + code);

  var currentItem = state.gameItems[itemIndex];
  if (currentItem) renderPresentationItem(currentItem, itemIndex);

  prevListener = roomRef.child('currentItem').on('value', function(snapshot) {
    if (paused) return;
    var idx = snapshot.val();
    if (idx !== null && state.gameItems && state.gameItems[idx]) {
      state.gameStateCurrentItem = idx;
      renderPresentationItem(state.gameItems[idx], idx);
    }
  });

  roomRef.child('state').on('value', function(snapshot) {
    if (paused) return;
    if (snapshot.val() === 'finished') {
      document.getElementById('presentation-question').textContent = __('game.finished');
      document.getElementById('presentation-options').innerHTML = '';
    }
  });

  if (currentItem && currentItem.type === 'question' && currentItem.timeLimit) {
    var timerEl = document.getElementById('presentation-timer');
    function tick() {
      if (paused) { requestAnimationFrame(tick); return; }
      var endsAt = state.gameStateTimerEnds;
      if (!endsAt) { timerEl.textContent = ''; return; }
      var remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      var min = Math.floor(remaining / 60);
      var sec = remaining % 60;
      timerEl.textContent = min + ':' + (sec < 10 ? '0' : '') + sec;
      if (remaining > 0) setTimeout(tick, 1000);
      else timerEl.textContent = '';
    }
    tick();
  }
}

export function exitPresentation() {
  if (prevListener) { prevListener.off(); prevListener = null; }
  paused = false;
  showScreen('screen-game-host');
}

export function togglePause() {
  paused = !paused;
  document.getElementById('presentation-pause-overlay').classList.toggle('active', paused);
}

export function initPresentation() {
  document.addEventListener('keydown', function(e) {
    var presScreen = document.getElementById('screen-presentation');
    if (!presScreen.classList.contains('active')) return;

    if (e.key === 'Escape') {
      exitPresentation();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      togglePause();
    }
  });

  document.getElementById('screen-presentation').addEventListener('click', function() {
    if (!paused) return;
    togglePause();
  });
}
