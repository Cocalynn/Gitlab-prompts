chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    try {
      const url = chrome.runtime.getURL('prompts.json');
      const resp = await fetch(url);
      const defaults = await resp.json();
      // Store defaults in local (larger quota)
      await chrome.storage.local.set({ defaultPrompts: defaults });
    } catch (err) {
      console.error('Error seeding defaults into local:', err);
    }
  }
});

