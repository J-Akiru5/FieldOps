(function() {
  const phases = document.querySelectorAll('[data-phase-id]');
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-task-key]');

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem('fieldops-tracker') || '{}');
    } catch { return {}; }
  }
  function saveState(state) {
    localStorage.setItem('fieldops-tracker', JSON.stringify(state));
  }

  function updateUI() {
    const state = loadState();
    let total = 0, done = 0;

    checkboxes.forEach(cb => {
      cb.checked = !!state[cb.dataset.taskKey];
      const row = cb.closest('.task-row');
      const title = row.querySelector('.task-title');
      if (cb.checked) title.classList.add('done');
      else title.classList.remove('done');
    });

    phases.forEach(phase => {
      const pid = phase.dataset.phaseId;
      const pChecks = document.querySelectorAll('input[data-task-key^="task-' + pid + '-"]');
      const pDone = Array.from(pChecks).filter(c => c.checked).length;
      const pct = pChecks.length ? Math.round((pDone / pChecks.length) * 100) : 0;
      total += pChecks.length;
      done += pDone;

      const fill = phase.querySelector('.phase-progress-fill');
      const count = phase.querySelector('.phase-count');
      if (fill) fill.style.width = pct + '%';
      if (count) count.textContent = pDone + '/' + pChecks.length;
    });

    const globalPct = total ? Math.round((done / total) * 100) : 0;
    const globalFill = document.getElementById('global-progress-fill');
    const globalText = document.getElementById('global-progress-text');
    if (globalFill) globalFill.style.width = globalPct + '%';
    if (globalText) globalText.textContent = globalPct + '% complete';
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const state = loadState();
      state[cb.dataset.taskKey] = cb.checked;
      saveState(state);
      updateUI();
    });
  });

  document.querySelectorAll('.task-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const body = row.nextElementSibling;
      if (body && body.classList.contains('task-body')) {
        body.classList.toggle('open');
      }
    });
  });

  updateUI();
})();