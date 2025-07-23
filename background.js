// background.js
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // load prompts.json
    const resp = await fetch(chrome.runtime.getURL('prompts.json'));
    const defaults = await resp.json();
    // save to chrome.storage.sync
    chrome.storage.sync.set({ prompts: defaults });
  }
});
