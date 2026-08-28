import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import TopBar from '../components/TopBar';
import {
  MagnifyingGlass, Plus, BellSimple, BookmarkSimple,
  VideoCamera, Camera, FileText, SpeakerSimpleSlash, Checks, PencilSimple, Check,
} from '@phosphor-icons/react';
import { Checkmark20Filled } from '@fluentui/react-icons';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { useSkeleton, ChatsSkeleton, FadeIn } from '../components/Skeleton';
import ErgizAvatar from '../components/ErgizAvatar';
import './Chats.css';

// Первый экран — данные из Figma-макета Chats (Type=Chats), аватары в public/img/chats.
const baseChats = [
  // Уведомления переехали в иконку-колокольчик на Главной — в списке чатов
  // их дублировать не нужно. Оставлено закомментированным на случай отката.
  // { kind: 'system', icon: BellSimple, title: 'Уведомления', preview: 'Новый вход в qollab: Устройство: iPhone', time: '09:12' },
  { kind: 'system', icon: BookmarkSimple, title: 'Избранное', preview: 'Мои задачи на неделю:', time: '12:02' },
  { kind: 'bot', avatar: '/img/chats/ergiz-avatar.png', title: 'ERGiz – Искусственный интеллект', preview: 'Привет! хочу задать вам пару коротких вопросов', time: '13:44' },
  { avatar: '/img/chats/bts-pr.png', title: 'PR01DEV + ROBOTS', to: '/chats/prodev', sender: 'Арман А.:', preview: 'не узнал', time: '11:34', muted: true },
  { profileId: 'ayazhan', avatar: '/img/chats/ayazhan.png', title: 'Аяжан Сериккызы', preview: 'Салем, там задача', time: '13:21', online: true, unreadCount: 2 },
  { avatar: '/img/chats/daniyar.png', title: 'Данияр Кенжебаев', preview: 'Вот зал куда мы ходим', time: '10:51', online: true, contentIcon: VideoCamera, attachKind: 'video' },
  { avatar: '/img/chats/qollab-group.png', title: 'Групповой чат qollab', kind: 'group', sender: 'Айдар С.:', preview: 'Вот скрин приложения с о', time: '10:01', muted: true, contentIcon: Camera, attachKind: 'photo' },
  { avatar: '/img/chats/aray.png', title: 'Ерлан Абишев', preview: 'Подпиши этот договор', time: '09:01', contentIcon: FileText, attachKind: 'document' },
];

// Дальше — бесконечная мок-лента: уникальные фото-аватарки (randomuser.me,
// пол совпадает с именем), полные имена-фамилии и сообщения.
const firstNames = ['Нурлан', 'Салтанат', 'Ербол', 'Мадина', 'Азамат', 'Гульнара', 'Тимур', 'Айгерим', 'Бекзат', 'Динара', 'Серик', 'Жанар', 'Куаныш', 'Асель', 'Марат', 'Лейла', 'Даурен', 'Камила', 'Олжас', 'Диана'];
const lastNamesM = ['Ибраев', 'Бейсенов', 'Шарипов', 'Ахметов', 'Мукашев', 'Танирбергенов', 'Байтенов', 'Ержанов', 'Умбетов', 'Сапаров'];
const lastNamesF = ['Жумагулова', 'Касымова', 'Оспанова', 'Садыкова', 'Ералиева', 'Абишева', 'Нургалиева', 'Сулейменова', 'Токтарова', 'Бекова'];
const messages = [
  'Отчёт по смене готов, глянь когда будет время',
  'Созвон в 15:00 по проекту МТОРО',
  'Спасибо большое! Всё получилось',
  'Фото с объекта скинул в группу',
  'Заявка согласована, можно запускать',
  'Добрый день! Подскажите по расчетному листку',
  'Документы подписаны, отправил обратно',
  'Завтра планерка в 9:00, не забудь',
  'Посмотри пожалуйста презентацию до вечера',
  'Коллеги передали, что смена переносится',
  'Готов протокол по вчерашней встрече',
  'Хорошие новости по бюджету на квартал',
];
const times = ['вчера', 'вчера', 'пн', 'пн', 'вс', 'сб', 'пт', '02.07', '30.06', '28.06'];

function makeChat(i) {
  const nameIdx = i % firstNames.length;
  const id = `gen-${i}`;
  const male = nameIdx % 2 === 0; // список имён чередуется: чётные — мужские
  const lastNames = male ? lastNamesM : lastNamesF;
  return {
    id,
    avatar: `https://randomuser.me/api/portraits/${male ? 'men' : 'women'}/${(i * 7) % 99}.jpg`,
    title: `${firstNames[nameIdx]} ${lastNames[(i * 3 + 1) % lastNames.length]}`,
    preview: messages[i % messages.length],
    time: times[Math.min(Math.floor(i / 2), times.length - 1)],
    online: i % 5 === 0,
    muted: i % 7 === 3,
    contentIcon: i % 6 === 2 ? Camera : i % 6 === 4 ? FileText : undefined,
    attachKind: i % 6 === 2 ? 'photo' : i % 6 === 4 ? 'document' : undefined,
    // Пара примеров прочтения моего последнего сообщения (галочки слева от
    // превью) и пара примеров непрочитанных входящих (бейдж справа) — не
    // на каждом чате, только для демонстрации обоих состояний.
    lastMine: i === 0 || i === 3,
    lastStatus: i === 0 ? 'read' : i === 3 ? 'delivered' : undefined,
    unreadCount: i === 1 ? 3 : i === 6 ? 1 : undefined,
  };
}

const BATCH = 10;

function Avatar({ chat }) {
  if (chat.kind === 'system') {
    const Icon = chat.icon;
    return (
      <div className="chat-avatar chat-avatar--system">
        <Icon size={28} weight="fill" color="#fff" />
      </div>
    );
  }
  if (chat.kind === 'bot') {
    return <div className="chat-avatar chat-avatar--bot"><ErgizAvatar size={56} /></div>;
  }
  return (
    <div className="chat-avatar">
      <img src={chat.avatar} alt="" loading="lazy" />
      {chat.online && <span className="chat-avatar-online" />}
    </div>
  );
}

export default function Chats() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const location = useLocation();
  const [extraCount, setExtraCount] = useState(BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const pendingRef = useRef(false);
  const sentinelRef = useRef(null);
  // Режим выбора: карандаш в шапке превращает список в набор чекбоксов.
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState([]);
  // Удалённое и прочитанное в прототипе некуда сохранять — держим на экране.
  const [removed, setRemoved] = useState([]);
  const [read, setRead] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');

  // Таб-бар живёт в App, поэтому убираем его классом на <html>: пробрасывать
  // ради этого состояние наверх пришлось бы через все вкладки.
  useEffect(() => {
    if (!selecting) return undefined;
    document.documentElement.classList.add('selecting');
    return () => document.documentElement.classList.remove('selecting');
  }, [selecting]);

  // Список id текущего экрана — нужен «Прочитать все», когда ничего не выбрано
  const chatIdsRef = useRef([]);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const exitSelect = () => { setSelecting(false); setPicked([]); };
  const markRead = () => {
    const ids = picked.length ? picked : null;
    setRead((r) => [...new Set([...r, ...(ids || chatIdsRef.current)])]);
    setToast(ids ? 'Отмечено прочитанным' : 'Все чаты прочитаны');
    exitSelect();
  };
  const removePicked = () => {
    setRemoved((r) => [...r, ...picked]);
    setConfirm(false);
    setToast(picked.length === 1 ? 'Чат удалён' : `Удалено чатов: ${picked.length}`);
    exitSelect();
  };

  useEffect(() => {
    if (loading) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || pendingRef.current) return;
      // короткая мок-«подгрузка» со спиннером
      pendingRef.current = true;
      setLoadingMore(true);
      setTimeout(() => {
        setExtraCount((c) => c + BATCH);
        setLoadingMore(false);
        pendingRef.current = false;
      }, 600);
    }, { rootMargin: '150px' });
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [loading]);

  const chats = [...baseChats, ...Array.from({ length: extraCount }, (_, i) => makeChat(i))]
    .map((c, i) => ({ ...c, id: c.id || `base-${i}` }))
    .filter((c) => !removed.includes(c.id))
    .map((c) => (read.includes(c.id) ? { ...c, unreadCount: undefined } : c));
  chatIdsRef.current = chats.map((c) => c.id);

  const openChat = (chat) => {
    if (selecting) { toggle(chat.id); return; }
    if (chat.kind === 'system') return;
    if (chat.to) { navigate(chat.to, { state: { background: location } }); return; }
    // contentIcon/icon — React-компоненты, history.pushState не умеет их клонировать
    const { contentIcon, icon, ...serializable } = chat;
    navigate('/chats/dm', { state: { chat: serializable, background: location } });
  };

  // В режиме выбора шапка пустеет: остаётся одна кнопка на месте «плюса» —
  // выйти. Карандаш и создание чата там сейчас ни к чему.
  const actions = selecting ? (
    <button className="topbar-btn primary" aria-label="Готово" onClick={exitSelect}>
      <Check size={20} weight="bold" color="#fff" />
    </button>
  ) : (
    <>
      <button
        className="topbar-btn"
        aria-label="Выбрать чаты"
        onClick={() => setSelecting(true)}
      >
        <PencilSimple size={20} weight="fill" color="var(--color-weak)" />
      </button>
      <button
        className="topbar-btn primary"
        aria-label="Новый чат"
        onClick={() => navigate('/new-chat', { state: { background: location } })}
      >
        <Plus size={20} color="#fff" />
      </button>
    </>
  );

  const title = selecting ? `Выбрано: ${picked.length}` : 'Чаты';

  if (loading) {
    return <TabLayout topbar={<TopBar title="Чаты" actions={actions} />}><ChatsSkeleton /></TabLayout>;
  }

  return (
    <>
    <TabLayout topbar={<TopBar title={title} actions={actions} />}>
      <FadeIn>
      <div className="chats-search-wrap">
        <div
          className="chats-search"
          role="button"
          onClick={() => navigate('/chat-search', { state: { background: location } })}
        >
          <MagnifyingGlass size={20} color="var(--color-weak)" />
          <span>Поиск</span>
        </div>
      </div>
      <ul className="chat-list">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`chat-row ${selecting ? 'selecting' : ''} ${picked.includes(chat.id) ? 'picked' : ''}`}
            onClick={() => openChat(chat)}
          >
            {selecting && (
              <span className="chat-check" aria-hidden>
                <Checkmark20Filled />
              </span>
            )}
            <Avatar chat={chat} />
            <div className="chat-body">
              <div className="chat-line1">
                <span className="chat-title">{chat.title}</span>
                {chat.muted && <SpeakerSimpleSlash size={14} weight="fill" color="var(--color-weak)" />}
                <span className="chat-time">{chat.time}</span>
              </div>
              <div className="chat-line2">
                <span className="chat-preview">
                  {chat.lastMine && (
                    chat.lastStatus === 'read'
                      ? <Checks size={16} color="var(--color-primary)" className="chat-receipt" />
                      : <Checks size={16} color="var(--color-weak)" className="chat-receipt" />
                  )}
                  {chat.sender && <b className="chat-sender">{chat.sender} </b>}
                  {chat.contentIcon && <chat.contentIcon size={14} weight="fill" color="var(--color-weak)" style={{ verticalAlign: 'middle', marginRight: 2 }} />}
                  {chat.preview}
                </span>
                {chat.unreadCount ? <span className="chat-badge">{chat.unreadCount}</span> : null}
              </div>
            </div>
          </li>
        ))}
        <li ref={sentinelRef} className="chat-sentinel" aria-hidden />
        {loadingMore && <li className="spinner-row"><span className="spinner" /></li>}
      </ul>
      </FadeIn>
    </TabLayout>

    {/* Панель действий встаёт на место таб-бара — он скрыт классом .selecting */}
    {selecting && (
      <div className="chats-actionbar">
        <button className="chats-act" onClick={markRead}>
          {picked.length ? 'Прочитать' : 'Прочитать все'}
        </button>
        <button
          className="chats-act chats-act--danger"
          disabled={!picked.length}
          onClick={() => setConfirm(true)}
        >
          Удалить
        </button>
      </div>
    )}
    {confirm && (
      <ConfirmDialog
        title={picked.length === 1 ? 'Удалить чат?' : `Удалить чаты: ${picked.length}?`}
        text="Переписка пропадёт с этого устройства. У собеседников она останется."
        confirmLabel="Удалить"
        danger
        onConfirm={removePicked}
        onCancel={() => setConfirm(false)}
      />
    )}
    <Toast text={toast} onDone={() => setToast('')} />
    </>
  );
}
