import { useEffect, useState } from 'react';

// Значения берём из вычисленных стилей документа, а не из копии: так таблица
// не может разойтись с tokens.css и сама пересчитывается при смене темы.
const NAMES = [
  ['--page-bg', 'фон под карточками'],
  ['--color-white', 'карточки и бары'],
  ['--color-background', 'пилюли и подложки'],
  ['--color-text', 'основной текст'],
  ['--color-weak', 'подписи'],
  ['--color-light', 'шевроны'],
  ['--color-border', 'границы'],
  ['--color-primary', 'действия'],
  ['--color-primary-bg', 'подложка акцента'],
  ['--color-success', 'подтверждение'],
  ['--color-danger', 'разрушающее'],
];

export function TokenGrid() {
  const [values, setValues] = useState({});

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setValues(Object.fromEntries(NAMES.map(([n]) => [n, cs.getPropertyValue(n).trim()])));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-company'] });
    return () => mo.disconnect();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
      {NAMES.map(([name, use]) => (
        <div key={name} style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ height: 54, background: values[name] }} />
          <div style={{ padding: '9px 11px', background: 'var(--color-white)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'var(--color-text)' }}>{name}</span>
            <span style={{ fontSize: 11.5, color: 'var(--color-weak)' }}>{values[name]} · {use}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
