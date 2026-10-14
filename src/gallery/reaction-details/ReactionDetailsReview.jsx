import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowBendUpLeft, ArrowCounterClockwise, Bell, CalendarBlank, CaretRight, ChatCircle, Checks, Copy, DotsThree, Eye, MagnifyingGlass, Microphone, Moon, Newspaper, PaperPlaneRight, PencilSimple, Plus, PushPin, Share, Smiley, Sun, Trash, Users, X, CheckCircle } from '@phosphor-icons/react';
import Message from '../../components/Message';
import { REACTIONS } from '../../components/MessageMenu';
import EmojiPicker from '../reaction-picker/EmojiPicker';
import { formatTime, groupReactions, reactionFixtures, readers, scenarios, singleReader, toggleReaction, activityLabel, messageActivity, shortTime } from './reactionDetailsModel';
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

function ActivityPopover({ reactions, readEntries, mine, id, popoverRef, onClose }) {
  const entries = messageActivity(reactions, readEntries, mine);
  const title = reactions.length ? (mine && readEntries.length ? 'Реакции и просмотры' : 'Реакции') : 'Просмотры';
  return <section className="rd-activity" id={id} ref={popoverRef} aria-label={title}>
    <header className="rd-activity-head"><h2>{title}</h2><span>{entries.length}</span><button type="button" onClick={onClose} aria-label="Закрыть список"><X size={16} /></button></header>
    <div className="rd-list-scroll" tabIndex={0} aria-label="Участники и время">
      <ul className="rd-people">{entries.map(({ user, reactions: userReactions, readAt }) => <li key={user.id}>
        <Avatar user={user} /><div className="rd-person-text"><strong title={user.name}>{user.name}</strong><div className="rd-person-times">
          {userReactions.length > 0 && <span title={`Реакция: ${formatTime(userReactions[0].createdAt)}`}><Smiley size={12} /><time dateTime={userReactions[0].createdAt}>{shortTime(userReactions[0].createdAt)}</time></span>}
          {readAt && <span title={`Прочитано: ${formatTime(readAt)}`}><Checks size={13} /><time dateTime={readAt}>{shortTime(readAt)}</time></span>}
        </div></div>
        {userReactions.length > 0 ? <span className="rd-person-emoji" aria-label={`Реакции: ${userReactions.map(item => item.emoji).join(' ')}`}>{userReactions.map(item => item.emoji).join('')}</span> : <Checks size={17} className="rd-read-check" />}
      </li>)}</ul>
    </div>
  </section>;
}

function MessageMenu({ message, reactions, readEntries, personal, position, stage, onClose, onReact, onExpand, onAction, capture, initialDetails = false }) {
  const stack = useRef(null), summary = useRef(null), popover = useRef(null), closeTimer = useRef(null);
  const id = useId();
  const [box, setBox] = useState(null), [details, setDetails] = useState(initialDetails), [flyout, setFlyout] = useState(null);
  const availableReads = personal ? [] : readEntries;
  const label = activityLabel(reactions, availableReads, message.mine);
  const keepOpen = () => clearTimeout(closeTimer.current);
  const hideSoon = () => { keepOpen(); closeTimer.current = setTimeout(() => setDetails(false), 180); };
  const reveal = () => { keepOpen(); setDetails(true); };
  const hide = () => { keepOpen(); setDetails(false); summary.current?.focus({ preventScroll: true }); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useLayoutEffect(() => {
    const scene = stack.current.closest('.rd-stage');
    setBox({ left: Math.max(12, Math.min(position.x, scene.offsetWidth - stack.current.offsetWidth - 12)), top: Math.max(12, Math.min(position.y, scene.offsetHeight - stack.current.offsetHeight - 12)) });
  }, [position, stage, label]);
  useLayoutEffect(() => {
    if (!details || !box || !popover.current || !summary.current) return;
    const scene = stack.current.closest('.rd-stage'), bounds = stack.current.getBoundingClientRect(), row = summary.current.getBoundingClientRect();
    const scale = bounds.width / stack.current.offsetWidth;
    const side = box.left + stack.current.offsetWidth + 6 + 288 <= scene.offsetWidth - 12 ? 'right' : 'left';
    const top = Math.max(12 - box.top, Math.min((row.top - bounds.top) / scale, scene.offsetHeight - box.top - popover.current.offsetHeight - 12));
    setFlyout({ side, top });
  }, [details, box, stage, reactions.length, readEntries.length]);
  useEffect(() => { if (!capture) stack.current?.querySelector('[role="menuitem"]')?.focus({ preventScroll: true }); }, [capture]);
  const navigate = event => {
    if (event.key === 'Escape' || (event.key === 'ArrowLeft' && details)) { event.preventDefault(); event.stopPropagation(); if (details) hide(); else onClose(); return; }
    if (event.key === 'ArrowRight' && event.target === summary.current) { event.preventDefault(); reveal(); requestAnimationFrame(() => popover.current?.querySelector('[tabindex="0"]')?.focus()); return; }
    if (event.target.closest('.rd-activity') && event.key !== 'Tab') return;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab'].includes(event.key)) return;
    event.preventDefault();
    const items = [...stack.current.querySelectorAll('button, [tabindex="0"]')];
    const current = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey) ? -1 : 1) + items.length) % items.length;
    items[next]?.focus();
  };
  const actions = [
    ['reply', 'Ответить', ArrowBendUpLeft], ['copy', 'Копировать', Copy],
    ...(message.mine ? [['edit', 'Изменить', PencilSimple]] : []),
    ['pin', 'Закрепить', PushPin], ['forward', 'Переслать', Share],
    ...(message.mine ? [['delete', 'Удалить', Trash]] : []),
    ['select', 'Выбрать', CheckCircle],
  ];
  return <div className="rd-menu-layer">
    <button type="button" className="rd-dismiss" aria-label="Закрыть меню" tabIndex={-1} onClick={onClose} />
    <div className="rd-menu-stack" ref={stack} style={box || { visibility: 'hidden' }} onKeyDown={navigate}>
      <div className="msgmenu-reactions" aria-label="Быстрые реакции">{REACTIONS.map(emoji => <button type="button" className="msgmenu-reaction" key={emoji} aria-label={`Поставить реакцию ${emoji}`} aria-pressed={reactions.some(item => item.user.id === 'me' && item.emoji === emoji)} onClick={() => onReact(emoji)}>{emoji}</button>)}<button type="button" className="msgmenu-reaction rp-more" aria-label="Все эмодзи" onClick={onExpand}><Plus size={18} /></button></div>
      <div className="rd-menu" role="menu" aria-label="Меню сообщения">
        {personal && message.mine && readEntries.length > 0 && <div className="rd-personal-read" aria-label={`Прочитано ${formatTime(readEntries[0].createdAt)}`}><Checks size={16} /><time dateTime={readEntries[0].createdAt}>{shortTime(readEntries[0].createdAt)}</time></div>}
        {label && <div className="rd-menu-meta" role="group" aria-label="Информация о сообщении">
          <button type="button" className="rd-meta-row" role="menuitem" ref={summary} aria-haspopup="true" aria-expanded={details} aria-controls={details ? id : undefined} onMouseEnter={reveal} onMouseLeave={hideSoon} onClick={reveal}>
            {reactions.length ? <Smiley size={16} /> : <Checks size={16} />}<span>{label}</span><CaretRight size={12} />
          </button>
        </div>}
        {actions.map(([key, title, Icon]) => <button type="button" role="menuitem" className={`rd-action ${key === 'delete' ? 'rd-danger' : ''} ${key === 'select' ? 'rd-separated' : ''}`} key={key} onMouseEnter={() => setDetails(false)} onClick={() => onAction(key)}><Icon size={16} /><span>{title}</span></button>)}
      </div>
      {details && label && <div className={`rd-flyout rd-flyout--${flyout?.side || 'left'}`} style={{ top: flyout?.top ?? 44 }} onMouseEnter={keepOpen} onMouseLeave={hideSoon}>
        <ActivityPopover reactions={reactions} readEntries={availableReads} mine={message.mine} id={id} popoverRef={popover} onClose={hide} />
      </div>}
    </div>
  </div>;
}

function Scene({ scenario, theme, capture = false }) {
  const initial = scenario === 'incoming' ? 'incoming' : 'own';
  const [active, setActive] = useState(initial);
  const [mode, setMode] = useState('menu');
  const [menuKey, setMenuKey] = useState(0);
  const personal = scenario === 'personal';
  const threadMessages = personal ? [{ id: 'incoming', text: 'Отправила обновлённый макет.', time: '16:30' }, { id: 'own', mine: true, text: 'Спасибо, посмотрю сегодня.', time: '16:32', status: 'read' }] : messages;
  const initialDetails = scenario.startsWith('readers-') || ['list', 'single', 'long'].includes(scenario);
  const [data, setData] = useState(() => ({ own: reactionFixtures(scenario), incoming: reactionFixtures('list').slice(0, 3), hello: [], answer: [] }));
  const [position, setPosition] = useState({ x: 1080, y: 300 });
  const [notice, setNotice] = useState('');
  const stage = useRef(null);
  const trigger = useRef(null);
  const message = threadMessages.find(item => item.id === active);
  const entries = data[active];
  const readEntries = ['one-reader', 'readers-one', 'personal'].includes(scenario) ? singleReader : ['no-readers', 'single'].includes(scenario) ? [] : scenario === 'readers-long' ? reactionFixtures('long').map(({user,createdAt}) => ({user,createdAt})) : readers;
  const close = () => { setMode('chat'); requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  const open = (msg, event) => {
    event.preventDefault();
    const bounds = stage.current.getBoundingClientRect();
    const target = event.currentTarget.getBoundingClientRect();
    const scale = bounds.width / stage.current.offsetWidth;
    trigger.current = event.currentTarget;
    setActive(msg.id);
    setPosition({ x: event.type === 'contextmenu' ? (event.clientX - bounds.left) / scale : (target.right - bounds.left) / scale - 232, y: event.type === 'contextmenu' ? (event.clientY - bounds.top) / scale : (target.top - bounds.top) / scale + 30 });
    setMenuKey(value => value + 1);
    setMode('menu');
  };
  useLayoutEffect(() => {
    trigger.current = stage.current.querySelector(`[data-message-id="${initial}"] .rd-message-more`);
    const bounds = stage.current.getBoundingClientRect();
    const target = trigger.current.getBoundingClientRect();
    const scale = bounds.width / stage.current.offsetWidth;
    setPosition({ x: (target.right - bounds.left) / scale - 232, y: (target.top - bounds.top) / scale + 30 });
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
        <section className="rp-web-room rd-room" aria-label={personal ? "Аяжан Даркеева" : "PR01DEV + ROBOTS"}><header className="cr-header"><span className="cr-avatar"><img src={personal ? "/img/chats/ayazhan.png" : "/img/chats/bts-pr.png"} alt="" /></span><div className="cr-title-wrap"><strong className="cr-title">{personal ? "Аяжан Даркеева" : "PR01DEV + ROBOTS"}</strong><span className="cr-subtitle">{personal ? "В сети" : "73 участника"}</span></div><MagnifyingGlass size={22} /><DotsThree size={25} /></header>
          <div className="rd-messages"><div className="cr-day">12 октября</div>{threadMessages.map(msg => <div key={msg.id} className="rd-message" data-message-id={msg.id} onContextMenu={event => open(msg, event)}>
            <Message msg={msg} mine={msg.mine} firstOfGroup lastOfGroup withAvatarSlot authorLabel={msg.mine ? undefined : 'Аяжан Даркеева'} authorColor="var(--color-primary)" avatar={<span className="msg-avatar"><img src="/img/chats/ayazhan.png" alt="" /></span>} reactions={groupReactions(data[msg.id])} onToggleReaction={emoji => choose(emoji, msg.id)} />
            <button type="button" className={`rd-message-more ${msg.mine ? 'is-own' : ''}`} aria-label={`Меню сообщения ${msg.id === 'own' ? 'своего' : msg.id === 'incoming' ? 'собеседника' : msg.time}`} aria-haspopup="menu" onClick={event => open(msg, event)} onKeyDown={event => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) open(msg, event); }}><DotsThree size={22} /></button>
          </div>)}</div>
          <div className="rd-composer" aria-hidden="true"><Plus size={23} /><span>Написать сообщение…</span><Smiley size={23} /><Microphone size={23} /><PaperPlaneRight size={23} /></div>
        </section>
      </div>
    </div>
    {mode === 'menu' && <MessageMenu key={menuKey} message={message} reactions={entries} readEntries={readEntries} personal={personal} position={position} stage={stage} onClose={close} onReact={choose} onExpand={() => setMode('picker')} onAction={action} capture={capture} initialDetails={menuKey === 0 && initialDetails} />}
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
  if (board) return <main className="rd-board"><h1>QM-2611 · Реакции и просмотры на вебе</h1><p>Вложенный список · 1440 × 900 · 24 состояния</p>{['light', 'dark'].map(boardTheme => <section key={boardTheme}><h2>{boardTheme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</h2><div className="rd-board-grid">{scenarios.map((item, index) => <article key={item.id}><h3>{index + 1}. {item.title}</h3><Scene scenario={item.id} theme={boardTheme} capture /></article>)}</div></section>)}</main>;
  return <main className="rd-review">
    <header className="rd-review-head"><div className="rd-brand"><img src="/img/common/qollab-logo.svg" alt="Qollab" /><span>QM-2611</span><small>Локальная проверка</small></div><h1>Реакции и просмотры</h1><p>Компактное меню и единый список участников</p></header>
    <div className="rd-toolbar"><div className="rp-segment" aria-label="Тема">{[['light', Sun, 'Светлая'], ['dark', Moon, 'Тёмная']].map(([id, Icon, title]) => <button type="button" key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}><Icon size={18} />{title}</button>)}</div><a href="?view=board">Все состояния ↗</a><button type="button" onClick={() => setRevision(value => value + 1)}><ArrowCounterClockwise size={17} />Сбросить</button></div>
    <div className="rd-scenarios">{scenarios.map((item, i) => <button type="button" key={item.id} aria-pressed={scenario === item.id} onClick={() => { setScenario(item.id); setRevision(value => value + 1); }}><small>0{i + 1}</small><strong>{item.title}</strong><span>{item.note}</span></button>)}</div>
    <div className="rd-preview-label"><span>Веб · 1440 × 900</span><span>Правый клик → наведите на строку реакций и просмотров</span></div>
    <div className="rd-preview-scroll" ref={preview}><div style={{ zoom: scale }}><Scene key={`${scenario}-${revision}`} scenario={scenario} theme={theme} /></div></div>
    <div className="rd-decision"><Eye size={20} /><p><strong>Одна строка, один список.</strong> Наведите курсор, нажмите на строку или используйте →. Список откроется рядом с меню. Люди не дублируются; время реакции и прочтения сохранено. Esc закрывает список, повторный Esc — меню.</p><p>Просмотры доступны автору, реакции — всем участникам. В личной переписке — дата с галочками без перехода. Капсулы по-прежнему ставят и снимают свою реакцию.</p></div>
    <footer className="rd-footer"><span>Демонстрационные данные · 14 октября 2026</span><a href="https://jira2.erg.kz/browse/QM-2611" target="_blank" rel="noreferrer">QM-2611 в Jira ↗</a></footer>
  </main>;
}
