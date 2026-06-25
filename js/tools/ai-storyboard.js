/* ==========================================================================
   LUMENFORGE — AI Storyboard Prompt Builder Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const inputs = [
    document.getElementById('p-subject'),
    document.getElementById('p-shot'),
    document.getElementById('p-lens'),
    document.getElementById('p-light'),
    document.getElementById('p-color'),
    document.getElementById('p-ar'),
    document.getElementById('p-engine')
  ];
  
  const outBox = document.getElementById('final-prompt');
  const btnCopy = document.getElementById('btn-copy');

  function generatePrompt() {
    const subject = inputs[0].value.trim() || 'A subject';
    const shot = inputs[1].value;
    const lens = inputs[2].value;
    const light = inputs[3].value;
    const color = inputs[4].value;
    const ar = inputs[5].value;
    const engine = inputs[6].value;

    // Formula: [Shot Type] of [Subject], [Lens], [Lighting], [Color/Film Stock], photorealistic masterpiece [AR] [Engine]
    let prompt = `Film still, ${shot} of ${subject}, ${lens}, ${light}, ${color}. Masterpiece, highly detailed.`;
    
    // Append engine specific tags
    if (engine.includes('--v')) {
      prompt += ` ${ar} ${engine}`;
    } else {
      prompt += `, ${engine}.`; // SD approach
    }

    outBox.textContent = prompt;
  }

  // Listen to changes
  inputs.forEach(el => {
    if (el) {
      el.addEventListener('input', generatePrompt);
    }
  });

  // Initial generation
  generatePrompt();

  // Copy to clipboard
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(outBox.textContent).then(() => {
        const originalText = btnCopy.textContent;
        btnCopy.textContent = '✅ Đã Copy!';
        btnCopy.style.background = '#32d74b';
        setTimeout(() => {
          btnCopy.textContent = originalText;
          btnCopy.style.background = 'var(--accent-cyan)';
        }, 2000);
      });
    });
  }

  // PRO Gating Interceptor for selects
  inputs.forEach(el => {
    if (el && el.tagName === 'SELECT') {
      let previousValue = el.value;
      
      el.addEventListener('focus', () => {
        previousValue = el.value;
      });
      
      el.addEventListener('change', () => {
        const selectedOption = el.options[el.selectedIndex];
        if (selectedOption && selectedOption.getAttribute('data-pro') === 'true') {
          if (typeof lfAuth !== 'undefined') {
            const featureName = selectedOption.text.replace(' (VIP PRO)', '').replace(' 👑 PRO', '');
            const hasAccess = lfAuth.gateFeature(featureName, () => {
              // Fallback: reset dropdown to previous non-PRO value
              el.value = previousValue;
              generatePrompt();
            });
            
            if (hasAccess) {
              previousValue = el.value;
            }
          } else {
            previousValue = el.value;
          }
        } else {
          previousValue = el.value;
        }
      });
    }
  });
});
