import { useEffect, useState } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BellSlash, CaretLeft, Checks, Heart, MagnifyingGlass, Monitor, PencilSimple, Plus, PushPin, Smiley } from '@phosphor-icons/react';
import { Avatar } from '../../screens/Chats';
import { baseChats } from '../../data/chatList';
import TopBar from '../../components/TopBar';
import TabLayout from '../../components/TabLayout';
import BottomNav from '../../components/BottomNav';
import Message from '../../components/Message';
import '../../screens/ChatRoom.css';
import './ReactionUnreadReview.css';

const scenarios = [
  { id: 'overview', title: 'Все сочетания', note: 'Реакция, сообщения, закрепление и звук', description: 'Новые реакции видны и в личных, и в групповых чатах. Сердечко и число сообщений стоят рядом; значки закрепления и звука сохраняют свои места.' },
  { id: 'latest', title: 'Несколько реакций', note: 'Один индикатор с сердечком', description: 'Добавь реакцию к сообщению другого участника. Любая новая реакция отмечается одним сердечком, время и порядок чатов не меняются.' },
  { id: 'sync', title: 'Прочитано на другом устройстве', note: 'Сброс индикатора и пуша', description: 'Открой PR01DEV на вебе кнопкой ниже или на телефоне справа. Индикатор и пуш реакции исчезнут на обоих устройствах.' },
  { id: 'reaction-only', title: 'Только новая реакция', note: 'Сообщения уже прочитаны', description: 'Когда новых сообщений нет, справа остаётся только индикатор с сердечком. Он не содержит числа и исчезает после открытия чата.' },
];
const target = 'chat-2';
const initialChats = () => baseChats.slice(0, 7).map((chat, index) => ({
  ...chat, id: `chat-${index}`, pinned: index === 2 || index === 6,
  unreadCount: index === 2 ? 3 : chat.unreadCount,
  reaction: index === 2 ? '👍' : index === 3 ? '❤️' : index === 4 ? '🔥' : index === 5 ? '👏' : null,
}));

export function UnreadReaction({ active }) {
  if (!active) return null;
  return <span className="chat-badge ru-indicator" role="img" aria-label="Непрочитанные реакции">
    <Heart size={12} weight="fill" aria-hidden="true" />
  </span>;
}

function ChatRow({ chat, onOpen }) {
  const accessible = [chat.title, chat.unreadCount ? `${chat.unreadCount} непрочитанных сообщения` : '', chat.reaction ? 'Новая реакция' : ''].filter(Boolean).join(', ');
  return <li><button className="chat-row ru-chat-row" onClick={() => onOpen(chat)} data-chat-id={chat.id} aria-label={accessible}>
    <Avatar chat={chat} />
    <div className="chat-body">
      <div className="chat-line1">
        <span className="chat-title">{chat.title}</span>
        {chat.muted && <span className="chat-notification-mode" role="img" aria-label="Уведомления отключены"><BellSlash size={14} weight="fill" /></span>}
        <span className="chat-time">{chat.time}</span>
      </div>
      <div className="chat-line2">
        <span className="chat-preview">
          {chat.lastMine && <Checks className="chat-receipt" size={16} color="var(--color-primary)" />}
          {chat.sender && <b className="chat-sender">{chat.sender} </b>}
          {chat.contentIcon && <chat.contentIcon size={14} weight="fill" style={{ verticalAlign: 'middle', marginRight: 2 }} />}
          {chat.preview}
        </span>
        <span className="ru-row-signals">
          {chat.pinned && <PushPin size={14} weight="fill" color="var(--color-weak)" role="img" aria-label="Чат закреплён" />}
          <UnreadReaction active={!!chat.reaction} />
          {chat.unreadCount > 0 && <span className="chat-badge">{chat.unreadCount}</span>}
        </span>
      </div>
    </div>
  </button></li>;
}

function Conversation({ chat, emoji, onBack }) {
  const group = !!chat.sender;
  const [mine, setMine] = useState(false);
  const user = { id: 'ayazhan', avatar: '/img/chats/ayazhan.png', initials: 'АС' };
  const messages = [
    { id: 1, text: 'Коллеги, макеты готовы. Посмотрите, пожалуйста, когда будет время.', time: '11:20', author: 'Арман А.' },
    { id: 2, mine: true, text: 'Спасибо! Посмотрю до обеда.', time: '11:21', status: 'read' },
    { id: 3, text: 'Хорошо, все изменения уже в файле.', time: '11:34', author: group ? 'Айдар С.' : chat.title },
  ];
  return <section className="chatroom ru-conversation" aria-label={`Чат ${chat.title}`}>
    <header className="cr-header">
      <button className="cr-back" onClick={onBack} aria-label="Назад к чатам"><CaretLeft size={24} /></button>
      <div className="cr-avatar"><img src={chat.avatar} alt="" /></div>
      <div className="cr-title-wrap"><h1 className="cr-title">{chat.title}</h1><span className="cr-subtitle">{group ? '73 участника' : 'в сети'}</span></div>
    </header>
    <div className="cr-body ru-message-list">
      <div className="ru-day">Сегодня</div>
      {messages.map(msg => <Message key={msg.id} msg={msg} mine={msg.mine} firstOfGroup lastOfGroup withAvatarSlot={group}
        authorLabel={group ? msg.author : undefined} authorColor="var(--color-primary)"
        avatar={<span className="msg-avatar"><img src="/img/chats/daniyar.png" alt="" /></span>}
        reactions={msg.id === 1 && emoji ? { [emoji]: [user, ...(mine ? [{ id: 'me', initials: 'Я' }] : [])] } : {}}
        onToggleReaction={() => setMine(value => !value)} />)}
    </div>
    <div className="ru-composer"><Smiley size={22} /><span>Сообщение…</span><span className="ru-composer-note">Демо</span></div>
  </section>;
}

function Phone({ chats, readChat, activeChat, setActiveChat, seenEmoji }) {
  const navigate = useNavigate();
  const location = useLocation();
  const open = chat => {
    if (chat.kind === 'system' || chat.kind === 'bot') return;
    readChat(chat.id, 'mobile');
    setActiveChat(chat.id);
    navigate(`/chats/${chat.id}`);
  };
  const back = () => { setActiveChat(null); navigate('/chats'); };
  const selected = location.pathname !== '/chats' && chats.find(chat => chat.id === activeChat);
  return <div className="device ru-phone" data-testid="reaction-phone">
    <TabLayout topbar={<TopBar title="Чаты" actions={<><button className="topbar-btn" disabled aria-label="Выбрать чаты"><PencilSimple size={20} weight="fill" color="var(--color-weak)" /></button><button className="topbar-btn primary" disabled aria-label="Новый чат"><Plus size={20} /></button></>} />}>
      <div className="chats-search-wrap"><div className="chats-search"><MagnifyingGlass size={20} /><span>Поиск</span></div></div>
      <ul className="chat-list">{chats.map(chat => <ChatRow key={chat.id} chat={chat} onOpen={open} />)}</ul>
    </TabLayout>
    <div className="ru-nav-preview" inert><BottomNav /></div>
    {selected && <Conversation key={selected.id} chat={selected} emoji={seenEmoji[selected.id]} onBack={back} />}
  </div>;
}

function InteractiveReview() {
  const params = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [scenario, setScenario] = useState('overview');
  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState(null);
  const [seenEmoji, setSeenEmoji] = useState({});
  const [push, setPush] = useState(true);
  const [event, setEvent] = useState('Новые реакции ожидают прочтения');
  const [version, setVersion] = useState(0);
  const current = scenarios.find(item => item.id === scenario);
  const demoChat = chats.find(chat => chat.id === target);

  useEffect(() => {
    document.documentElement.classList.add('reaction-unread-review');
    document.documentElement.dataset.company = 'erg';
    document.title = 'QM-2588 · Непрочитанные реакции · Qollab';
    return () => document.documentElement.classList.remove('reaction-unread-review');
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState(null, '', url);
  }, [theme]);

  const choose = id => {
    setScenario(id);
    const next = initialChats();
    if (id === 'latest') next.forEach(chat => { chat.reaction = null; });
    if (id === 'reaction-only') { next[2].unreadCount = 0; }
    setChats(next);
    setActiveChat(null);
    setSeenEmoji({});
    setPush(id !== 'latest');
    setEvent(id === 'latest' ? 'Добавь новую реакцию кнопкой ниже' : 'Новые реакции ожидают прочтения');
    setVersion(value => value + 1);
  };
  const readChat = (id, device) => {
    const chat = chats.find(item => item.id === id);
    setSeenEmoji(value => ({ ...value, [id]: chat.reaction || value[id] }));
    setChats(value => value.map(item => item.id === id ? { ...item, reaction: null, unreadCount: 0 } : item));
    if (id === target) setPush(false);
    setEvent(`${chat.title}: прочитано ${device === 'web' ? 'на вебе' : 'на телефоне'}. Состояние синхронизировано.`);
  };
  const addReaction = emoji => {
    setChats(value => value.map(chat => chat.id === target ? { ...chat, reaction: emoji } : chat));
    setPush(true);
    setEvent(`Новая реакция ${emoji} к сообщению Армана. В списке один индикатор с сердечком.`);
  };

  return <main className="ru-review">
    <header className="ru-review-header">
      <div className="ru-brand"><img src="/img/auth/app-icon.svg" alt="" width="32" height="32" /><span>qollab <i>/</i> QM-2588</span><span className="ru-review-tag">На ревью</span></div>
      <h1>Новые реакции в чатах</h1>
      <p>Заметить реакцию, открыть чат — и убрать непрочитанное на всех устройствах. <a href="?view=board">Все экраны для Figma →</a></p>
    </header>
    <div className="ru-layout">
      <aside className="ru-panel">
        <div className="ru-section-heading"><h2>Состояния</h2><button className="ru-reset" onClick={() => choose(scenario)}>Сбросить</button></div>
        <div className="ru-scenarios">{scenarios.map((item, index) => <button key={item.id} data-scenario={item.id} aria-pressed={scenario === item.id} className={`ru-scenario${scenario === item.id ? ' is-selected' : ''}`} onClick={() => choose(item.id)}>
          <span className="ru-number">0{index + 1}</span><span><strong>{item.title}</strong><small>{item.note}</small></span><ArrowRight size={18} />
        </button>)}</div>
        <p className="ru-description">{current.description}</p>
        {scenario === 'latest' && <div className="ru-add-reactions" aria-label="Симуляция новых реакций">{['👍', '❤️', '🔥'].map(emoji => <button key={emoji} aria-label={`Добавить реакцию ${emoji}`} onClick={() => addReaction(emoji)}>{emoji}</button>)}</div>}
        {scenario === 'sync' && <section className="ru-web-demo" aria-label="Другое устройство">
          <div className="ru-web-title"><Monitor size={18} /><h3>Qollab · веб</h3><span>Демо</span></div>
          <div className="ru-web-chat"><img src={demoChat.avatar} alt="" /><span><strong>{demoChat.title}</strong><small>Арман А.: не узнал</small></span><UnreadReaction active={!!demoChat.reaction} />{demoChat.unreadCount > 0 && <span className="chat-badge">{demoChat.unreadCount}</span>}</div>
          <button className="ru-web-open" onClick={() => readChat(target, 'web')} disabled={!demoChat.reaction && !demoChat.unreadCount}>Открыть чат на вебе <ArrowRight size={16} /></button>
          <div className={`ru-push-state${push ? '' : ' is-read'}`}><span className="ru-status-dot" />{push ? 'Пуш реакции на телефоне активен' : 'Пуш реакции на телефоне снят'}</div>
        </section>}
        <p className="ru-event" role="status">{event}</p>
        <div className="ru-design-notes"><h3>Правила индикатора</h3>
          <p><UnreadReaction active /> <span>Одно filled-сердечко на чат, без числа реакций.</span></p>
          <p><span className="chat-badge">2</span> <span>Сообщения — отдельный счётчик рядом.</span></p>
          <p><PushPin size={18} weight="fill" /><span>Закрепление слева от сердечка, звук у названия.</span></p>
        </div>
        <p className="ru-demo-note">Отдельный прототип. События и снятие пуша имитируются; подключение синхронизации — следующий этап разработки.</p>
        <a className="ru-source" href="https://jira2.erg.kz/browse/QM-2588" target="_blank" rel="noreferrer">Задача QM-2588 <ArrowRight size={14} /></a>
      </aside>
      <section className="ru-preview" aria-label="Предпросмотр мобильного экрана">
        <div className="ru-preview-top"><div className="ru-theme" aria-label="Тема">{[['light', 'Светлая'], ['dark', 'Тёмная']].map(([id, title]) => <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}>{title}</button>)}</div><span>402 × 820</span></div>
        <MemoryRouter key={version} initialEntries={['/chats']}><Phone chats={chats} readChat={readChat} activeChat={activeChat} setActiveChat={setActiveChat} seenEmoji={seenEmoji} /></MemoryRouter>
        <p className="ru-preview-caption">Нажми на чат с реакцией, затем вернись к списку.</p>
      </section>
    </div>
  </main>;
}

function ReactionUnreadBoard() {
  useEffect(() => {
    document.documentElement.classList.add('reaction-unread-review');
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.company = 'erg';
    document.title = 'QM-2588 · Экраны 402×820 · Qollab';
    return () => document.documentElement.classList.remove('reaction-unread-review');
  }, []);
  const cases = [
    ['overview', 'Все сочетания', 'Реакции, сообщения, закрепление и звук.'],
    ['reactions', 'Только реакции', 'Новых сообщений нет, остаются сердечки.'],
    ['messages', 'Только сообщения', 'Реакции прочитаны, счётчики сохранены.'],
    ['read-chat', 'Чат прочитан', 'PR01DEV прочитан на другом устройстве.'],
    ['read-all', 'Всё прочитано', 'Все индикаторы сняты, закрепление осталось.'],
    ['conversation', 'Открытый чат', 'Реакция остаётся под сообщением после чтения.'],
  ];
  return <main className="ru-board">
    <header><span className="ru-board-brand">QOLLAB · QM-2588</span><h1>Непрочитанные реакции</h1><p>Согласованный дизайн · 12 экранов · каждый 402×820 px · <a href="?theme=light">Кликабельный прототип →</a></p></header>
    {['light', 'dark'].map(theme => <section key={theme} className="ru-board-section"><h2>{theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</h2>
      <div className="ru-board-grid">{cases.map(([id, title, note], index) => {
        const chats = initialChats().map(chat => ({ ...chat,
          reaction: ['messages', 'read-all'].includes(id) || (['read-chat', 'conversation'].includes(id) && chat.id === target) ? null : chat.reaction,
          unreadCount: ['reactions', 'read-all'].includes(id) || (['read-chat', 'conversation'].includes(id) && chat.id === target) ? 0 : chat.unreadCount,
        }));
        return <figure key={id} className="ru-board-cell"><figcaption><h3>{String(index + 1).padStart(2, '0')} · {title}</h3><p>{note}</p></figcaption>
          <div className="ru-board-frame" data-theme={theme} data-board-screen={`${theme}-${id}`} inert>
            <MemoryRouter initialEntries={[id === 'conversation' ? `/chats/${target}` : '/chats']}>
              <Phone chats={chats} readChat={() => {}} activeChat={id === 'conversation' ? target : null} setActiveChat={() => {}} seenEmoji={{ [target]: '👍' }} />
            </MemoryRouter>
          </div>
        </figure>;
      })}</div>
    </section>)}
  </main>;
}

export default function ReactionUnreadReview() {
  return new URLSearchParams(window.location.search).get('view') === 'board' ? <ReactionUnreadBoard /> : <InteractiveReview />;
}
