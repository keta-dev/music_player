/**
 * @typedef {Object} AudioTrack - Audio Track object
 * @property {string} title - Title of the track
 * @property {string} artist - Name of the artist
 * @property {number} duration - Duration of the track
 * @property {"idle" | "playing" | "paused"} state - State of the track
 * @property {number} currentTime - Track current time
 * @property {string} artwork - Track artwork
 */

(() => {
  const showMore = document.querySelector(".more-btn");
  const playlist = document.querySelector("#playlist");
  const track_art = document.querySelector("#artwork");
  const indicator = document.querySelector(".indicator");
  const dot = document.querySelector(".dot");
  const slider = document.querySelector("#slider");
  const prev_btn = document.querySelector(".previous_btn");
  const playpause_btn = document.querySelector(".play_btn");
  const next_btn = document.querySelector(".next_btn");
  const curr_time = document.querySelector(".current-time");
  const total_duration = document.querySelector(".total-duration");
  const track_artwork = document.querySelector("#track-artwork");
  const track_title = document.querySelector("#track-title");
  const track_artist = document.querySelector("#track-artist");

  const playerStateButtons = {
    paused: "images/playbtn.svg",
    playing: "images/btn_pause.svg",
    idle: "images/playbtn.svg",
  };

  /**
   * Calculate the value of the percentage
   * @param {number} percentage - percentage
   * @param {number} duration - duration
   * @returns {number} - The value of the percentage
   */
  function toPercentageValue(percentage, duration) {
    return (duration / 100) * percentage;
  }

  /**
   * Calculates the percentage of the current value
   * @param {number} current - The current value
   * @param {number} duration - The duration
   * @returns {number} - The percentage of the current value
   */
  function toPercentage(current, duration) {
    return (current / duration) * 100;
  }

  /**
   * Convert a single digit to double digit string
   * @param {number} value - Number value
   * @returns {string}
   */
  function toDoubleDigit(value) {
    if (value > 9) {
      return value;
    } else {
      return "0" + value;
    }
  }

  /**
   * Convert milliseconds to time HH:MM:SS format
   * @param {number} time - Timestamp in milliseconds
   * @returns {string}
   */
  function toAudioTime(time) {
    const timeProps = { h: 1000 * 60 * 60, m: 1000 * 60, s: 1000 };
    let nTime = time;
    const hours = Math.floor(nTime / timeProps.h);
    if (hours) nTime %= timeProps.h;
    const minutes = nTime ? Math.floor(nTime / timeProps.m) : 0;
    if (minutes) nTime %= timeProps.m;
    const seconds = nTime ? Math.floor(nTime / timeProps.s) : 0;

    if (hours) {
      return `${toDoubleDigit(hours)}:${toDoubleDigit(minutes)}:${toDoubleDigit(
        seconds
      )}`;
    } else {
      return `${toDoubleDigit(minutes)}:${toDoubleDigit(seconds)}`;
    }
  }

  const player = {
    /**
     * @type  {AudioTrack[]}
     */
    tracks: [],

    moveSeekBar: false,

    timmer: null,

    currentTrackIndex: 0,

    loadPlaylist() {
      const colors = getColors();
      this.tracks.push(
        ...Array.from(Array(Math.ceil(Math.random() * 10))).map((_, index) => {
          return {
            title: "Track " + (index + 1),
            artist: "Artist " + (index + 1),
            duration:
              60000 * Math.ceil(Math.random() * 7) +
              Math.ceil(Math.random() * 58) * 1000,
            state: "idle",
            currentTime: 0,
            artwork: `https://placehold.co/300/${
              colors[index]
            }/000000?text=Track+${index + 1}`,
          };
        })
      );
      this.renderPlaylist();
    },

    getPlayerState() {
      return this.getCurrentTrack().state;
    },

    renderPlaylist() {
      const firstChild = playlist.firstElementChild;

      playlist.replaceChildren(
        firstChild,
        ...this.tracks.map((track, index) => {
          const item = document.createElement("li");
          item.onclick = this.playTrack.bind(this, index);
          let indexElement = index + 1;

          if (index === this.currentTrackIndex) {
            item.setAttribute("class", "active");
            switch (this.getPlayerState()) {
              case "paused":
                indexElement = `
                  <img src="images/btn_play_over.svg" alt="..." />
                `;
                break;
              case "playing":
                indexElement = `
                  <img src="images/playing.gif" alt="..." />
                `;
                break;
              default:
                indexElement = index + 1;
            }
          }

          item.onmouseover = () => {
            if (
              index === this.currentTrackIndex &&
              this.getPlayerState() === "playing"
            ) {
              item.firstElementChild.firstElementChild.innerHTML = indexElement;
            } else {
              item.firstElementChild.firstElementChild.innerHTML = `
              <img src="images/btn_play_over.svg" alt="..." />
            `;
            }
          };

          item.onmouseleave = () => {
            item.firstElementChild.firstElementChild.innerHTML = indexElement;
          };

          item.innerHTML = `
            <div class="d-flex py-3 px-3">
              <div class="num">${indexElement}</div>
              <div class="title">${track.title}</div>
              <div class="artist">${track.artist}</div>
              <div class="img-container">
                <img src="images/btn_addPlaylist.svg" alt="add btn">
                <img src="images/btn_share.svg" alt="share btn">
                <img src="images/btn_download.svg" alt="download btn">
              </div>
              <div class="time-stamp">${toAudioTime(track.duration)}</div>
            </div>
          `;

          return item;
        })
      );
    },

    getCurrentTrack() {
      return this.tracks[this.currentTrackIndex];
    },

    /**
     * Set the current track duration
     * @param {PointerEvent} e - event object
     */
    setCurrentTime(x) {
      const percent = toPercentage(x, window.innerWidth);
      const track = this.getCurrentTrack();
      track.currentTime = toPercentageValue(percent, track.duration);
      curr_time.innerText = toAudioTime(track.currentTime);
      slider.setAttribute(
        "style",
        `width: ${toPercentage(track.currentTime, track.duration)}%`
      );
    },

    nextTrack() {
      clearInterval(this.timmer);
      const track = this.getCurrentTrack();
      track.currentTime = 0;
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.currentTrackIndex++;
        this.playTrack();
      } else {
        this.currentTrackIndex = 0;
        this.stopTrack();
      }
    },

    previousTrack() {
      clearInterval(this.timmer);
      const track = this.getCurrentTrack();
      track.currentTime = 0;
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
        this.playTrack();
      } else {
        this.currentTrackIndex = this.tracks.length - 1;
        this.stopTrack();
      }
    },

    loadTrack() {
      const track = this.getCurrentTrack();
      track_artwork.setAttribute("src", track.artwork);
      track_art.setAttribute(
        "style",
        `background-image: url('${track.artwork}')`
      );
      track_title.innerText = track.title;
      track_artist.innerText = track.artist;
      playpause_btn.setAttribute("src", playerStateButtons[track.state]);
      playpause_btn.onclick = this.playTrack.bind(this);
      prev_btn.onclick = this.previousTrack.bind(this);
      next_btn.onclick = this.nextTrack.bind(this);
      curr_time.innerText = toAudioTime(track.currentTime);
      total_duration.innerText = toAudioTime(track.duration);
      showMore.onclick = this.loadPlaylist.bind(this);
      dot.onmousedown = () => {
        this.moveSeekBar = true;
      };
      document.onmouseup = () => {
        this.moveSeekBar = false;
      };
      document.onmousemove = (e) => {
        if (this.moveSeekBar) {
          this.setCurrentTime(e.x);
        }
      };
      indicator.onmousedown = (e) => {
        this.setCurrentTime.bind(this)(e.x);
        this.moveSeekBar = true;
      };
      slider.setAttribute(
        "style",
        `width: ${toPercentage(track.currentTime, track.duration)}%`
      );
      this.renderPlaylist();
    },

    renderPlayer() {
      const track = this.getCurrentTrack();
      if (track.currentTime < track.duration) {
        const diff = track.duration - track.currentTime;
        if (diff < 100) {
          track.currentTime = track.currentTime + diff;
        } else {
          track.currentTime = track.currentTime + 100;
        }
        curr_time.innerText = toAudioTime(track.currentTime);
        slider.setAttribute(
          "style",
          `width: ${toPercentage(track.currentTime, track.duration)}%`
        );
      } else {
        this.nextTrack();
      }
    },

    stopTrack() {
      const track = this.getCurrentTrack();
      track.state = "idle";
      this.loadTrack();
    },

    pauseTrack() {
      const track = this.getCurrentTrack();
      track.state = "paused";
      this.loadTrack();
      playpause_btn.setAttribute("src", playerStateButtons[track.state]);
      playpause_btn.onclick = this.playTrack.bind(this);
      clearInterval(this.timmer);
    },

    /**
     * Play the current track or the track on the index specified
     * @param {number} index track index
     */
    playTrack(index = null) {
      clearInterval(this.timmer);
      let track = this.getCurrentTrack();
      if (
        index !== null &&
        typeof index === "number" &&
        index < this.tracks.length
      ) {
        track.currentTime = 0;
        this.currentTrackIndex = index;
        track = this.getCurrentTrack();
      }
      track.state = "playing";
      this.loadTrack();
      playpause_btn.setAttribute("src", playerStateButtons[track.state]);
      playpause_btn.onclick = this.pauseTrack.bind(this);
      this.timmer = setInterval(this.renderPlayer.bind(this), 100);
    },
  };

  function getColors() {
    return [
      "FBD002",
      "red",
      "green",
      "pink",
      "white",
      "orange",
      "lime",
      "skyblue",
      "cyan",
      "gold",
    ].sort(() => Math.floor(Math.random() - 0.5));
  }

  player.loadPlaylist();
  player.loadTrack();
})();
