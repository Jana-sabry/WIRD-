import { loadState, getCount, calcStats, renderStats } from './dailyStats.js';
import { increment, reset, updateCard, popCircle } from './counter.js';

const container = document.getElementById('cards-container');
const template = document.getElementById('card-template');
const azkarSection = document.getElementById('azkar');
const titleEl = document.getElementById('section-title');
const descEl = document.getElementById('section-desc');

const categoryButtons = document.querySelectorAll('button[data-category]');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let azkarData = null;
let itemsById = {};
let currentCategory = 'morning';

async function loadAzkar() {
  const response = await fetch('data/azkar.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function renderCategory(category) {
  const group = azkarData[category];
  if (!group) return;

  currentCategory = category;
  azkarSection.dataset.theme = category;
  titleEl.textContent = group.title;
  descEl.textContent = group.description;

  container.replaceChildren();

  const fragment = document.createDocumentFragment();
  for (const item of group.items) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.id = item.id;
    card.querySelector('.zikr-text').textContent = item.text;
    updateCard(card, getCount(item.id), item.target);
    fragment.appendChild(card);
  }
  container.appendChild(fragment);


  categoryButtons.forEach((btn) => {
    const active = btn.dataset.category === category;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function selectCategory(category) {
  renderCategory(category);
  azkarSection.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}

function refreshStats() {
  renderStats(calcStats(azkarData));
}


function bindEvents() {
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.category));
  });

  container.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl || !container.contains(actionEl)) return;

    const card = actionEl.closest('.zikr-card');
    const item = itemsById[card.dataset.id];
    if (!item) return;

    if (actionEl.dataset.action === 'increment') {
      const count = increment(item.id, item.target);
      updateCard(card, count, item.target);
      popCircle(card);
    } else if (actionEl.dataset.action === 'reset') {
      const count = reset(item.id, item.target);
      updateCard(card, count, item.target);
      card.querySelector('.zikr-tap').focus();
    }

    refreshStats();
  });
}


async function init() {
  try {
    azkarData = await loadAzkar();
  } catch (error) {
    container.innerHTML =
      '<p class="error-box">تعذّر تحميل الأذكار. شغّل الموقع عن طريق Live Server (وليس بفتح الملف مباشرة).</p>';
    console.error('Failed to load azkar.json:', error);
    return;
  }

  
  itemsById = {};
  for (const group of Object.values(azkarData)) {
    for (const item of group.items) itemsById[item.id] = item;
  }

  loadState();
  bindEvents();
  renderCategory(currentCategory);
  refreshStats();
}

init();