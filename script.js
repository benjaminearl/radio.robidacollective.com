// AUDIO PLAYER
document.addEventListener("DOMContentLoaded", () => {
document.querySelectorAll(".audio").forEach(wrapper => {
  const audio = wrapper.querySelector("audio");
  const playBtn = wrapper.querySelector(".audio__playBtn");
  const audioUI = wrapper.querySelector(".audio__ui");
  const streamChannel = wrapper.closest(".stream__channel");

  // Create volume slider element
  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.min = 0;
  volumeSlider.max = 1;
  volumeSlider.step = 0.01;
  volumeSlider.value = audio.volume; // default volume (usually 1)
  volumeSlider.classList.add("audio__volumeSlider");

  // Append slider below the play button inside .audio__ui
  audioUI.appendChild(volumeSlider);

  // Change audio volume as slider moves
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = "Listen out";
      streamChannel.classList.add("clear");
    } else {
      audio.pause();
      playBtn.textContent = "Listen in";
      streamChannel.classList.remove("clear");
    }
  });

  audio.addEventListener("ended", () => {
    playBtn.textContent = "Listen in";
    streamChannel.classList.remove("clear");
  });
});


  const popup = document.getElementById('popup');
  const closeBtn = document.getElementById('popupClose');

  closeBtn.addEventListener('click', () => {
    popup.classList.add('hidden');
  });

  // Optional: Close popup if clicking outside content
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.classList.add('hidden');
    }
  });
});

// TOGGLE ASIDE
function toggleAside() {
  var element = document.getElementById("aside");
  element.classList.toggle("aside--open");
}


