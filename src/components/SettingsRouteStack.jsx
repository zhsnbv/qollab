import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigationType } from 'react-router-dom';
import { advanceSettingsStack, createSettingsStack, finishSettingsTransition, settingsLocationStamp } from '../utils/settingsNavigation';
import '../screens/Settings.css';

// The router owns navigation; this stack owns only presentation and retention.
// Path keys preserve screen state and scroll, including partially specified
// MemoryRouter background chains and browser Back/Forward.
export default function SettingsRouteStack({ location, renderLocation }) {
  const navigationType = useNavigationType();
  const [stored, setStored] = useState(() => createSettingsStack(location));
  let state = stored;
  if (stored.stamp !== settingsLocationStamp(location)) {
    state = advanceSettingsStack(stored, location, navigationType);
    setStored(state);
  }
  const stackRef = useRef(null);
  const focusByPath = useRef(new Map());
  const outsideFocus = useRef(null);
  const { token, direction, active } = state;

  useLayoutEffect(() => {
    if (direction === 'none') return;
    const stack = stackRef.current;
    const focused = document.activeElement;
    if (direction === 'push' && focused && focused !== document.body && !stack?.contains(focused)) outsideFocus.current = focused;
    let alive = true;
    const finish = () => {
      if (!alive) return;
      alive = false;
      setStored(current => finishSettingsTransition(current, token));
      const layer = stack?.querySelector('[data-active="true"]');
      let destination = direction === 'pop' ? focusByPath.current.get(active) : null;
      if (!destination?.isConnected || !layer?.contains(destination)) destination = layer?.querySelector('.st-title');
      if (!active) destination = outsideFocus.current;
      if (destination?.isConnected && !destination.closest('[inert]')) {
        if (destination.matches('.st-title')) destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
      }
    };
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = event => { if (event.matches) finish(); };
    preference.addEventListener('change', onPreference);
    if (preference.matches) finish();
    else {
      const animations = [...(stack?.querySelectorAll('[data-motion]:not([data-motion="none"])') || [])].flatMap(layer => layer.getAnimations?.() || []);
      if (!animations.length) finish();
      else Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(finish);
    }
    return () => { alive = false; preference.removeEventListener('change', onPreference); };
  }, [token, direction, active]);

  if (!state.layers.length) return null;
  const top = state.desired.at(-1)?.pathname;
  return <div className="st-route-stack" ref={stackRef} data-transition={direction}>
    {state.layers.map(({ location: layerLocation, motion }, index) => {
      const isActive = layerLocation.pathname === active;
      const visible = layerLocation.pathname === top || motion !== 'none';
      return <div key={layerLocation.pathname} className="st-route-layer" data-route={layerLocation.pathname}
        data-motion={motion} data-active={isActive} data-visible={visible}
        inert={!isActive} aria-hidden={!isActive} style={{ zIndex: index }}
        onFocusCapture={event => { if (isActive) focusByPath.current.set(layerLocation.pathname, event.target); }}>
        {renderLocation(layerLocation)}
      </div>;
    })}
  </div>;
}
