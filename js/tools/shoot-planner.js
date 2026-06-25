/* ==========================================================================
   LUMENFORGE — Shoot Planner & Call Sheet Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const inputs = {
    name: document.getElementById('p-name'),
    date: document.getElementById('p-date'),
    time: document.getElementById('p-time'),
    location: document.getElementById('p-location'),
    crew: document.getElementById('p-crew'),
    gear: document.getElementById('p-gear')
  };

  const outputs = {
    name: document.getElementById('out-name'),
    date: document.getElementById('out-date'),
    time: document.getElementById('out-time'),
    location: document.getElementById('out-location'),
    crew: document.getElementById('out-crew'),
    gear: document.getElementById('out-gear')
  };

  function updatePreview() {
    outputs.name.textContent = inputs.name.value || '[TÊN DỰ ÁN]';
    outputs.date.textContent = inputs.date.value || '...';
    outputs.time.textContent = inputs.time.value || '...';
    outputs.location.textContent = inputs.location.value || '...';
    outputs.crew.textContent = inputs.crew.value || '...';
    outputs.gear.textContent = inputs.gear.value || '...';
  }

  // Live update on input
  Object.values(inputs).forEach(el => {
    if (el) {
      el.addEventListener('input', updatePreview);
    }
  });

  // Print action (👑 VIP PRO Gated)
  const btnGenerate = document.getElementById('btn-generate');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      if (typeof lfAuth !== 'undefined') {
        const hasAccess = lfAuth.gateFeature('Xuất sơ đồ & Call Sheet chuyên nghiệp (Export Call Sheet)', () => {
          // Do nothing on cancel
        });
        if (!hasAccess) return;
      }
      updatePreview();
      window.print();
    });
  }

  // Initial preview sync
  updatePreview();
});
