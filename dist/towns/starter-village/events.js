// Chest hit areas are slightly larger than the visible sliver for touch input.
export const townEvents = {
  townId: 'starter-village',
  chests: [
    { id: 'hidden-chest-1', name: '村莊隱藏寶箱1', location: 'pond', x: 124, y: 531, hitWidth: 30, hitHeight: 22 },
    { id: 'hidden-chest-2', name: '村莊隱藏寶箱2', location: 'bush', x: 844, y: 552, hitWidth: 26, hitHeight: 24 },
  ],
  lightSwitch: { buildingId: 'home-3', initialLightsOn: true, threshold: 100, eventId: 'home-3-hidden-event' },
};
