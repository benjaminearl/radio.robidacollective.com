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

// TIMELINE
const events = [];

// === Set your start and end date ===
const startDate = new Date('2025-07-27T00:00:00');
const endDate = new Date('2025-08-10T23:59:59')


// === Events/Markers ===
const timelineBar = document.getElementById('timelineBar');
const dateLabels = document.getElementById('dateLabels');
const markersContainer = document.getElementById('markersContainer');

function formatShortDate(date) {
  return date.toLocaleDateString('en-UK', { weekday: 'short', day: 'numeric' });
}

function getDaysBetween(start, end) {
  const dates = [];
  let current = new Date(start);
  current.setHours(0, 0, 0, 0);
  end = new Date(end);
  end.setHours(0, 0, 0, 0);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function addDateLabels() {
  const totalDuration = endDate - startDate;
  const days = getDaysBetween(startDate, endDate);

  days.forEach(day => {
    const label = document.createElement('div');
    label.classList.add('date-label');
    label.textContent = formatShortDate(day);

    const timeFromStart = day - startDate;
    let leftPercent = (timeFromStart / totalDuration) * 100;
    leftPercent = Math.max(0, Math.min(leftPercent, 100));

    label.style.left = `${leftPercent}%`;
    dateLabels.appendChild(label);
  });
}

function addMarkers() {
  const totalDuration = endDate - startDate;

  events.forEach(event => {
    const marker = document.createElement('div');
    marker.classList.add('marker');

    const timeSinceStart = event.start - startDate;
    let leftPercent = (timeSinceStart / totalDuration) * 100;
    leftPercent = Math.max(0, Math.min(leftPercent, 100));

    marker.style.left = `${leftPercent}%`;

    // Create label above line
    const label = document.createElement('div');
    label.classList.add('marker-label');
    label.textContent = event.label;
    label.addEventListener('click', () => {
      showPopup(event.description || "No description available.");
    });
    label.style.bottom = '20px'; // initial bottom offset from line, will be adjusted by stackLabels
    marker.appendChild(label);
    
    // Create line connecting dot to label
    const line = document.createElement('div');
    line.classList.add('marker-line');
    // Set initial height to match initial label bottom (will update later)
    line.style.height = '20px'; 
    marker.appendChild(line);
    
    // Create dot
    const dot = document.createElement('div');
    dot.classList.add('marker-dot');
    marker.appendChild(dot);

    markersContainer.appendChild(marker);
  });

  stackLabels(); // call stacking function after all markers added
}

function stackLabels() {
  const labels = [...document.querySelectorAll('.marker-label')];
  const markersContainerRect = markersContainer.getBoundingClientRect();

  const placed = [];
  const lineSpacing = 20; // vertical space between stacked labels

  labels.forEach(label => {
    const marker = label.parentElement;

    // Start with the highest possible position (e.g. 100px above the line)
    // or you can start from a fixed max value if you prefer
    let bottomPx = 100; // start labels near the top (adjust as needed)

    const labelHeight = label.offsetHeight;
    const labelRect = label.getBoundingClientRect();

    const left = labelRect.left - markersContainerRect.left;
    const right = labelRect.right - markersContainerRect.left;

    let overlaps = true;

    while (overlaps) {
      overlaps = false;

      for (const placedLabel of placed) {
        const horizontalOverlap = !(right < placedLabel.left || left > placedLabel.right);
        const verticalClose = Math.abs(placedLabel.bottom - bottomPx) < lineSpacing;

        if (horizontalOverlap && verticalClose) {
          // Push this label down by decreasing bottomPx (because bottom=0 is dot)
          bottomPx -= lineSpacing;
          overlaps = true;
          break;
        }
      }
    }

    // Prevent labels from going below the dot (bottom: 0)
    if (bottomPx < labelHeight) {
      bottomPx = labelHeight;
    }

    label.style.bottom = `${bottomPx}px`;

    const line = marker.querySelector('.marker-line');
    // Line height should cover from dot (0) to bottomPx + label height
    line.style.height = `${bottomPx + labelHeight}px`;

    placed.push({ left, right, bottom: bottomPx });
  });
}


function extractImageUrl(text) {
  const arenaImageRegex = /https:\/\/images\.are\.na\/[^\s"]+/i;
  const standardImageRegex = /https?:\/\/\S+\.(jpeg|jpg|png|gif|webp|svg)/i;

  const arenaMatch = text.match(arenaImageRegex);
  if (arenaMatch) return arenaMatch[0];

  const standardMatch = text.match(standardImageRegex);
  return standardMatch ? standardMatch[0] : null;
}


function showPopup(content) {
  const popup = document.getElementById('popup');
  const popupDesc = document.getElementById('popupDescription');
  popupDesc.innerHTML = '';

  const imageUrl = extractImageUrl(content);
  const hasImage = !!imageUrl;
  const text = hasImage ? content.replace(imageUrl, '').trim() : content;

  if (hasImage) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Event image';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    popupDesc.appendChild(img);
  }

  if (text) {
    const p = document.createElement('p');
    p.textContent = text;
    popupDesc.appendChild(p);
  }

  popup.classList.remove('hidden');
}









function updateTimeline() {
  const now = new Date();
  const totalDuration = endDate - startDate;
  const elapsed = now - startDate;

  let progress = (elapsed / totalDuration) * 100;
  progress = Math.max(0, Math.min(progress, 100));
  timelineBar.style.width = progress + '%';
}


// ARE.NA SCHEDULE
fetch("https://api.are.na/v2/channels/robida-radio-schedule-test/contents?access_token=eAbi6dA3i-tCZInyJd4VStOtfEJ8EKuvPepCqBhYRW4")
.then((response) => {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error("NETWORK RESPONSE ERROR");
  }
  })
.then(data => {
  getEventData(data)

  addDateLabels();
  addMarkers();
  updateTimeline();
})
.catch((error) => console.error("FETCH ERROR:", error));

function getEventData(data) {
  data.contents.forEach(item => {
    if (!item.description) return;

    const parts = item.description.split('/');
    const start = new Date(parts[0].trim());
    const end = parts[1] ? new Date(parts[1].trim()) : null;

    if (!isNaN(start)) {
      events.push({
        start,
        end: end && !isNaN(end) ? end : start, // fallback to single date
        label: item.title,
        description: item.image?.display?.url || item.content || ''
      });
    } else {
      console.warn(`Invalid date for "${item.title}":`, item.description);
    }
  });
}


setInterval(updateTimeline, 1000);
