// Живая шкала: строки рисуются теми же классами и переменными, что и экраны,
// поэтому расходиться с приложением ей не с чем.
const ROWS = [
  ['Заголовок экрана', 24, 700, 'var(--color-heading)', 'имя в профиле, заголовок публикации'],
  ['Заголовок листа', 18, 700, 'var(--color-heading)', 'шапка листа снизу'],
  ['Заголовок блока', 16, 600, 'var(--color-heading)', 'название карточки, строка списка'],
  ['Основной текст', 15, 400, 'var(--color-text)', 'сообщения, описания, поля'],
  ['Подпись', 13, 400, 'var(--color-weak)', 'время, роль, вторая строка'],
  ['Мелкая метка', 11, 500, 'var(--color-weak)', 'счётчики, бейджи, подписи вкладок'],
];

export function TypeScale() {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      {ROWS.map(([label, size, weight, color, use]) => (
        <div
          key={label}
          style={{
            display: 'flex', alignItems: 'baseline', gap: 16, padding: '12px 14px', flexWrap: 'wrap',
            background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 12,
          }}
        >
          <span style={{ fontSize: size, fontWeight: weight, color, flex: '1 1 auto' }}>{label}</span>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'var(--color-weak)', whiteSpace: 'nowrap' }}>
            {size}/{weight}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-weak)', flex: '1 1 200px' }}>{use}</span>
        </div>
      ))}
    </div>
  );
}

// Табличные цифры включены на body, но кнопки и поля получают от браузера
// собственный font — им наследование прописано отдельно.
export function TabularDemo() {
  const cell = { padding: '10px 14px', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 12 };
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={cell}>
        <div style={{ fontSize: 12, color: 'var(--color-weak)', marginBottom: 6 }}>Табличные (как в проекте)</div>
        <div style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>1 111 111<br />8 888 888</div>
      </div>
      <div style={cell}>
        <div style={{ fontSize: 12, color: 'var(--color-weak)', marginBottom: 6 }}>Пропорциональные (так быть не должно)</div>
        <div style={{ fontSize: 18, fontVariantNumeric: 'proportional-nums' }}>1 111 111<br />8 888 888</div>
      </div>
    </div>
  );
}

// Теней в токенах пока нет — значения лежат в местах применения. Показываем
// ровно то, что стоит в коде, чтобы список нельзя было принять за желаемое.
const SHADOWS = [
  ['.hdr-shadow', '0 2px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)', 'шапка при прокрутке'],
  ['карточка', '0 1px 1px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02), 0 2px 2px rgba(0,0,0,0.02)', 'плитки и карточки'],
  ['лист снизу', '0 8px 30px rgba(0,0,0,0.18)', 'оверлей над затемнением'],
  ['таб-бар', '0 8px 40px rgba(0,0,0,0.12)', 'плавающая капсула'],
];

export function ShadowGrid() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {SHADOWS.map(([name, value, use]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 96, height: 52, flex: 'none', borderRadius: 14, background: 'var(--color-white)', boxShadow: value }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-heading)' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-weak)' }}>{use}</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: 'var(--color-light)', wordBreak: 'break-word' }}>{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const RADII = [
  ['--radius-sm', 'плитка внутри карточки'],
  ['--radius-md', 'подложка иконки, поле'],
  ['--radius-lg', 'карточка, шапка профиля'],
  ['--radius-xl', 'верх листа снизу'],
  ['--radius-pill', 'пилюли и аватарки'],
];

export function RadiusGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
      {RADII.map(([name, use]) => (
        <div key={name} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <div style={{
            width: '100%', height: 64, borderRadius: `var(${name})`,
            background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary)',
          }}
          />
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'var(--color-text)' }}>{name}</span>
          <span style={{ fontSize: 11, color: 'var(--color-weak)', textAlign: 'center' }}>{use}</span>
        </div>
      ))}
    </div>
  );
}

// Семёрки в шкале нет: 28px ни разу не понадобилось.
const SPACES = [1, 2, 3, 4, 5, 6, 8];

export function SpaceScale() {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {SPACES.map((n) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'var(--color-weak)', width: 82 }}>--space-{n}</span>
          <span style={{ height: 14, width: `var(--space-${n})`, background: 'var(--color-primary)', borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
}
