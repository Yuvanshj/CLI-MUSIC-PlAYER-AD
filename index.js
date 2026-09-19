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

let selectedIndex = 0;
let currentSongIndex = -1;
let currentSong = null;
let player = null;
let timer = null;
let elapsed = 0;
let isPaused = false;

if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
}
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (key) => {
    switch (key) {
        case '\u001b[A': 
            selectedIndex = (selectedIndex - 1 + songs.length) % songs.length;
            render();
            break;
        case '\u001b[B': 
            selectedIndex = (selectedIndex + 1) % songs.length;
            render();
            break;
        case '\r': 
            playSong(selectedIndex);
            break;
        case ' ': 
            togglePlayPause();
            break;
        case '\u0003': 
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
                ║     ↑ ↓   Navigate                                   ║
                ║     ↵     Play Song                                  ║
                ║     Space Pause / Resume                             ║
                ║                                                      ║
                ╚══════════════════════════════════════════════════════╝
    `);

    songs.forEach((song, idx) => {
        const cursor = idx === selectedIndex ? '> ' : '  ';
        console.log(`${cursor}${song.name}`);
    });

    if (currentSong) {
        const state = isPaused ? 'Paused' : 'Playing';
        const percent = currentSong.duration ? elapsed / currentSong.duration : 0;
        const filled = Math.round(Math.min(1, percent) * 30);
        const progressBar = '█'.repeat(filled).padEnd(30, '░');

        console.log(`\n${state}: ${currentSong.name}`);
        console.log(`[${progressBar}]`);
        console.log(`${formatTime(elapsed)} / ${formatTime(currentSong.duration)}`);
    }

    console.log('\nUse UP and DOWN to navigate. Press Enter to play, Space to pause/resume, Ctrl+C to exit.');
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

    player.on('close', () => {
        const nextIndex = (currentSongIndex + 1) % songs.length;
        playSong(nextIndex);
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