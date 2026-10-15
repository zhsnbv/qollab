import { usePublicationScenario } from '../publication-screens/ScenarioContext';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft24Regular, ChevronRight24Regular, Dismiss24Regular, FullScreenMaximize20Regular, Play20Filled } from '@fluentui/react-icons';
import { ASSET, PHOTO_STATUSES, videoEmbed } from './data';
import { cardImages } from './cardAppearance';
import './PublicationMedia.css';
import useSwipeRail from './useSwipeRail';

function PhotoInfo({ photo, fallback, showStatus = true }) {
  const status = showStatus && PHOTO_STATUSES.includes(photo.status) ? photo.status : null;
  return <div className="pw-photo-info">
    {status && <span className={`pw-info-status status-${PHOTO_STATUSES.indexOf(status)}`}><i />{status}</span>}
    <p>{photo.caption?.trim() || fallback || 'Описание не добавлено'}</p>
  </div>;
}

function MediaImage({ src, alt = '' }) {
  return <><img className="pw-media-backdrop" src={src} alt="" aria-hidden="true" draggable={false} /><img className="pw-media-photo" src={src} alt={alt} draggable={false} /></>;
}

function Video({ item, title, active = true, onPlay }) {
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbed(item);
  useEffect(() => { if (!active) setPlaying(false); }, [active]);
  return <div className="pw-media-video">
    {playing && embed ? <iframe title={`${item.provider}: ${title}`} src={embed} allow="fullscreen; picture-in-picture" allowFullScreen /> : <button className="pw-video-preview" type="button" aria-label="Воспроизвести видео" tabIndex={active ? 0 : -1} onClick={() => onPlay ? onPlay() : setPlaying(true)} disabled={!embed}>
      <MediaImage src={item.poster || ASSET + 'prod-furnace-01.webp'} /><span className="pw-media-play"><Play20Filled /></span><span className="pw-provider-badge">{item.provider === 'youtube' ? 'YouTube' : 'Vimeo'}</span>
    </button>}
  </div>;
}

// Keep elapsed time while paused; manual navigation starts a fresh six-second slide.
function useSlideshow(root, index, count, blocked, onNext) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(false), [hidden, setHidden] = useState(() => document.hidden);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const elapsed = useRef(0), next = useRef(onNext);
  next.current = onNext;
  const reset = () => { elapsed.current = 0; root.current?.style.setProperty('--pw-slide-progress', '0'); };
  useLayoutEffect(() => { elapsed.current = 0; root.current?.style.setProperty('--pw-slide-progress', '0'); }, [root, index, count]);
  useEffect(() => {
    const target = root.current?.querySelector('.pw-carousel-stage');
    if (!target || count < 2) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .35), { threshold: .35 });
    observer.observe(target);
    const visibility = () => setHidden(document.hidden);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReducedMotion(motion.matches);
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', preference);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', preference); };
  }, [root, count]);
  const state = count < 2 ? 'single' : reducedMotion ? 'reduced-motion' : hidden ? 'hidden' : !visible ? 'offscreen' : hovered ? 'hover' : focused ? 'focus' : blocked ? 'media' : 'playing';
  const scenario = usePublicationScenario();
  const running = state === 'playing' && !scenario;
  useEffect(() => {
    if (!running) return;
    let frame, previous = performance.now();
    const tick = now => {
      elapsed.current += Math.min(now - previous, 250); previous = now;
      root.current?.style.setProperty('--pw-slide-progress', String(Math.min(elapsed.current / 6000, 1)));
      if (elapsed.current >= 6000) { elapsed.current = 0; next.current(); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [root, running, index, count]);
  return { running, state, reset, handlers: {
    onPointerEnter: event => { if (event.pointerType === 'mouse') setHovered(true); },
    onPointerLeave: () => setHovered(false),
    onPointerDownCapture: event => { if (event.target.closest('.pw-swipe-rail')) reset(); setFocused(false); },
    onFocusCapture: event => { if (event.target.matches(':focus-visible')) setFocused(true); },
    onBlurCapture: event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); },
  } };
}

function MediaLightbox({ post, items, initialIndex, onChange, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const shell = useRef(null);
  const rail = useSwipeRail(index, items.length, next => { setIndex(next); onChange(next); });
  const go = next => { if (next >= 0 && next < items.length) rail.go(next); };
  useEffect(() => {
    const dialog = shell.current;
    document.documentElement.classList.add('pw-lightbox-open');
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    return () => { dialog.close(); document.documentElement.classList.remove('pw-lightbox-open'); };
  }, []);
  const onKeyDown = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };
  return createPortal(<dialog ref={shell} tabIndex={-1} className="pw-lightbox" aria-label="Просмотр медиа" onKeyDown={onKeyDown} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget || e.target.classList.contains('pw-lightbox-slide') || e.target.classList.contains('pw-lightbox-rail')) onClose(); }}>
    <button className="pw-lightbox-close" aria-label="Закрыть просмотр" onClick={onClose}><Dismiss24Regular /></button>
    <div ref={rail.ref} className="pw-lightbox-rail pw-swipe-rail" {...rail.handlers}>{items.map((item, i) => <div key={`${item.kind}-${item.id}-${i}`} className="pw-lightbox-slide" inert={i !== index} aria-hidden={i !== index}>
      <figure className={`pw-lightbox-frame ${item.kind === 'video' ? 'is-video' : ''}`}>
        {item.kind === 'image' ? <img className="pw-lightbox-photo" src={item.src} alt={item.caption || post.title} draggable={false} /> : <Video item={item} title={post.title} active={i === index} />}
        {item.kind === 'image' && (post.type === 'audit' || item.caption) && <figcaption className="pw-photo-overlay"><PhotoInfo photo={item} fallback={post.title} showStatus={post.type === 'audit'} /></figcaption>}
      </figure>
    </div>)}</div>
    {items.length > 1 && <><button className="pw-lightbox-arrow prev" aria-label="Предыдущее медиа" disabled={index === 0} onClick={() => go(index - 1)}><ChevronLeft24Regular /></button><button className="pw-lightbox-arrow next" aria-label="Следующее медиа" disabled={index === items.length - 1} onClick={() => go(index + 1)}><ChevronRight24Regular /></button><span className="pw-lightbox-counter" aria-live="polite">{index + 1} / {items.length}</span></>}
  </dialog>, document.body);
}

export default function PublicationMedia({ post, cover, headerControls = false, controlsTarget, onImageClick }) {
  const scenario = usePublicationScenario();
  const [active, setActive] = useState(scenario?.mediaIndex || 0), [viewer, setViewer] = useState(scenario?.lightbox ? scenario.mediaIndex || 0 : null);
  const carousel = useRef(null), returnFocus = useRef(null);
  const items = [...cardImages(post, !!cover).map(p => ({ ...p, kind: 'image' })), ...(post.videos || []).map(v => ({ ...v, kind: 'video' }))];
  const index = Math.min(active, Math.max(0, items.length - 1)), item = items[index];
  const hasAuditNote = (media, i) => post.type === 'audit' && i > 0 && media.kind === 'image' && (media.caption?.trim() || PHOTO_STATUSES.includes(media.status));
  const showingAuditNote = !!item && hasAuditNote(item, index);
  const rail = useSwipeRail(index, items.length, setActive);
  const slideshow = useSlideshow(carousel, index, items.length, viewer !== null || item?.kind === 'video', () => rail.go((index + 1) % items.length));
  const go = next => { if (next >= 0 && next < items.length) { slideshow.reset(); rail.go(next); } };
  useEffect(() => {
    if (viewer === null && returnFocus.current) {
      const previous = returnFocus.current;
      const target = previous.isConnected && !previous.closest('.pw-carousel-slide') ? previous : carousel.current?.querySelector('.pw-carousel-image[tabindex="0"], .pw-video-preview[tabindex="0"], .pw-media-expand');
      target?.focus({ preventScroll: true }); returnFocus.current = null;
    }
  }, [viewer]);
  const open = (next = index) => {
    returnFocus.current = carousel.current?.contains(document.activeElement) ? document.activeElement : carousel.current?.querySelector('.pw-carousel-image, button');
    rail.go(next, false); setActive(next); setViewer(next);
  };
  if (!item) return null;
  const timeline = items.length > 1 && <div className="pw-carousel-timeline" aria-label="Выбор медиа">{items.map((m, i) => <button key={`${m.kind}-${m.id}-${i}`} aria-label={`Медиа ${i + 1} из ${items.length}`} aria-current={i === index} onClick={() => go(i)}><span className="pw-slide-track"><span className="pw-slide-fill" style={{ transform: `scaleX(${i === index ? 'var(--pw-slide-progress, 0)' : i < index ? 1 : 0})` }} /></span></button>)}</div>;
  const mediaActions = <div className="pw-media-actions" aria-label="Управление галереей">
    {items.length > 1 && <><button aria-label="Предыдущее медиа в карточке" onClick={() => go((index - 1 + items.length) % items.length)}><ChevronLeft24Regular /></button><button aria-label="Следующее медиа в карточке" onClick={() => go((index + 1) % items.length)}><ChevronRight24Regular /></button></>}
    <button className="pw-media-expand" aria-label="Открыть медиа на весь экран" onClick={() => open()}><FullScreenMaximize20Regular /></button>
  </div>;
  return <>
    <div ref={carousel} className={`pw-media-carousel ${cover ? 'is-cover' : ''} ${post.type === 'audit' ? 'is-audit' : ''} ${items.length > 1 ? 'has-many' : ''}`} {...slideshow.handlers} data-media-backdrop={post.mediaBackdrop} data-autoplay-state={slideshow.state} role={items.length > 1 ? 'region' : undefined} aria-roledescription={items.length > 1 ? 'Карусель' : undefined} aria-label={items.length > 1 ? `Медиа: ${post.title}` : undefined}>
      <div className="pw-carousel-stage" onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); } }}>
        <div ref={rail.ref} className="pw-carousel-rail pw-swipe-rail" {...rail.handlers}>{items.map((media, i) => <div className="pw-carousel-slide" key={`${media.kind}-${media.id}-${i}`}>
          {media.kind === 'image' ? <button className="pw-carousel-image" onClick={() => onImageClick ? onImageClick() : open(i)} aria-label={onImageClick ? `Открыть статью: ${post.title}` : `Открыть изображение ${i + 1} из ${items.length}`} tabIndex={i === index ? 0 : -1}><MediaImage src={media.src} alt={media.caption || post.title} /></button> : <Video item={media} title={post.title} active={i === index} onPlay={cover ? () => open(i) : undefined} />}
          {!cover && media.kind === 'image' && (post.type === 'audit' || media.caption) && <div className="pw-photo-overlay"><PhotoInfo photo={media} fallback={post.title} showStatus={post.type === 'audit'} /></div>}
        </div>)}</div>
        {cover && <div className="pw-cover-editorial">
          <div className="pw-cover-header">{cover.header}</div>
          <div className="pw-cover-copy">
            <div className="pw-cover-stack">
              <div className={`pw-cover-story ${showingAuditNote ? '' : 'is-active'}`} inert={showingAuditNote} aria-hidden={showingAuditNote}>
                {cover.onOpen ? <button type="button" className="pw-cover-title" onClick={cover.onOpen}>{cover.title}</button> : <h3 className="pw-cover-title">{cover.title}</h3>}
                {post.type !== 'audit' && item.kind === 'image' && item.caption && <div className="pw-cover-photo-info"><PhotoInfo photo={item} fallback={post.title} showStatus={false} /></div>}
              </div>
              {/* Overlapping grid cells reserve the tallest copy before a slide changes. */}
              {items.map((media, i) => hasAuditNote(media, i) && <div key={`note-${media.id}-${i}`} className={`pw-cover-photo-info pw-cover-audit-note ${i === index ? 'is-active' : ''}`} inert={i !== index} aria-hidden={i !== index}><PhotoInfo photo={media} /></div>)}
            </div>
          </div>
          <div className="pw-rubric-band" aria-hidden="true" />
        </div>}
        {!headerControls && <div className="pw-media-corner-actions">{mediaActions}</div>}
        {timeline}
      </div>
      {headerControls && controlsTarget && createPortal(mediaActions, controlsTarget)}
      {items.length > 1 && <span className="pw-sr-only" aria-live={slideshow.running ? 'off' : 'polite'}>{index + 1} / {items.length}</span>}
    </div>
    {viewer !== null && <MediaLightbox post={post} items={items} initialIndex={viewer} onChange={go} onClose={() => setViewer(null)} />}
  </>;
}
