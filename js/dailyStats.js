const STORAGE_KEY = 'wird-state-v1';

let state = freshState();

function freshState() {
  return { date: todayKey(), counts: {}, completions: {} };
}

function todayKey() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.date === todayKey() && saved.counts && typeof saved.counts === 'object') {
      if (!saved.completions || typeof saved.completions !== 'object') saved.completions = {}; // بيانات محفوظة من نسخة أقدم
      state = saved;
      return;
    }
  } catch {

  }
  state = freshState();
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {

  }
}

function toCount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function getCount(id) {
  return toCount(state.counts[id]);
}

export function setCount(id, value) {
  if (value <= 0) {
    delete state.counts[id];
  } else {
    state.counts[id] = value;
  }
  saveState();
}

export function getCompletions(id) {
  return toCount(state.completions[id]);
}

export function addCompletion(id) {
  state.completions[id] = getCompletions(id) + 1;
  saveState();
}

export function calcStats(azkarData) {
  const stats = { total: 0 };

  for (const [category, group] of Object.entries(azkarData)) {
    let distinctDone = 0;

    for (const item of group.items) {
      const times = Math.max(getCompletions(item.id), getCount(item.id) >= item.target ? 1 : 0);
      stats.total += times;
      if (times > 0) distinctDone++;
    }

    const count = group.items.length;
    stats[category] = {
      completed: distinctDone,
      count,
      percent: count === 0 ? 0 : Math.round((distinctDone / count) * 100),
    };
  }
  return stats;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderCategoryStat(name, data) {
  if (!data) return;
  setText(`stat-${name}-percent`, data.percent);
  setText(`stat-${name}-detail`, `${data.completed} من ${data.count}`);

  const bar = document.getElementById(`stat-${name}-bar`);
  const track = document.getElementById(`stat-${name}-track`);
  if (bar) bar.style.width = `${data.percent}%`;
  if (track) track.setAttribute('aria-valuenow', String(data.percent));
}

export function renderStats(stats) {
  setText('stat-total', stats.total);
  renderCategoryStat('morning', stats.morning);
  renderCategoryStat('evening', stats.evening);
}