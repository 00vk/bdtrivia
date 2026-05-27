import { state } from './state.js';
import { db } from './firebase.js';
import { showScreen, showError } from './ui.js';
import { initLobby, tryReconnect } from './lobby.js';
import { initEditor } from './editor.js';
import { applyI18n, toggleLang } from './locales.js';
import { initPacksScreen, saveCurrentPack, showPacksScreen } from './packs-ui.js';

applyI18n();

document.getElementById('lang-toggle').addEventListener('click', toggleLang);

initLobby();
initEditor();
initPacksScreen();

document.getElementById('editor-save-pack').addEventListener('click', saveCurrentPack);
document.getElementById('editor-load-pack').addEventListener('click', showPacksScreen);

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
