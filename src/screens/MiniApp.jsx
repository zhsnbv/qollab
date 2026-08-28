import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CaretLeft, CaretRight, X, SquaresFour,
  UserFocus, Files, Headset, Camera, GearSix, ForkKnife, Receipt,
  ClipboardText, LockKeyOpen, NotePencil, ArrowsClockwise, UsersThree,
  BookOpenText, VideoCamera, Signature, PaperPlaneTilt, Tray, FolderOpen,
  CheckCircle, SealCheck, Star, FilePlus, IdentificationCard,
  ClockCounterClockwise, Briefcase, ArrowUUpLeft,
} from '@phosphor-icons/react';
import { DotsIcon } from '../components/TopBar';
import { miniApps } from '../data/miniapps';
import { servicesById } from '../context/FavoritesContext';
import { useSkeleton } from '../components/Skeleton';
import ActionSheet from '../components/ActionSheet';
import Switch from '../components/Switch';
import Toast from '../components/Toast';
import {
  ArrowSync24Regular, Share24Regular, PhoneAdd24Regular,
  Broom24Regular, Settings24Regular, DismissCircle24Regular,
} from '@fluentui/react-icons';
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

// Скелетон тела — общий для всех аппов, идёт вторым шагом после сплеша.
function MiniAppSkeleton() {
  return (
    <div className="ma-sk">
      <div className="ma-sk-search sk" />
      <div className="ma-sk-banner sk" />
      <div className="ma-sk-tiles">
        <span className="sk" /><span className="sk" /><span className="sk" />
      </div>
      <div className="ma-sk-title sk" />
      <div className="ma-sk-cards">
        <span className="sk" /><span className="sk" />
      </div>
    </div>
  );
}

// Запуск мини-аппа: свой сплеш с иконкой сервиса, по которому тапнули,
// и его названием — как у нативного приложения.
function MiniAppSplash({ name, img }) {
  return (
    <div className="ma-splash">
      {img
        ? <img className="ma-splash-ico" src={img} alt="" />
        : <span className="ma-splash-ico ma-splash-ico--fallback"><SquaresFour size={40} weight="fill" /></span>}
      <span className="ma-splash-name">{name}</span>
    </div>
  );
}

// Экраны есть пока только у «Моих задач». Для остальных сервисов показываем
// заглушку — так вся сетка сервисов кликается и прототип не упирается в
// «ничего не происходит».
function MiniAppStub({ name }) {
  return (
    <div className="ma-stub">
      <span className="ma-stub-ico"><SquaresFour size={32} weight="fill" /></span>
      <h2 className="ma-stub-title">{name}</h2>
      <p className="ma-stub-text">
        Мини-приложение откроется здесь. Раздел ещё готовится — в прототипе
        показываем только вход в него.
      </p>
    </div>
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
  // Запуск идёт тремя шагами: сплеш приложения → скелетон тела → контент.
  // useSkeleton держит только первый шаг, дальше ведём свой таймер.
  const splash = useSkeleton(1200);
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    if (splash) return undefined;
    const t = setTimeout(() => setBooting(false), 1100);
    return () => clearTimeout(t);
  }, [splash]);
  const loading = splash || booting;
  // Имя в шапке: у аппов со своим деревом — заголовок экрана, у остальных
  // берём название сервиса из каталога.
  const appId = path[0];
  const service = servicesById[appId];
  const appName = miniApps[appId]?.title || service?.name || 'Мини-приложение';

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

  // Контекстное меню мини-аппа: к общим пунктам добавлены выход и установка
  // на домашний экран — они есть только здесь.
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const MENU_ITEMS = [
    { id: 'exit', label: 'Выйти из мини-приложения', Icon: DismissCircle24Regular, danger: true },
    { id: 'refresh', label: 'Обновить страницу', Icon: ArrowSync24Regular },
    { id: 'share', label: 'Поделиться ссылкой', Icon: Share24Regular },
    { id: 'home', label: 'Добавить на главный экран', Icon: PhoneAdd24Regular },
    { id: 'cache', label: 'Очистить кэш мини-приложения', Icon: Broom24Regular },
    { id: 'settings', label: 'Настройки', Icon: Settings24Regular },
  ];

  const onMenuPick = (id) => {
    setMenuOpen(false);
    if (id === 'exit') closeApp();
    if (id === 'refresh') setToast('Страница обновлена');
    if (id === 'share') setToast('Ссылка скопирована');
    if (id === 'home') setToast(`${appName} добавлено на главный экран`);
    if (id === 'cache') setToast('Кэш мини-приложения очищен');
    if (id === 'settings') navigate('/settings', { state: { background: location } });
  };
  const open = (id) => navigate(`/app/${[...path, id].join('/')}`, { state: location.state });


  // Шапка по макету (25099-85021): слева крестик — закрыть мини-апп целиком,
  // на вложенных уровнях он превращается в «назад»; по центру имя приложения
  // с подписью, справа «…».
  const nested = depth > 1;
  const title = nested ? screen?.title || appName : appName;

  return (
    <div className={`miniapp ${closing ? 'closing' : ''}`}>
      <header className="ma-top">
        <button className="ma-back" onClick={back} aria-label={nested ? 'Назад' : 'Закрыть'}>
          {nested ? <CaretLeft size={24} /> : <X size={22} />}
        </button>
        <span className="ma-titles">
          <span className="ma-title">{title}</span>
          {!nested && <span className="ma-subtitle">Мини-приложение</span>}
        </span>
        <button className="ma-menu" aria-label="Меню" onClick={() => setMenuOpen(true)}><DotsIcon /></button>
      </header>

      <div className="ma-scroll" key={path.join('/')} data-dir={dir}>
        {splash && <MiniAppSplash name={appName} img={service?.img} />}
        {!splash && booting && <div className="ma-fade"><MiniAppSkeleton /></div>}
        {!loading && !screen && <div className="ma-fade"><MiniAppStub name={appName} /></div>}

        {!loading && screen?.type === 'list' && (
          <div className="ma-list">
            {screen.items.map((item) => <Row key={item.id} item={item} onOpen={open} />)}
          </div>
        )}

        {!loading && screen?.type === 'records' && (
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
        <div className={`ma-bottom-spacer ${screen?.favorite ? 'compact' : ''}`} />
      </div>

      {!loading && screen?.favorite && (
        <label className="ma-fav">
          <span>Добавить в избранное</span>
          <Switch
            checked={!!favs[favKey]}
            onChange={(on) => setFavs((f) => ({ ...f, [favKey]: on }))}
            label="Добавить в избранное"
          />
        </label>
      )}

      {menuOpen && (
        <ActionSheet items={MENU_ITEMS} onClose={() => setMenuOpen(false)} onPick={onMenuPick} />
      )}
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
