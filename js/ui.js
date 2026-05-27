export function showScreen(id) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  var el = document.getElementById(id);
  if (el) el.classList.add('active');
}

export function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

export function hideError(el) {
  el.classList.add('hidden');
}

export function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}
