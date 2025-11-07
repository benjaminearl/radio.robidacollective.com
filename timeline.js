const timeline = document.getElementById('timeline');
const track = timeline.querySelector('.timeline__track');

const events = [];

let startDate = new Date('2025-11-08T00:00:00');
let endDate = new Date('2025-11-08T23:59:59');

// Always enforce daily view
function enforceDayView() {
  timeline.classList.add('timeline--day');
  updateTimeline(startDate.toISOString(), endDate.toISOString());
}

window.addEventListener('resize', enforceDayView);
window.addEventListener('DOMContentLoaded', enforceDayView);

function updateTimeline(start, end) {
  startDate = new Date(start);
  endDate = new Date(end);
  track.innerHTML = '';
  drawDateMarker();
  drawLine();
  drawPlaybar();
  drawEvents();
}

function drawDateMarker() {
  const date = new Date(startDate);
  const label = date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });

  const marker = document.createElement('div');
  marker.className = 'timeline__date-marker';
  marker.textContent = label;

  const dayCell = document.createElement('div');
  dayCell.className = 'timeline__day-cell';
  dayCell.appendChild(marker);

  track.appendChild(dayCell);
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
    const percent = progress * 100;
    bar.style.width = percent + '%';
    requestAnimationFrame(updateBar);
  }

  updateBar();

  // Scroll to "now" once
  requestAnimationFrame(() => {
    const barX = ((new Date() - startDate) / (endDate - startDate)) * track.scrollWidth;
    const timelineRect = timeline.getBoundingClientRect();
    timeline.scrollLeft = Math.max(0, barX - timelineRect.width / 2);
  });
}

// Helper to extract image URLs
function extractImageUrl(text) {
  if (!text) return null;
  const arenaImageRegex = /https:\/\/images\.are\.na\/[^\s"]+/i;
  const standardImageRegex = /https?:\/\/\S+\.(jpeg|jpg|png|gif|webp|svg)/i;
  return text.match(arenaImageRegex)?.[0] || text.match(standardImageRegex)?.[0] || null;
}

function simpleMarkdownToHtml(md) {
  if (!md) return '';
  md = md.replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;');

  md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>')
         .replace(/^## (.*$)/gim, '<h2>$1</h2>')
         .replace(/^# (.*$)/gim, '<h1>$1</h1>');

  md = md.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
         .replace(/\*(.*?)\*/gim, '<em>$1</em>');

  md = md.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  md = md.replace(/\n{2,}/g, '</p><p>')
         .replace(/\n/g, '<br>')
         .replace(/^(.+)$/gim, '<p>$1</p>');

  return md.trim();
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
  const item = scheduleList.querySelector(`[data-event-id="${event.id}"]`);
  if (item) {
    schedule.classList.remove('hidden');
    scheduleList.querySelectorAll('.schedule__item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    item.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      item.classList.remove('active');
    }, 3000);
  }
}

// ARE.NA FETCH
fetch("https://api.are.na/v2/channels/robida-radio-schedule/contents?per=100")
  .then((response) => response.ok ? response.json() : Promise.reject("Network error"))
  .then(data => {
    parseArenaEvents(data);
    updateTimeline(startDate.toISOString(), endDate.toISOString());
  })
  .catch((error) => console.error("FETCH ERROR:", error));

function parseArenaEvents(data) {
  events.length = 0;

  data.contents.forEach((item, i) => {
    if (!item.description) return;

    const parts = item.description.split('/');
    const start = new Date(parts[0].trim());
    const end = parts[1] ? new Date(parts[1].trim()) : null;

    if (!isNaN(start)) {
      events.push({
        id: `evt-${i}`,
        start,
        end: end && !isNaN(end) ? end : start,
        label: item.title,
        description: item.image?.display?.url || item.content || ''
      });
    }
  });

  buildScheduleView();
}

const schedule = document.getElementById('schedule');
const scheduleList = document.getElementById('scheduleList');

document.querySelectorAll(".schedule__toggleBtn").forEach(button => {
  button.addEventListener("click", () => {
    schedule.classList.toggle('hidden');
  });
});

function buildScheduleView() {
  scheduleList.innerHTML = '';

  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return eventEnd >= startDate && eventStart <= endDate;
  });

  const sorted = filteredEvents.sort((a, b) => a.start - b.start);

  sorted.forEach(event => {
    const li = document.createElement('li');
    li.className = 'schedule__item';
    li.dataset.eventId = event.id;

    const start = new Date(event.start);
    const end = new Date(event.end);

    const startTimeStr = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    const imageUrl = extractImageUrl(event.description);

    let contentHTML = '';
    if (imageUrl) {
      contentHTML = `<img src="${imageUrl}" alt="${event.label}" style="max-width:100%; height:auto; margin-top:8px;">`;
    } else if (event.description.startsWith('http')) {
      contentHTML = `<a href="${event.description}" target="_blank" rel="noopener">${event.description}</a>`;
    } else {
      const html = simpleMarkdownToHtml(event.description);
      contentHTML = `<div class="markdown">${html}</div>`;
    }

    li.innerHTML = `
      <strong>${event.label}</strong> <br>
      <div class="schedule-content">${contentHTML}</div>
    `;

    li.addEventListener('click', () => {
      highlightScheduleItem(event);
    });

    scheduleList.appendChild(li);
  });
}
