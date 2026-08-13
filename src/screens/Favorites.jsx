import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, MinusCircle, PlusCircle, DotsSixVertical } from '@phosphor-icons/react';
import { useFavorites } from '../context/FavoritesContext';
import './Favorites.css';

// Драг-реордер указателем: тащим за ручку (DotsSixVertical), список
// переупорядочивается «на лету» — как только палец/курсор проходит середину
// соседней строки. FLIP-анимацию соседей не делаем (не критично для этого
// объёма списка) — едет плавно только сама перетаскиваемая строка.
function useReorder(count, setFavoriteIds) {
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
      // замыкание: апдейтер setFavoriteIds React может вызвать отложенно
      // (после следующего pointermove/up), и к этому моменту drag.current
      // уже обнулён обработчиком up — обращение к нему падало с
      // «Cannot read properties of null».
      if (target !== from) {
        drag.current.current = target;
        setFavoriteIds((list) => {
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

// Настройка избранного (Figma node 24737-3477): сверху «Избранное» с
// удалением и перетаскиванием, ниже — остальной каталог с добавлением.
// Изменения сразу уходят в общее состояние, поэтому Главная обновляется
// без бэкенда, а «Сохранить» просто закрывает экран.
export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, rest, setFavoriteIds } = useFavorites();
  const { rowRefs, dragIndex, dragY, onPointerDown } = useReorder(favorites.length, setFavoriteIds);

  const remove = (id) => setFavoriteIds((list) => list.filter((x) => x !== id));
  const add = (id) => setFavoriteIds((list) => [...list, id]);

  return (
    <div className="favscreen">
      <header className="fav-top">
        <button className="fav-back" onClick={() => navigate(-1)} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="fav-title">Настроить избранное</h1>
        <span className="fav-back" aria-hidden="true" />
      </header>

      <div className="fav-scroll">
        <h2 className="fav-section">Избранное</h2>
        <div className="fav-list">
          {favorites.map((s, i) => {
            const dragging = dragIndex === i;
            return (
              <div
                className={`favedit-row ${dragging ? 'dragging' : ''}`}
                key={s.id}
                ref={(el) => { rowRefs.current[i] = el; }}
                style={dragging ? { transform: `translateY(${dragY}px)` } : undefined}
              >
                <button className="fav-remove" onClick={() => remove(s.id)} aria-label={`Убрать «${s.name}» из избранного`}>
                  <MinusCircle size={20} weight="fill" />
                </button>
                <img className="fav-ico" src={s.img} alt="" />
                <span className="fav-name">{s.name}</span>
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
            <p className="fav-empty">Список избранного пуст — добавьте сервисы ниже.</p>
          )}
        </div>

        <h2 className="fav-section">Все сервисы</h2>
        <div className="fav-list">
          {rest.map((s) => (
            <div className="favedit-row" key={s.id}>
              <button className="fav-add" onClick={() => add(s.id)} aria-label={`Добавить «${s.name}» в избранное`}>
                <PlusCircle size={20} weight="fill" />
              </button>
              <img className="fav-ico" src={s.img} alt="" />
              <span className="fav-name">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fav-save-wrap">
        <button className="fav-save" onClick={() => navigate(-1)}>Сохранить</button>
      </div>
    </div>
  );
}
