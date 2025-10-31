const accentPicker = document.getElementById('accent');
const bgPicker = document.getElementById('background');

// Load saved colors
chrome.storage.sync.get(['theme', 'background'], (result) => {
  if (result.theme) accentPicker.value = result.theme;
  if (result.background) bgPicker.value = result.background;
});

// Save accent color
accentPicker.addEventListener('input', () => {
  const color = accentPicker.value;
  chrome.storage.sync.set({ theme: color }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('mail.google.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'themeChanged',
          theme: color
        });
      }
    });
  });
});

// Save background color
bgPicker.addEventListener('input', () => {
  const color = bgPicker.value;
  chrome.storage.sync.set({ background: color }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('mail.google.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'backgroundChanged',
          background: color
        });
      }
    });
  });
});
