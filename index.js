const fs = require('fs');
const { spawn, execSync } = require('child_process');

const songs = fs.readdirSync('./Songs')
    .filter(file => file.endsWith('.mp3'))
    .map(file => {
        const songPath = `./Songs/${file}`;
        return {
            name: file.replace('.mp3', ''),
            path: songPath,
            duration: getSongDuration(songPath)
        };
    });

// State
let selectedIndex = 0;
let currentSongIndex = -1;
let currentSong = null;
let player = null;
let timer = null;
let elapsed = 0;
let isPaused = false;
let volume = 80;
let isMuted = false;
let shuffle = false;
let repeatMode = 'all'; // 'all' | 'one' | 'off'
let isSearching = false;
let searchQuery = '';

if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
}
process.stdin.resume();
process.stdin.setEncoding('utf8');

function getFilteredSongs() {
    if (!searchQuery) {
        return songs.map((s, idx) => ({ ...s, originalIndex: idx }));
    }
    const q = searchQuery.toLowerCase();
    return songs
        .map((s, idx) => ({ ...s, originalIndex: idx }))
        .filter(s => s.name.toLowerCase().includes(q));
}

process.stdin.on('data', (key) => {
    if (isSearching) {
        if (key === '\u001b') { // Escape: exit search
            isSearching = false;
            searchQuery = '';
            selectedIndex = currentSongIndex >= 0 ? currentSongIndex : 0;
            render();
            return;
        }
        if (key === '\u0003') { // Ctrl+C
            stopPlayback();
            process.exit();
        }
        if (key === '\r') { // Enter: play selected song and exit search
            const list = getFilteredSongs();
            if (list.length > 0) {
                const target = list[selectedIndex] || list[0];
                playSong(target.originalIndex);
            }
            isSearching = false;
            searchQuery = '';
            render();
            return;
        }
        if (key === '\u007f' || key === '\b') { // Backspace
            searchQuery = searchQuery.slice(0, -1);
            selectedIndex = 0;
            render();
            return;
        }
        if (key === '\u001b[A') { // Up arrow
            const list = getFilteredSongs();
            if (list.length > 0) {
                selectedIndex = (selectedIndex - 1 + list.length) % list.length;
                render();
            }
            return;
        }
        if (key === '\u001b[B') { // Down arrow
            const list = getFilteredSongs();
            if (list.length > 0) {
                selectedIndex = (selectedIndex + 1) % list.length;
                render();
            }
            return;
        }
        // Append typed or pasted characters
        if (!key.startsWith('\u001b')) {
            const printable = key.replace(/[\x00-\x1f\x7f]/g, '');
            if (printable.length > 0) {
                searchQuery += printable;
                selectedIndex = 0;
                render();
                return;
            }
        }
        return;
    }

    // Normal Mode Controls
    switch (key) {
        case '\u001b[A': // Up arrow
            selectedIndex = (selectedIndex - 1 + songs.length) % songs.length;
            render();
            break;
        case '\u001b[B': // Down arrow
            selectedIndex = (selectedIndex + 1) % songs.length;
            render();
            break;
        case '\u001b[C': // Right arrow: Seek +10s
            seek(10);
            break;
        case '\u001b[D': // Left arrow: Seek -10s
            seek(-10);
            break;
        case '\r': // Enter
            playSong(selectedIndex);
            break;
        case ' ': // Space
            togglePlayPause();
            break;
        case '/': // Search mode
            isSearching = true;
            searchQuery = '';
            selectedIndex = 0;
            render();
            break;
        case 'n':
        case 'N':
            playNextSong();
            break;
        case 'p':
        case 'P':
            playPrevSong();
            break;
        case '+':
        case '=':
            changeVolume(5);
            break;
        case '-':
        case '_':
            changeVolume(-5);
            break;
        case 'm':
        case 'M':
            toggleMute();
            break;
        case 's':
        case 'S':
            shuffle = !shuffle;
            render();
            break;
        case 'r':
        case 'R':
            if (repeatMode === 'all') repeatMode = 'one';
            else if (repeatMode === 'one') repeatMode = 'off';
            else repeatMode = 'all';
            render();
            break;
        case '\u0003': // Ctrl+C
            stopPlayback();
            process.exit();
    }
});

function render() {
    console.clear();
    console.log(`
                ╔══════════════════════════════════════════════════════╗
                ║                                                      ║
                ║                    MUSIC PLAYER                      ║
                ║                                                      ║
                ║              Your music. Your moment.                ║
                ║                                                      ║
                ╠══════════════════════════════════════════════════════╣
                ║                                                      ║
                ║     ↑ / ↓       Navigate list                        ║
                ║     ↵           Play selected song                   ║
                ║     Space       Play / Pause                         ║
                ║     ← / →       Seek -10s / +10s                     ║
                ║     N / P       Next / Previous song                 ║
                ║     + / -       Volume Up / Down (M to mute)         ║
                ║     S / R       Shuffle (S) / Repeat Mode (R)        ║
                ║     /           Search songs (Esc to exit)           ║
                ║                                                      ║
                ╚══════════════════════════════════════════════════════╝
    `);

    const listToDisplay = isSearching ? getFilteredSongs() : songs.map((s, idx) => ({ ...s, originalIndex: idx }));

    if (isSearching) {
        console.log(`Search: / ${searchQuery}█  (${listToDisplay.length} found - Enter to play, Esc to cancel)\n`);
    }

    if (listToDisplay.length === 0) {
        console.log('  No matching songs found.');
    } else {
        listToDisplay.forEach((song, idx) => {
            const cursor = idx === selectedIndex ? '> ' : '  ';
            const isPlaying = song.originalIndex === currentSongIndex ? ' ♫' : '';
            console.log(`${cursor}${song.name}${isPlaying}`);
        });
    }

    if (currentSong) {
        const state = isPaused ? 'Paused' : 'Playing';
        const percent = currentSong.duration ? elapsed / currentSong.duration : 0;
        const filled = Math.round(Math.min(1, percent) * 30);
        const progressBar = '█'.repeat(filled).padEnd(30, '░');

        const volDisplay = isMuted ? 'MUTED' : `${volume}%`;
        const shuffleDisplay = shuffle ? 'ON' : 'OFF';
        const repeatDisplay = repeatMode.toUpperCase();

        console.log(`\n${state}: ${currentSong.name}`);
        console.log(`[${progressBar}]`);
        console.log(`${formatTime(elapsed)} / ${formatTime(currentSong.duration)}  |  Vol: ${volDisplay}  |  Shuffle: ${shuffleDisplay}  |  Repeat: ${repeatDisplay}`);
    }

    console.log('\nUse controls above. Press Ctrl+C to exit.');
}

function playSong(index) {
    stopPlayback();

    currentSongIndex = index;
    selectedIndex = index;
    currentSong = songs[index];
    elapsed = 0;
    isPaused = false;

    player = spawn('vlc', [
        '--intf', 'dummy',
        '--extraintf', 'rc',
        '--rc-fake-tty',
        '--quiet',
        '--play-and-exit',
        currentSong.path
    ], { stdio: ['pipe', 'pipe', 'ignore'] });

    player.stdout.on('data', () => {});

    applyVolume();

    player.on('close', () => {
        playNextSong(true);
    });

    timer = setInterval(() => {
        if (!isPaused && elapsed < currentSong.duration) {
            elapsed++;
            render();
        }
    }, 1000);

    render();
}

function togglePlayPause() {
    if (!player || !currentSong) {
        playSong(selectedIndex);
        return;
    }

    if (player.stdin && player.stdin.writable) {
        player.stdin.write('pause\n');
        isPaused = !isPaused;
        render();
    }
}

function stopPlayback() {
    if (player) {
        player.removeAllListeners('close');
        player.kill();
        player = null;
    }
    clearInterval(timer);
    timer = null;
    currentSong = null;
    currentSongIndex = -1;
    elapsed = 0;
    isPaused = false;
}

function seek(delta) {
    if (!player || !currentSong) return;
    elapsed = Math.max(0, Math.min(currentSong.duration, elapsed + delta));
    if (player.stdin && player.stdin.writable) {
        player.stdin.write(`seek ${elapsed}\n`);
    }
    render();
}

function applyVolume() {
    if (player && player.stdin && player.stdin.writable) {
        const effectiveVol = isMuted ? 0 : volume;
        const vlcVol = Math.round((effectiveVol / 100) * 256);
        player.stdin.write(`volume ${vlcVol}\n`);
    }
}

function changeVolume(delta) {
    isMuted = false;
    volume = Math.max(0, Math.min(100, volume + delta));
    applyVolume();
    render();
}

function toggleMute() {
    isMuted = !isMuted;
    applyVolume();
    render();
}

function getNextIndex() {
    if (songs.length <= 1) return 0;
    if (shuffle) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentSongIndex);
        return randomIndex;
    }
    return (currentSongIndex + 1) % songs.length;
}

function playNextSong(isAuto = false) {
    if (songs.length === 0) return;

    if (isAuto && repeatMode === 'one') {
        playSong(currentSongIndex);
        return;
    }

    if (isAuto && repeatMode === 'off' && currentSongIndex === songs.length - 1 && !shuffle) {
        stopPlayback();
        render();
        return;
    }

    const nextIndex = getNextIndex();
    playSong(nextIndex);
}

function playPrevSong() {
    if (songs.length === 0) return;
    if (elapsed > 3) {
        seek(-elapsed);
        return;
    }
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prevIndex);
}

function getSongDuration(filePath) {
    try {
        const out = execSync(`afinfo "${filePath}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
        const match = out.match(/estimated duration:\s*([\d.]+)/);
        if (match) return Math.round(Number(match[1]));
    } catch {}
    return 0;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

render();