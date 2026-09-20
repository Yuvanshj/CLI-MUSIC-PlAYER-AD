# **CLI Music Player**

A **JavaScript-based CLI music player** built as a refinement challenge. It now supports a full set of interactive controls, progress tracking, and a live search feature.

---

## **Features**

- **Navigate songs** using **Up** / **Down** arrow keys.
- **Play / Pause** with **Enter** (toggles pause/resume).
- **Previous / Next** track with **←** / **→** arrow keys.
- **Seek** forward or backward by 10 seconds with **Right Arrow** / **Left Arrow**.
- **Volume control**: increase/decrease by 5% with **+** / **-** keys, mute with **m**.
- **Shuffle** and **Repeat** modes (All / One / Off) toggled with **s** (shuffle) and **r** (repeat).
- **Automatic advance** to the next song when the current track finishes.
- **Live search**: press **/** to focus the search bar, type to filter songs, **Enter** to play the selected result, **Esc** to exit search.
- **Progress bar**: real‑time percentage‑based bar updates while a song plays.
- **Help banner** showing keybindings and current state.
- Clean resource management – stops old playback processes, clears timers, and removes listeners on track change or quit.

---

## **Keybindings**

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move selection up/down the song list |
| `Enter` | Play selected song / toggle pause/resume |
| `←` / `→` | Seek backward / forward 10 seconds |
| `-` / `+` | Decrease / increase volume by 5 % |
| `m` | Mute / unmute |
| `s` | Toggle Shuffle mode |
| `r` | Cycle Repeat mode (Off → All → One) |
| `⌫` (Backspace) | Play previous track |
| `⌦` (Delete) | Play next track |
| `/` | Open live search (type to filter, **Enter** to play) |
| `Esc` | Exit search mode |
| `q` | Quit the application |
| `h` | Show/hide help banner |

---

## **Technology**

- **JavaScript** (Node.js)
- **VLC RC interface** – playback is handled via a spawned VLC process with the remote‑control (`rc`) interface.
- **Node.js terminal APIs** for raw keyboard input and UI redraw.

---

## **Usage**

```bash
# Clone the repository
git clone https://github.com/yourusername/CLI-MUSIC-PlAYER-AD.git
cd CLI-MUSIC-PlAYER-AD

# Install dependencies (if any) and run
npm install   # optional – the project uses only built‑in modules
node index.js
```

The player will display a list of songs. Use the keybindings above to interact.

---

## **Project Goals**

The goal is to understand and implement:
- Keyboard input handling in a terminal.
- State management for playback, UI, and user interactions.
- Integration with an external audio player (VLC) via its RC interface.
- Real‑time UI updates (progress bar, help banner, search results).
- Proper cleanup of child processes, timers, and listeners.
