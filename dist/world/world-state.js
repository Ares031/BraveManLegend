import { worldConfig as config } from '../config/world.js';

// Persist the world origin, seed and independent manual clock anchors.
export function createWorld({ storage, now = Date.now, random = Math.random } = {}) {
  let origin, persistent = true;
  try {
    const saved = JSON.parse(storage.getItem(config.storageKey));
    if (saved?.version === 1 && Number.isFinite(saved.startedAt) && saved.startedAt >= 0 && Number.isInteger(saved.seed)) origin = saved;
  } catch { persistent = false; }
  if (!origin) {
    origin = { version: 1, startedAt: now(), seed: Math.floor(random() * 4294967296) >>> 0 };
    try { storage.setItem(config.storageKey, JSON.stringify(origin)); persistent = true; } catch { persistent = false; }
  }
  function save() {
    try { storage.setItem(config.storageKey, JSON.stringify(origin)); persistent = true; }
    catch { persistent = false; }
  }
  // Separate deterministic streams keep weather independent from future events.
  function roll(index, salt) {
    let n = (origin.seed ^ Math.imul(index + 1, 0x9e3779b1) ^ salt) >>> 0;
    n = Math.imul(n ^ n >>> 16, 0x21f0aaad);
    n = Math.imul(n ^ n >>> 15, 0x735a2d97);
    return ((n ^ n >>> 15) >>> 0) / 4294967296;
  }
  function getState() {
    const elapsed = Math.max(0, (now() - origin.startedAt) / 1000);
    const phaseAnchor = origin.phaseOverride;
    const phaseElapsed = phaseAnchor && Number.isFinite(phaseAnchor.at) && typeof phaseAnchor.night === 'boolean'
      ? Math.max(0, (now() - phaseAnchor.at) / 1000) : elapsed;
    const initialNight = phaseAnchor && Number.isFinite(phaseAnchor.at) && typeof phaseAnchor.night === 'boolean'
      ? phaseAnchor.night : config.dayNight.initialPhase === 'night';
    const cycle = Math.floor(phaseElapsed / config.dayNight.intervalSeconds);
    const part = phaseElapsed % config.dayNight.intervalSeconds;
    const night = (cycle % 2 === 1) !== initialNight;
    const target = night ? 1 : 0;
    const progress = Math.min(1, part / config.dayNight.transitionSeconds);
    const weatherAnchor = origin.weatherOverride;
    const hasWeatherAnchor = weatherAnchor && Number.isFinite(weatherAnchor.at) && Number.isInteger(weatherAnchor.index) && weatherAnchor.index >= 0;
    const weatherElapsed = hasWeatherAnchor ? Math.max(0, (now() - weatherAnchor.at) / 1000) : elapsed;
    const weatherIndex = (hasWeatherAnchor ? weatherAnchor.index : 0) + Math.floor(weatherElapsed / config.weather.intervalSeconds);
    let value = roll(weatherIndex, 0x517cc1b7), weather = 'sunny';
    for (const [name, probability] of Object.entries(config.weather.probabilities)) {
      value -= probability;
      if (value < 0) { weather = name; break; }
    }
    return {
      elapsedSeconds: elapsed, phase: night ? 'night' : 'day',
      darkness: cycle === 0 ? target : (1 - target) + (target * 2 - 1) * progress,
      nextPhaseSeconds: Math.ceil(config.dayNight.intervalSeconds - part),
      weather, weatherIndex,
      nextWeatherSeconds: Math.ceil(config.weather.intervalSeconds - weatherElapsed % config.weather.intervalSeconds),
      // Reserved only: no event dispatch or rewards until actual content exists.
      events: { enabled: config.events.enabled, chance: config.events.chance, active: null },
      persistent,
    };
  }
  function toggleDayNight() {
    origin.phaseOverride = { at: now(), night: getState().phase !== 'night' };
    save();
    return getState();
  }
  function rerollWeather() {
    origin.weatherOverride = { at: now(), index: getState().weatherIndex + 1 };
    save();
    return getState();
  }
  return Object.freeze({ getState, toggleDayNight, rerollWeather });
}

let storage;
try { storage = globalThis.localStorage; } catch { /* Private storage may be unavailable. */ }
export const world = createWorld({ storage });
