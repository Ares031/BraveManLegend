import { world } from './world-state.js';
import { drawAtmosphere, weatherLabel } from './weather-effects.js';
// Bridge for the original prototype's classic scripts.
window.gameWorld = world;
window.worldEffects = { drawAtmosphere, weatherLabel };
