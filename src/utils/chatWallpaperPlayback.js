// Playback is decorative and opt-in to visibility. These gates never alter the
// selected preset: an ineligible/failed video leaves its real poster visible.
export function shouldPlayChatWallpaper({ hasVideo = true, miniature = false, reducedMotion = false, saveData = false, pageVisible = true, inViewport = false, ancestorsVisible = true, failed = false }) {
  return hasVideo && !miniature && !reducedMotion && !saveData && pageVisible && inViewport && ancestorsVisible && !failed;
}

export function chatWallpaperAncestorsVisible(video, getStyle) {
  for (let node = video.parentElement; node; node = node.parentElement) {
    if (node.hasAttribute('inert') || node.hasAttribute('hidden') || node.getAttribute('data-active') === 'false' || node.getAttribute('data-visible') === 'false') return false;
    // Our own layers are intentionally decorative (aria-hidden). A hidden app
    // or route ancestor is different and must not keep background media alive.
    if (!node.classList.contains('qa-wallpaper-layers') && node.getAttribute('aria-hidden') === 'true') return false;
    const style = getStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.contentVisibility === 'hidden' || style.opacity === '0') return false;
  }
  return true;
}

export function watchChatWallpaperPlayback(video, { onVisible, onFailure }, environment = {}) {
  const win = environment.window || window;
  const doc = environment.document || document;
  const connection = (environment.navigator || navigator).connection;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false, failed = false, allowed = false, pending = null, request = 0;
  let inViewport = false;
  let visible = false;
  const show = value => { if (visible !== value) { visible = value; onVisible(value); } };
  const ancestorVisible = () => chatWallpaperAncestorsVisible(video, node => win.getComputedStyle(node));
  const canPlay = () => shouldPlayChatWallpaper({ reducedMotion: reduced.matches, saveData: !!connection?.saveData, pageVisible: !doc.hidden, inViewport, ancestorsVisible: ancestorVisible(), failed });
  const fail = () => {
    if (disposed || failed) return;
    failed = true; allowed = false; pending = null; request++;
    show(false); video.pause(); onFailure();
  };
  const sync = () => {
    if (disposed) return;
    allowed = canPlay();
    if (!allowed) {
      request++; pending = null;
      show(false); video.pause();
      return;
    }
    if (!video.paused || pending !== null) return;
    const token = ++request;
    pending = token;
    let playing;
    try { playing = video.play(); }
    catch { pending = null; fail(); return; }
    Promise.resolve(playing).then(() => {
      if (disposed || token !== request) return;
      pending = null;
      // Only the actual `playing` event exposes frames; a resolved play promise
      // alone is not evidence that there is a decoded, drawable frame.
    }, () => {
      if (disposed || token !== request) return;
      pending = null;
      if (allowed) fail();
    });
  };
  const onPlaying = () => {
    if (disposed) return;
    if (!allowed || !canPlay()) { sync(); return; }
    show(true);
  };
  const onPause = () => show(false);
  // A buffered loop boundary may briefly wait while retaining a valid frame.
  // Keep that decoded frame instead of flashing the poster on every loop.
  const onWaiting = () => { if (video.readyState < 2) show(false); };
  const onEmptied = () => show(false);
  const events = { playing: onPlaying, pause: onPause, waiting: onWaiting, stalled: onWaiting, emptied: onEmptied, error: fail };
  for (const [event, handler] of Object.entries(events)) video.addEventListener(event, handler);
  doc.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);

  let intersection;
  const checkViewport = () => {
    const rect = video.getBoundingClientRect();
    inViewport = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < win.innerHeight && rect.left < win.innerWidth;
    sync();
  };
  if (win.IntersectionObserver) {
    intersection = new win.IntersectionObserver(entries => {
      if (disposed) return;
      const entry = entries.find(item => item.target === video);
      if (!entry) return;
      inViewport = entry.isIntersecting && entry.intersectionRatio >= .01;
      sync();
    }, { threshold: .01 });
    intersection.observe(video);
  } else {
    win.addEventListener('scroll', checkViewport, true);
    win.addEventListener('resize', checkViewport);
    checkViewport();
  }

  // IntersectionObserver alone does not see visibility:hidden or retained
  // inert routes. Observe every ancestor, without watching our own opacity.
  const mutation = win.MutationObserver ? new win.MutationObserver(sync) : null;
  const ancestors = new Set();
  for (let node = video.parentElement; node; node = node.parentElement) {
    ancestors.add(node);
    mutation?.observe(node, { attributes: true, attributeFilter: ['inert', 'hidden', 'aria-hidden', 'data-active', 'data-visible', 'class', 'style'] });
  }
  // CSS can finish a reveal from opacity:0 without another attribute mutation.
  const onAncestorMotionEnd = event => { if (ancestors.has(event.target)) sync(); };
  doc.addEventListener('transitionend', onAncestorMotionEnd, true);
  doc.addEventListener('animationend', onAncestorMotionEnd, true);
  sync();
  return () => {
    disposed = true; request++; pending = null;
    intersection?.disconnect(); mutation?.disconnect();
    for (const [event, handler] of Object.entries(events)) video.removeEventListener(event, handler);
    doc.removeEventListener('visibilitychange', sync);
    doc.removeEventListener('transitionend', onAncestorMotionEnd, true);
    doc.removeEventListener('animationend', onAncestorMotionEnd, true);
    reduced.removeEventListener('change', sync);
    connection?.removeEventListener?.('change', sync);
    win.removeEventListener('scroll', checkViewport, true);
    win.removeEventListener('resize', checkViewport);
    video.pause();
  };
}
