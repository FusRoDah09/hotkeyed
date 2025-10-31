class GmailShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.commands = new Map();
    this.enabled = true;
    this.helpVisible = false;
    this.commandPanelVisible = false;
    this.sequenceBuffer = '';
    this.sequenceTimeout = null;
    this.selectedIndex = -1;
    
    this.state = {
      selectedEmails: new Set(),
      currentFocus: null,
      lastFocusedRow: null,
      selectionAnchor: null,
      viewContext: 'list',
      lastAction: null,
      currentFolder: null,
      lastFolder: null
    };
    
    this.init();
  }

  init() {
    this.waitForGmail().then(() => {
      this.enableGmailShortcuts();
      this.loadSettings();
      this.registerAllShortcuts();
      this.registerCommands();
      this.attachListeners();
      this.injectHelpOverlay();
      this.injectCommandPanel();
      this.observeViewChanges();
      console.log('Hotkeyed extension loaded');
    });
  }

  waitForGmail() {
    return new Promise((resolve) => {
      const checkGmail = setInterval(() => {
        if (document.querySelector('[gh="tl"]') || 
            document.querySelector('.AO') ||
            document.querySelector('[role="main"]')) {
          clearInterval(checkGmail);
          resolve();
        }
      }, 500);
    });
  }

  enableGmailShortcuts() {
    setTimeout(() => {
      try {
        localStorage.setItem('bx_ks', 'true');
        console.log('Gmail shortcuts enabled');
      } catch (e) {
        console.warn('Could not enable Gmail shortcuts:', e);
      }
    }, 1000);
  }

  observeViewChanges() {
    const observer = new MutationObserver(() => {
      this.updateViewContext();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  updateViewContext() {
    if (document.querySelector('.nH .if')) {
      this.state.viewContext = 'conversation';
    } else if (document.querySelector('.dw .no')) {
      this.state.viewContext = 'compose';
    } else {
      this.state.viewContext = 'list';
    }
  }

  loadSettings() {
    chrome.storage.sync.get(['enabled', 'theme', 'background'], (result) => {
      this.enabled = result.enabled !== false;
      if (result.theme) {
        document.documentElement.style.setProperty('--hotkeyed-primary', result.theme);
      }
      if (result.background) {
        document.documentElement.style.setProperty('--hotkeyed-background', result.background);
      }
    });
  }

  applyTheme(theme) {
    const root = document.documentElement;
    if (theme) {
      root.style.setProperty('--hotkeyed-primary', theme);
    }
  }

  // Send proper keyboard events to Gmail
  sendKey(shortcutKey, shiftKey = false, ctrlKey = false, metaKey = false) {
    const keyMap = {
      'e': { keyCode: 69, charCode: 101 },
      'E': { keyCode: 69, charCode: 69 },
      'x': { keyCode: 88, charCode: 120 },
      'X': { keyCode: 88, charCode: 88 },
      'c': { keyCode: 67, charCode: 99 },
      'C': { keyCode: 67, charCode: 67 },
      'd': { keyCode: 68, charCode: 100 },
      'r': { keyCode: 82, charCode: 114 },
      'a': { keyCode: 65, charCode: 97 },
      'A': { keyCode: 65, charCode: 65 },
      'f': { keyCode: 70, charCode: 102 },
      's': { keyCode: 83, charCode: 115 },
      'S': { keyCode: 83, charCode: 83 },
      'h': { keyCode: 72, charCode: 104 },
      'b': { keyCode: 66, charCode: 98 },
      'u': { keyCode: 85, charCode: 117 },
      'U': { keyCode: 85, charCode: 85 },
      'i': { keyCode: 73, charCode: 105 },
      'I': { keyCode: 73, charCode: 73 },
      'j': { keyCode: 74, charCode: 106 },
      'J': { keyCode: 74, charCode: 74 },
      'k': { keyCode: 75, charCode: 107 },
      'K': { keyCode: 75, charCode: 75 },
      'l': { keyCode: 76, charCode: 108 },
      'L': { keyCode: 76, charCode: 76 },
      'y': { keyCode: 89, charCode: 121 },
      'Y': { keyCode: 89, charCode: 89 },
      'v': { keyCode: 86, charCode: 118 },
      'm': { keyCode: 77, charCode: 109 },
      'M': { keyCode: 77, charCode: 77 },
      'n': { keyCode: 78, charCode: 110 },
      'p': { keyCode: 80, charCode: 112 },
      'o': { keyCode: 79, charCode: 111 },
      'O': { keyCode: 79, charCode: 79 },
      'g': { keyCode: 71, charCode: 103 },
      't': { keyCode: 84, charCode: 116 },
      'z': { keyCode: 90, charCode: 122 },
      'q': { keyCode: 81, charCode: 113 },
      '#': { keyCode: 51, charCode: 35 },
      '!': { keyCode: 49, charCode: 33 },
      '/': { keyCode: 191, charCode: 47 },
      '?': { keyCode: 191, charCode: 63 },
      '*': { keyCode: 56, charCode: 42 },
      '[': { keyCode: 219, charCode: 91 },
      ']': { keyCode: 221, charCode: 93 },
      '`': { keyCode: 192, charCode: 96 },
      '~': { keyCode: 192, charCode: 126 },
      '-': { keyCode: 189, charCode: 45 },
      '=': { keyCode: 187, charCode: 61 },
      '+': { keyCode: 187, charCode: 43 },
      ';': { keyCode: 186, charCode: 59 },
      'enter': { keyCode: 13, charCode: 13 },
      'escape': { keyCode: 27, charCode: 27 },
      'space': { keyCode: 32, charCode: 32 },
      'tab': { keyCode: 9, charCode: 9 },
      'left': { keyCode: 37, charCode: 0 },
      'right': { keyCode: 39, charCode: 0 },
      'up': { keyCode: 38, charCode: 0 },
      'down': { keyCode: 40, charCode: 0 }
    };

    const keyInfo = keyMap[shortcutKey] || keyMap[shortcutKey.toLowerCase()];
    if (!keyInfo) {
      console.warn('Unknown key:', shortcutKey);
      return;
    }

    const target = document.querySelector('[role="main"]') || 
                   document.querySelector('.nH.bkK') || 
                   document.body;

    const isUpperCase = shortcutKey === shortcutKey.toUpperCase() && shortcutKey.length === 1;
    
    const keyDownEvent = new KeyboardEvent('keydown', {
      keyCode: keyInfo.keyCode,
      charCode: 0,
      shiftKey: shiftKey || isUpperCase,
      ctrlKey: ctrlKey,
      metaKey: metaKey,
      bubbles: true,
      cancelable: true
    });

    const keyPressEvent = new KeyboardEvent('keypress', {
      keyCode: keyInfo.charCode,
      charCode: keyInfo.charCode,
      shiftKey: shiftKey || isUpperCase,
      ctrlKey: ctrlKey,
      metaKey: metaKey,
      bubbles: true,
      cancelable: true
    });

    target.dispatchEvent(keyDownEvent);
    target.dispatchEvent(keyPressEvent);
  }

  registerAllShortcuts() {
    // Actions
    this.addShortcut('Ctrl+k', 'Command Panel', () => this.toggleCommandPanel());
    this.addShortcut('Meta+k', 'Command Panel', () => this.toggleCommandPanel());
    this.addShortcut('/', 'Search', () => this.sendKey('/'));
    this.addShortcut('z', 'Undo', () => this.sendKey('z'));
    this.addShortcut('?', 'Shortcuts', () => this.toggleHelp());
    
    // Selection
    this.addShortcut('x', 'Select Conversation', () => this.sendKey('x'));
    this.addShortcut('Shift+j', 'Select Next', () => {
      if (!this.hasSelectedEmail() && this.hasFocusedEmail()) {
        this.sendKey('x');
        setTimeout(() => this.sendKey('j'), 50);
      } else {
        setTimeout(() => this.sendKey('j'), 50);
        setTimeout(() => this.sendKey('x'), 100);
      }
    });
    
    this.addShortcut('Shift+k', 'Select Previous', () => {
      if (!this.hasSelectedEmail() && this.hasFocusedEmail()) {
        this.sendKey('x');
        setTimeout(() => this.sendKey('k'), 50);
      } else {
        setTimeout(() => this.sendKey('k'), 50);
        setTimeout(() => this.sendKey('x'), 100);
      }
    });

    this.addShortcut('Escape', 'Clear Selection / Back', () => {
      if (this.hasSelectedEmail()) {
        this.sendKey('*');
        setTimeout(() => this.sendKey('n'), 50);
      } else if (!this.isListView()) {
        this.sendKey('u');
      }
    });

    this.addShortcut('* a', 'Select All', () => {
      this.sendKey('*');
      setTimeout(() => this.sendKey('a'), 50);
    });
    
    this.addShortcut('l', 'Add/Remove Label', () => {
      if (this.hasSelectedEmail()) {
        this.sendKey('l');  
      } else {
        this.sendKey('x');
        setTimeout(() => this.sendKey('l'), 50);
      }
    });

    this.addShortcut('y', 'Remove Label', () => {
      if (this.hasSelectedEmail()) {
        this.sendKey('y');
      } else {
        this.sendKey('x');
        setTimeout(() => this.sendKey('y'), 50);
      }
    });

    this.addShortcut('[', 'Remove Label, Next', () => this.sendKey('['));
    this.addShortcut(']', 'Remove Label, Previous', () => this.sendKey(']'));
    this.addShortcut('v', 'Move to Folder', () => this.sendKey('v'));
    
    // Conversations
    this.addShortcut('e', 'Archive', () => {
      if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('x');
        setTimeout(() => this.sendKey('e'), 5);
      } else if (!this.isListView()) {
        this.sendKey('e');
      }
    });
    
    this.addShortcut('Shift+e', 'Move to Inbox', () => {
      if (!this.hasSelectedEmail() && this.hasFocusedEmail()) {
        this.sendKey('x');
        setTimeout(() => this.moveToInboxAction(), 50);
      } else {
        this.moveToInboxAction();
      }
    });
    
    this.moveToInboxAction = () => {
      this.sendKey('v');
      setTimeout(() => {
        const input = document.querySelector('input[aria-label*="Label"]') ||
                     document.querySelector('input[aria-label*="Move to"]');
        if (input) {
          input.value = 'Inbox';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(() => {
            const inboxOption = Array.from(document.querySelectorAll('[role="menuitem"]'))
              .find(item => item.textContent.trim().toLowerCase() === 'inbox');
            if (inboxOption) {
              inboxOption.click();
            } else {
              input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
            }
          }, 150);
        }
      }, 300);
    };
    
    this.addShortcut('h', 'Snooze', () => {
      if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('b');
      } else if (!this.isListView()) {
        this.sendKey('b');
      }
    });
    this.addShortcut('b', 'Snooze', () => {
      if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('b');
      } else if (!this.isListView()) {
        this.sendKey('b');
      }
    });
    
    this.addShortcut('s', 'Star', () => this.sendKey('s'));
    this.addShortcut('u', 'Toggle Read/Unread', () => this.sendKey('u'));
    this.addShortcut('Shift+u', 'Mark Unread', () => {
      if (this.hasSelectedEmail() && this.hasFocusedEmail()) {
        this.sendKey('U');
        setTimeout(() => this.sendKey('*'), 200);
        setTimeout(() => this.sendKey('n'), 250);
      } else if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('X');
        setTimeout(() => this.sendKey('U'), 200);
        setTimeout(() => this.sendKey('*'), 250);
        setTimeout(() => this.sendKey('n'), 300);
      }
    });
    this.addShortcut('Shift+i', 'Mark Read', () => {
      if (this.hasSelectedEmail() && this.hasFocusedEmail()) {
        this.sendKey('I');
        setTimeout(() => this.sendKey('*'), 200);
        setTimeout(() => this.sendKey('n'), 250);
      } else if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('X');
        setTimeout(() => this.sendKey('I'), 200);
        setTimeout(() => this.sendKey('*'), 250);
        setTimeout(() => this.sendKey('n'), 300);
      }
    });
    this.addShortcut('Delete', 'Delete', () => {
      const deleteBtn = document.querySelector('[data-tooltip="Delete"]') ||
                       document.querySelector('[aria-label*="Delete"]');
      if (deleteBtn) {
        deleteBtn.click();
      } else {
        this.sendKey('#');
      }
    });
    this.addShortcut('!', 'Mark Spam', () => this.sendKey('!'));
    this.addShortcut('Shift+m', 'Mute', () => this.sendKey('m'));
    this.addShortcut('=', 'Mark Important', () => this.sendKey('='));
    this.addShortcut('-', 'Mark Not Important', () => this.sendKey('-'));
    
    this.addShortcut('Ctrl+u', 'Unsubscribe', () => {
      const gmailUnsub = Array.from(document.querySelectorAll('[role="link"], [role="button"], a'))
        .find(el => {
          const text = el.textContent.toLowerCase();
          const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
          return text.includes('unsubscribe') || ariaLabel.includes('unsubscribe');
        });
      
      if (gmailUnsub) {
        gmailUnsub.click();
        setTimeout(() => {
          const confirmBtn = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.toLowerCase().includes('unsubscribe'));
          if (confirmBtn) confirmBtn.click();
        }, 300);
      } else if (!this.isListView()) {
        const unsubLink = document.querySelector('a[href*="unsubscribe"], a[href*="opt-out"], a[href*="optout"]');
        if (unsubLink) window.open(unsubLink.href, '_blank');
      } else {
        this.sendKey('enter');
        setTimeout(() => {
          const gmailUnsub = Array.from(document.querySelectorAll('[role="link"], [role="button"], a'))
            .find(el => el.textContent.toLowerCase().includes('unsubscribe'));
          if (gmailUnsub) gmailUnsub.click();
        }, 500);
      }
    });
    
    // Messages
    this.addShortcut('c', 'Compose', () => this.sendKey('c'));
    this.addShortcut('Shift+c', 'Pop Out Compose', () => this.sendKey('d'));
    this.addShortcut('Enter', 'Open/Reply All', () => this.sendKey('enter'));
    
    this.addShortcut('r', 'Reply', () => {
      if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('enter');
        setTimeout(() => this.sendKey('r'), 200);
      } else {
        this.sendKey('r');
      }
    });
    
    this.addShortcut('a', 'Reply All', () => {
      if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('enter');
        setTimeout(() => this.sendKey('a'), 200);
      } else {
        this.sendKey('a');
      }
    });
    
    this.addShortcut('f', 'Forward', () => {
      if (this.isListView() && this.hasFocusedEmail()) {
        this.sendKey('enter');
        setTimeout(() => this.sendKey('f'), 200);
      } else {
        this.sendKey('f');
      }
    });
    
    this.addShortcut('Ctrl+o', 'Open Attachments', () => {
      if (!this.isListView()) {
        const attachments = [];
        
        document.querySelectorAll('a[href*="?projector=1"]').forEach(link => {
          if (!attachments.includes(link.href)) attachments.push(link.href);
        });
        
        document.querySelectorAll('a[download], a[href*="&view=att"]').forEach(link => {
          if (!attachments.includes(link.href)) attachments.push(link.href);
        });
        
        document.querySelectorAll('.aZo a[href*="mail.google.com/mail"][target="_blank"]').forEach(link => {
          if (!attachments.includes(link.href)) attachments.push(link.href);
        });
        
        attachments.forEach(url => window.open(url, '_blank'));
      }
    });
    
    this.addShortcut('o', 'Expand Message', () => this.sendKey('o'));
    this.addShortcut('Shift+o', 'Expand All', () => {
      // Click all collapsed messages
      const collapsed = document.querySelectorAll('.h7 .hx .hA');
      collapsed.forEach(msg => msg.click());
    });
    
    // Navigation
    this.addShortcut('j', 'Next Conversation', () => this.sendKey('j'));
    this.addShortcut('k', 'Previous Conversation', () => this.sendKey('k'));
    this.addShortcut('n', 'Newer Message', () => this.sendKey('n'));
    this.addShortcut('p', 'Older Message', () => this.sendKey('p'));
    this.addShortcut('`', 'Next Category', () => this.sendKey('`'));
    this.addShortcut('~', 'Previous Category', () => this.sendKey('~'));
    
    // Use native arrow keys for navigation when viewing email
    this.addShortcut('ArrowLeft', 'Previous Email', () => {
      if (!this.isListView()) {
        this.sendKey('k');
      }
    });
    this.addShortcut('ArrowRight', 'Next Email', () => {
      if (!this.isListView()) {
        this.sendKey('j');
      }
    });
    
    // Scroll
    this.addShortcut('Space', 'Scroll Down', () => {
      const scrollable = document.querySelector('[role="main"]') || 
                        document.querySelector('.AO') || 
                        document.querySelector('.Tm.aeJ');
      if (scrollable && scrollable !== document.body) {
        scrollable.scrollTop += scrollable.clientHeight * 0.8;
      } else {
        window.scrollBy(0, window.innerHeight * 0.8);
      }
    });
    this.addShortcut('Shift+Space', 'Scroll Up', () => {
      const scrollable = document.querySelector('[role="main"]') || 
                        document.querySelector('.AO') || 
                        document.querySelector('.Tm.aeJ');
      if (scrollable && scrollable !== document.body) {
        scrollable.scrollTop -= scrollable.clientHeight * 0.8;
      } else {
        window.scrollBy(0, -window.innerHeight * 0.8);
      }
    });
    
    // Folders (G then...)
    this.addShortcut('g i', 'Go to Inbox', () => {
      this.sendKey('g');
      setTimeout(() => this.sendKey('i'), 50);
    });
    this.addShortcut('g s', 'Go to Starred', () => {
      this.sendKey('g');
      setTimeout(() => this.sendKey('s'), 50);
    });
    this.addShortcut('g d', 'Go to Drafts', () => {
      this.sendKey('g');
      setTimeout(() => this.sendKey('d'), 50);
    });
    this.addShortcut('g t', 'Go to Sent', () => {
      this.sendKey('g');
      setTimeout(() => this.sendKey('t'), 50);
    });
    this.addShortcut('g a', 'Go to All Mail', () => {
      this.sendKey('g');
      setTimeout(() => this.sendKey('a'), 50);
    });
    this.addShortcut('g !', 'Go to Spam', () => window.location.hash = '#spam');
    this.addShortcut('g #', 'Go to Trash', () => window.location.hash = '#trash');
    
    // Compose shortcuts
    this.addShortcut('Ctrl+Enter', 'Send', () => {
      if (this.isInCompose()) {
        this.sendKey('tab', false, true);
      }
    });
    this.addShortcut('Meta+Enter', 'Send', () => {
      if (this.isInCompose()) {
        this.sendKey('tab', false, false, true);
      }
    });
    
    this.addShortcut('Ctrl+Shift+l', 'Schedule Send', () => {
      if (this.isInCompose()) {
        const sendBtn = document.querySelector('[aria-label*="Send"]') ||
                       document.querySelector('[data-tooltip*="Send"]');
        if (!sendBtn) return;
        
        const dropdown = sendBtn.nextElementSibling ||
                        sendBtn.parentElement?.querySelector('[role="button"][aria-haspopup]') ||
                        document.querySelector('[aria-label*="Send"][aria-haspopup]');
        
        if (dropdown) {
          dropdown.click();
          setTimeout(() => {
            const scheduleOption = Array.from(document.querySelectorAll('[role="menuitem"]'))
              .find(el => el.textContent.toLowerCase().includes('schedule'));
            if (scheduleOption) scheduleOption.click();
          }, 200);
        }
      }
    });
  }

  // Helper methods
  isListView() {
    return !document.querySelector('.nH .if') && !document.querySelector('.dw .no');
  }

  isInCompose() {
    return document.querySelector('.dw .no') !== null;
  }

  hasSelectedEmail() {
    return document.querySelector('.x7') !== null || 
           document.querySelector('[aria-checked="true"]') !== null;
  }

  hasFocusedEmail() {
    // Check if any email row has focus indicator
    return document.querySelector('tr.btb') !== null ||
           document.querySelector('tr.zA:focus') !== null;
  }

  addShortcut(key, description, callback) {
    const normalizedKey = this.normalizeKey(key);
    this.shortcuts.set(normalizedKey, { key, description, callback });
  }

  normalizeKey(key) {
    return key.toLowerCase()
      .replace('meta+', 'cmd+')
      .replace('ctrl+', 'ctrl+')
      .replace('shift+', 'shift+')
      .replace('alt+', 'alt+')
      .replace(/\s+/g, ' ');
  }

  attachListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      
      if (e.target.matches('input, textarea, [contenteditable="true"]')) {
        if (this.commandPanelVisible) {
          this.handleCommandPanelNavigation(e);
        }
        return;
      }

      const key = this.getKeyCombo(e);
      
      if (this.sequenceBuffer) {
        const sequenceKey = `${this.sequenceBuffer} ${key}`;
        const shortcut = this.shortcuts.get(sequenceKey);
        
        if (shortcut) {
          e.preventDefault();
          e.stopPropagation();
          shortcut.callback();
        }
        
        this.sequenceBuffer = '';
        clearTimeout(this.sequenceTimeout);
        return;
      }

      if (key === 'g' || key === '*') {
        this.sequenceBuffer = key;
        this.sequenceTimeout = setTimeout(() => {
          this.sequenceBuffer = '';
        }, 1000);
        e.preventDefault();
        return;
      }

      const shortcut = this.shortcuts.get(key);
      if (shortcut) {
        e.preventDefault();
        e.stopPropagation();
        shortcut.callback();
      }
    });
  }

  getKeyCombo(e) {
    let combo = [];
    
    if (e.metaKey || e.ctrlKey) {
      combo.push(e.metaKey ? 'cmd' : 'ctrl');
    }
    if (e.altKey) combo.push('alt');
    if (e.shiftKey) combo.push('shift');
    
    const key = e.key.toLowerCase();
    
    const keyMap = {
      'enter': 'enter',
      'escape': 'escape',
      ' ': 'space',
      'arrowleft': 'arrowleft',
      'arrowright': 'arrowright'
    };
    
    combo.push(keyMap[key] || key);
    
    return combo.join('+');
  }

  // Command panel methods
  registerCommands() {

    this.commands.set('settings', {
      name: 'Open Settings',
      key: '',
      category: 'Actions',
      action: () => {
        const settingsBtn = document.querySelector('[aria-label*="Settings"]') ||
                           document.querySelector('[aria-label*="settings"]');
        if (settingsBtn) settingsBtn.click();
      }
    });
    
    this.commands.set('refresh inbox', {
      name: 'Refresh Inbox',
      key: '',
      category: 'Actions',
      action: () => {
        const refreshBtn = document.querySelector('[data-tooltip="Refresh"]');
        if (refreshBtn) refreshBtn.click();
      }
    });
    
    this.commands.set('delete emails from company', {
      name: 'Delete All Emails from Company',
      key: '',
      category: 'Actions',
      action: () => this.deleteFromCompany()
    });
    
    this.shortcuts.forEach((shortcut, key) => {
      if (!shortcut.description.includes('Command Panel')) {
        this.commands.set(shortcut.description.toLowerCase(), {
          name: shortcut.description,
          key: shortcut.key,
          category: this.getCategoryForCommand(shortcut.description),
          action: shortcut.callback
        });
      }
    });
  }

  deleteFromCompany() {
    // Get sender email from current email
    const senderElement = document.querySelector('[email]');
    if (senderElement) {
      const email = senderElement.getAttribute('email');
      const domain = email.split('@')[1];
      
      // Create filter to delete all from domain
      window.location.href = `#settings/filters`;
      setTimeout(() => {
        const createFilter = document.querySelector('[data-tooltip="Create a new filter"]');
        if (createFilter) createFilter.click();
        
        setTimeout(() => {
          const fromField = document.querySelector('input[aria-label="From"]');
          if (fromField) {
            fromField.value = `@${domain}`;
            // Continue with filter creation
          }
        }, 300);
      }, 500);
    }
  }

  getCategoryForCommand(description) {
    const categories = {
      'Compose': ['Compose', 'Reply', 'Forward', 'Send', 'Schedule'],
      'Navigation': ['Next', 'Previous', 'Go to', 'Scroll', 'Category'],
      'Actions': ['Archive', 'Delete', 'Star', 'Snooze', 'Spam', 'Mute', 'Label', 'Move', 'Inbox', 'Important'],
      'Selection': ['Select', 'Clear']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  // UI injection methods
  injectHelpOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'hotkeyed-help';
    overlay.innerHTML = `
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="shortcuts-close">×</button>
        </div>
        <div class="shortcuts-body">
          ${this.generateShortcutsHTML()}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.shortcuts-close').addEventListener('click', () => {
      this.toggleHelp();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.toggleHelp();
      }
    });
  }

  generateShortcutsHTML() {
    const categories = {
      'Actions': ['ctrl+k', '/', 'z', '?', 'x'],
      'Conversations': ['e', 'shift+e', 'h', 's', 'u', '#', '!', 'shift+m', '=', '-'],
      'Messages': ['c', 'shift+c', 'enter', 'r', 'a', 'f', 'ctrl+o', 'o', 'shift+o'],
      'Navigation': ['j', 'k', 'n', 'p', '`', '~', 'space', 'shift+space'],
      'Folders': ['g i', 'g s', 'g d', 'g t', 'g a', 'g !', 'g #'],
      'Labels': ['l', 'y', '[', ']', 'shift+y', 'v'],
      'Selection': ['x', 'shift+j', 'shift+k', 'escape', '* a'],
      'Compose': ['ctrl+enter', 'ctrl+shift+l']
    };

    let html = '';
    for (const [category, keys] of Object.entries(categories)) {
      html += `<div class="shortcuts-category">
        <h3>${category}</h3>
        <div class="shortcuts-list">`;
      
      keys.forEach(key => {
        const shortcut = this.shortcuts.get(key.toLowerCase());
        if (shortcut) {
          const displayKey = shortcut.key
            .toUpperCase()
            .replace('META', '⌘')
            .replace('CTRL', 'CTRL')
            .replace('SHIFT', 'SHIFT');
            
          html += `
            <div class="shortcut-item">
              <kbd>${displayKey}</kbd>
              <span>${shortcut.description}</span>
            </div>
          `;
        }
      });
      
      html += `</div></div>`;
    }
    return html;
  }

  toggleHelp() {
    this.helpVisible = !this.helpVisible;
    const overlay = document.getElementById('hotkeyed-help');
    overlay.style.display = this.helpVisible ? 'flex' : 'none';
  }

  injectCommandPanel() {
    const panel = document.createElement('div');
    panel.id = 'hotkeyed-command-panel';
    panel.innerHTML = `
      <div class="command-panel-backdrop"></div>
      <div class="command-panel-container">
        <div class="command-panel-header">
          <img src="chrome-extension://${chrome.runtime.id}/icons/icon48.png" class="command-panel-logo">
          <span class="command-panel-title">Hotkeyed</span>
          <input type="text" id="command-search" placeholder="Type a command..." autocomplete="off">
          <div class="command-panel-hints">
            <span class="hint-key">ESC</span>
            <span>to close</span>
          </div>
        </div>
        <div class="command-panel-results"></div>
      </div>
    `;
    document.body.appendChild(panel);

    const backdrop = panel.querySelector('.command-panel-backdrop');
    backdrop.addEventListener('click', () => this.toggleCommandPanel());

    const searchInput = panel.querySelector('#command-search');
    searchInput.addEventListener('input', () => this.filterCommands());
  }

  toggleCommandPanel() {
    this.commandPanelVisible = !this.commandPanelVisible;
    const panel = document.getElementById('hotkeyed-command-panel');
    const input = panel.querySelector('#command-search');
    
    if (this.commandPanelVisible) {
      panel.style.display = 'flex';
      input.value = '';
      input.focus();
      this.displayAllCommands();
      this.selectedIndex = 0;
      this.highlightSelectedCommand();
    } else {
      panel.style.display = 'none';
      this.selectedIndex = -1;
    }
  }

  displayAllCommands() {
    const results = document.querySelector('.command-panel-results');
    const categories = {};
    
    this.commands.forEach(cmd => {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(cmd);
    });

    let html = '';
    Object.entries(categories).forEach(([category, cmds]) => {
      html += `
        <div class="command-category">
          <div class="command-category-title">${category}</div>
          ${cmds.map((cmd, i) => `
            <div class="command-item" data-command="${cmd.name}">
              <div class="command-info">
                <span class="command-name">${cmd.name}</span>
                ${cmd.key ? `<span class="command-key">${cmd.key
                  .toUpperCase()
                  .replace('META', '⌘')
                  .replace('CTRL', 'CTRL')
                  .replace('SHIFT', 'SHIFT')}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });
    
    results.innerHTML = html;
    
    results.querySelectorAll('.command-item').forEach(item => {
      item.addEventListener('click', () => {
        const cmdName = item.dataset.command;
        const cmd = this.commands.get(cmdName.toLowerCase());
        if (cmd) {
          cmd.action();
          this.toggleCommandPanel();
        }
      });
    });
  }

  filterCommands() {
    const query = document.querySelector('#command-search').value.toLowerCase();
    const results = document.querySelector('.command-panel-results');
    
    if (!query) {
      this.displayAllCommands();
      return;
    }

    const filtered = Array.from(this.commands.values()).filter(cmd => 
      cmd.name.toLowerCase().includes(query) ||
      cmd.key.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      results.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No commands found</div>';
      return;
    }

    let html = '<div class="command-category">';
    filtered.forEach(cmd => {
      html += `
        <div class="command-item" data-command="${cmd.name}">
          <div class="command-info">
            <span class="command-name">${cmd.name}</span>
            ${cmd.key ? `<span class="command-key">${cmd.key
              .toUpperCase()
              .replace('META', '⌘')
              .replace('CTRL', 'CTRL')
              .replace('SHIFT', 'SHIFT')}</span>` : ''}
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    results.innerHTML = html;
    this.selectedIndex = 0;
    this.highlightSelectedCommand();
    
    results.querySelectorAll('.command-item').forEach(item => {
      item.addEventListener('click', () => {
        const cmdName = item.dataset.command;
        const cmd = this.commands.get(cmdName.toLowerCase());
        if (cmd) {
          cmd.action();
          this.toggleCommandPanel();
        }
      });
    });
  }

  handleCommandPanelNavigation(e) {
    const items = document.querySelectorAll('.command-item');
    
    if (e.key === 'Escape') {
      e.preventDefault();
      this.toggleCommandPanel();
      return;
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[this.selectedIndex];
      if (selected) {
        const cmdName = selected.dataset.command;
        const cmd = this.commands.get(cmdName.toLowerCase());
        if (cmd) {
          cmd.action();
          this.toggleCommandPanel();
        }
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
      this.highlightSelectedCommand();
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.highlightSelectedCommand();
    }
  }

  highlightSelectedCommand() {
    const items = document.querySelectorAll('.command-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
}

// Initialize
if (window.location.hostname === 'mail.google.com') {
  new GmailShortcuts();
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'themeChanged' && message.theme) {
      document.documentElement.style.setProperty('--hotkeyed-primary', message.theme);
      chrome.storage.sync.set({ theme: message.theme });
    }

    if (message.action === 'backgroundChanged' && message.background) {
      document.documentElement.style.setProperty('--hotkeyed-background', message.background);
      chrome.storage.sync.set({ background: message.background });
    }
  });
}