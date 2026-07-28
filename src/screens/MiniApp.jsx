import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CaretLeft, CaretRight,
  UserFocus, Files, Headset, Camera, GearSix, ForkKnife, Receipt,
  ClipboardText, LockKeyOpen, NotePencil, ArrowsClockwise, UsersThree,
  BookOpenText, VideoCamera, Signature, PaperPlaneTilt, Tray, FolderOpen,
  CheckCircle, SealCheck, Star, FilePlus, IdentificationCard,
  ClockCounterClockwise, Briefcase, ArrowUUpLeft,
} from '@phosphor-icons/react';
import { DotsIcon } from '../components/TopBar';
import { miniApps } from '../data/miniapps';
import './MiniApp.css';

// Иконки строк держим словарём: в данных лежит только имя, чтобы дерево
// навигации оставалось чистыми данными и его можно было отдать с бэка.
const ICONS = {
  UserFocus, Files, Headset, Camera, GearSix, ForkKnife, Receipt,
  ClipboardText, LockKeyOpen, NotePencil, ArrowsClockwise, UsersThree,
  BookOpenText, VideoCamera, Signature, PaperPlaneTilt, Tray, FolderOpen,
  CheckCircle, SealCheck, Star, FilePlus, IdentificationCard,
  ClockCounterClockwise, Briefcase, ArrowUUpLeft,
};

// Идём по дереву: первый сегмент — сам мини-апп, дальше id пунктов.
// Возвращаем найденный экран и всю цепочку — по ней строится «назад».
function resolve(segments) {
  const [appId, ...rest] = segments;
  const root = miniApps[appId];
  if (!root) return null;

  let screen = root;
  for (const id of rest) {
    const item = screen.items?.find((i) => i.id === id);
    if (!item?.screen) return null;
    screen = item.screen;
  }
  return screen;
}

function Row({ item, onOpen }) {
  const Icon = item.icon ? ICONS[item.icon] : null;
  const leaf = !item.screen; // конечный пункт — ведёт «в никуда», как в живом приложении
  return (
    <button
      className={`ma-row ${item.disabled ? 'disabled' : ''}`}
      onClick={() => !item.disabled && item.screen && onOpen(item.id)}
      disabled={item.disabled}
      aria-disabled={item.disabled || undefined}
    >
      {/* «Без иконки» — отдельный вариант шаблона: заголовок уезжает влево,
          места под иконку не резервируем. */}
      {Icon && (
        <span className="ma-row-ico">
          <Icon size={24} weight="regular" />
        </span>
      )}
      <span className="ma-row-texts">
        <span className="ma-row-title">{item.title}</span>
        {item.sub && <span className="ma-row-sub">{item.sub}</span>}
      </span>
      <CaretRight size={16} color="var(--color-light)" className={leaf ? 'ma-caret-leaf' : undefined} />
    </button>
  );
}

// Экран мини-аппа с многоуровневой навигацией (Figma node 24014-12302).
// Уровень зашит в URL (/app/mytasks/it/closed), поэтому системное «назад»
// и свайп работают сами: каждый переход вглубь — обычный push в историю.
export default function MiniApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const path = (params['*'] || '').split('/').filter(Boolean);
  const screen = resolve(path);

  const [closing, setClosing] = useState(false);
  // Избранное держим по ключу экрана, а не одним флагом: компонент при
  // переходе на другой уровень не пересоздаётся, и общий флаг «протекал» —
  // включённый на одном экране тумблер выглядел включённым и на соседнем.
  const [favs, setFavs] = useState({});
  const favKey = path.join('/');
  const depth = path.length;
  const prevDepth = useRef(depth);
  // Направление перехода: вглубь — новый уровень приезжает справа, назад —
  // слева. Считаем по изменению глубины пути.
  const [dir, setDir] = useState('fwd');

  useEffect(() => {
    setDir(depth >= prevDepth.current ? 'fwd' : 'back');
    prevDepth.current = depth;
  }, [depth]);

  // Закрываем весь мини-апп: с любого уровня возвращаемся на экран, с
  // которого его открыли (Главная), а не отматываем стек по одному шагу.
  const closeApp = () => {
    setClosing(true);
    setTimeout(() => navigate(-depth), 280);
  };

  const back = () => (depth > 1 ? navigate(-1) : closeApp());
  const open = (id) => navigate(`/app/${[...path, id].join('/')}`, { state: location.state });

  if (!screen) {
    return (
      <div className="miniapp">
        <header className="ma-top">
          <button className="ma-back" onClick={closeApp} aria-label="Назад"><CaretLeft size={24} /></button>
          <h1 className="ma-title">Не найдено</h1>
          <span className="ma-menu-space" />
        </header>
        <div className="ma-scroll"><p className="ma-empty">Такого раздела нет.</p></div>
      </div>
    );
  }

  return (
    <div className={`miniapp ${closing ? 'closing' : ''}`}>
      <header className="ma-top">
        <button className="ma-back" onClick={back} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="ma-title">{screen.title}</h1>
        <button className="ma-menu" aria-label="Меню"><DotsIcon /></button>
      </header>

      <div className="ma-scroll" key={path.join('/')} data-dir={dir}>
        {screen.type === 'list' && (
          <div className="ma-list">
            {screen.items.map((item) => <Row key={item.id} item={item} onOpen={open} />)}
          </div>
        )}

        {screen.type === 'records' && (
          <div className="ma-list">
            {screen.records.map((r, i) => (
              <button className="ma-row" key={i}>
                <span className="ma-row-texts">
                  <span className="ma-row-title">{r.title}</span>
                  <span className="ma-row-sub">{r.meta}</span>
                </span>
                <CaretRight size={16} color="var(--color-light)" />
              </button>
            ))}
          </div>
        )}

        {/* Запас снизу нужен только когда под скроллом ничего нет: панель
            «Добавить в избранное» сама отодвинута от таб-бара, и второй такой
            же отступ просто не давал долистать последний блок. */}
        <div className={`ma-bottom-spacer ${screen.favorite ? 'compact' : ''}`} />
      </div>

      {screen.favorite && (
        <label className="ma-fav">
          <span>Добавить в избранное</span>
          <input
            type="checkbox"
            checked={!!favs[favKey]}
            onChange={(e) => setFavs((f) => ({ ...f, [favKey]: e.target.checked }))}
          />
          <span className="ma-switch" />
        </label>
      )}
    </div>
  );
}
