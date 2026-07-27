import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, MinusCircle, DotsSixVertical } from '@phosphor-icons/react';
import { useFavorites, FAV_ICONS } from '../context/FavoritesContext';
import './Favorites.css';

// Драг-реордер указателем: тащим за ручку (DotsSixVertical), список
// переупорядочивается «на лету» — как только палец/курсор проходит середину
// соседней строки. FLIP-анимацию соседей не делаем (не критично для этого
// объёма списка) — едет плавно только сама перетаскиваемая строка.
function useReorder(count, setFavorites) {
  const rowRefs = useRef([]);
  const drag = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragY, setDragY] = useState(0);

  const onPointerDown = (index) => (e) => {
    e.preventDefault();
    const height = rowRefs.current[index]?.getBoundingClientRect().height || 64;
    drag.current = { from: index, current: index, startY: e.clientY, height };
    setDragIndex(index);
    setDragY(0);

    const move = (ev) => {
      if (!drag.current) return;
      const delta = ev.clientY - drag.current.startY;
      setDragY(delta);
      const shift = Math.round(delta / drag.current.height);
      const target = Math.min(count - 1, Math.max(0, drag.current.from + shift));
      const from = drag.current.current;
      // from/target — обычные числа, а не drag.current, захватываем их в
      // замыкание: apдейтер setFavorites React может вызвать отложенно
      // (после следующего pointermove/up), и к этому моменту drag.current
      // уже обнулён обработчиком up — обращение к drag.current внутри
      // апдейтера падало с «Cannot read properties of null».
      if (target !== from) {
        drag.current.current = target;
        setFavorites((list) => {
          const next = [...list];
          const [moved] = next.splice(from, 1);
          next.splice(target, 0, moved);
          return next;
        });
      }
    };
    const up = () => {
      drag.current = null;
      setDragIndex(null);
      setDragY(0);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return { rowRefs, dragIndex, dragY, onPointerDown };
}

// Полноэкранный push-экран настройки избранного (Figma node 23774-6737).
// Удаление и порядок применяются сразу к общему состоянию (FavoritesContext),
// поэтому изменения видно на Главной сразу после «Сохранить» — без бэкенда,
// но по-настоящему интерактивно.
export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, setFavorites } = useFavorites();
  const { rowRefs, dragIndex, dragY, onPointerDown } = useReorder(favorites.length, setFavorites);

  const remove = (id) => setFavorites((list) => list.filter((f) => f.id !== id));

  return (
    <div className="favscreen">
      <header className="fav-top">
        <button className="fav-back" onClick={() => navigate(-1)} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="fav-title">Список избранных</h1>
        <span className="fav-back" aria-hidden="true" />
      </header>

      <div className="fav-scroll">
        <div className="fav-list">
          {favorites.map((f, i) => {
            const Icon = FAV_ICONS[f.icon];
            const dragging = dragIndex === i;
            return (
              <div
                className={`favedit-row ${dragging ? 'dragging' : ''}`}
                key={f.id}
                ref={(el) => { rowRefs.current[i] = el; }}
                style={dragging ? { transform: `translateY(${dragY}px)` } : undefined}
              >
                <button className="fav-remove" onClick={() => remove(f.id)} aria-label={`Убрать «${f.value}» из избранного`}>
                  <MinusCircle size={20} weight="fill" />
                </button>
                {Icon && <Icon size={24} weight="duotone" color="var(--color-primary)" />}
                <span className="fav-texts">
                  <span className="fav-name">{f.value}</span>
                  <span className="fav-sub">{f.label}</span>
                </span>
                <span
                  className="fav-handle"
                  onPointerDown={onPointerDown(i)}
                  aria-label="Изменить порядок"
                  role="button"
                >
                  <DotsSixVertical size={20} />
                </span>
              </div>
            );
          })}
          {favorites.length === 0 && (
            <p className="fav-empty">Список избранного пуст — добавьте элементы на Главной.</p>
          )}
        </div>
      </div>

      <div className="fav-save-wrap">
        <button className="fav-save" onClick={() => navigate(-1)}>Сохранить</button>
      </div>
    </div>
  );
}
