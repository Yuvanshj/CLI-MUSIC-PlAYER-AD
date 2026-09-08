const fs = require('fs');
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

// console.log(songsObj[selectedSong].name);

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

        case "\u0003":
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
                ║     Q     Quit                                       ║
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

    console.log("Use UP and DOWN arrow keys to navigate through the songs. Press Ctrl+C to exit.");
}

render()



