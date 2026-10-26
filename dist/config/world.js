// All durations are seconds. A phase lasts 10 minutes; a full day/night cycle lasts 20.
export const worldConfig = Object.freeze({
  storageKey: 'bravemanlegend.world.v1',
  dayNight: { intervalSeconds: 600, initialPhase: 'day', transitionSeconds: 12 },
  weather: { intervalSeconds: 300, probabilities: { sunny: 0.70, rainy: 0.20, foggy: 0.10 } },
  events: { enabled: false, intervalSeconds: 300, chance: 0, entries: [] },
});
