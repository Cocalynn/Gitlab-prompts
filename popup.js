// popup.js
// A palette of background and foreground color pairs for placeholders
const COLOR_PAIRS = [
  { bg: '#BBDEFB', fg: '#0D47A1' },
  { bg: '#C8E6C9', fg: '#1B5E20' },
  { bg: '#FFE082', fg: '#FF8F00' },
  { bg: '#FFCCBC', fg: '#E64A19' },
  { bg: '#E1BEE7', fg: '#4A148C' },
  { bg: '#B2DFDB', fg: '#004D40' }
];

function getRandomPair() {
  return COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
}

// Escape HTML entities to prevent unintended HTML injection
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Highlight placeholders delimited by #<...> with colored background & contrasting text
function highlightPlaceholders(text) {
  const parts = text.split(/(#<[^>]+>)/g);
  return parts.map(part => {
    if (/^#<[^>]+>$/.test(part)) {
      const { bg, fg } = getRandomPair();
      return `<span class="placeholder" style="background:${bg}; color:${fg}">${escapeHTML(part)}</span>`;
    } else {
      return escapeHTML(part);
    }
  }).join('');
}

// Always fetch and cache defaults, then auto-reset and merge with user prompts
async function loadPrompts() {
  // 1. Fetch the latest defaults from bundled JSON
  let defaultPrompts = [];
  try {
    const url = chrome.runtime.getURL('prompts.json');
    const resp = await fetch(url);
    defaultPrompts = await resp.json();
    // Cache the latest defaults
    await chrome.storage.local.set({ defaultPrompts });
  } catch (err) {
    console.error('Failed to fetch prompts.json:', err);
    // Fallback to local cache
    const local = await chrome.storage.local.get('defaultPrompts');
    defaultPrompts = local.defaultPrompts || [];
  }

   // 2. Load any user‑modified or added prompts (don't reset them)
  const { prompts: userPrompts = [] } = await chrome.storage.sync.get('prompts');

  // 4. Merge defaults with user prompts (user takes precedence)
  const merged = [...defaultPrompts];
  for (const up of userPrompts) {
    const idx = merged.findIndex(dp => dp.id === up.id);
    if (idx > -1) merged[idx] = up;
    else merged.push(up);
  }
  return merged;
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('➡️ popup.js loaded');
  const select = document.getElementById('scenario-select');
  const output = document.getElementById('prompt-text');
  const copyBtn = document.getElementById('copy-btn');
  let currentTemplate = '';

  function render(prompts) {
    if (!prompts.length) {
      select.innerHTML = '<option disabled>No prompts available</option>';
      return;
    }
    select.innerHTML = [
      '<option disabled selected>Select a scenario…</option>',
      ...prompts.map(p => `<option value="${p.id}">${p.title}</option>`)
    ].join('');
    // Auto‑select and render the first prompt
    select.selectedIndex = 1;
    select.onchange = () => {
      const pick = prompts.find(p => p.id === select.value);
      currentTemplate = pick.template;
      output.innerHTML = highlightPlaceholders(currentTemplate);
      copyBtn.focus();
    };
    select.onchange();
  }

  try {
    const prompts = await loadPrompts();
    render(prompts);
  } catch (err) {
    console.error('Error loading prompts:', err);
    select.innerHTML = `<option disabled>Error loading prompts: ${err.message}</option>`;
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentTemplate)
      .then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy to Clipboard'), 1500);
      })
      .catch(err => console.error('Copy failed:', err));
  });
});
