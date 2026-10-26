// Message delivery only. Reward systems must update actual player data themselves.
import { formatMoney } from '../config/economy.js';
const channels = { general: [], system: [] };
export const MESSAGE_LIMIT = 200;
const listeners = { general: new Set(), system: new Set() };
export function publishMessage(channel, text, {quality} = {}) {
  if (!Object.hasOwn(channels, channel) || typeof text !== 'string' || !text.trim()) return;
  const message = { text, createdAt: Date.now(), ...(quality?{quality}:{}) };
  channels[channel].push(message);
  if (channels[channel].length > MESSAGE_LIMIT) channels[channel].shift();
  for (const listener of listeners[channel]) listener(message);
}
export function subscribeMessages(channel, listener) {
  if (!Object.hasOwn(channels, channel)) throw Error('Unknown message channel');
  for (const message of channels[channel]) listener(message);
  listeners[channel].add(listener);
  return () => listeners[channel].delete(listener);
}
export function reportReward({ experience = 0, money = 0 } = {}) {
  if(Number.isFinite(experience)&&experience>0)publishMessage('system',`取得經驗值 +${experience}`);
  if(Number.isFinite(money)&&money>0)publishMessage('system',`取得金幣 +${formatMoney(money)}`);
}
