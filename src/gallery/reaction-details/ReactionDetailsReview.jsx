import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowBendUpLeft, ArrowCounterClockwise, Bell, CalendarBlank, CaretRight, ChatCircle, Checks, Copy, DotsThree, Eye, MagnifyingGlass, Microphone, Moon, Newspaper, PaperPlaneRight, PencilSimple, Plus, PushPin, Share, Smiley, Sun, Trash, Users, X, CheckCircle } from '@phosphor-icons/react';
import Message from '../../components/Message';
import { REACTIONS } from '../../components/MessageMenu';
import EmojiPicker from '../reaction-picker/EmojiPicker';
import { formatTime, groupReactions, reactionFixtures, readers, readLabel, scenarios, singleReader, sortReactions, toggleReaction } from './reactionDetailsModel';
import '../../screens/ChatRoom.css';
import '../reaction-picker/ReactionPickerReview.css';
import './ReactionDetailsReview.css';

const messages = [
  { id: 'hello', text: 'Коллеги, привет! Как продвигаются макеты?', time: '11:10' },
  { id: 'answer', mine: true, text: 'Привет! Уже заканчиваем последние правки 👌', time: '11:12', status: 'read' },
  { id: 'incoming', text: 'Посмотрела обновления. Всё выглядит отлично, спасибо команде!', time: '11:18' },
  { id: 'own', mine: true, text: 'Коллеги, макеты готовы. Посмотрите, пожалуйста, когда будет время.', time: '11:20', status: 'read' },
];

function Avatar({ user }) {
  const [failed, setFailed] = useState(false);
  return <span className="rd-avatar">{user.avatar && !failed ? <img src={user.avatar} alt="" onError={() => setFailed(true)} /> : user.initials || '?'}</span>;
}

// The same row geometry is used by both metadata actions and both details lists.
function MetaRow({ icon: Icon, children, onClick }) {
  return <button type="button" className="rd-meta-row" role="menuitem" onClick={onClick}><Icon size={20} /><span>{children}</span><CaretRight size={16} /></button>;
}

function DetailsDialog({ entries, kind, message, onClose, capture }) {
  const id = useId();
  const ref = useRef(null);
  const isReactions = kind === 'reactions';
  useEffect(() => { if (!capture) ref.current?.querySelector('button')?.focus({ preventScroll: true }); }, [capture]);
  const trap = event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const items = [...ref.current.querySelectorAll('button, [tabindex="0"]')];
      const index = items.indexOf(document.activeElement);
      event.preventDefault(); items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
    }
  };
  return <div className="rd-modal-layer" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="rd-dialog" ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-context`} onKeyDown={trap}>
      <header className="rd-dialog-head"><h2 id={`${id}-title`}>{isReactions ? 'Реакции' : 'Просмотры сообщения'}<span>{entries.length}</span></h2><button type="button" onClick={onClose} aria-label="Закрыть список"><X size={22} /></button></header>
      <div className="rd-message-context" id={`${id}-context`}><strong>{message.mine ? 'Вы' : 'Аяжан Даркеева'}<span> · 12 окт., {message.time}</span></strong><p>{message.text}</p></div>
      <div className="rd-list-scroll" tabIndex={0} aria-label={isReactions ? 'Список реакторов' : 'Список прочитавших'}>
        <ul className="rd-people">{sortReactions(entries).map(({ user, emoji, createdAt }) => <li key={`${user.id}-${emoji || 'read'}`}>
          <Avatar user={user} /><div className="rd-person-text"><strong title={user.name}>{user.name}</strong><time dateTime={createdAt}>{formatTime(createdAt)}</time></div>
          {isReactions ? <span className="rd-person-emoji" aria-label={`Реакция ${emoji}`}>{emoji}</span> : <Checks size={22} className="rd-read-check" />}
        </li>)}</ul>
      </div>
    </section>
  </div>;
}

function MessageMenu({ message, reactions, readEntries, position, stage, onClose, onDetails, onReact, onExpand, onAction, capture }) {
  const stack = useRef(null);
  const [box, setBox] = useState(null);
  const label = readLabel(message.mine, readEntries);
  useLayoutEffect(() => {
    const scene = stack.current.closest('.rd-stage');
    setBox({ left: Math.max(12, Math.min(position.x, scene.offsetWidth - stack.current.offsetWidth - 12)), top: Math.max(12, Math.min(position.y, scene.offsetHeight - stack.current.offsetHeight - 12)) });
  }, [position, stage, label, reactions.length]);
  useEffect(() => { if (!capture) stack.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true }); }, [capture]);
  const navigate = event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') { onClose(); return; }
    const items = [...stack.current.querySelectorAll('button')];
    const current = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey) ? -1 : 1) + items.length) % items.length;
    items[next]?.focus();
  };
  const actions = [
    ['reply', 'Ответить', ArrowBendUpLeft], ['copy', 'Скопировать', Copy],
    ...(message.mine ? [['edit', 'Изменить', PencilSimple]] : []),
    ['pin', 'Закрепить', PushPin], ['forward', 'Переслать', Share],
    ...(message.mine ? [['delete', 'Удалить', Trash]] : []),
    ['select', 'Выбрать', CheckCircle],
  ];
  return <div className="rd-menu-layer">
    <button type="button" className="rd-dismiss" aria-label="Закрыть меню" tabIndex={-1} onClick={onClose} />
    <div className="rd-menu-stack" ref={stack} style={box || { visibility: 'hidden' }} onKeyDown={navigate}>
      <div className="msgmenu-reactions" aria-label="Быстрые реакции">{REACTIONS.map(emoji => <button type="button" className="msgmenu-reaction" key={emoji} aria-label={`Поставить реакцию ${emoji}`} aria-pressed={reactions.some(item => item.user.id === 'me' && item.emoji === emoji)} onClick={() => onReact(emoji)}>{emoji}</button>)}<button type="button" className="msgmenu-reaction rp-more" aria-label="Все эмодзи" onClick={onExpand}><Plus size={22} /></button></div>
      <div className="rd-menu" role="menu" aria-label="Меню сообщения">
        {(label || reactions.length > 0) && <div className="rd-menu-meta" role="group" aria-label="Информация о сообщении">
          {label && <MetaRow icon={Checks} onClick={() => onDetails('readers')}>{label}</MetaRow>}
          {reactions.length > 0 && <MetaRow icon={Smiley} onClick={() => onDetails('reactions')}>Реакции: {reactions.length}</MetaRow>}
        </div>}
        {actions.map(([key, title, Icon]) => <button type="button" role="menuitem" className={`rd-action ${key === 'delete' ? 'rd-danger' : ''} ${key === 'select' ? 'rd-separated' : ''}`} key={key} onClick={() => onAction(key)}><Icon size={20} /><span>{title}</span></button>)}
      </div>
    </div>
  </div>;
}

function Scene({ scenario, theme, capture = false }) {
  const initial = scenario === 'incoming' ? 'incoming' : 'own';
  const [active, setActive] = useState(initial);
  const [mode, setMode] = useState(scenario.startsWith('readers-') ? 'readers' : ['list', 'single', 'long'].includes(scenario) ? 'reactions' : 'menu');
  const [data, setData] = useState(() => ({ own: reactionFixtures(scenario), incoming: reactionFixtures('list').slice(0, 3), hello: [], answer: [] }));
  const [position, setPosition] = useState({ x: 1080, y: 300 });
  const [notice, setNotice] = useState('');
  const stage = useRef(null);
  const trigger = useRef(null);
  const message = messages.find(item => item.id === active);
  const entries = data[active];
  const readEntries = ['one-reader', 'readers-one'].includes(scenario) ? singleReader : scenario === 'no-readers' ? [] : scenario === 'readers-long' ? reactionFixtures('long').map(({user,createdAt}) => ({user,createdAt})) : readers;
  const close = () => { setMode('chat'); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  const open = (msg, event) => {
    event.preventDefault();
    const bounds = stage.current.getBoundingClientRect();
    const target = event.currentTarget.getBoundingClientRect();
    const scale = bounds.width / stage.current.offsetWidth;
    trigger.current = event.currentTarget;
    setActive(msg.id);
    setPosition({ x: event.type === 'contextmenu' ? (event.clientX - bounds.left) / scale : (target.right - bounds.left) / scale - 264, y: event.type === 'contextmenu' ? (event.clientY - bounds.top) / scale : (target.top - bounds.top) / scale + 30 });
    setMode('menu');
  };
  useLayoutEffect(() => {
    trigger.current = stage.current.querySelector(`[data-message-id="${initial}"] .rd-message-more`);
    const bounds = stage.current.getBoundingClientRect();
    const target = trigger.current.getBoundingClientRect();
    const scale = bounds.width / stage.current.offsetWidth;
    setPosition({ x: (target.right - bounds.left) / scale - 264, y: (target.top - bounds.top) / scale + 30 });
  }, [initial]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2400);
    return () => clearTimeout(timer);
  }, [notice]);
  const choose = (emoji, id = active) => {
    const removed = data[id].some(item => item.user.id === 'me' && item.emoji === emoji);
    setData(value => ({ ...value, [id]: toggleReaction(value[id], emoji) }));
    setNotice(removed ? 'Реакция убрана' : 'Реакция добавлена');
    if (mode !== 'chat') close();
  };
  const action = async key => {
    close();
    if (key === 'copy') {
      try { await navigator.clipboard.writeText(message.text); setNotice('Сообщение скопировано'); }
      catch { setNotice('Копирование недоступно в этом браузере'); }
    } else setNotice('Действие показано для контекста. Проверяем просмотр реакций.');
  };
  return <div ref={stage} className={`rd-stage rp-stage rp-web ru-board-frame${capture ? ' rd-capture' : ''}`} data-theme={theme} data-state={scenario} data-testid="reaction-details-stage">
    <div className="rd-shell" inert={mode !== 'chat' ? true : undefined}>
      <header className="rp-web-top"><img src="/img/common/qollab-logo.svg" alt="Qollab" /><span><MagnifyingGlass size={16} />Найти: сотрудника, канал, пост, мероприятие</span><Bell size={22} /><div className="rp-web-user">РЖ</div></header>
      <nav className="rp-web-nav" aria-label="Разделы Qollab"><small>Главная</small>{[[Newspaper, 'Публикации'], [ChatCircle, 'Чаты'], [Users, 'Орг. структура'], [CalendarBlank, 'Мероприятия']].map(([Icon, title]) => <div key={title} className={title === 'Чаты' ? 'active' : ''}><Icon size={20} />{title}</div>)}<small>Сервисы</small><div><CalendarBlank size={20} />Мой календарь</div></nav>
      <div className="rp-web-main"><aside className="rp-web-chats"><h2>Чаты<PencilSimple size={18} /><Plus size={20} /></h2><div className="rp-web-search"><MagnifyingGlass size={18} />Поиск</div>{[['bts-pr.png', 'PR01DEV + ROBOTS', 'Вы: Коллеги, макеты готовы…'], ['ayazhan.png', 'Аяжан Даркеева', 'Отлично, спасибо!'], ['daniyar.png', 'Данияр Кульманов', 'Посмотрю до обеда'], ['qollab-group.png', 'Команда Qollab', 'Хорошего дня 👋']].map(([avatar, title, text], i) => <div className={`rp-web-chat ${i === 0 ? 'active' : ''}`} key={title}><img src={`/img/chats/${avatar}`} alt="" /><span><strong>{title}</strong><small>{text}</small></span></div>)}</aside>
        <section className="rp-web-room rd-room" aria-label="PR01DEV + ROBOTS"><header className="cr-header"><span className="cr-avatar"><img src="/img/chats/bts-pr.png" alt="" /></span><div className="cr-title-wrap"><strong className="cr-title">PR01DEV + ROBOTS</strong><span className="cr-subtitle">73 участника</span></div><MagnifyingGlass size={22} /><DotsThree size={25} /></header>
          <div className="rd-messages"><div className="cr-day">12 октября</div>{messages.map(msg => <div key={msg.id} className="rd-message" data-message-id={msg.id} onContextMenu={event => open(msg, event)}>
            <Message msg={msg} mine={msg.mine} firstOfGroup lastOfGroup withAvatarSlot authorLabel={msg.mine ? undefined : 'Аяжан Даркеева'} authorColor="var(--color-primary)" avatar={<span className="msg-avatar"><img src="/img/chats/ayazhan.png" alt="" /></span>} reactions={groupReactions(data[msg.id])} onToggleReaction={emoji => choose(emoji, msg.id)} />
            <button type="button" className={`rd-message-more ${msg.mine ? 'is-own' : ''}`} aria-label={`Меню сообщения ${msg.id === 'own' ? 'своего' : msg.id === 'incoming' ? 'собеседника' : msg.time}`} aria-haspopup="menu" onClick={event => open(msg, event)} onKeyDown={event => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) open(msg, event); }}><DotsThree size={22} /></button>
          </div>)}</div>
          <div className="rd-composer" aria-hidden="true"><Plus size={23} /><span>Написать сообщение…</span><Smiley size={23} /><Microphone size={23} /><PaperPlaneRight size={23} /></div>
        </section>
      </div>
    </div>
    {mode === 'menu' && <MessageMenu message={message} reactions={entries} readEntries={readEntries} position={position} stage={stage} onClose={close} onDetails={setMode} onReact={choose} onExpand={() => setMode('picker')} onAction={action} capture={capture} />}
    {['reactions', 'readers'].includes(mode) && <DetailsDialog entries={mode === 'reactions' ? entries : readEntries} kind={mode} message={message} onClose={close} capture={capture} />}
    {mode === 'picker' && <div className="rd-modal-layer" onMouseDown={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => { if (event.key === 'Escape') close(); }}><EmojiPicker platform="web" autoFocus selected={entries.find(item => item.user.id === 'me')?.emoji} onSelect={choose} onClose={close} messageText={message.text} /></div>}
    {notice && <div className="rd-toast" role="status">{notice}</div>}
  </div>;
}

export default function ReactionDetailsReview() {
  const params = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [scenario, setScenario] = useState(scenarios.some(item => item.id === params.get('state')) ? params.get('state') : 'menu');
  const [revision, setRevision] = useState(0);
  const [scale, setScale] = useState(1);
  const preview = useRef(null);
  const board = params.get('view') === 'board';
  const frame = params.get('view') === 'frame';
  useLayoutEffect(() => {
    if (!preview.current) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / 1440)));
    observer.observe(preview.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const old = document.documentElement.dataset.theme;
    const title = document.title;
    document.documentElement.classList.add('reaction-details-review');
    document.documentElement.dataset.theme = 'light';
    document.title = 'QM-2611 · Реакции на вебе · Qollab';
    return () => { document.documentElement.classList.remove('reaction-details-review'); if (old) document.documentElement.dataset.theme = old; else delete document.documentElement.dataset.theme; document.title = title; };
  }, []);
  useEffect(() => {
    if (board) return;
    const query = new URLSearchParams({ theme, state: scenario, ...(frame ? { view: 'frame' } : {}) });
    window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
  }, [theme, scenario, frame, board]);
  if (frame) return <Scene scenario={scenario} theme={theme} capture />;
  if (board) return <main className="rd-board"><h1>QM-2611 · Реакции и просмотры на вебе</h1><p>Модальное окно · 1440 × 900 · 22 состояния</p>{['light', 'dark'].map(boardTheme => <section key={boardTheme}><h2>{boardTheme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</h2><div className="rd-board-grid">{scenarios.map((item, index) => <article key={item.id}><h3>{index + 1}. {item.title}</h3><Scene scenario={item.id} theme={boardTheme} capture /></article>)}</div></section>)}</main>;
  return <main className="rd-review">
    <header className="rd-review-head"><div className="rd-brand"><img src="/img/common/qollab-logo.svg" alt="Qollab" /><span>QM-2611</span><small>Локальная проверка</small></div><h1>Кто поставил реакцию</h1><p>Меню сообщения и список реакторов в веб-версии Qollab</p></header>
    <div className="rd-toolbar"><div className="rp-segment" aria-label="Тема">{[['light', Sun, 'Светлая'], ['dark', Moon, 'Тёмная']].map(([id, Icon, title]) => <button type="button" key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}><Icon size={18} />{title}</button>)}</div><a href="?view=board">Все состояния ↗</a><button type="button" onClick={() => setRevision(value => value + 1)}><ArrowCounterClockwise size={17} />Сбросить</button></div>
    <div className="rd-scenarios">{scenarios.map((item, i) => <button type="button" key={item.id} aria-pressed={scenario === item.id} onClick={() => { setScenario(item.id); setRevision(value => value + 1); }}><small>0{i + 1}</small><strong>{item.title}</strong><span>{item.note}</span></button>)}</div>
    <div className="rd-preview-label"><span>Веб · 1440 × 900</span><span>Правый клик или «···» у сообщения → Реакции</span></div>
    <div className="rd-preview-scroll" ref={preview}><div style={{ zoom: scale }}><Scene key={`${scenario}-${revision}`} scenario={scenario} theme={theme} /></div></div>
    <div className="rd-decision"><Eye size={22} /><p><strong>Формат списка — модальное окно.</strong> Открывается по строке «Реакции: N», сохраняет контекст сообщения. Один плоский список, новые реакции сверху; длинный список прокручивается внутри окна. Закрытие — крестик, Esc или клик снаружи.</p><p>Прочтения доступны автору. Реакции — всем участникам, когда N &gt; 0. Клик по капсуле ставит или снимает свою реакцию.</p></div>
    <footer className="rd-footer"><span>Демонстрационные данные · 14 октября 2026</span><a href="https://jira2.erg.kz/browse/QM-2611" target="_blank" rel="noreferrer">QM-2611 в Jira ↗</a></footer>
  </main>;
}
