import { state } from './state.js';

export function saveDraft() {
  localStorage.setItem('bdtrivia_draft', JSON.stringify(state.draftItems));
}

export function loadDraft() {
  var saved = localStorage.getItem('bdtrivia_draft');
  if (saved) {
    try { state.draftItems = JSON.parse(saved); return; } catch(e) {}
  }
  state.draftItems = JSON.parse(JSON.stringify(getSampleItems()));
}

export function getGameItems() {
  var saved = localStorage.getItem('bdtrivia_draft');
  if (saved) {
    try {
      var items = JSON.parse(saved);
      if (items.length > 0) return items;
    } catch(e) {}
  }
  return getSampleItems();
}

function getSampleItems() {
  return [
    { type: 'slide', title: 'Раунд 1: История', description: 'Вопросы по истории Древнего мира. Удачи!' },
    { type: 'question', questionType: 'choice', question: 'В каком году пал Западный Рим?', media: null, options: ['395', '476', '410', '1453'], correctAnswer: '476', maxScore: 1000, timeLimit: 20, roundName: 'История' },
    { type: 'slide', title: 'Раунд 2: Космос и География', description: 'От планет до столиц — проверьте свою эрудицию!' },
    { type: 'question', questionType: 'choice', question: 'Какая планета самая большая в Солнечной системе?', media: null, options: ['Сатурн', 'Юпитер', 'Нептун', 'Уран'], correctAnswer: 'Юпитер', maxScore: 1000, timeLimit: 20, roundName: 'Космос' },
    { type: 'question', questionType: 'text', question: 'Назовите столицу Австралии', media: null, correctAnswer: ['Канберра', 'Canberra'], maxScore: 2000, timeLimit: 30, roundName: 'География' }
  ];
}
