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
  // Split text into normal segments and placeholder tokens
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

document.addEventListener('DOMContentLoaded', () => {
  console.log('➡️ popup.js loaded');
  const select = document.getElementById('scenario-select');
  const output = document.getElementById('prompt-text'); // now a <pre>
  const copyBtn = document.getElementById('copy-btn');
  let currentTemplate = '';

  function render(prompts) {
    console.log('Rendering', prompts.length, 'prompts');
    select.innerHTML = [
      '<option disabled selected>Select a scenario…</option>',
      ...prompts.map(p => `<option value="${p.id}">${p.title}</option>`)
    ].join('');
    select.onchange = () => {
      const pick = prompts.find(p => p.id === select.value);
      currentTemplate = pick.template;
      // Render with highlighted placeholders
      output.innerHTML = highlightPlaceholders(currentTemplate);
    };
  }

  chrome.storage.sync.get({ prompts: [] }, async ({ prompts }) => {
    console.log('⚙️ storage.sync.get returned', prompts.length, 'prompts');
    if (prompts.length) {
      return render(prompts);
    }
    console.warn('No prompts found in storage; loading bundled defaults');
    try {
      const url = chrome.runtime.getURL('prompts.json');
      console.log('Fetching fallback defaults from:', url);
      const resp = await fetch(url);
      const defaults = await resp.json();
      console.log('Fallback loaded', defaults.length, 'prompts; seeding storage');
      await chrome.storage.sync.set({ prompts: defaults });
      render(defaults);
    } catch (err) {
      console.error('Failed to load prompts.json fallback:', err);
      select.innerHTML = '<option disabled>Error loading prompts</option>';
    }
  });

  copyBtn.addEventListener('click', () => {
    // Copy raw template text to clipboard
    navigator.clipboard.writeText(currentTemplate)
      .then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy to Clipboard'), 1500);
      });
  });
});