document.addEventListener('DOMContentLoaded', () => {
  const residual = document.getElementById('residual');
  const cipher = document.getElementById('cipher');
  setTimeout(() => { residual.classList.add('revealed'); cipher.classList.add('revealed'); }, 3000);
  let tipTimeout;
  const showTip = () => { clearTimeout(tipTimeout); cipher.classList.add('show-tooltip'); tipTimeout = setTimeout(() => cipher.classList.remove('show-tooltip'), 2000); };
  cipher.addEventListener('mouseenter', showTip);
  cipher.addEventListener('focus', showTip);
  cipher.addEventListener('touchstart', (e) => { showTip(); }, {passive: true});
});
