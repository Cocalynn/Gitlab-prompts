// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('scenario-select');
  const textarea = document.getElementById('prompt-text');
  const copyBtn = document.getElementById('copy-btn');

  // Load prompts.json
  const resp = await fetch(chrome.runtime.getURL('prompts.json'));
  const prompts = await resp.json();

  // Populate dropdown
  select.innerHTML = prompts
    .map(p => `<option value="${p.id}">${p.title}</option>`)
    .join('');

  // When user picks a scenario
  select.addEventListener('change', () => {
    const pick = prompts.find(p => p.id === select.value);
    textarea.value = pick.template;
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    textarea.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy to Clipboard'), 1500);
  });
});
