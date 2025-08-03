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

// DRAGGABLE
function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const handle = elmnt.querySelector('.draggable') || elmnt;

  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function setRandomPosition(elmnt) {
  const vw = window.innerWidth - 400;
  const vh = window.innerHeight - 500;
  elmnt.style.left = Math.random() * (vw - elmnt.offsetWidth) + "px";
  elmnt.style.top = Math.random() * (vh - elmnt.offsetHeight) + "px";
}

document.querySelectorAll(".draggable").forEach(div => {
  if (window.innerWidth > 768) {
    setRandomPosition(div);
  }
  dragElement(div);
});


// CHAT

document.querySelectorAll(".chat__toggleBtn").forEach(button => {
  if (window.matchMedia("(max-width: 768px)").matches) {

    button.addEventListener("click", () => {
      window.open("https://radiorobida.chatango.com/", "_blank");
    });
  } else {

    button.addEventListener("click", () => {
      document.getElementById('chat').classList.toggle('hidden');
    });
  }
});

