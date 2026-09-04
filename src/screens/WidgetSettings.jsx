import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, LockSimple } from '@phosphor-icons/react';
import { useWidgets } from '../context/WidgetsContext';
import { WIDGET_ICONS } from '../components/Widgets';
import { widgetList, widgetData } from '../data/widgets';
import { useScrolled } from '../utils/useScrolled';
import Toast from '../components/Toast';
import '../components/Widgets.css';
import './Favorites.css';
import './WidgetSettings.css';

// Панель «Виджеты» по п. «Экран настройки» ТЗ: карточки в два столбца,
// в каждой уменьшенный вид самого виджета — человек добавляет то, что видит.
// Кнопки «Сохранить» нет, изменения применяются сразу.
export default function WidgetSettings() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const { isHidden, toggle, reset, isDefault } = useWidgets();
  const [closing, setClosing] = useState(false);
  const [toast, setToast] = useState('');

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const onToggle = (w) => {
    const wasOn = !isHidden(w.id);
    toggle(w.id);
    setToast(wasOn ? `«${w.name}» скрыт` : `«${w.name}» добавлен`);
  };

  // Превью повторяет форму самого виджета, а не рисует абстрактные полоски:
  // по нему и понятно, что именно появится на главной.
  const preview = (w) => {
    if (w.id === 'safety') {
      return (
        <>
          <div className="wset-prev-big">{widgetData.safetyDays}</div>
          <span className="wset-line w45" />
        </>
      );
    }
    // У встреч превью — тот же таймлайн: прошедшая, идущая сейчас, будущая
    if (w.id === 'meet') {
      return (
        <div className="wset-tl">
          <span className="wset-tl-row wset-tl-row--past" />
          <span className="wset-tl-row wset-tl-row--now" />
          <span className="wset-tl-row" />
        </div>
      );
    }
    return (
      <>
        <span className="wset-line w70" />
        <span className="wset-line w45" />
        <span className="wset-line w70" />
      </>
    );
  };

  return (
    <div className={`favscreen ${closing ? 'closing' : ''}`}>
      <header className={`fav-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="fav-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="fav-title">Виджеты</h1>
        <span className="fav-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="fav-scroll" onScroll={onScroll}>
        <p className="wset-note">Добавленные виджеты появятся на главной, под блоком сервисов</p>

        <div className="wset-grid">
          {widgetList.map((w) => {
            const Icon = WIDGET_ICONS[w.icon];
            const on = !isHidden(w.id);
            return (
              <div className="wset-card" key={w.id}>
                <div className={`wset-prev wg-tone--${w.tone}`}>
                  <div className="wset-prev-top">
                    <span className="wset-prev-ico">{Icon && <Icon />}</span>
                    <span className="wset-prev-name">{w.title}</span>
                  </div>
                  <div className="wset-prev-body">{preview(w)}</div>
                </div>
                <span className="wset-name">{w.name}</span>
                {w.user ? (
                  <button
                    className={`wset-btn ${on ? 'wset-btn--off' : ''}`}
                    onClick={() => onToggle(w)}
                  >
                    {on ? 'Скрыть' : 'Добавить'}
                  </button>
                ) : (
                  /* У постоянных кнопки нет вовсе: нажимать нечего, и причина
                     сказана прямо — иначе выглядит как неработающая кнопка. */
                  <span className="wset-locked">
                    <LockSimple size={11} weight="fill" />
                    Всегда на главной
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button className="wset-reset" onClick={() => { reset(); setToast('Вернули набор по умолчанию'); }} disabled={isDefault}>
          Вернуть по умолчанию
        </button>

        <div className="fav-bottom-spacer" />
      </div>

      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
