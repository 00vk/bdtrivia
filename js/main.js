import { state } from './state.js';
import { db } from './firebase.js';
import { showScreen, showError } from './ui.js';
import { initLobby, tryReconnect } from './lobby.js';
import { initEditor } from './editor.js';

initLobby();
initEditor();

var params = new URLSearchParams(window.location.search);
var roomFromUrl = params.get('room');

if (roomFromUrl) {
  var code = roomFromUrl.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code) {
    showScreen('screen-player-roomcode');
  } else {
    state.currentRoomCode = code;
    db.ref('rooms/' + code).once('value').then(function(snapshot) {
      if (!snapshot.exists()) {
        showScreen('screen-player-roomcode');
      } else {
        var room = snapshot.val();
        if (room.state !== 'lobby') {
          showError(document.getElementById('player-code-error'), 'Игра уже началась');
          document.getElementById('player-code-input').value = code;
          showScreen('screen-player-roomcode');
        } else {
          showScreen('screen-player-nickname');
        }
      }
    }).catch(function() {
      showScreen('screen-player-roomcode');
    });
  }
} else {
  tryReconnect();
}
