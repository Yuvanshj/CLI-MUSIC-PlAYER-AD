const fs = require('fs');
const { spawn } = require('child_process');
const songs = fs.readdirSync("./Songs").filter(file => file.endsWith('.mp3'));

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

const songsObj = songs.map(song => {
    const songName = song.replace('.mp3', '');
    const songPath = `./Songs/${song}`;
    return {
        name: songName,
        path: songPath
    };
});

let selectedSong = 0;
let playerProcess;


process.stdin.on("data", (key) => {
    switch (key) {
        case "\u001b[A":
            // console.log("UP");
            selectedSong = (selectedSong - 1 + songsObj.length) % songsObj.length;
            render()
            break;

        case "\u001b[B":
            // console.log("DOWN");
            selectedSong = (selectedSong + 1) % songsObj.length;
            render()
            break;
        case "\r":
            playSong();
            console.log(`Playing: ${songsObj[selectedSong].name}`);
            break;
        case " ":
            if (playerProcess) {
                playerProcess.kill();
                playerProcess = null;
                console.log("Playback stopped.");
            }
            break;
        case "\u0003":
            if (playerProcess) {
                playerProcess.kill();
            }
            process.exit();
    }
});


function render(){
    console.clear();
    
    console.log();
    console.log();
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
                ║                                                      ║
                ╚══════════════════════════════════════════════════════╝
            `);

    console.log("")
    console.log("")

    songsObj.forEach((song, idx)=>{
        if(idx === selectedSong){
            console.log(`> ${song.name}`);
        } else {
            console.log(`  ${song.name}`);
        }
    })

    console.log("Use UP and DOWN arrow keys to navigate. Press Enter to play, Space to stop, or Ctrl+C to exit.");
}

function playSong(){
    if (playerProcess) {
        playerProcess.kill();
    }

    playerProcess = spawn('vlc', [songsObj[selectedSong].path] );
}

render()

