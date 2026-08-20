import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft, MinusCircle, PlusCircle, DotsSixVertical, Info } from '@phosphor-icons/react';
import { useFavorites, servicesById, allServices } from '../context/FavoritesContext';
import './Favorites.css';
import { useScrolled } from '../utils/useScrolled';

// Ровно столько плиток помещается в сетку «Моих сервисов» на Главной
// (два ряда по четыре, восьмая — «Все сервисы»), поэтому набор фиксирован:
// сохранить можно только полный комплект.
const LIMIT = 7;

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

// Настройка избранного (Figma node 24860-3477): сверху «Избранное» с
// удалением и перетаскиванием, ниже — остальной каталог с добавлением.
// Правки копятся в черновике и уходят на Главную только по «Сохранить» —
// иначе кнопка ничего не значила бы, а на экране можно побывать в неполном
// наборе (например, убрать всё и уйти назад).
export default function Favorites() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const { favoriteIds, setFavoriteIds } = useFavorites();
  const [draft, setDraft] = useState(favoriteIds);

  const favorites = useMemo(() => draft.map((id) => servicesById[id]).filter(Boolean), [draft]);
  const rest = useMemo(() => allServices.filter((s) => !draft.includes(s.id)), [draft]);
  const { rowRefs, dragIndex, dragY, onPointerDown } = useReorder(favorites.length, setDraft);

  const remove = (id) => setDraft((list) => list.filter((x) => x !== id));
  const add = (id) => setDraft((list) => (list.length >= LIMIT ? list : [...list, id]));
  const full = draft.length >= LIMIT;
  const canSave = draft.length === LIMIT;

  const save = () => {
    setFavoriteIds(draft);
    navigate(-1);
  };

  return (
    <div className="favscreen">
      <header className={`fav-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="fav-back" onClick={() => navigate(-1)} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="fav-title">Избранные сервисы</h1>
        <span className="fav-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="fav-hint">
        <Info size={16} weight="fill" />
        Выберите {LIMIT} сервисов, чтобы сохранить изменения
      </div>

      <div className="fav-scroll" onScroll={onScroll}>
        <div className="fav-section-row">
          <h2 className="fav-section">Избранное</h2>
          <span className="fav-count">{draft.length} из {LIMIT}</span>
        </div>
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
            <p className="fav-empty">Выберите необходимые сервисы из списка ниже</p>
          )}
        </div>

        <h2 className="fav-section">Все сервисы</h2>
        <div className="fav-list">
          {rest.map((s) => (
            <div className={`favedit-row ${full ? 'muted' : ''}`} key={s.id}>
              <button
                className="fav-add"
                onClick={() => add(s.id)}
                disabled={full}
                aria-label={`Добавить «${s.name}» в избранное`}
              >
                <PlusCircle size={20} weight="fill" />
              </button>
              <img className="fav-ico" src={s.img} alt="" />
              <span className="fav-name">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fav-save-wrap">
        <button className="fav-save" onClick={save} disabled={!canSave}>Сохранить</button>
      </div>
    </div>
  );
}
