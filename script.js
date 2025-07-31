// AUDIO PLAYER
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".audio").forEach(wrapper => {
    const audio = wrapper.querySelector("audio");
    const playBtn = wrapper.querySelector(".audio__playBtn");

    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        playBtn.textContent = "Tune out";
      } else {
        audio.pause();
        playBtn.textContent = "Tune in";
      }
    });

    audio.addEventListener("ended", () => {
      playBtn.textContent = "Tune in";
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


