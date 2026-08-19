import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, Plus, Microphone, PaperPlaneRight } from '@phosphor-icons/react';
import { dayLabel } from '../utils/chatDate';
import { useKeyboardInset } from '../utils/useKeyboardInset';
import { ConnectingSkeleton } from '../components/ChatState';
import Message from '../components/Message';
import './ChatRoom.css';

// Участники. В группе имя показываем полным, фамилию — инициалом с точкой.
// avatar — фото; initials — цветной кружок с инициалами (как в макете).
// color — цвет имени автора внутри бабла и полосы цитаты, когда его
// цитируют (закреплён за собеседником, как в дизайне).
const dinara = { profileId: 'dinara', short: 'Динара Т.', avatar: '/img/chats/ayazhan.png', color: '#eb2f96' };
const nurlan = { profileId: 'nurlan', short: 'Нурлан Б.', initials: 'НБ', tint: 'green', color: '#52c41a' };
const arman = { profileId: 'arman', short: 'Арман А.', initials: 'АА', tint: 'blue', color: '#1677ff' };
const madina = { profileId: 'madina', short: 'Мадина К.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', color: '#f5222d' };
const participants = [dinara, nurlan, arman, madina];

// История переписки — проигрывается один раз сразу после скелетона (группа
// уже активна, история уже есть). typing — сколько мс «печатает», gap — пауза
// после сообщения.
const script = [
  { author: dinara, typing: 1100, gap: 500, text: 'О, привет! Как раз тебя тут обсуждали 👋' },
  { author: nurlan, typing: 1400, gap: 400, text: 'Привет всем! Почти на финише. Глянь PR #482, я оставил пару комментов' },
  { author: nurlan, typing: 1000, gap: 400, kind: 'photo', img: '/img/posts/events/e4.jpg', text: 'Скинул фото с демо для стейкхолдеров 👇' },
  { author: nurlan, typing: 800, gap: 600, kind: 'link', text: 'https://figma.com/design/qollab/PR-482' },
  { author: arman, typing: 1300, gap: 500, text: 'Кстати релиз сдвинули на пятницу, успеем прогнать тесты?' },
  {
    author: dinara, typing: 1500, gap: 400,
    quote: { author: nurlan.short, text: 'https://figma.com/design/qollab/PR-482', color: nurlan.color },
    text: 'Хороший тайминг — как раз смотрела на эту таску :)',
  },
  { author: dinara, typing: 1200, gap: 600, kind: 'voice', duration: '0:37' },
  { author: madina, typing: 1400, gap: 500, text: 'Плюсую 👍 Давайте синкнемся в 16:00, скину инвайт' },
  { author: arman, typing: 1500, gap: 400, text: '@Динара Т. добавь встречу в календарь, пожалуйста' },
  { author: nurlan, typing: 900, gap: 0, text: 'Ок, я за 🚀' },
];

// Короткие ответы на сообщения, которые юзер пишет уже после того, как
// история отыграла — тот же интерактив, что и в личных чатах (DMChat).
const replies = [
  'Плюсую 👍', 'Го, давайте синкнемся', 'Я за, скидывайте детали',
  'Норм, но давайте после обеда', 'Ок, беру на себя', 'Принято, гляну',
];

let uid = 0;
const now = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function AuthorAvatar({ author, onOpen }) {
  const inner = author.avatar
    ? <img src={author.avatar} alt="" loading="lazy" />
    : author.initials;
  const cls = author.avatar ? 'msg-avatar' : `msg-avatar msg-avatar--initials tint-${author.tint}`;
  // Тап по аватарке в группе открывает профиль участника
  if (!onOpen || !author.profileId) return <span className={cls}>{inner}</span>;
  return (
    <button className={`${cls} msg-avatar--btn`} onClick={() => onOpen(author.profileId)} aria-label={`Профиль: ${author.short}`}>
      {inner}
    </button>
  );
}

export default function ChatRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  // Профили открываем поверх чата: он остаётся под ними смонтированным
  const openProfile = (id, kind) => navigate('/chat-profile', {
    state: { id, kind, background: location.state?.background },
  });
  const [closing, setClosing] = useState(false);
  const [phase, setPhase] = useState('connecting'); // connecting | chat
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(null);
  const [input, setInput] = useState('');
  const startedRef = useRef(false);
  const scrollRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => setPhase('chat'), 900);
    return () => clearTimeout(t);
  }, []);

  // История отыгрывает сама один раз, как только чат подключился —
  // без ожидания первого сообщения от пользователя.
  useEffect(() => {
    if (phase !== 'chat' || startedRef.current) return;
    startedRef.current = true;
    runScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useKeyboardInset(scrollRef);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, phase]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const close = () => {
    setClosing(true);
    timersRef.current.push(setTimeout(() => navigate('/chats'), 260));
  };

  const runScript = () => {
    let delay = 700;
    script.forEach((step) => {
      timersRef.current.push(setTimeout(() => setTyping(step.author), delay));
      delay += step.typing;
      timersRef.current.push(setTimeout(() => {
        setTyping(null);
        setMessages((m) => [...m, {
          id: ++uid, author: step.author, kind: step.kind || 'text',
          text: step.text, img: step.img, duration: step.duration, quote: step.quote, time: now(),
        }]);
      }, delay));
      delay += step.gap;
    });
  };

  // Групповой чат: прочтение не отслеживаем — статус своих сообщений
  // останавливается на «доставлено» (серые галочки), как просили.
  const send = () => {
    const text = input.trim();
    if (!text) return;
    const id = ++uid;
    setMessages((m) => [...m, { id, mine: true, kind: 'text', text, time: now(), status: 'sent' }]);
    setInput('');
    timersRef.current.push(setTimeout(() => {
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, status: 'delivered' } : msg)));
    }, 600));
    const author = pick(participants);
    const delay = 900 + Math.random() * 700;
    timersRef.current.push(setTimeout(() => setTyping(author), 400));
    timersRef.current.push(setTimeout(() => {
      setTyping(null);
      setMessages((m) => [...m, { id: ++uid, author, kind: 'text', text: pick(replies), time: now() }]);
    }, delay));
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const subtitle = phase === 'connecting'
    ? 'Подключение…'
    : (typing ? `${typing.short} печатает…` : '73 участника');

  // Группировка: имя — на первом сообщении серии одного автора, аватар и
  // «хвостик» бабла — на последнем.
  const items = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameAuthor = (a, b) => (a.mine ? b.mine : !b.mine && a.author?.short === b.author?.short);
    const firstOfGroup = !prev || !sameAuthor(prev, msg);
    const lastOfGroup = !next || !sameAuthor(next, msg);
    return { ...msg, firstOfGroup, lastOfGroup };
  });

  return (
    <div className={`chatroom ${closing ? 'closing' : ''}`}>
      <header className="cr-header">
        <button className="cr-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <button className="cr-headline" onClick={() => openProfile('prodev', 'group')} aria-label="Профиль группы">
          <span className="cr-avatar"><img src="/img/chats/bts-pr.png" alt="" /></span>
          <span className="cr-title-wrap">
            <span className="cr-title">PR01DEV + ROBOTS</span>
            <span className={`cr-subtitle ${phase === 'connecting' || typing ? 'accent' : ''}`}>{subtitle}</span>
          </span>
        </button>
        <button className="cr-walkie" aria-label="Рация"><img src="/img/chats/walkie.svg" alt="" width="20" height="20" /></button>
      </header>

      <div className="cr-body" ref={scrollRef}>
        {phase === 'connecting' && <ConnectingSkeleton />}
        {phase === 'chat' && (
          <div className="cr-messages">
            <div className="cr-day"><span className="cr-day-line" />{dayLabel()}<span className="cr-day-line" /></div>
            {items.map((msg) => (
              <Message
                key={msg.id}
                msg={msg}
                firstOfGroup={msg.firstOfGroup}
                lastOfGroup={msg.lastOfGroup}
                mine={!!msg.mine}
                avatar={!msg.mine ? <AuthorAvatar author={msg.author} onOpen={(id) => openProfile(id, 'user')} /> : null}
                authorLabel={!msg.mine ? msg.author?.short : null}
                authorColor={!msg.mine ? msg.author?.color : null}
              />
            ))}
            {typing && (
              <div className="msg msg--their msg--last">
                <span className="msg-avatar-slot"><AuthorAvatar author={typing} /></span>
                <div className="msg-col">
                  <div className="msg-bubble msg-bubble--typing"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="cr-writebar">
        <button className="cr-write-btn" aria-label="Вложение"><Plus size={24} color="var(--color-text)" /></button>
        <div className="cr-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Сообщение…"
          />
        </div>
        {input.trim() ? (
          <button className="cr-write-btn cr-send" onClick={send} aria-label="Отправить"><PaperPlaneRight size={22} weight="fill" color="#fff" /></button>
        ) : (
          <button className="cr-write-btn" aria-label="Голосовое"><Microphone size={24} color="var(--color-text)" /></button>
        )}
      </div>
    </div>
  );
}
