let songs;
let currfolder;

let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch songs from songs.json for a given album name
async function getsongs(albumName) {
  currfolder = albumName;
  try {
    let response = await fetch('songs.json');
    let data = await response.json();
    console.log("Fetched JSON:", data);

    // Find the album by name in the JSON file
    let album = data.albums.find(a => a.name === albumName);
    if (!album) {
      console.error("Album not found:", albumName);
      return [];
    }
    
    // Extract the filenames from the album's songs array
    songs = album.songs.map(song => song.filename);
    
    let songUL = document.querySelector(".songsList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
      songUL.innerHTML += `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Himanshu</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>`;
    }

    // Attach event listener to each song element
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
      e.addEventListener("click", () => {
        const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
        playMusic(track);
      });
    });

    console.log("Final song list:", songs);
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

// Update playMusic to use the album folder and song filename
const playMusic = (track, pause = false) => {
  // Build the song URL assuming your songs are stored in "songs/<albumName>/"
  currentSong.src = `songs/${currfolder}/${track}`;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Display albums from songs.json
async function displayAlbum() {
  try {
    let response = await fetch('songs.json');
    let data = await response.json();
    let albums = data.albums;
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";
    for (let album of albums) {
      cardContainer.innerHTML += `
        <div data-folder="${album.name}" class="card">
          <div class="play">
            <img src="songs/${album.name}/Billion.jpg" alt="">
            <h2>${album.name}</h2>
            <p>${album.description || ""}</p>
          </div>
        </div>`;
    }
  } catch (error) {
    console.error("Error fetching album list:", error);
  }
}

// This function sets up auto-next functionality when a song ends
function setupAutoNext() {
  currentSong.addEventListener("ended", () => {
    // Decode the filename from the currentSong's src
    const currentFilename = decodeURIComponent(currentSong.src.split("/").pop());
    const currentIndex = songs.indexOf(currentFilename);

    // Check if there's more than one song and if the current song isn't the last one
    if (songs.length > 1 && currentIndex < songs.length - 1) {
      playMusic(songs[currentIndex + 1]);
    }
  });
}

async function main() {
  // For testing, load an album by its name (e.g., "My_fav")
  songs = await getsongs("My_fav");
  if (songs && songs.length > 0) {
    playMusic(songs[0], true);
  }

  // Attach auto-next functionality after initializing the player
  setupAutoNext();

  // Optionally, display all albums on a page
  // displayAlbum();

  // Attach event listener to the play/pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Update song time and seekbar position
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seekbar click event for song seeking
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger menu open/close events
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Loop toggle event
  let isLooping = false;
  document.getElementById("loop").addEventListener("click", function () {
    isLooping = !isLooping;
    currentSong.loop = isLooping;
    this.src = isLooping ? "asloop.svg" : "loop.svg";
  });

  // Next and Previous song events
  previous.addEventListener("click", () => {
    const currentFilename = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentFilename);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    const currentFilename = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentFilename);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Load a playlist when an album card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getsongs(item.currentTarget.dataset.folder);
    });
  });
}

// Start the app
main();
