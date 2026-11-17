// Settings uses the existing router history. This model only retains visual
// layers long enough to finish a pop; it never creates a second history.
export const isSettingsLocation = location => location?.pathname === '/settings' || location?.pathname?.startsWith('/settings/');

export function settingsParentPath(pathname) {
  if (pathname === '/settings') return '/profile';
  if (['/settings/reaction', '/settings/chat-theme'].includes(pathname)) return '/settings/appearance';
  if (['/settings/bubbles', '/settings/wallpaper'].includes(pathname)) return '/settings/chat-theme';
  return '/settings';
}

const syntheticLocation = pathname => ({ pathname, key: `settings:${pathname}`, search: '', hash: '', state: null });
export const settingsLocationStamp = location => `${location.key || ''}:${location.pathname}${location.search || ''}${location.hash || ''}`;

export function settingsLocationChain(location) {
  const result = [], seen = new Set();
  let current = location;
  while (current && !seen.has(current.pathname)) {
    seen.add(current.pathname);
    if (isSettingsLocation(current)) result.unshift(current);
    if (current.state?.background) current = current.state.background;
    else if (isSettingsLocation(current) && current.pathname !== '/settings') current = syntheticLocation(settingsParentPath(current.pathname));
    else break;
  }
  return result;
}

export function settingsHistoryEntries(pathname) {
  let background;
  return settingsLocationChain(syntheticLocation(pathname)).map(location => {
    const entry = { ...location, state: background ? { background } : null };
    background = entry;
    return entry;
  });
}

function target(location) {
  const desired = settingsLocationChain(location);
  return { stamp: settingsLocationStamp(location), desired, active: isSettingsLocation(location) ? location.pathname : null };
}
const settledLayers = desired => desired.map(location => ({ location, motion: 'none' }));

export function createSettingsStack(location) {
  const next = target(location);
  return { ...next, layers: settledLayers(next.desired), direction: 'none', token: 0 };
}

export function advanceSettingsStack(previous, location, navigationType) {
  const next = target(location);
  if (next.stamp === previous.stamp) return previous;
  let direction = 'none';
  if (next.active !== previous.active) {
    if (location.state?.settingsTransition === 'pop') direction = 'pop';
    else if (navigationType === 'REPLACE') direction = 'none';
    else if (next.desired.some(item => item.pathname === previous.active)) direction = 'push';
    else if (previous.desired.some(item => item.pathname === next.active)) direction = 'pop';
    else if (previous.active && !next.active && !next.desired.length) direction = 'pop';
    else if (next.active) direction = navigationType === 'POP' && previous.active ? 'pop' : 'push';
  }
  let layers = settledLayers(next.desired);
  if (direction === 'push') {
    layers = layers.map(layer => ({ ...layer, motion: layer.location.pathname === next.active ? 'push-in' : layer.location.pathname === previous.active ? 'push-under' : 'none' }));
  } else if (direction === 'pop') {
    layers = layers.map(layer => ({ ...layer, motion: layer.location.pathname === next.active ? 'pop-under' : 'none' }));
    const outgoing = previous.layers.find(layer => layer.location.pathname === previous.active);
    if (outgoing && !layers.some(layer => layer.location.pathname === previous.active)) layers.push({ ...outgoing, motion: 'pop-out' });
  }
  return { ...next, layers, direction, token: previous.token + 1 };
}

export function finishSettingsTransition(state, token) {
  if (state.token !== token || state.direction === 'none') return state;
  return { ...state, layers: settledLayers(state.desired), direction: 'none' };
}
