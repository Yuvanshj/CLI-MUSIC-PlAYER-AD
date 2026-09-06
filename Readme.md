# **CLI Music Player**

A **JavaScript-based CLI music player** built as a refinement challenge.

The project starts from a basic command-line music player and gradually improves it to support **keyboard navigation, terminal UI redrawing, controlled playback, pause/resume, progress tracking, and clean resource management**.

> **Learning approach:** This project is being built step by step. The implementation will be written by the student, with assistance used for explanations, debugging, and guidance when needed.

---

## **Challenge Requirements**

The final application should support:

- **Navigate through songs** using the **Up** and **Down** arrow keys.
- **Redraw the song list** in the same terminal location instead of printing a new list every time.
- **Play the selected song** using **Enter**.
- **Pause and resume** a song from the correct playback position.
- **Display the song duration**.
- **Display a percentage-based progress bar** that updates while the song is playing.
- **Switch songs and quit cleanly** without leaving old playback processes, timers, or listeners running.

---

## **Technology**

- **JavaScript**
- **Node.js**
- **Node.js terminal APIs** for keyboard input and terminal control
- An **appropriate audio playback library for Node.js**

The exact libraries will be selected while building the project rather than adding unnecessary dependencies at the beginning.

---

## **Project Goals**

The primary goal is **not just to make the player work**.

The goal is to **understand the concepts behind the implementation** and be able to explain the final solution.

Important concepts this project will cover include:

- Reading keyboard input in a terminal
- Handling arrow keys and Enter
- Managing application state
- Keeping track of the selected song
- Terminal cursor movement and line clearing
- Audio playback control
- Playback position and duration
- Pause/resume state
- Timers and live progress updates
- Cleaning up processes, timers, and event listeners
- Separating UI state from playback state

---

# **Planned Development Path**

The player will be developed **incrementally**.

## **Phase 1 — Project Setup**

- Create the Node.js project.
- Create the entry point.
- Run a basic JavaScript program from the terminal.

---

## **Phase 2 — Song Data**

- Create a small list of songs.
- Give each song the information required by the player.
- Display the list in the terminal.

---

## **Phase 3 — Keyboard Navigation**

- Read keyboard input.
- Detect **Up** and **Down** arrows.
- Maintain a **selected-song index**.
- Prevent the selection from moving outside the list.

---

## **Phase 4 — Terminal UI Redrawing**

- Keep the selected item visually highlighted.
- Redraw the list in the same terminal position.
- Avoid repeatedly printing new copies of the list.

---

## **Phase 5 — Audio Playback**

- Connect the selected song to an audio player.
- Start playback when **Enter** is pressed.
- Show the currently playing song.

---

## **Phase 6 — Playback State**

Track:

- Whether a song is **playing or paused**
- The **current playback position**
- The **song duration**

Then implement:

- Pause
- Resume
- Resume from the correct playback position without restarting the song

---

## **Phase 7 — Progress Bar**

- Calculate playback progress as a percentage.
- Update the progress display while the song is playing.
- Keep the displayed progress consistent with the actual playback position.

Example:

```text
[██████████░░░░░░░░░░] 48%
```

---

## **Phase 8 — Switching Songs and Cleanup**

- Stop the previous song before starting another one.
- Stop or replace old timers.
- Remove or manage old event listeners where necessary.
- Cleanly exit the application.

---

## **Phase 9 — Testing and Refinement**

Test important behaviours such as:

- Moving to the first and last song
- Trying to move above the first song
- Trying to move below the last song
- Starting a song
- Pausing and resuming
- Switching songs while one is already playing
- Exiting while audio is playing
- Checking that no old timer or playback process remains active

---

# **Expected State**

The application will eventually need to keep track of information similar to:

- **Selected song**
- **Currently playing song**
- **Playback status**
- **Current playback position**
- **Song duration**
- **Progress percentage**
- **Active playback resource**
- **Active progress/update timer**

The exact state structure will be decided during implementation.

---

# **Example User Flow**

```text
CLI Music Player

> Song 1
  Song 2
  Song 3
  Song 4

↑ / ↓  Navigate
Enter  Play / Select
Q      Quit
```

After playback starts, the interface should provide information similar to:

```text
Now Playing: Song 1

Duration: 03:42

[██████████░░░░░░░░░░] 48%
```

The final UI is expected to be refined during implementation.

---

# **Architecture**

An architecture diagram will be created **after the core design is understood**.

The application will likely contain responsibilities for:

```text
Keyboard Input
      ↓
Application State
      ↓
┌───────────────┬────────────────┐
│               │                │
│  Terminal UI  │    Playback    │
│               │                │
└───────────────┴────────────────┘
                       │
                    Timing
```

This diagram is intentionally only a **starting point**.

The final architecture should reflect the **actual implementation** and the responsibilities developed throughout the project.

---