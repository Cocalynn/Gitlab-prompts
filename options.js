// options.js
const listEl = document.getElementById('list');
const form = document.getElementById('prompt-form');
const idInput = document.getElementById('prompt-id');
const titleInput = document.getElementById('prompt-title');
const templateInput = document.getElementById('prompt-template');
const cancelBtn = document.getElementById('cancel-btn');

let prompts = [];

// Utility: render the list of prompts
function renderList() {
  listEl.innerHTML = '';
  prompts.forEach(p => {
    const div = document.createElement('div');
    div.className = 'prompt';
    div.innerHTML = `
      <strong>${p.title}</strong>
      <button data-id="${p.id}" class="edit-btn">Edit</button>
      <button data-id="${p.id}" class="delete-btn">Delete</button>
      <pre>${p.template}</pre>
    `;
    listEl.appendChild(div);
  });
  // wire up buttons
  listEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.id));
  });
  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deletePrompt(btn.dataset.id));
  });
}

// Load from storage on open
chrome.storage.sync.get({ prompts: [] }, data => {
  prompts = data.prompts;
  renderList();
});

// Start editing or adding
function startEdit(id) {
  const p = prompts.find(x => x.id === id) || { id: '', title: '', template: '' };
  idInput.value = p.id;
  titleInput.value = p.title;
  templateInput.value = p.template;
}

// Cancel edit
cancelBtn.addEventListener('click', () => {
  form.reset();
  idInput.value = '';
});

// Delete a prompt
function deletePrompt(id) {
  prompts = prompts.filter(p => p.id !== id);
  chrome.storage.sync.set({ prompts }, renderList);
}

// Handle form submission
form.addEventListener('submit', e => {
  e.preventDefault();
  const id = idInput.value || `prompt_${Date.now()}`;
  const updated = { id, title: titleInput.value.trim(), template: templateInput.value.trim() };

  // replace or add
  const idx = prompts.findIndex(p => p.id === id);
  if (idx > -1) prompts[idx] = updated;
  else prompts.push(updated);

  // save and reset
  chrome.storage.sync.set({ prompts }, () => {
    renderList();
    form.reset();
    idInput.value = '';
  });
});
