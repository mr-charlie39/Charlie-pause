console.log("Music Player is running...");

const songs = [
    { songName: "Qalbi Fil Madinah", filePath: "Qalbi-Fil-Madinah.mp3", coverImage: "cover-music-1.png" },
    { songName: "Batmana Ansak", filePath: "BtmannaAnsak-Sherine.mp3", coverImage: "Batmana-ansak-image.jpg" },
    { songName: "Rahmatun Lil’Alameen", filePath: "rehman.mp3", coverImage: "pic-3.jpg" },
    { songName: "Hayati", filePath: "Hayati.mp3", coverImage: "Hayati-pic.jpg" },
    { songName: "Kalam Eineh", filePath: "Kalam.mp3", coverImage: "Sherine-KalamEineh-pic.jpg" },
    { songName: "Kun Anta", filePath: "KunAnta.mp3", coverImage: "Humood-KunAnta.jpg" },
    { songName: "Balaghal Ula Bi Kamaalihi", filePath: "bbbbb.mp3", coverImage: "BalaghalUlaBiKamaalihi-pic.jpg" },
    { songName: "Faslon Ko Takalf", filePath: "Faslon Ko Takalf Hum Se Ho Agr Old Naat Qari Waheed Zafar Qasmi - Islamic Videos.mp3", coverImage: "FaslonKoTakalf-pic.jpg" }
];

let songIndex = 0;
const audioElement = new Audio(songs[songIndex].filePath);
const masterPlay = document.getElementById('masterPlay');
const progressBar = document.getElementById('volume');
const timeInfo = document.getElementById('timeInfo');
const prevButton = document.querySelector('.fa-backward');
const nextButton = document.querySelector('.fa-forward');
const songItemPlayButtons = document.querySelectorAll('.song-list-play i');
const songTimeSpans = document.querySelectorAll('.song-list-play > span:first-child');

audioElement.preload = 'metadata';
progressBar.value = 0;

function formatTime(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimeInfo() {
    const current = formatTime(audioElement.currentTime);
    const total = formatTime(audioElement.duration);
    if (timeInfo) {
        timeInfo.textContent = `${current} / ${total}`;
    }
}

function loadSongDurations() {
    songs.forEach((song, index) => {
        const tempAudio = new Audio(song.filePath);
        tempAudio.preload = 'metadata';

        tempAudio.addEventListener('loadedmetadata', () => {
            if (songTimeSpans[index]) {
                songTimeSpans[index].textContent = formatTime(tempAudio.duration);
            }
        });

        tempAudio.addEventListener('error', () => {
            if (songTimeSpans[index]) {
                songTimeSpans[index].textContent = '--:--';
            }
        });
    });
}

loadSongDurations();
updateTimeInfo();

function setMasterPlayIcon(isPlaying) {
    masterPlay.classList.toggle('fa-play', !isPlaying);
    masterPlay.classList.toggle('fa-pause', isPlaying);
    document.body.classList.toggle('is-playing', isPlaying);
}

function resetSongItemIcons() {
    songItemPlayButtons.forEach((button) => {
        button.classList.remove('fa-pause');
        button.classList.add('fa-play');
    });
}

function setCurrentSong(index) {
    songIndex = index;
    audioElement.src = songs[songIndex].filePath;
    audioElement.currentTime = 0;
    progressBar.value = 0;
    updateTimeInfo();
}

function playCurrentSong() {
    const playPromise = audioElement.play();
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise
            .then(() => {
                setMasterPlayIcon(true);
                resetSongItemIcons();
                if (songItemPlayButtons[songIndex]) {
                    songItemPlayButtons[songIndex].classList.remove('fa-play');
                    songItemPlayButtons[songIndex].classList.add('fa-pause');
                }
            })
            .catch((error) => {
                console.error('Audio playback failed:', error);
                setMasterPlayIcon(false);
            });
    }
}

masterPlay.addEventListener('click', () => {
    if (audioElement.paused) {
        playCurrentSong();
    } else {
        audioElement.pause();
        setMasterPlayIcon(false);
        resetSongItemIcons();
    }
});

songItemPlayButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        if (songIndex === index && !audioElement.paused) {
            audioElement.pause();
            setMasterPlayIcon(false);
            button.classList.remove('fa-pause');
            button.classList.add('fa-play');
            return;
        }

        setCurrentSong(index);
        playCurrentSong();
    });
});

if (prevButton) {
    prevButton.addEventListener('click', () => {
        const previousIndex = songIndex === 0 ? songs.length - 1 : songIndex - 1;
        setCurrentSong(previousIndex);
        playCurrentSong();
    });
}

if (nextButton) {
    nextButton.addEventListener('click', () => {
        const nextIndex = songIndex === songs.length - 1 ? 0 : songIndex + 1;
        setCurrentSong(nextIndex);
        playCurrentSong();
    });
}

progressBar.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(audioElement.duration) && audioElement.duration > 0) {
        audioElement.currentTime = (value / 100) * audioElement.duration;
    }
});

audioElement.addEventListener('timeupdate', () => {
    if (Number.isFinite(audioElement.duration) && audioElement.duration > 0) {
        progressBar.value = Math.floor((audioElement.currentTime / audioElement.duration) * 100);
    }
    updateTimeInfo();
});

audioElement.addEventListener('loadedmetadata', updateTimeInfo);

audioElement.addEventListener('ended', () => {
    const nextIndex = songIndex === songs.length - 1 ? 0 : songIndex + 1;
    setCurrentSong(nextIndex);
    playCurrentSong();
});

audioElement.addEventListener('error', () => {
    console.error('Could not load audio file:', songs[songIndex].filePath);
    setMasterPlayIcon(false);
    resetSongItemIcons();
    updateTimeInfo();
});

