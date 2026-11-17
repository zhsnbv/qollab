import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { Check, FileText, ImageSquare, VideoCamera, MusicNotes, Sparkle } from '@phosphor-icons/react';
import { formatStorage } from '../utils/settingsPreferences';
import Portal from './Portal';
import { pushScrim, popScrim } from '../utils/scrim';
import './SettingsStorageVisuals.css';

const TAU = Math.PI * 2;
const point = (radius, angle) => `${120 + radius * Math.cos(angle)},${120 + radius * Math.sin(angle)}`;

// A filled annular sector, with four individually rounded corners. Unlike
// round stroke caps, the two radial edges remain almost straight like the reference.
function roundedSector(start, part) {
  const outer = 105, inner = 68;
  const gap = Math.min(.055, part * TAU * .24);
  const a = start * TAU - Math.PI / 2 + gap / 2;
  const b = (start + part) * TAU - Math.PI / 2 - gap / 2;
  const corner = Math.min(6, (b - a) * inner / 3);
  const outerInset = corner / outer, innerInset = corner / inner;
  return [
    `M${point(outer, a + outerInset)}`,
    `A${outer},${outer} 0 ${b - a - outerInset * 2 > Math.PI ? 1 : 0} 1 ${point(outer, b - outerInset)}`,
    `Q${point(outer, b)} ${point(outer - corner, b)}`,
    `L${point(inner + corner, b)}`,
    `Q${point(inner, b)} ${point(inner, b - innerInset)}`,
    `A${inner},${inner} 0 ${b - a - innerInset * 2 > Math.PI ? 1 : 0} 0 ${point(inner, a + innerInset)}`,
    `Q${point(inner, a)} ${point(inner + corner, a)}`,
    `L${point(outer - corner, a)}`,
    `Q${point(outer, a)} ${point(outer, a + outerInset)}Z`,
  ].join(' ');
}

export function StorageRing({ categories, selected, onToggle }) {
  const id = useId();
  const total = categories.reduce((sum, category) => sum + category.mb, 0);
  let offset = 0;
  const segments = categories.filter(category => category.mb > 0).map(category => {
    const part = category.mb / total;
    const segment = { ...category, part, path: roundedSector(offset, part) };
    offset += part;
    return segment;
  });
  return <div className={`sv-ring ${total ? '' : 'is-empty'}`}>
    <svg viewBox="0 0 240 240" role={total ? 'group' : undefined} aria-label={total ? 'Состав кэша' : undefined} aria-hidden={!total || undefined}>
      <defs><mask id={`${id}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
        <circle className="sv-ring-reveal" cx="120" cy="120" r="86.5" fill="none" stroke="#fff" strokeWidth="43" pathLength="1" strokeDasharray="1 1" transform="rotate(-90 120 120)" />
      </mask></defs>
      {total ? <g mask={`url(#${id}-reveal)`}>{segments.map(segment => <g key={segment.id} role="button" tabIndex={0} aria-label={`${segment.name}: ${formatStorage(segment.mb)}`} aria-pressed={selected.includes(segment.id)} onClick={() => onToggle(segment.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(segment.id); } }} className={`sv-ring-segment ${selected.includes(segment.id) ? 'is-selected' : ''}`}>
        <path d={segment.path} fill={segment.color} />
      </g>)}</g> : <circle className="sv-ring-empty" cx="120" cy="120" r="92" fill="none" strokeWidth="24" />}
    </svg>
    <div className="sv-ring-center" role={total ? undefined : 'status'} aria-live={total ? undefined : 'polite'} aria-atomic={total ? undefined : true}>{total ? <><strong>{formatStorage(total)}</strong><span>занято кэшем</span></> : <><Check className="sv-ring-success-mark" size={40} weight="bold" aria-hidden="true" /><strong className="sv-ring-success-title">Всё чисто</strong></>}</div>
  </div>;
}

export function DeviceStorageBar({ cache }) {
  const other = 107020, capacity = 128000, free = capacity - other - cache;
  return <div className="sv-disk st-card"><div className="sv-disk-heading"><span>Память устройства</span><span>128 ГБ</span></div><div className="sv-disk-free"><strong>{formatStorage(free)}</strong><span>свободно</span></div><div className="sv-disk-bar" role="img" aria-label={`qollab ${formatStorage(cache)}, другие данные ${formatStorage(other)}, свободно ${formatStorage(free)}`}><i style={{ width: `${cache / capacity * 100}%` }} /><b style={{ width: `${other / capacity * 100}%` }} /></div><div className="sv-disk-legend"><span><i />qollab <b>{formatStorage(cache)}</b></span><span><i />Другие данные <b>{formatStorage(other)}</b></span></div></div>;
}

const FILES = [
  { Icon: VideoCamera, angle: -155, delay: -.12 },
  { Icon: ImageSquare, angle: -45, delay: -.72 },
  { Icon: FileText, angle: 55, delay: -1.32 },
  { Icon: MusicNotes, angle: 145, delay: -1.92 },
];

function CleaningArtwork({ done }) {
  if (done) return <div className="sv-clean-stage-art is-complete" aria-hidden="true">
    <svg className="sv-clean-check" viewBox="0 0 64 64"><path d="M14 33l13 13 25-27" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg>
  </div>;

  return <div className="sv-clean-stage-art" aria-hidden="true">
    <div className="sv-clean-files">{FILES.map(({ Icon, angle, delay }, index) => <span key={index} style={{ '--file-x': `${Math.cos(angle * Math.PI / 180) * 88}px`, '--file-y': `${Math.sin(angle * Math.PI / 180) * 88}px`, '--file-tilt': `${index % 2 ? 12 : -12}deg`, '--file-delay': `${delay}s` }}><Icon size={19} weight="duotone" /></span>)}</div>
    <div className="sv-clean-core"><Sparkle size={38} weight="duotone" /></div>
  </div>;
}

export function CacheCleaning({ job, onClose }) {
  const overlay = useRef(null), dialog = useRef(null), doneButton = useRef(null);
  const id = useId(), done = job.phase === 'done';
  const progress = Math.max(0, Math.min(1, job.progress));
  const percent = Math.round(progress * 100);

  useLayoutEffect(() => {
    // Portal places this layer beside the screen, above its header and scroll
    // container. Only this DeviceHost becomes inert, never another review phone.
    const layer = overlay.current;
    const host = layer.parentElement;
    const previous = document.activeElement;
    const siblings = [...host.children].filter(node => node !== layer);
    const inertBefore = siblings.map(node => node.inert);
    const blurredBefore = siblings.map(node => node.classList.contains('sv-cleaning-background'));
    // Blur the actual screen pixels as well as the backdrop. This remains visible
    // when the device's transformed/isolated layers prevent backdrop sampling.
    siblings.forEach(node => { node.inert = true; node.classList.add('sv-cleaning-background'); });
    dialog.current.focus({ preventScroll: true });
    pushScrim();
    return () => {
      siblings.forEach((node, index) => {
        node.inert = inertBefore[index];
        if (!blurredBefore[index]) node.classList.remove('sv-cleaning-background');
      });
      popScrim();
      const available = node => node?.isConnected && !node.disabled
        && !node.closest('[inert], [hidden], [aria-hidden="true"]')
        && node.getClientRects().length > 0;
      // ConfirmDialog may already be unmounted when this layer takes focus,
      // leaving body as the recorded element. Body is not a restore target.
      const target = previous !== document.body && previous !== document.documentElement && available(previous)
        ? previous
        // A retained route can contain a hidden screen before the active one.
        // Inspect all candidates instead of stopping at its first hidden button.
        : siblings.flatMap(node => [...node.querySelectorAll('button:not([disabled]), [tabindex="0"]')]).find(available);
      target?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { if (done) doneButton.current?.focus({ preventScroll: true }); }, [done]);

  return <Portal><div className="sv-cleaning-overlay" ref={overlay}>
    <div className={`sv-cleaning-dialog ${done ? 'is-done' : ''}`} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} ref={dialog} onKeyDown={event => {
      if (event.key === 'Tab') { event.preventDefault(); (doneButton.current || dialog.current).focus({ preventScroll: true }); }
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (done) onClose(); }
    }}>
      <div className="sv-clean-content">
        <CleaningArtwork done={done} />
        <h2 id={`${id}-title`} role="status" aria-live="polite" aria-atomic="true">{done ? 'Кэш очищен' : 'Очищаем кэш'}</h2>
        <div className="sv-clean-action">{done ? <button className="sv-clean-done" onClick={onClose} ref={doneButton}>Отлично</button> : <div className="sv-clean-progress" role="progressbar" aria-label="Очистка кэша" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`}><strong>{percent}%</strong><div className="sv-clean-progress-track"><span style={{ width: `${percent}%` }} /></div></div>}</div>
      </div>
    </div>
  </div></Portal>;
}
