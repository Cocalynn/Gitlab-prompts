// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('scenario-select');
  const textarea = document.getElementById('prompt-text');
  const copyBtn = document.getElementById('copy-btn');

  chrome.storage.sync.get({ prompts: [] }, ({ prompts }) => {
    if (!prompts.length) {
      select.innerHTML = '<option disabled>No prompts found</option>';
      return;
    }
    select.innerHTML = [
      '<option disabled selected>Select a scenario…</option>',
      ...prompts.map(p => `<option value="${p.id}">${p.title}</option>`)
    ].join('');

    select.addEventListener('change', () => {
      const pick = prompts.find(p => p.id === select.value);
      textarea.value = pick.template;
    });
  });

  copyBtn.addEventListener('click', () => {
    textarea.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 1500);
  });
});
