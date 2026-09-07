import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CaretLeft, LockSimple, MinusCircle, PlusCircle, DotsSixVertical,
} from '@phosphor-icons/react';
import { useWidgets } from '../context/WidgetsContext';
import { WIDGET_ICONS } from '../components/Widgets';
import { widgetList } from '../data/widgets';
import { useScrolled } from '../utils/useScrolled';
import { useReorder } from '../utils/useReorder';
import Toast from '../components/Toast';
import './Favorites.css';
import './WidgetSettings.css';

// Панель «Виджеты» по п. «Экран настройки» ТЗ. Список, а не сетка превью:
// порядок меняется перетаскиванием, а тащить плитки в двух колонках неудобно —
// непонятно, куда именно встанет карточка. Строки и ручка справа — тот же
// приём, что в настройке избранных сервисов, и человек уже знает его.
//
// Кнопки «Сохранить» нет: и видимость, и порядок применяются сразу.
export default function WidgetSettings() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const { widgets, order, isHidden, toggle, reset, isDefault, setOrder } = useWidgets();
  const [closing, setClosing] = useState(false);
  const [toast, setToast] = useState('');

  const hidden = widgetList.filter((w) => isHidden(w.id));

  // Тащим только видимые, а пишем полный порядок: скрытые остаются на своих
  // местах, поэтому возвращённый виджет встаёт туда же, откуда его убрали,
  // а не в конец ленты.
  const visibleRef = useRef([]);
  const orderRef = useRef([]);
  useEffect(() => {
    visibleRef.current = widgets.map((w) => w.id);
    orderRef.current = order;
  });

  const setVisibleOrder = (updater) => {
    const next = typeof updater === 'function' ? updater(visibleRef.current) : updater;
    const set = new Set(next);
    let i = 0;
    const full = orderRef.current.map((id) => (set.has(id) ? next[i++] : id));
    // Пишем в ref сразу: следующий шаг перетаскивания придёт раньше рендера,
    // и без этого он читал бы устаревший порядок.
    visibleRef.current = next;
    orderRef.current = full;
    setOrder(full);
  };

  const { rowRefs, dragIndex, dragY, onPointerDown } = useReorder(widgets.length, setVisibleOrder);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const onToggle = (w) => {
    const wasOn = !isHidden(w.id);
    toggle(w.id);
    setToast(wasOn ? `«${w.name}» скрыт` : `«${w.name}» добавлен`);
  };

  const glyph = (w) => {
    const Icon = WIDGET_ICONS[w.icon];
    return <span className="wset-ico">{Icon && <Icon />}</span>;
  };

  const text = (w, sub) => (
    <span className="wset-text">
      <span className="wset-row-name">{w.name}</span>
      <span className="wset-row-sub">{sub}</span>
    </span>
  );

  return (
    <div className={`favscreen ${closing ? 'closing' : ''}`}>
      <header className={`fav-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="fav-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="fav-title">Виджеты</h1>
        <span className="fav-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="fav-scroll" onScroll={onScroll}>
        <p className="wset-note">
          Виджеты появятся на главной в этом порядке. Перетащите за ручку справа, чтобы его поменять.
        </p>

        <div className="fav-section-row">
          <h2 className="fav-section">На главной</h2>
          <span className="fav-count">{widgets.length}</span>
        </div>
        <div className="fav-list">
          {widgets.map((w, i) => {
            const dragging = dragIndex === i;
            return (
              <div
                className={`favedit-row wset-row ${dragging ? 'dragging' : ''}`}
                key={w.id}
                ref={(el) => { rowRefs.current[i] = el; }}
                style={dragging ? { transform: `translateY(${dragY}px)` } : undefined}
              >
                {w.user ? (
                  <button className="fav-remove" onClick={() => onToggle(w)} aria-label={`Скрыть «${w.name}»`}>
                    <MinusCircle size={20} weight="fill" />
                  </button>
                ) : (
                  /* Постоянный виджет спрятать нельзя — вместо кнопки замок:
                     нажимать нечего, и причина видна сразу. */
                  <span className="wset-lock" aria-label="Всегда на главной">
                    <LockSimple size={16} weight="fill" />
                  </span>
                )}
                {glyph(w)}
                {text(w, w.user ? w.title : 'Всегда на главной')}
                <span
                  className="fav-handle"
                  onPointerDown={onPointerDown(i)}
                  role="button"
                  aria-label={`Изменить порядок: «${w.name}»`}
                >
                  <DotsSixVertical size={20} />
                </span>
              </div>
            );
          })}
        </div>

        {hidden.length > 0 && (
          <>
            <h2 className="fav-section">Скрытые</h2>
            <div className="fav-list">
              {hidden.map((w) => (
                <div className="favedit-row wset-row" key={w.id}>
                  <button className="fav-add" onClick={() => onToggle(w)} aria-label={`Добавить «${w.name}»`}>
                    <PlusCircle size={20} weight="fill" />
                  </button>
                  {glyph(w)}
                  {text(w, w.title)}
                </div>
              ))}
            </div>
          </>
        )}

        <button className="wset-reset" onClick={() => { reset(); setToast('Вернули набор и порядок по умолчанию'); }} disabled={isDefault}>
          Вернуть по умолчанию
        </button>

        <div className="fav-bottom-spacer" />
      </div>

      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
