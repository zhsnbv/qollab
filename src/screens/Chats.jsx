import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import TopBar from '../components/TopBar';
import {
  MagnifyingGlass, Plus, BellSimple, BookmarkSimple,
  VideoCamera, Camera, FileText, SpeakerSimpleSlash, Checks, PencilSimple,
} from '@phosphor-icons/react';
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
  { avatar: '/img/chats/ayazhan.png', title: 'Аяжан Сериккызы', preview: 'Салем, там задача', time: '13:21', online: true, unreadCount: 2 },
  { avatar: '/img/chats/daniyar.png', title: 'Данияр Кенжебаев', preview: 'Вот зал куда мы ходим', time: '10:51', online: true, contentIcon: VideoCamera, attachKind: 'video' },
  { avatar: '/img/chats/qollab-group.png', title: 'Групповой чат qollab', kind: 'group', sender: 'Айдар С.:', preview: 'Вот скрин приложения с о', time: '10:01', muted: true, contentIcon: Camera, attachKind: 'photo' },
  { avatar: '/img/chats/aray.png', title: 'Арай Абишева', preview: 'Подпиши этот договор', time: '09:01', contentIcon: FileText, attachKind: 'document' },
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
  const male = nameIdx % 2 === 0; // список имён чередуется: чётные — мужские
  const lastNames = male ? lastNamesM : lastNamesF;
  return {
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

  const chats = [...baseChats, ...Array.from({ length: extraCount }, (_, i) => makeChat(i))];

  const openChat = (chat) => {
    if (chat.kind === 'system') return;
    if (chat.to) { navigate(chat.to, { state: { background: location } }); return; }
    // contentIcon/icon — React-компоненты, history.pushState не умеет их клонировать
    const { contentIcon, icon, ...serializable } = chat;
    navigate('/chats/dm', { state: { chat: serializable, background: location } });
  };

  const actions = (
    <>
      {/* Карандаш вместо «трёх точек»: здесь будет редактирование чатов */}
      <button className="topbar-btn" aria-label="Редактировать"><PencilSimple size={20} weight="fill" color="var(--color-weak)" /></button>
      <button className="topbar-btn primary" aria-label="Новый чат"><Plus size={20} color="#fff" /></button>
    </>
  );

  if (loading) {
    return <TabLayout topbar={<TopBar title="Чаты" actions={actions} />}><ChatsSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={<TopBar title="Чаты" actions={actions} />}>
      <FadeIn>
      <div className="chats-search-wrap">
        <div className="chats-search">
          <MagnifyingGlass size={20} color="var(--color-weak)" />
          <span>Поиск</span>
        </div>
      </div>
      <ul className="chat-list">
        {chats.map((chat, i) => (
          <li key={i} className="chat-row" onClick={() => openChat(chat)}>
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
  );
}
