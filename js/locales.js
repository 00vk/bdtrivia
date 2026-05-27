import { state } from './state.js';

var LANG_KEY = 'bdtrivia_lang';

function detectLang() {
  var stored = localStorage.getItem(LANG_KEY);
  if (stored) return stored;
  return navigator.language && navigator.language.startsWith('ru') ? 'ru' : 'en';
}

state.currentLang = detectLang();

var ru = {
  'start.title': 'Викторина',
  'start.subtitle': 'Создайте викторину для друзей',
  'start.join': 'Присоединиться',
  'start.create': 'Создать игру',

  'host.nickname': 'Ваше имя',
  'host.createBtn': 'Создать комнату',
  'host.creating': 'Создаём...',
  'host.error.nickname': 'Введите ваше имя',
  'host.error.generic': 'Ошибка: {msg}',

  'host.lobby.title': 'Комната создана!',
  'host.copyBtn': '📋 Копировать',
  'host.copied': '✅ Скопировано',
  'host.editBtn': '✏️ Редактировать вопросы',
  'host.startBtn': 'Начать игру',
  'host.starting': 'Запускаем...',
  'host.enterOnPhone': 'Введите код на телефоне',
  'host.error.auth': 'Не удалось подтвердить права ведущего. Обновите страницу.',
  'host.error.notHost': 'Только ведущий может запустить игру',
  'host.waitingPlayers': 'Ожидаем игроков...',
  'host.disconnected': 'отключился',
  'host.backLobby': '← Назад в лобби',

  'join.title': 'Присоединиться к игре',
  'join.roomCode': 'Код комнаты',
  'join.yourName': 'Ваше имя',
  'join.nicknameInput': 'Никнейм',
  'join.joinBtn': 'Присоединиться',
  'join.nextBtn': 'Далее',
  'join.joining': 'Присоединяюсь...',
  'join.error.enterCode': 'Введите код комнаты',
  'join.error.notFound': 'Комната не найдена',
  'join.error.alreadyStarted': 'Игра уже началась',
  'join.error.enterNickname': 'Введите никнейм',

  'player.lobby.title': 'Вы в игре!',
  'player.lobby.waiting': 'Ожидаем, пока ведущий начнёт...',
  'player.lobby.connected': 'Подключено',

  'game.slide': 'Слайд {n} / {total}',
  'game.question': 'Вопрос {n} / {total}',
  'game.round': '{round} · Вопрос {n} / {total}',
  'game.finished': 'Игра завершена!',
  'game.timer': '⏱ {time}',
  'game.answered': 'Ответило: {n}',
  'game.answerPlaceholder': 'Ваш ответ...',
  'game.submitBtn': 'Ответить',
  'game.submittedBtn': 'Отправлено',
  'game.answerAccepted': 'Ответ принят!',
  'game.waitingOthers': 'Ждём остальных...',
  'game.next': 'Далее →',
  'game.newGame': 'Новая игра',

  'reveal.correctAnswer': 'Правильный ответ: {answer}',
  'reveal.correctCount': 'Правильно: {correct} из {total} ({pct}%)',
  'reveal.answeredCount': 'Ответило: {n} из {total}',
  'reveal.yourAnswer': 'Ваш ответ: {answer}',
  'reveal.correctLabel': 'Правильный: {answer}',
  'reveal.points': '{points} баллов',
  'reveal.pointsNegative': '{points} балла',
  'reveal.top3': 'Топ-3',

  'editor.title': 'Редактор вопросов',
  'editor.addChoice': '+ Вопрос (выбор)',
  'editor.addText': '+ Вопрос (текст)',
  'editor.addSlide': '+ Слайд',
  'editor.slidePlaceholder': 'Слайд',
  'editor.questionPlaceholder': 'Вопрос',
  'editor.noItems': 'Нет вопросов. Добавьте первый!',

  'form.title': 'Заголовок',
  'form.titlePlaceholder': 'Раунд 1: История',
  'form.description': 'Описание',
  'form.descPlaceholder': 'Правила раунда',
  'form.question': 'Вопрос',
  'form.questionPlaceholder': 'Текст вопроса',
  'form.round': 'Раунд',
  'form.roundPlaceholder': 'Название раунда',
  'form.timeLimit': 'Лимит (сек)',
  'form.maxScore': 'MAX баллов',
  'form.options': 'Варианты ответов',
  'form.optionPlaceholder': 'Вариант {n}',
  'form.correctAnswer': 'Правильный ответ (синонимы через запятую)',
  'form.correctPlaceholder': 'Канберра, Canberra',
  'form.media': 'Медиа (необязательно)',
  'form.mediaNone': 'Нет',
  'form.mediaYoutube': 'YouTube',
  'form.mediaImage': 'Картинка',
  'form.mediaAudio': 'Аудио',
  'form.mediaVideo': 'Видео',
  'form.uploadFile': 'Загрузить файл',
  'form.save': 'Сохранить',
  'form.cancel': 'Отмена',
  'form.delete': '✕ Удалить',

  'error.slideTitleRequired': 'Заголовок слайда обязателен',
  'error.questionRequired': 'Вопрос не может быть пустым',
  'error.minOptions': 'Нужно минимум 2 варианта ответа',
  'error.selectCorrect': 'Выберите правильный ответ',
  'error.specifyAnswer': 'Укажите хотя бы один правильный ответ',
  'error.confirmDelete': 'Удалить этот элемент?',

  'upload.widgetError': 'Виджет загрузки не загрузился. Проверьте интернет.',
  'upload.error': 'Ошибка: {status}',
  'upload.unknown': 'неизвестная',
  'upload.invalidUrl': 'Ошибка: недопустимый URL от Cloudinary',
  'upload.success': '✅ {file} загружен',

  'lang.toggle': 'EN',

  'packs.title': 'Мои паки',
  'packs.back': '← Назад',
  'packs.empty': 'У вас ещё нет паков',
  'packs.saveBtn': '💾 Сохранить пак',
  'packs.loadBtn': '📂 Загрузить пак',
  'packs.savePrompt': 'Название пака:',
  'packs.loading': 'Загрузка...',
  'packs.saving': 'Сохраняем...',
  'packs.saved': 'Пак сохранён! Код восстановления: {code}',
  'packs.recoveryTitle': 'Ввести код восстановления',
  'packs.recoveryPlaceholder': 'XXXXXX',
  'packs.recoveryBtn': 'Загрузить',
  'packs.deleteConfirm': 'Удалить этот пак?',
  'packs.error.auth': 'Ошибка входа: {msg}',
  'packs.error.limit': 'Максимум {n} паков',
  'packs.error.notFound': 'Пак не найден',
  'packs.error.invalidCode': 'Неверный код (нужно 6 символов)',
  'packs.error.codeNotFound': 'Код не найден',

  'present.enter': '🖥 Показать',
  'present.pauseOverlay': '⏸',
  'present.controls': 'Space — пауза · Esc — выход',
};

var en = {
  'start.title': 'Trivia',
  'start.subtitle': 'Create a trivia game for friends',
  'start.join': 'Join',
  'start.create': 'Create Game',

  'host.nickname': 'Your Name',
  'host.createBtn': 'Create Room',
  'host.creating': 'Creating...',
  'host.error.nickname': 'Enter your name',
  'host.error.generic': 'Error: {msg}',

  'host.lobby.title': 'Room Created!',
  'host.copyBtn': '📋 Copy',
  'host.copied': '✅ Copied',
  'host.editBtn': '✏️ Edit Questions',
  'host.startBtn': 'Start Game',
  'host.starting': 'Starting...',
  'host.enterOnPhone': 'Enter the code on your phone',
  'host.error.auth': 'Could not verify host rights. Please refresh the page.',
  'host.error.notHost': 'Only the host can start the game',
  'host.waitingPlayers': 'Waiting for players...',
  'host.disconnected': 'disconnected',
  'host.backLobby': '← Back to Lobby',

  'join.title': 'Join Game',
  'join.roomCode': 'Room Code',
  'join.yourName': 'Your Name',
  'join.nicknameInput': 'Nickname',
  'join.joinBtn': 'Join',
  'join.nextBtn': 'Next',
  'join.joining': 'Joining...',
  'join.error.enterCode': 'Enter a room code',
  'join.error.notFound': 'Room not found',
  'join.error.alreadyStarted': 'Game already started',
  'join.error.enterNickname': 'Enter a nickname',

  'player.lobby.title': 'You are in!',
  'player.lobby.waiting': 'Waiting for the host to start...',
  'player.lobby.connected': 'Connected',

  'game.slide': 'Slide {n} / {total}',
  'game.question': 'Question {n} / {total}',
  'game.round': '{round} · Question {n} / {total}',
  'game.finished': 'Game finished!',
  'game.timer': '⏱ {time}',
  'game.answered': 'Answered: {n}',
  'game.answerPlaceholder': 'Your answer...',
  'game.submitBtn': 'Submit',
  'game.submittedBtn': 'Submitted',
  'game.answerAccepted': 'Answer accepted!',
  'game.waitingOthers': 'Waiting for others...',
  'game.next': 'Next →',
  'game.newGame': 'New Game',

  'reveal.correctAnswer': 'Correct Answer: {answer}',
  'reveal.correctCount': 'Correct: {correct} of {total} ({pct}%)',
  'reveal.answeredCount': 'Answered: {n} of {total}',
  'reveal.yourAnswer': 'Your answer: {answer}',
  'reveal.correctLabel': 'Correct: {answer}',
  'reveal.points': '{points} points',
  'reveal.pointsNegative': '{points} points',
  'reveal.top3': 'Top 3',

  'editor.title': 'Question Editor',
  'editor.addChoice': '+ Choice',
  'editor.addText': '+ Text',
  'editor.addSlide': '+ Slide',
  'editor.slidePlaceholder': 'Slide',
  'editor.questionPlaceholder': 'Question',
  'editor.noItems': 'No questions. Add one!',

  'form.title': 'Title',
  'form.titlePlaceholder': 'Round 1: History',
  'form.description': 'Description',
  'form.descPlaceholder': 'Round rules',
  'form.question': 'Question',
  'form.questionPlaceholder': 'Question text',
  'form.round': 'Round',
  'form.roundPlaceholder': 'Round name',
  'form.timeLimit': 'Time (sec)',
  'form.maxScore': 'MAX Score',
  'form.options': 'Answer Options',
  'form.optionPlaceholder': 'Option {n}',
  'form.correctAnswer': 'Correct Answer (synonyms comma separated)',
  'form.correctPlaceholder': 'Canberra',
  'form.media': 'Media (optional)',
  'form.mediaNone': 'None',
  'form.mediaYoutube': 'YouTube',
  'form.mediaImage': 'Image',
  'form.mediaAudio': 'Audio',
  'form.mediaVideo': 'Video',
  'form.uploadFile': 'Upload File',
  'form.save': 'Save',
  'form.cancel': 'Cancel',
  'form.delete': '✕ Delete',

  'error.slideTitleRequired': 'Slide title is required',
  'error.questionRequired': 'Question cannot be empty',
  'error.minOptions': 'Need at least 2 options',
  'error.selectCorrect': 'Select the correct answer',
  'error.specifyAnswer': 'Specify at least one correct answer',
  'error.confirmDelete': 'Delete this item?',

  'upload.widgetError': 'Upload widget did not load. Check your internet.',
  'upload.error': 'Error: {status}',
  'upload.unknown': 'unknown',
  'upload.invalidUrl': 'Error: invalid URL from Cloudinary',
  'upload.success': '✅ {file} uploaded',

  'lang.toggle': 'RU',

  'packs.title': 'My Packs',
  'packs.back': '← Back',
  'packs.empty': 'No packs yet',
  'packs.saveBtn': '💾 Save Pack',
  'packs.loadBtn': '📂 Load Pack',
  'packs.savePrompt': 'Pack name:',
  'packs.loading': 'Loading...',
  'packs.saving': 'Saving...',
  'packs.saved': 'Pack saved! Recovery code: {code}',
  'packs.recoveryTitle': 'Enter recovery code',
  'packs.recoveryPlaceholder': 'XXXXXX',
  'packs.recoveryBtn': 'Load',
  'packs.deleteConfirm': 'Delete this pack?',
  'packs.error.auth': 'Auth error: {msg}',
  'packs.error.limit': 'Maximum {n} packs',
  'packs.error.notFound': 'Pack not found',
  'packs.error.invalidCode': 'Invalid code (need 6 characters)',
  'packs.error.codeNotFound': 'Code not found',

  'present.enter': '🖥 Present',
  'present.pauseOverlay': '⏸',
  'present.controls': 'Space — pause · Esc — exit',
};

var strings = { ru: ru, en: en };

export function __(key, vars) {
  var lang = state.currentLang || 'en';
  var dict = strings[lang] || strings.en;
  var val = dict[key];
  if (val === undefined) {
    val = strings.en[key];
    if (val === undefined) val = '?' + key;
  }
  if (vars) {
    for (var v in vars) {
      val = val.replace('{' + v + '}', vars[v]);
    }
  }
  return val;
}

export function toggleLang() {
  state.currentLang = state.currentLang === 'ru' ? 'en' : 'ru';
  localStorage.setItem(LANG_KEY, state.currentLang);
  applyI18n();
}

export function applyI18n() {
  var els = document.querySelectorAll('[data-i18n]');
  els.forEach(function(el) {
    var key = el.dataset.i18n;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      var attr = el.dataset.i18nAttr || 'placeholder';
      el.setAttribute(attr, __(key));
    } else {
      el.textContent = __(key);
    }
  });
  var toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) toggleBtn.textContent = __('lang.toggle');
}
