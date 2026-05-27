import { state } from './state.js';
import { showScreen, showError, hideError, escapeHtml } from './ui.js';
import { saveDraft, loadDraft } from './storage.js';
import { renderEditorItems } from './editor.js';
import { savePack, loadUserPacks, loadPack, loadByRecoveryCode, deletePack } from './packs.js';
import { __ } from './locales.js';

function renderPacksList() {
  var container = document.getElementById('packs-list');
  container.innerHTML = '<p class="waiting">' + __('packs.loading') + '</p>';

  loadUserPacks().then(function(packs) {
    container.innerHTML = '';
    if (packs.length === 0) {
      container.innerHTML = '<p class="waiting">' + __('packs.empty') + '</p>';
      return;
    }
    packs.forEach(function(p) {
      var card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;';
      card.innerHTML =
        '<span style="flex:1;text-align:left;font-weight:600;">' + escapeHtml(p.name) + '</span>' +
        '<span style="font-size:0.85em;opacity:0.6;">' + p.itemCount + '</span>' +
        '<button class="packs-delete-btn" data-pack-id="' + p.id + '" style="background:none;border:none;color:#ff8888;cursor:pointer;font-size:1.2em;">\u00D7</button>';
      card.addEventListener('click', function(e) {
        if (e.target.closest('.packs-delete-btn')) return;
        loadPackIntoEditor(p.id);
      });
      card.querySelector('.packs-delete-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        if (!confirm(__('packs.deleteConfirm'))) return;
        deletePack(p.id).then(function() {
          renderPacksList();
        });
      });
      container.appendChild(card);
    });
  }).catch(function(err) {
    container.innerHTML = '<p class="error" style="display:block;">' + escapeHtml(err.message) + '</p>';
  });
}

function loadPackIntoEditor(packId) {
  loadPack(packId).then(function(pack) {
    state.draftItems = pack.items;
    saveDraft();
    showScreen('screen-editor');
    renderEditorItems();
  }).catch(function(err) {
    showError(document.getElementById('packs-error'), err.message);
  });
}

export function initPacksScreen() {
  document.getElementById('packs-back-btn').addEventListener('click', function() {
    hideError(document.getElementById('packs-error'));
    showScreen('screen-editor');
  });

  document.getElementById('packs-recovery-btn').addEventListener('click', function() {
    var code = document.getElementById('packs-recovery-input').value.trim();
    hideError(document.getElementById('packs-error'));
    loadByRecoveryCode(code).then(function(pack) {
      state.draftItems = pack.items;
      saveDraft();
      showScreen('screen-editor');
      renderEditorItems();
    }).catch(function(err) {
      showError(document.getElementById('packs-error'), err.message);
    });
  });

  document.getElementById('packs-recovery-input').addEventListener('input', function() {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });
}

export function showPacksScreen() {
  hideError(document.getElementById('packs-error'));
  showScreen('screen-packs');
  renderPacksList();
}

export function saveCurrentPack() {
  var name = prompt(__('packs.savePrompt'));
  if (!name) return;
  document.getElementById('editor-error').textContent = __('packs.saving');
  document.getElementById('editor-error').classList.remove('hidden');

  savePack(name, state.draftItems).then(function(result) {
    document.getElementById('editor-error').textContent = __('packs.saved', {code: result.recoveryCode});
  }).catch(function(err) {
    document.getElementById('editor-error').textContent = err.message;
  });
}
