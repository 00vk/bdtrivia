import { state } from './state.js';
import { showScreen, showError, hideError, escapeHtml } from './ui.js';
import { db } from './firebase.js';
import { loadDraft, getGameItems } from './storage.js';
import { renderEditorItems } from './editor.js';
import { renderCurrentItem, showReveal, showFinished } from './game.js';
import { ROOM_CODE_LENGTH, CHARSET } from './config.js';
import { __ } from './locales.js';

export function createUniqueRoomCode() {
  return new Promise(function(resolve, reject) {
    var attempts = 0;
    function tryGenerate() {
      if (attempts >= 20) { reject(new Error('Could not generate unique room code')); return; }
      attempts++;
      var code = '';
      for (var i = 0; i < ROOM_CODE_LENGTH; i++) { code += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length)); }
      db.ref('rooms/' + code).once('value').then(function(snapshot) {
        if (!snapshot.exists()) { resolve(code); }
        else { tryGenerate(); }
      }).catch(reject);
    }
    tryGenerate();
  });
}

export function listenPlayers(code) {
  var ref = db.ref('rooms/' + code + '/players');
  var container = document.getElementById('player-list');

  function updatePlayerChip(key, p) {
    var chip = document.getElementById('player-' + key);
    if (chip) {
      chip.className = 'player-chip' + (p.connected === false ? ' disconnected' : '');
      chip.innerHTML = escapeHtml(p.nickname) + (p.connected === false ? '<span class="disc-label">' + __('host.disconnected') + '</span>' : '');
    }
  }

  ref.on('child_added', function(snapshot) {
    var p = snapshot.val();
    var placeholder = container.querySelector('.waiting');
    if (placeholder) placeholder.remove();
    if (!document.getElementById('player-' + snapshot.key)) {
      var chip = document.createElement('div');
      chip.className = 'player-chip';
      chip.id = 'player-' + snapshot.key;
      container.appendChild(chip);
    }
    updatePlayerChip(snapshot.key, p);
    updateStartButton();
  });

  ref.on('child_changed', function(snapshot) { updatePlayerChip(snapshot.key, snapshot.val()); });

  ref.on('child_removed', function(snapshot) {
    var chip = document.getElementById('player-' + snapshot.key);
    if (chip) chip.remove();
    if (container.children.length === 0) {
      var p = document.createElement('p');
      p.className = 'waiting';
      p.textContent = __('host.waitingPlayers');
      container.appendChild(p);
    }
    updateStartButton();
  });
}

function updateStartButton() {
  var btn = document.getElementById('host-start-btn');
  if (btn) {
    var count = document.querySelectorAll('#player-list .player-chip').length;
    btn.disabled = count === 0;
  }
}

export function showQRCode(code) {
  if (window.location.protocol === 'file:') return;
  var base = window.location.origin + window.location.pathname.replace(/\/?$/, '');
  var url = base + '?room=' + code;
  var qrContainer = document.getElementById('lobby-qr');
  qrContainer.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=' + encodeURIComponent(url) + '" alt="QR">';
}

export function listenGameState(code, isHost) {
  var roomRef = db.ref('rooms/' + code);

  roomRef.child('state').on('value', function(snapshot) {
    var s = snapshot.val();
    if (s === 'playing') {
      roomRef.once('value', function(snap) {
        var room = snap.val();
        state.gameItems = room.items || [];
        state.gameItemCount = state.gameItems.length;
        state.gameStateCurrentItem = room.currentItem;
        showScreen(isHost ? 'screen-game-host' : 'screen-game-player');
        renderCurrentItem(code, isHost, room.currentItem, room.timerEndsAt);
      });
    } else if (s === 'reveal') {
      showScreen(isHost ? 'screen-game-host' : 'screen-game-player');
      showReveal(code, isHost);
    } else if (s === 'finished') {
      showScreen(isHost ? 'screen-game-host' : 'screen-game-player');
      showFinished(code, isHost);
    }
  });

  roomRef.child('currentItem').on('value', function(snapshot) {
    var idx = snapshot.val();
    if (idx !== null && state.gameItems) {
      state.gameStateCurrentItem = idx;
      roomRef.child('timerEndsAt').once('value', function(timerSnap) {
        renderCurrentItem(code, isHost, idx, timerSnap.val());
      });
    }
  });
}

export function tryReconnect() {
  var savedRoom = sessionStorage.getItem('bdtrivia_room');
  var savedPlayerId = sessionStorage.getItem('bdtrivia_playerId');
  var savedHostKey = sessionStorage.getItem('bdtrivia_hostKey');
  if (!savedRoom) return;

  state.currentRoomCode = savedRoom;
  db.ref('rooms/' + savedRoom).once('value').then(function(snapshot) {
    if (!snapshot.exists()) { sessionStorage.clear(); return; }
    var room = snapshot.val();

    if (savedHostKey && room.hostKey === savedHostKey) {
      document.getElementById('room-code-display').textContent = savedRoom;
      if (room.state === 'lobby') {
        showScreen('screen-lobby-host');
        listenPlayers(savedRoom);
        listenGameState(savedRoom, true);
        return;
      }
      listenGameState(savedRoom, true);
      return;
    }

    if (savedPlayerId && room.players && room.players[savedPlayerId]) {
      state.currentPlayerId = savedPlayerId;
      if (room.state === 'lobby') {
        showScreen('screen-lobby-player');
        listenGameState(savedRoom, false);
        return;
      }
      listenGameState(savedRoom, false);
    }
  });
}

export function initLobby() {
  var hostCreateBtn = document.getElementById('host-create-btn');
  var hostCreateError = document.getElementById('host-create-error');

  hostCreateBtn.addEventListener('click', function() {
    var nickname = document.getElementById('host-nickname-input').value.trim();
    if (!nickname) { showError(hostCreateError, __('host.error.nickname')); return; }
    hideError(hostCreateError);
    hostCreateBtn.disabled = true;
    hostCreateBtn.textContent = __('host.creating');

    createUniqueRoomCode().then(function(code) {
      state.currentRoomCode = code;
      var hostKey = Array.from(crypto.getRandomValues(new Uint8Array(6)), function(b) { return b.toString(36).padStart(2, '0'); }).join('').slice(0, 10);
      sessionStorage.setItem('bdtrivia_hostKey', hostKey);
      sessionStorage.setItem('bdtrivia_room', code);
      return db.ref('rooms/' + code).set({
        hostNickname: nickname,
        hostKey: hostKey,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        state: 'lobby'
      });
    }).then(function() {
      document.getElementById('room-code-display').textContent = state.currentRoomCode;
      showScreen('screen-lobby-host');
      listenPlayers(state.currentRoomCode);
      listenGameState(state.currentRoomCode, true);
      showQRCode(state.currentRoomCode);
    }).catch(function(err) {
      showError(hostCreateError, __('host.error.generic', {msg: err.message}));
    }).finally(function() {
      hostCreateBtn.disabled = false;
      hostCreateBtn.textContent = __('host.createBtn');
    });
  });

  document.getElementById('copy-code-btn').addEventListener('click', function() {
    var code = document.getElementById('room-code-display').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function() {
        document.getElementById('copy-code-btn').textContent = __('host.copied');
        setTimeout(function() { document.getElementById('copy-code-btn').textContent = __('host.copyBtn'); }, 2000);
      });
    }
  });

  document.getElementById('host-edit-btn').addEventListener('click', function() {
    loadDraft();
    renderEditorItems();
    showScreen('screen-editor');
  });

  var hostStartBtn = document.getElementById('host-start-btn');
  var hostStartError = document.getElementById('host-start-error');

  hostStartBtn.addEventListener('click', function() {
    hideError(hostStartError);
    hostStartBtn.disabled = true;
    hostStartBtn.textContent = __('host.starting');

    var storedKey = sessionStorage.getItem('bdtrivia_hostKey');
    if (!storedKey) {
      showError(hostStartError, __('host.error.auth'));
      hostStartBtn.disabled = false;
      hostStartBtn.textContent = __('host.startBtn');
      return;
    }

    db.ref('rooms/' + state.currentRoomCode + '/hostKey').once('value').then(function(snap) {
      if (snap.val() !== storedKey) { throw new Error(__('host.error.notHost')); }
      var startItems = getGameItems();
      var gameData = { items: startItems };
      gameData.state = 'playing';
      gameData.currentItem = 0;
      var firstItem = startItems[0];
      gameData.timerEndsAt = firstItem && firstItem.type === 'question' ? Date.now() + (firstItem.timeLimit || 20) * 1000 : null;
      return db.ref('rooms/' + state.currentRoomCode).update(gameData);
    }).catch(function(err) {
      showError(hostStartError, __('host.error.generic', {msg: err.message}));
      hostStartBtn.disabled = false;
      hostStartBtn.textContent = __('host.startBtn');
    });
  });

  document.getElementById('player-code-input').addEventListener('input', function() {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  var playerCodeError = document.getElementById('player-code-error');
  document.getElementById('player-join-code-btn').addEventListener('click', function() {
    var code = document.getElementById('player-code-input').value.trim();
    if (!code || code.length < 3) { showError(playerCodeError, __('join.error.enterCode')); return; }
    hideError(playerCodeError);

    db.ref('rooms/' + code).once('value').then(function(snapshot) {
      if (!snapshot.exists()) { showError(playerCodeError, __('join.error.notFound')); return; }
      var room = snapshot.val();
      if (room.state !== 'lobby') { showError(playerCodeError, __('join.error.alreadyStarted')); return; }
      state.currentRoomCode = code;
      showScreen('screen-player-nickname');
    }).catch(function(err) { showError(playerCodeError, __('host.error.generic', {msg: err.message})); });
  });

  var playerJoinBtn = document.getElementById('player-join-btn');
  var playerJoinError = document.getElementById('player-join-error');

  playerJoinBtn.addEventListener('click', function() {
    var nickname = document.getElementById('player-nickname-input').value.trim();
    if (!nickname) { showError(playerJoinError, __('join.error.enterNickname')); return; }
    hideError(playerJoinError);
    playerJoinBtn.disabled = true;
    playerJoinBtn.textContent = __('join.joining');

    var playersRef = db.ref('rooms/' + state.currentRoomCode + '/players');
    var newRef = playersRef.push();
    newRef.set({ nickname: nickname, score: 0, connected: true }).then(function() {
      state.currentPlayerId = newRef.key;
      sessionStorage.setItem('bdtrivia_playerId', state.currentPlayerId);
      sessionStorage.setItem('bdtrivia_room', state.currentRoomCode);
      showScreen('screen-lobby-player');
      listenGameState(state.currentRoomCode, false);
      playersRef.child(state.currentPlayerId).onDisconnect().update({ connected: false });
    }).catch(function(err) { showError(playerJoinError, __('host.error.generic', {msg: err.message})); }).finally(function() {
      playerJoinBtn.disabled = false;
      playerJoinBtn.textContent = __('join.joinBtn');
    });
  });
}
