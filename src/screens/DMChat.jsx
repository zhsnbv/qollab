import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, Plus, Microphone, PaperPlaneRight, Phone } from '@phosphor-icons/react';
import { dayLabel } from '../utils/chatDate';
import { useKeyboardInset } from '../utils/useKeyboardInset';
import { ConnectingSkeleton, EmptyState } from '../components/ChatState';
import ErgizAvatar from '../components/ErgizAvatar';
import Message from '../components/Message';
import './ChatRoom.css';

// Генерик-чат «один на один» (и групповой/бот) — история уже есть, на любое
// сообщение пользователя приходит ровно один ответ (без сценария как в ProDev).
const dmReplies = [
  'Окей, принято 👍', 'Хорошо, спасибо!', 'Понял, гляну и отпишусь',
  'Договорились!', 'Супер, спасибо за инфо', 'Ага, звучит хорошо',
  'Принял в работу, скоро отвечу подробнее',
];
const groupReplies = [
  'Плюсую 👍', 'Го, давайте синкнемся', 'Я за, скидывайте детали',
  'Норм, но давайте после обеда', 'Ок, беру на себя',
];
const groupNames = ['Айдар С.', 'Сауле Р.', 'Дамир К.'];
const botReplies = [
  'Секунду, уточняю информацию…',
  'Готово! Я отправил детали в ваш профиль.',
  'По регламенту компании это оформляется через сервис «Кадровые справки».',
  'Хороший вопрос — передал его специалисту, он свяжется с вами.',
  'Спасибо за обращение! Есть ещё вопросы?',
];

// Палитра имён для групповых чатов — цвет закрепляется за автором по хэшу
// его имени (стабильно между рендерами), как цвета участников в ProDev.
const NAME_COLORS = ['#52c41a', '#1677ff', '#eb2f96', '#f5222d', '#722ed1', '#13a8a8'];

const now = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Вложение последнего сообщения — по attachKind из списка чатов (Chats.jsx),
// чтобы фото/видео/документ, показанные превью-иконкой в списке, были видны
// и внутри самого чата.
function attachmentFor(chat) {
  if (chat.attachKind === 'video') return { kind: 'video', img: '/img/posts/events/e6.jpg' };
  if (chat.attachKind === 'photo') return { kind: 'photo', img: '/img/posts/events/e4.jpg' };
  if (chat.attachKind === 'document') return { kind: 'document', name: 'Договор.pdf', size: '482 КБ' };
  return null;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function colorForName(name) {
  return NAME_COLORS[hashStr(name || '') % NAME_COLORS.length];
}

// У части коллег переписки ещё нет — решаем детерминированно по имени чата
// (стабильно между открытиями), чтобы плашка «Нет сообщений» встречалась
// случайно среди личных чатов, но не у бота/группы и не там, где уже есть
// вложение в превью списка чатов.
function isEmptyChat(chat) {
  if (chat.kind || chat.attachKind) return false;
  return hashStr(chat.title || '') % 4 === 0;
}

function buildHistory(chat) {
  if (!chat) return [];
  const attach = attachmentFor(chat);
  if (chat.kind === 'bot') {
    return [
      { id: 1, mine: false, author: 'ERGiz', text: 'Привет! Я ERGiz — ваш AI-помощник qollab 🤖 Чем могу помочь?', time: '13:40' },
      { id: 2, mine: false, author: 'ERGiz', text: chat.preview, time: chat.time, ...attach },
    ];
  }
  if (chat.kind === 'group') {
    return [
      { id: 1, mine: false, author: 'Сауле Р.', text: 'Кто-нибудь видел новый регламент по командировкам?', time: '09:40' },
      { id: 2, mine: false, author: (chat.sender || '').replace(':', '') || 'Айдар С.', text: chat.preview, time: chat.time, ...attach },
    ];
  }
  return [
    { id: 1, mine: false, author: chat.title, text: 'Привет! Как продвигается?', time: chat.time },
    { id: 2, mine: false, author: chat.title, text: chat.preview, time: chat.time, ...attach },
  ];
}

function replyFor(chat) {
  if (chat.kind === 'bot') return { author: 'ERGiz', text: pick(botReplies) };
  if (chat.kind === 'group') return { author: pick(groupNames), text: pick(groupReplies) };
  return { author: chat.title, text: pick(dmReplies) };
}

function subtitleFor(chat) {
  if (chat.kind === 'bot') return 'AI-помощник qollab';
  if (chat.kind === 'group') return 'Групповой чат';
  return chat.online ? 'в сети' : 'был(а) недавно';
}

// ERGiz — рамка+звезда вёрсткой (ErgizAvatar), у остальных — обычное фото.
function ChatAvatarImg({ chat, size }) {
  if (chat.kind === 'bot') return <ErgizAvatar size={size} />;
  return <img src={chat.avatar} alt="" loading="lazy" />;
}

function AuthorAvatar({ chat, author }) {
  if (chat.kind === 'group') {
    return (
      <span className="msg-avatar msg-avatar--initials tint-green">
        {author.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <span className={`msg-avatar ${chat.kind === 'bot' ? 'msg-avatar--bot' : ''}`}>
      <ChatAvatarImg chat={chat} size={40} />
    </span>
  );
}

export default function DMChat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const chat = state?.chat;
  const [closing, setClosing] = useState(false);
  const [phase, setPhase] = useState('connecting'); // connecting | empty | chat
  const [messages, setMessages] = useState(() => (chat && !isEmptyChat(chat) ? buildHistory(chat) : []));
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const timersRef = useRef([]);
  const uidRef = useRef(1000);

  useEffect(() => {
    if (!chat) navigate('/chats', { replace: true });
  }, [chat, navigate]);

  useEffect(() => {
    if (!chat) return;
    const t = setTimeout(() => setPhase(isEmptyChat(chat) ? 'empty' : 'chat'), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, phase]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  useKeyboardInset(scrollRef);

  if (!chat) return null;

  const close = () => {
    setClosing(true);
    timersRef.current.push(setTimeout(() => navigate('/chats'), 260));
  };

  // Прочтение отслеживаем только в личных чатах и с ботом — как только
  // приходит ответ, все свои сообщения отмечаются прочитанными (оранжевые
  // галочки). В групповых — стоп на «доставлено» (серые), как просили.
  const send = () => {
    const text = input.trim();
    if (!text) return;
    const id = ++uidRef.current;
    setMessages((m) => [...m, { id, mine: true, text, time: now(), status: 'sent' }]);
    setInput('');
    setPhase('chat');
    timersRef.current.push(setTimeout(() => {
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, status: 'delivered' } : msg)));
    }, 600));
    const delay = 900 + Math.random() * 700;
    timersRef.current.push(setTimeout(() => setTyping(true), 400));
    timersRef.current.push(setTimeout(() => {
      setTyping(false);
      const r = replyFor(chat);
      setMessages((m) => {
        const withRead = chat.kind === 'group' ? m : m.map((msg) => (msg.mine ? { ...msg, status: 'read' } : msg));
        return [...withRead, { id: ++uidRef.current, mine: false, author: r.author, text: r.text, time: now() }];
      });
    }, delay));
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  // Группировка: имя — на первом сообщении серии одного автора, аватар и
  // «хвостик» бабла — на последнем. Имя показываем только в групповых чатах
  // (в личных — один собеседник, подписывать его в каждом сообщении незачем).
  const items = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const sameAuthor = (a, b) => a.mine === b.mine && a.author === b.author;
    const firstOfGroup = !prev || !sameAuthor(prev, msg);
    const lastOfGroup = !next || !sameAuthor(next, msg);
    return { ...msg, firstOfGroup, lastOfGroup };
  });

  const subtitle = phase === 'connecting' ? 'Подключение…' : (typing ? 'печатает…' : subtitleFor(chat));

  return (
    <div className={`chatroom ${closing ? 'closing' : ''}`}>
      <header className="cr-header">
        <button className="cr-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <span className={`cr-avatar ${chat.kind === 'bot' ? 'cr-avatar--bot' : ''}`}><ChatAvatarImg chat={chat} size={40} /></span>
        <div className="cr-title-wrap">
          <div className="cr-title">{chat.title}</div>
          <div className={`cr-subtitle ${phase === 'connecting' || typing ? 'accent' : ''}`}>{subtitle}</div>
        </div>
        {!chat.kind && (
          <button className="cr-walkie" aria-label="Позвонить"><Phone size={20} color="var(--color-text)" /></button>
        )}
      </header>

      <div className="cr-body" ref={scrollRef}>
        {phase === 'connecting' && <ConnectingSkeleton />}
        {phase === 'empty' && <EmptyState />}
        {phase === 'chat' && (
          <div className="cr-messages">
            <div className="cr-day"><span className="cr-day-line" />{dayLabel(isEmptyChat(chat) ? undefined : chat.time)}<span className="cr-day-line" /></div>
            {items.map((msg) => (
              <Message
                key={msg.id}
                msg={msg}
                firstOfGroup={msg.firstOfGroup}
                lastOfGroup={msg.lastOfGroup}
                mine={!!msg.mine}
                avatar={!msg.mine ? <AuthorAvatar chat={chat} author={msg.author} /> : null}
                authorLabel={!msg.mine && chat.kind === 'group' ? msg.author : null}
                authorColor={!msg.mine && chat.kind === 'group' ? colorForName(msg.author) : null}
              />
            ))}
            {typing && (
              <div className="msg msg--their msg--last">
                <span className="msg-avatar-slot"><AuthorAvatar chat={chat} author={chat.title} /></span>
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
