# hotkeyed

```
 ___  ___  ________  _________  ___  __    _______       ___    ___ _______   ________     
|\  \|\  \|\   __  \|\___   ___\\  \|\  \ |\  ___ \     |\  \  /  /|\  ___ \ |\   ___ \    
\ \  \\\  \ \  \|\  \|___ \  \_\ \  \/  /|\ \   __/|    \ \  \/  / | \   __/|\ \  \_|\ \   
 \ \   __  \ \  \\\  \   \ \  \ \ \   ___  \ \  \_|/__   \ \    / / \ \  \_|/_\ \  \ \\ \  
  \ \  \ \  \ \  \\\  \   \ \  \ \ \  \\ \  \ \  \_|\ \   \/  /  /   \ \  \_|\ \ \  \_\\ \ 
   \ \__\ \__\ \_______\   \ \__\ \ \__\\ \__\ \_______\__/  / /      \ \_______\ \_______\
    \|__|\|__|\|_______|    \|__|  \|__| \|__|\|_______|\___/ /        \|_______|\|_______|
                                                       \|___|/                             
                                                                                           
```
## THIS REPO IS WIP
Keyboard shortcuts for Gmail.

## Install

```bash
git clone https://github.com/FusRoDah09/hotkeyed.git
cd hotkeyed
```

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `hotkeyed` folder

## Command Panel

Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac) to open the command panel.

- **Type** to search commands
- **↑/↓** to navigate
- **Enter** to execute
- **Esc** to close

## Essential Shortcuts

### Command & Help
| Key | Action |
|-----|--------|
| `Ctrl+K` / `Cmd+K` | Command panel |
| `?` | Show all shortcuts |
| `y` | Undo |
| `/` | Search |

### Navigation
| Key | Action |
|-----|--------|
| `j` | Next conversation |
| `k` | Previous conversation |
| `n` | Next message |
| `p` | Previous message |
| `o` / `Enter` | Open conversation |
| `u` / `Esc` | Back to list |

### Actions
| Key | Action |
|-----|--------|
| `e` | Archive (Mark done) |
| `Shift+I` | Mark not done |
| `h` | Remind me (Snooze) |
| `s` | Star |
| `Shift+U` | Mark read/unread |
| `#` | Delete |
| `!` | Mark spam |
| `Shift+M` | Mute |

### Compose
| Key | Action |
|-----|--------|
| `c` | Compose |
| `r` | Reply |
| `a` | Reply all |
| `f` | Forward |
| `Ctrl+Enter` | Send |
| `Shift+Enter` | Send & archive |
| `Shift+C` | Pop out compose |

### Selection
| Key | Action |
|-----|--------|
| `x` | Select conversation |
| `Shift+X` | Add to selection |
| `Shift+Y` | Clear selection |
| `* a` | Select all |
| `* n` | Deselect all |

### Folders (G then key)
| Key | Action |
|-----|--------|
| `g i` | Inbox |
| `g s` | Starred |
| `g d` | Drafts |
| `g t` | Sent |
| `g a` | All mail |
| `g !` | Spam |
| `g #` | Delete |

### Labels
| Key | Action |
|-----|--------|
| `l` | Add/remove label |
| `v` | Move to folder |
| `Shift+L` | Remove label |
| `[` | Remove label, previous |
| `]` | Remove label, next |

## All Shortcuts

Over 100 shortcuts:

- **Navigation**: j, k, n, p, o, u, Space, Shift+Space
- **Actions**: e, h, s, #, !, y, Shift+I, Shift+U, Shift+M
- **Compose**: c, r, a, f, d, Ctrl+Enter, Shift+Enter
- **Selection**: x, Shift+X, Shift+Y, * a, * n
- **Folders**: g + (i, s, d, t, a, !, #)
- **Labels**: l, v, Shift+L, [, ]
- **Messages**: Shift+O, Tab, Shift+Enter, Shift+;
- **Filters**: Shift+E, Shift+S, Shift+I, Shift+R
- **View**: Shift+B (focus), Ctrl+=/-, Ctrl+0

## Customization

**Add a new shortcut:**
```javascript
this.addShortcut('key', 'Description', () => this.yourAction());
```

**Add a new command:**
```javascript
this.commands.set('command name', {
  name: 'Command Name',
  key: 'shortcut',
  category: 'Category',
  action: () => this.yourAction()
});
```

## Inspiration

Inspired by [Superhuman](https://superhuman.com) and [Simplehuman](simplehuman.email) keyboard shortcuts.

## License

MIT License - see [LICENSE](LICENSE) for details