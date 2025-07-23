chrome.runtime.onInstalled.addListener(async details => {
  console.log('💡 background.js onInstalled:', details);
  if (details.reason === 'install' || details.reason === 'update') {
    try {
      const url = chrome.runtime.getURL('prompts.json');
      console.log('Fetching defaults from:', url);
      const resp = await fetch(url);
      const defaults = await resp.json();
      console.log('Seeding chrome.storage.sync with', defaults.length, 'prompts');
      await chrome.storage.sync.set({ prompts: defaults });
    } catch (err) {
      console.error('Error seeding defaults:', err);
    }
  }
});
