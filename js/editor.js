import { state } from './state.js';
import { showScreen, showError, hideError, escapeHtml } from './ui.js';
import { saveDraft } from './storage.js';

export function openUploadWidget(index) {
  var statusEl = document.getElementById('upload-status-' + index);
  if (typeof cloudinary === 'undefined') {
    if (statusEl) statusEl.textContent = 'Виджет загрузки не загрузился. Проверьте интернет.';
    return;
  }
  var widget = cloudinary.createUploadWidget({
    cloudName: 'dcdvpwr2v',
    uploadPreset: 'bdtrivia',
    maxFileSize: 10485760,
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp3', 'wav', 'ogg', 'aac'],
    maxImageWidth: 2000,
    maxImageHeight: 2000
  }, function(error, result) {
    if (error) {
      if (statusEl) statusEl.textContent = 'Ошибка: ' + (error.status || 'неизвестная');
      return;
    }
    if (result.event === 'success') {
      var info = result.info;
      var url = info.secure_url;
      if (!url || !/^https:\/\/res\.cloudinary\.com\//.test(url)) {
        if (statusEl) statusEl.textContent = 'Ошибка: недопустимый URL от Cloudinary';
        return;
      }
      var typeMap = { image: 'image', audio: 'audio', video: 'video' };
      var mediaType = typeMap[info.resource_type] || 'image';
      var form = document.querySelector('.editor-card-form.open');
      if (form) {
        var typeSelect = form.querySelector('.f-media-type');
        var urlInput = form.querySelector('.f-media-url');
        if (typeSelect) typeSelect.value = mediaType;
        if (urlInput) urlInput.value = url;
      }
      if (statusEl) statusEl.textContent = '✅ ' + (info.original_filename || 'Файл') + ' загружен';
      setTimeout(function() { if (statusEl) statusEl.textContent = ''; }, 4000);
    }
  });
  widget.open();
}

export function renderEditorItems() {
  var list = document.getElementById('editor-list');
  list.innerHTML = '';
  if (state.draftItems.length === 0) {
    list.innerHTML = '<p class="waiting" style="margin:16px 0;">Нет вопросов. Добавьте первый!</p>';
    return;
  }
  state.draftItems.forEach(function(item, i) {
    var isExpanded = state.editorExpandedIdx === i;
    var card = document.createElement('div');
    card.className = 'editor-card';

    var summary = document.createElement('div');
    summary.className = 'editor-card-summary';
    var icon = item.type === 'slide' ? '📄' : (item.questionType === 'text' ? '✏️' : '📝');
    var preview = item.type === 'slide' ? (item.title || 'Слайд') : (item.question || 'Вопрос');
    summary.innerHTML =
      '<span class="editor-card-icon">' + icon + '</span>' +
      '<span class="editor-card-preview">' + escapeHtml(preview) + '</span>' +
      '<span class="editor-card-actions">' +
        '<button data-action="move-up" data-i="' + i + '" ' + (i === 0 ? 'disabled style="opacity:0.3"' : '') + '>↑</button>' +
        '<button data-action="move-down" data-i="' + i + '" ' + (i === state.draftItems.length - 1 ? 'disabled style="opacity:0.3"' : '') + '>↓</button>' +
        '<button data-action="delete" data-i="' + i + '" style="color:#ff8888;">✕</button>' +
      '</span>';
    summary.addEventListener('click', function(e) {
      if (e.target.closest('.editor-card-actions')) return;
      state.editorExpandedIdx = state.editorExpandedIdx === i ? -1 : i;
      renderEditorItems();
    });
    card.appendChild(summary);

    var form = document.createElement('div');
    form.className = 'editor-card-form' + (isExpanded ? ' open' : '');
    form.dataset.index = i;
    if (isExpanded) {
      buildEditorForm(form, item, i);
    }
    card.appendChild(form);
    list.appendChild(card);
  });
}

function buildEditorForm(form, item, index) {
  if (item.type === 'slide') {
    form.innerHTML =
      '<label>Заголовок</label><input class="f-title" value="' + escapeHtml(item.title || '') + '" placeholder="Раунд 1: История">' +
      '<label>Описание</label><textarea class="f-desc" placeholder="Правила раунда">' + escapeHtml(item.description || '') + '</textarea>';
  } else {
    var typeLabel = item.questionType === 'text' ? 'Свободный текст' : 'Выбор одного';
    form.innerHTML =
      '<label>Вопрос</label><textarea class="f-question" placeholder="Текст вопроса">' + escapeHtml(item.question || '') + '</textarea>' +
      '<label>Раунд</label><input class="f-round" value="' + escapeHtml(item.roundName || '') + '" placeholder="Название раунда">' +
      '<div style="display:flex;gap:8px;">' +
        '<div style="flex:1;"><label>Лимит (сек)</label><input class="f-timelimit" type="number" value="' + (item.timeLimit || 20) + '" min="5" max="120" step="5"></div>' +
        '<div style="flex:1;"><label>MAX баллов</label><input class="f-maxscore" type="number" value="' + (item.maxScore || 1000) + '" min="100" max="10000" step="100"></div>' +
      '</div>';

    if (item.questionType === 'choice') {
      var optsHtml = '<label>Варианты ответов</label>';
      (item.options || ['', '', '', '']).forEach(function(opt, oi) {
        optsHtml +=
          '<div class="editor-opt-row">' +
            '<input class="f-opt" value="' + escapeHtml(opt) + '" placeholder="Вариант ' + (oi + 1) + '">' +
            '<input class="opt-correct" type="radio" name="correct-' + index + '" value="' + oi + '" ' + (item.correctAnswer === opt ? 'checked' : '') + '>' +
            (item.options.length > 2 ? '<button class="opt-remove" data-oi="' + oi + '">×</button>' : '') +
          '</div>';
      });
      optsHtml += '<button class="editor-btn-sm" id="add-opt-' + index + '" ' + (item.options.length >= 6 ? 'disabled style="opacity:0.4"' : '') + '>+ Вариант</button>';
      form.innerHTML += optsHtml;
      form.querySelector('.f-question').dataset.type = 'choice';
    } else {
      var correctVal = Array.isArray(item.correctAnswer) ? item.correctAnswer.join(', ') : (item.correctAnswer || '');
      form.innerHTML +=
        '<label>Правильный ответ (синонимы через запятую)</label><input class="f-correct-text" value="' + escapeHtml(correctVal) + '" placeholder="Канберра, Canberra">';
    }
  }

  var media = item.media || {};
  form.innerHTML +=
    '<label>Медиа (необязательно)</label>' +
    '<div style="display:flex;gap:6px;">' +
      '<select class="f-media-type" style="flex:0 0 auto;width:auto;padding:8px;border:none;border-radius:8px;background:rgba(255,255,255,0.12);color:#fff;">' +
        '<option value="">Нет</option>' +
        '<option value="youtube" ' + (media.type === 'youtube' ? 'selected' : '') + '>YouTube</option>' +
        '<option value="image" ' + (media.type === 'image' ? 'selected' : '') + '>Картинка</option>' +
        '<option value="audio" ' + (media.type === 'audio' ? 'selected' : '') + '>Аудио</option>' +
        '<option value="video" ' + (media.type === 'video' ? 'selected' : '') + '>Видео</option>' +
      '</select>' +
      '<input class="f-media-url" style="flex:1;" value="' + escapeHtml(media.url || '') + '" placeholder="URL медиа">' +
      '<button class="editor-btn-sm editor-upload-btn" data-action="upload" title="Загрузить файл">📁</button>' +
    '</div>' +
    '<div class="editor-upload-status" id="upload-status-' + index + '"></div>';

  form.innerHTML +=
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">' +
      '<button class="editor-btn-cancel" data-action="cancel">Отмена</button>' +
      '<button class="editor-btn-save" data-action="save">Сохранить</button>' +
    '</div>';

  form.addEventListener('click', function(e) {
    var action = e.target.dataset.action;
    if (action === 'cancel') {
      state.editorExpandedIdx = -1;
      renderEditorItems();
    } else if (action === 'save') {
      saveEditorItem(index);
    } else if (action === 'upload') {
      openUploadWidget(index);
    } else if (e.target.classList.contains('opt-remove')) {
      var oi = parseInt(e.target.dataset.oi);
      if (state.draftItems[index].options.length > 2) {
        state.draftItems[index].options.splice(oi, 1);
        if (state.draftItems[index].correctAnswer === state.draftItems[index].options[oi]) {
          state.draftItems[index].correctAnswer = state.draftItems[index].options[0] || '';
        }
        renderEditorItems();
        setExpanded(index);
      }
    }
  });

  var addOptBtn = form.querySelector('#add-opt-' + index);
  if (addOptBtn) {
    addOptBtn.addEventListener('click', function() {
      if (state.draftItems[index].options.length < 6) {
        state.draftItems[index].options.push('');
        renderEditorItems();
        setExpanded(index);
      }
    });
  }
}

function saveEditorItem(index) {
  var form = document.querySelector('.editor-card-form.open');
  if (!form) return;

  var item = state.draftItems[index];
  if (item.type === 'slide') {
    item.title = form.querySelector('.f-title').value.trim();
    item.description = form.querySelector('.f-desc').value.trim();
    if (!item.title) { showError(document.getElementById('editor-error'), 'Заголовок слайда обязателен'); return; }
  } else {
    item.question = form.querySelector('.f-question').value.trim();
    item.roundName = form.querySelector('.f-round').value.trim();
    item.timeLimit = parseInt(form.querySelector('.f-timelimit').value) || 20;
    item.maxScore = parseInt(form.querySelector('.f-maxscore').value) || 1000;

    if (!item.question) { showError(document.getElementById('editor-error'), 'Вопрос не может быть пустым'); return; }

    if (item.questionType === 'choice') {
      var optInputs = form.querySelectorAll('.f-opt');
      var opts = [];
      optInputs.forEach(function(inp) { if (inp.value.trim()) opts.push(inp.value.trim()); });
      if (opts.length < 2) { showError(document.getElementById('editor-error'), 'Нужно минимум 2 варианта ответа'); return; }
      item.options = opts;
      var correctRadio = form.querySelector('input[name="correct-' + index + '"]:checked');
      if (!correctRadio) { showError(document.getElementById('editor-error'), 'Выберите правильный ответ'); return; }
      item.correctAnswer = opts[parseInt(correctRadio.value)];
    } else {
      var raw = form.querySelector('.f-correct-text').value || '';
      var syns = raw.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
      if (syns.length === 0) { showError(document.getElementById('editor-error'), 'Укажите хотя бы один правильный ответ'); return; }
      item.correctAnswer = syns;
    }

    var mediaType = form.querySelector('.f-media-type').value;
    var mediaUrl = form.querySelector('.f-media-url').value.trim();
    item.media = mediaUrl ? { type: mediaType, url: mediaUrl } : null;
  }

  hideError(document.getElementById('editor-error'));
  state.editorExpandedIdx = -1;
  saveDraft();
  renderEditorItems();
}

function deleteItem(index) {
  if (!confirm('Удалить этот элемент?')) return;
  state.draftItems.splice(index, 1);
  if (state.editorExpandedIdx === index) state.editorExpandedIdx = -1;
  else if (state.editorExpandedIdx > index) state.editorExpandedIdx--;
  saveDraft();
  renderEditorItems();
}

function moveItem(index, direction) {
  var newIdx = index + direction;
  if (newIdx < 0 || newIdx >= state.draftItems.length) return;
  var tmp = state.draftItems[index];
  state.draftItems[index] = state.draftItems[newIdx];
  state.draftItems[newIdx] = tmp;
  if (state.editorExpandedIdx === index) state.editorExpandedIdx = newIdx;
  else if (state.editorExpandedIdx === newIdx) state.editorExpandedIdx = index;
  saveDraft();
  renderEditorItems();
}

function setExpanded(idx) {
  state.editorExpandedIdx = idx;
}

export function initEditor() {
  document.getElementById('editor-list').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var i = parseInt(btn.dataset.i);
    var action = btn.dataset.action;
    if (action === 'delete') deleteItem(i);
    else if (action === 'move-up') moveItem(i, -1);
    else if (action === 'move-down') moveItem(i, 1);
  });

  document.getElementById('editor-add-choice').addEventListener('click', function() {
    state.draftItems.push({ type: 'question', questionType: 'choice', question: '', media: null, options: ['', ''], correctAnswer: '', maxScore: 1000, timeLimit: 20, roundName: '' });
    state.editorExpandedIdx = state.draftItems.length - 1;
    saveDraft();
    renderEditorItems();
  });

  document.getElementById('editor-add-text').addEventListener('click', function() {
    state.draftItems.push({ type: 'question', questionType: 'text', question: '', media: null, correctAnswer: [''], maxScore: 1000, timeLimit: 20, roundName: '' });
    state.editorExpandedIdx = state.draftItems.length - 1;
    saveDraft();
    renderEditorItems();
  });

  document.getElementById('editor-add-slide').addEventListener('click', function() {
    state.draftItems.push({ type: 'slide', title: '', description: '' });
    state.editorExpandedIdx = state.draftItems.length - 1;
    saveDraft();
    renderEditorItems();
  });

  document.getElementById('editor-back-btn').addEventListener('click', function() {
    hideError(document.getElementById('editor-error'));
    showScreen('screen-lobby-host');
  });
}
