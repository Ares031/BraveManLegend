import { MESSAGE_LIMIT } from './messages.js';
import { equipmentQualities } from '../content/items/qualities.js';

// Preserve the reader's position while new messages arrive or old ones expire.
export function createMessageLog(element) {
  let following = true, anchor = null;
  const visible = () => element.clientHeight > 0;
  function remember() {
    const node = [...element.querySelectorAll('[data-message]')].find(node => node.offsetTop + node.offsetHeight > element.scrollTop);
    anchor = node ? { node, offset: element.scrollTop - node.offsetTop } : null;
  }
  function refresh() {
    if (!visible()) return;
    if (following) element.scrollTop = element.scrollHeight;
    else if (anchor?.node.isConnected) element.scrollTop = anchor.node.offsetTop + anchor.offset;
    else element.scrollTop = 0;
  }
  element.addEventListener('scroll', () => {
    if (!visible()) return;
    following = element.scrollHeight - element.clientHeight - element.scrollTop <= 3;
    remember();
  });
  new ResizeObserver(refresh).observe(element);
  function append(text,{quality}={}) {
    if (visible() && !following) remember();
    element.querySelector('.empty-message')?.remove();
    const p = document.createElement('p');
    p.dataset.message = '';p.textContent = text;element.append(p);
    if(equipmentQualities[quality])p.style.color=equipmentQualities[quality].color;
    const entries = element.querySelectorAll('[data-message]');
    for (let i = 0; i < entries.length - MESSAGE_LIMIT; i++) entries[i].remove();
    refresh();
  }
  return { append, refresh };
}
