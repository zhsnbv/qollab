import { useEffect, useRef } from 'react';

// Переключатель разделов профиля. Ряд шире экрана, поэтому при выборе
// подтягиваем активную пилюлю к центру — крайние вкладки иначе остаются
// за краем и кажутся недоступными.
export default function ProfileTabs({ tabs, value, onChange, data }) {
  const rowRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector('.cp-tab.active');
    if (!row || !active) return;
    // Считаем позицию сами: scrollIntoView заодно дёргает вертикальную
    // прокрутку экрана, а нам нужна только горизонтальная.
    const left = active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [value]);

  return (
    <div className="pp-tabs no-scrollbar" ref={rowRef}>
      {tabs.map(({ id, label, Icon, count }) => (
        <button
          key={id}
          className={`cp-tab ${value === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
        >
          {/* Иконка необязательна: у вкладок ID-карты её нет, а без проверки
              отсутствие валило весь ряд */}
          {Icon && <Icon />}
          {label}
          {count && <span className="pp-tab-count">{count(data)}</span>}
        </button>
      ))}
    </div>
  );
}
