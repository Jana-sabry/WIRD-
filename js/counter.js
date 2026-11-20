import { getCount, setCount, getCompletions, addCompletion } from './dailyStats.js';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function increment(id, target) {
  const current = getCount(id);
  if (current >= target) return current;

  const next = current + 1;
  setCount(id, next);
  if (next >= target) addCompletion(id);
  return next;
}

export function reset(id, target) {
  if (getCount(id) >= target && getCompletions(id) === 0) addCompletion(id);
  setCount(id, 0);
  return 0;
}

export function updateCard(card, count, target) {
  const shown = Math.min(count, target);
  const completed = shown >= target;
  const percent = (shown / target) * 100;

  card.querySelector('.count').textContent = shown;
  card.querySelector('.target').textContent = target;
  card.querySelector('.zikr-circle').style.setProperty('--p', percent);

  card.classList.toggle('completed', completed);
  card.querySelector('.zikr-tap').disabled = completed;
  card.querySelector('.reset-btn').hidden = !completed;
}

export function popCircle(card) {
  if (prefersReducedMotion) return;
  card.querySelector('.zikr-circle').animate(
    [{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
    { duration: 180, easing: 'ease-out' }
  );
}