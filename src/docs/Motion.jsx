import { useState } from 'react';

// Кривые показываем в деле: длительности взяты из tokens.css, а не переписаны.
const CURVES = [
  ['Появление оверлея', '0.28s cubic-bezier(0.32, 0.72, 0, 1)', 'экран въезжает справа'],
  ['Лист снизу', '0.26s cubic-bezier(0.32, 0.72, 0, 1)', 'то же ускорение, что у экрана'],
  ['Плашка таб-бара', '0.24s cubic-bezier(0.4, 0, 0.2, 1)', 'доезжает, а не перерисовывается'],
  ['Нажатие', '0.12s ease-out', 'прозрачность 0.6 — отклик, не анимация'],
];

export function MotionDemo() {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        style={{
          justifySelf: 'start', padding: '9px 16px', borderRadius: 999, border: 0,
          background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600,
        }}
      >
        {on ? 'Вернуть' : 'Проиграть'}
      </button>
      {CURVES.map(([label, timing, note]) => (
        <div key={label} style={{
          background: 'var(--color-white)', border: '1px solid var(--color-border)',
          borderRadius: 12, padding: '12px 14px', overflow: 'hidden',
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-heading)' }}>{label}</span>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: 'var(--color-weak)' }}>{timing}</span>
          </div>
          <div style={{ height: 22, background: 'var(--color-background)', borderRadius: 8, position: 'relative' }}>
            <span style={{
              position: 'absolute', top: 3, width: 34, height: 16, borderRadius: 6,
              background: 'var(--color-primary)',
              left: on ? 'calc(100% - 37px)' : 3,
              transition: `left ${timing}`,
            }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-weak)', marginTop: 7 }}>{note}</div>
        </div>
      ))}
    </div>
  );
}
