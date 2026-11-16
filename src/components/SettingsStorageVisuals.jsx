import { useEffect, useId, useRef } from 'react';
import { Check, FileText, ImageSquare, VideoCamera, Sparkle, MusicNotes } from '@phosphor-icons/react';
import { formatStorage } from '../utils/settingsPreferences';
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
    <svg viewBox="0 0 240 240" role="group" aria-label="Состав кэша">
      <defs><mask id={`${id}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
        <circle className="sv-ring-reveal" cx="120" cy="120" r="86.5" fill="none" stroke="#fff" strokeWidth="43" pathLength="1" strokeDasharray="1 1" transform="rotate(-90 120 120)" />
      </mask></defs>
      {total ? <g mask={`url(#${id}-reveal)`}>{segments.map(segment => <g key={segment.id} role="button" tabIndex={0} aria-label={`${segment.name}: ${formatStorage(segment.mb)}`} aria-pressed={selected.includes(segment.id)} onClick={() => onToggle(segment.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(segment.id); } }} className={`sv-ring-segment ${selected.includes(segment.id) ? 'is-selected' : ''}`}>
        <path d={segment.path} fill={segment.color} />
      </g>)}</g> : <circle className="sv-ring-empty" cx="120" cy="120" r="86.5" fill="none" strokeWidth="23" />}
    </svg>
    <div className="sv-ring-center"><strong>{total ? formatStorage(total) : <Check size={35} weight="bold" />}</strong><span>{total ? 'занято кэшем' : 'Всё чисто'}</span></div>
  </div>;
}

export function DeviceStorageBar({ cache }) {
  const other = 107020, capacity = 128000, free = capacity - other - cache;
  return <div className="sv-disk st-card"><div className="sv-disk-heading"><span>Память устройства</span><span>128 ГБ</span></div><div className="sv-disk-free"><strong>{formatStorage(free)}</strong><span>свободно</span></div><div className="sv-disk-bar" role="img" aria-label={`qollab ${formatStorage(cache)}, другие данные ${formatStorage(other)}, свободно ${formatStorage(free)}`}><i style={{ width: `${cache / capacity * 100}%` }} /><b style={{ width: `${other / capacity * 100}%` }} /></div><div className="sv-disk-legend"><span><i />qollab <b>{formatStorage(cache)}</b></span><span><i />Другие данные <b>{formatStorage(other)}</b></span></div></div>;
}

const FILES = [
  { Icon: VideoCamera, color: '#3d7eff', angle: -155, delay: -.1 },
  { Icon: ImageSquare, color: '#25b986', angle: -45, delay: -.78 },
  { Icon: FileText, color: '#a064ef', angle: 55, delay: -1.35 },
  { Icon: MusicNotes, color: '#ed9244', angle: 145, delay: -1.87 },
];
const BURST_COLORS = ['#3d7eff', '#25c98d', '#9c5af7', '#ffae36', '#f35e86'];

export function CacheCleaning({ job, onClose }) {
  const dialog = useRef(null), id = useId(), done = job.phase === 'done';
  useEffect(() => { const previous = document.activeElement; dialog.current?.focus(); return () => previous?.focus?.(); }, []);
  const current = job.categories[Math.min(job.categories.length - 1, Math.floor(job.progress * job.categories.length))];
  const percent = Math.round(job.progress * 100);
  return <div className="sx-cleaning-overlay sv-cleaning-overlay"><div className={`sv-cleaning-dialog ${done ? 'is-done' : ''}`} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} ref={dialog} onKeyDown={event => {
    if (event.key === 'Tab') { event.preventDefault(); (dialog.current.querySelector('button') || dialog.current).focus(); }
    if (event.key === 'Escape' && done) onClose();
  }}>
    <div className="sv-clean-stage-art" aria-hidden="true">
      <div className="sv-clean-aura" />
      <svg className="sv-clean-ring" viewBox="0 0 196 196"><defs><linearGradient id={`${id}-gradient`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4c8cff" /><stop offset=".55" stopColor="#7b70f8" /><stop offset="1" stopColor="#30cda1" /></linearGradient></defs><circle cx="98" cy="98" r="78" fill="none" className="sv-clean-track" strokeWidth="3" /><circle className="sv-clean-arc" cx="98" cy="98" r="78" fill="none" stroke={done ? '#25bd8c' : `url(#${id}-gradient)`} strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray="100 100" strokeDashoffset={100 - percent} transform="rotate(-90 98 98)" /></svg>
      {!done && <><div className="sv-clean-satellite"><i /></div><div className="sv-clean-files">{FILES.map(({ Icon, color, angle, delay }, index) => <span key={index} style={{ '--file-color': color, '--file-x': `${Math.cos(angle * Math.PI / 180) * 75}px`, '--file-y': `${Math.sin(angle * Math.PI / 180) * 75}px`, '--file-tilt': `${index % 2 ? 15 : -15}deg`, '--file-delay': `${delay}s` }}><Icon size={20} weight="duotone" /></span>)}</div></>}
      <div className="sv-clean-core">{done ? <svg className="sv-clean-check" viewBox="0 0 48 48"><path d="M11 24l9 9 18-19" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg> : <Sparkle size={35} weight="duotone" />}</div>
      {done && <div className="sv-clean-burst">{Array.from({ length: 10 }, (_, index) => <i key={index} style={{ '--burst-angle': `${index * 36}deg`, '--burst-color': BURST_COLORS[index % BURST_COLORS.length], '--burst-delay': `${(index % 3) * 30}ms` }} />)}</div>}
    </div>
    <h2 id={`${id}-title`}>{done ? 'Место освобождено' : 'Наводим порядок'}</h2>
    <p className="sv-clean-stage" role="status">{done ? 'Сообщения и файлы в чатах сохранены.' : `Очищаем: ${current?.name.toLocaleLowerCase() || 'кэш'}…`}</p>
    <div className="sv-clean-count"><strong>{formatStorage(Math.round(job.total * job.progress))}</strong><span>{done ? 'снова в вашем распоряжении' : `из ${formatStorage(job.total)}`}</span></div>
    {done ? <button className="sx-primary sv-clean-done" onClick={onClose}>Отлично</button> : <div className="sv-clean-progress" role="progressbar" aria-label="Очистка кэша" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /><small>{percent}%</small></div>}
  </div></div>;
}
