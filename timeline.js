const timeline = document.getElementById('timeline');
const track = timeline.querySelector('.timeline__track');
const toggleViewBtn = document.getElementById('toggleViewBtn');

// const modal = document.getElementById('eventModal');
// const modalTitle = document.getElementById('modalTitle');
// const modalContent = document.getElementById('modalContent');
// const modalClose = document.querySelector('.modal-close');

const events = [];

let startDate = new Date('2025-07-29T00:00:00');
let endDate = new Date('2025-08-10T23:59:59');

function enforceViewByScreenSize() {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    timeline.classList.remove('timeline--week');
    timeline.classList.add('timeline--day');
    updateTimeline(startDate.toISOString(), endDate.toISOString());
  }
}

window.addEventListener('resize', enforceViewByScreenSize);
window.addEventListener('DOMContentLoaded', enforceViewByScreenSize);

function updateTimeline(start, end) {
  startDate = new Date(start);
  endDate = new Date(end);
  track.innerHTML = '';
  drawDateMarkers();
  drawLine();
  drawPlaybar();
  drawEvents();
}

function drawDateMarkers() {
  const msPerDay = 86400000;
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate.getTime() + i * msPerDay);
    const label = date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit' });
    const marker = document.createElement('div');
    marker.className = 'timeline__date-marker';
    marker.textContent = label;

    if (timeline.classList.contains('timeline--day')) {
      const dayCell = document.createElement('div');
      dayCell.className = 'timeline__day-cell';
      dayCell.appendChild(marker);
      track.appendChild(dayCell);
    } else {
      marker.style.left = (i / 7 * 100) + '%';
      track.appendChild(marker);
    }
  }
}

function drawLine() {
  const line = document.createElement('div');
  line.className = 'timeline__line';
  track.appendChild(line);
}

function drawPlaybar() {
  const bar = document.createElement('div');
  bar.className = 'timeline__playbar';
  bar.style.left = '0';
  track.appendChild(bar);

  function updateBar() {
    const now = new Date();
    const progress = Math.max(0, Math.min(1, (now - startDate) / (endDate - startDate)));
    bar.style.width = (progress * 100) + '%';
    requestAnimationFrame(updateBar);
  }

  updateBar();
}

// Helper to extract Are.na or regular image URLs from a string
function extractImageUrl(text) {
  if (!text) return null;
  const arenaImageRegex = /https:\/\/images\.are\.na\/[^\s"]+/i;
  const standardImageRegex = /https?:\/\/\S+\.(jpeg|jpg|png|gif|webp|svg)/i;

  const arenaMatch = text.match(arenaImageRegex);
  if (arenaMatch) return arenaMatch[0];

  const standardMatch = text.match(standardImageRegex);
  if (standardMatch) return standardMatch[0];

  return null;
}

function drawEvents() {
  const stack = Array(20).fill(0);

  events.forEach(event => {
    const eventStart = new Date(Math.max(event.start, startDate));
    const eventEnd = new Date(Math.min(event.end, endDate));

    if (eventStart > endDate || eventEnd < startDate) return;

    const startX = ((eventStart - startDate) / (endDate - startDate)) * 100;
    const endX = ((eventEnd - startDate) / (endDate - startDate)) * 100;
    const width = endX - startX;

    let level = 0;
    while (stack[level] && stack[level] > startX) level++;
    stack[level] = endX;

    const el = document.createElement('div');
    el.className = 'timeline__event';
    el.style.left = startX + '%';
    el.style.top = (level * 20) + 'px';
    el.style.width = width + '%';

    el.addEventListener('click', () => highlightScheduleItem(event));

    track.appendChild(el);
  });
}

function highlightScheduleItem(event) {
  const index = events.indexOf(event);
  const item = scheduleList.querySelector(`[data-event-index="${index}"]`);
  if (item) {
    schedule.classList.remove('hidden');
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    scheduleList.querySelectorAll('.schedule-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Remove highlight after 3 seconds (optional)
    setTimeout(() => {
      item.classList.remove('active');
    }, 3000);
  }
}


function toggleView() {
  timeline.classList.toggle('timeline--week');
  timeline.classList.toggle('timeline--day');
  // if (toggleViewBtn.innerHTML === "Daily schedule") {
  //   toggleViewBtn.innerHTML = "Week overview";
  // } else {
  //   toggleViewBtn.innerHTML = "Daily schedule";
  // }
  updateTimeline(startDate.toISOString(), endDate.toISOString());
}

toggleViewBtn.addEventListener('click', toggleView);

// ARE.NA FETCH
fetch("https://api.are.na/v2/channels/robida-radio-schedule-test/contents?access_token=eAbi6dA3i-tCZInyJd4VStOtfEJ8EKuvPepCqBhYRW4")
  .then((response) => response.ok ? response.json() : Promise.reject("Network error"))
  .then(data => {
    parseArenaEvents(data);
    updateTimeline(startDate.toISOString(), endDate.toISOString());
  })
  .catch((error) => console.error("FETCH ERROR:", error));

function parseArenaEvents(data) {
  events.length = 0;
  data.contents.forEach(item => {
    if (!item.description) return;

    const parts = item.description.split('/');
    const start = new Date(parts[0].trim());
    const end = parts[1] ? new Date(parts[1].trim()) : null;

    if (!isNaN(start)) {
      events.push({
        start,
        end: end && !isNaN(end) ? end : start,
        label: item.title,
        description: item.image?.display?.url || item.content || ''
      });
    }
  });

  buildScheduleView(); // Add this
}


const schedule = document.getElementById('schedule');
const scheduleList = document.getElementById('scheduleList');
const toggleScheduleBtn = document.getElementById('toggleScheduleBtn');

// Toggle schedule visibility
toggleScheduleBtn.addEventListener('click', () => {
  schedule.classList.toggle('hidden');
});

// Add this to the end of parseArenaEvents()
function buildScheduleView() {
  scheduleList.innerHTML = '';

  const sorted = [...events].sort((a, b) => a.start - b.start);

  sorted.forEach((event, index) => {
    const li = document.createElement('li');
    li.className = 'schedule-item';
    li.dataset.eventIndex = index;

    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    const dateStr = startDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const startTimeStr = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // Extract image URL if any
    const imageUrl = extractImageUrl(event.description);

    // Build content element
    let contentHTML = '';
    if (imageUrl) {
      contentHTML = `<img src="${imageUrl}" alt="${event.label}" style="max-width:100%; height:auto; margin-top:8px;">`;
    } else if (event.description.startsWith('http')) {
      contentHTML = `<a href="${event.description}" target="_blank" rel="noopener">${event.description}</a>`;
    } else {
      contentHTML = `<p>${event.description}</p>`;
    }

    li.innerHTML = `
      <strong>${event.label}</strong><br>
      <div class="schedule-content">${contentHTML}</div>
    `;

    li.addEventListener('click', () => {
      highlightScheduleItem(event);
    });

    scheduleList.appendChild(li);
  });
}

