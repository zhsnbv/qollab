import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bell, CaretLeft, CaretRight, ChatCircleDots, Chats, FileText, MagnifyingGlass, Microphone, PaperPlaneRight, PaperPlaneTilt, PencilSimple, Phone, Plus, PushPin, Selection, Users, WarningCircle, X } from '@phosphor-icons/react';
import Message from '../../components/Message';
import ComposeInput from '../../components/ComposeInput';
import TopBar from '../../components/TopBar';
import ErgizAvatar from '../../components/ErgizAvatar';
import { NavIcon } from '../../components/NavIcons';
import MobileMessageMenu from '../../components/MobileMessageMenu';
import ForwardSheet from '../../components/ForwardSheet';
import ConfirmDialog from '../../components/ConfirmDialog';
import ThreadsSkeleton from './ThreadsSkeleton';
import '../../components/BottomNav.css';
import '../../components/ConfirmDialog.css';
import { ME, PEOPLE, GROUP, canThread, myThreads, unreadThreads, channelReplies, confirmedReplies, markRead, addReply, setReplyStatus, deleteFailedReply, deleteThreadMessage, rootLabel, initialThreads } from './threadModel';
import '../../screens/ChatRoom.css';
import './Threads.css';

const LIST_CASES = ['threads', 'list-menu', 'list-empty', 'participant-author', 'participant-reply', 'participant-mention', 'list-read', 'forward', 'select', 'loading', 'error', 'deleted-root-list'];
const GROUP_CASES = ['group', 'create-menu', 'group-replies', 'view-menu', 'group-unread', 'group-read', 'direct-menu', 'bot-menu', 'private-group', 'delete-root', 'deleted-root-group', 'closed-thread', 'deleted-root-other-group'];
const DEFAULT_DRAFT = 'Да ты чё! Базару нет!';

function Avatar({ id = 'aidar', size = 32 }) {
  const person = PEOPLE[id] || PEOPLE.aidar;
  return <img className="qt-avatar" src={person.avatar} alt={person.name} style={{ width: size, height: size }} />;
}
function Badge({ count, label }) {
  return count > 0 ? <span className="qt-badge" aria-label={`${label}: ${count}`}>{count > 99 ? '99+' : count}</span> : null;
}
function AvatarStack({ replies }) {
  const ids = [...new Set(replies.map(r => r.author))].slice(-3);
  return <span className="qt-avatar-stack">{ids.map(id => <Avatar key={id} id={id} size={23} />)}</span>;
}

function ReplyFooter({ thread, onOpen }) {
  const replies = confirmedReplies(thread);
  return replies.length > 0 ? <button className="qt-replies" onClick={event => { event.stopPropagation(); onOpen(); }} aria-label={`Открыть ветку, ответов: ${replies.length}${thread.unread ? `, новых: ${thread.unread}` : ''}`}>
    <AvatarStack replies={replies} /><span>Ответов: {replies.length}</span><Badge count={thread.unread} label="Новых ответов" /><CaretRight size={18} />
  </button> : null;
}

function ThreadReference({ thread, onOpen }) {
  const label = rootLabel(thread);
  return <button className="qt-thread-reference" onClick={event => { event.stopPropagation(); onOpen(); }} aria-label={`Открыть ветку: ${label}`} title={label}>
    <Chats size={18} />
    <span><small>Ответ в ветке</small>{thread.rootDeleted ? <em className="qt-deleted-text">{label}</em> : <strong>{label}</strong>}</span>
    <CaretRight size={15} />
  </button>;
}

function RootBubble({ thread, footer, onOpen, onMenu, reactions, onReact }) {
  const mine = thread.author === ME;
  return <div className={`qt-root${thread.rootDeleted ? ' qt-root-deleted' : ''}`} data-testid="thread-root">
    <Message msg={{ id: thread.id, text: rootLabel(thread), time: '09:19' }} mine={mine} firstOfGroup lastOfGroup
      avatar={<Avatar id={thread.author} size={40} />} authorLabel={PEOPLE[thread.author].name}
      authorColor="var(--color-primary)" reactions={thread.rootDeleted ? undefined : reactions} onToggleReaction={thread.rootDeleted ? undefined : onReact}
      onLongPress={thread.rootDeleted ? undefined : (msg, rect, node) => onMenu(msg, rect, node, mine)}
      bubbleFooter={footer && confirmedReplies(thread).length > 0 ? <ReplyFooter thread={thread} onOpen={onOpen} /> : null} />
  </div>;
}

function DeliveryDialog({ reply, onClose, onRetry, onDelete, capture }) {
  const ref = useRef(null);
  useEffect(() => {
    if (capture) return undefined;
    const previous = document.activeElement;
    ref.current?.querySelector('button')?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [capture]);
  return <div className="cdlg-wrap"><button className="cdlg-scrim" aria-label="Закрыть ошибку" onClick={onClose} tabIndex={-1} /><section className="cdlg" role="dialog" aria-modal="true" aria-label="Сообщение не отправлено" ref={ref} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const buttons = [...ref.current.querySelectorAll('button')], first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }}><div className="cdlg-body"><WarningCircle size={32} className="qt-error-symbol" /><h3 className="cdlg-title">Сообщение не отправлено</h3><p className="cdlg-text">Не удалось подключиться к серверу. Проверьте интернет и попробуйте ещё раз.</p><blockquote className="qt-failed-text">{reply.text}</blockquote></div><div className="cdlg-actions"><button className="cdlg-btn" onClick={onRetry}>Отправить повторно</button><button className="cdlg-btn danger" onClick={onDelete}>Удалить сообщение</button><button className="cdlg-btn" onClick={onClose}>Отмена</button></div></section></div>;
}

// The same raised message, reaction picker and action panels as the live chat.
function ThreadMessageMenu({ sceneRef, thread, restricted, label, reactions, preview = false, target, onClose, onReact, onAction }) {
  const [source, setSource] = useState(null);
  useEffect(() => {
    if (target) { setSource(target); return; }
    const node = preview
      ? sceneRef.current?.querySelector(`[data-thread-id="${thread.id}"] .msg`)
      : sceneRef.current?.querySelector('.qt-root .msg') || sceneRef.current?.querySelector('.qt-messages .msg:last-of-type');
    if (node) setSource({ node, rect: (node.querySelector('.msg-col') || node).getBoundingClientRect() });
  }, [sceneRef, preview, thread.id, target]);
  if (!source) return null;
  const message = target?.msg || (preview ? confirmedReplies(thread).at(-1) : { id: thread.id, text: thread.title });
  return <MobileMessageMenu {...source} msg={message} mine={target?.mine ?? (preview && message.author === ME)}
    selected={Object.entries(reactions).find(([, people]) => people.some(p => p.id === ME))?.[0]}
    sourceClassName={preview ? 'qt-preview-message' : ''}
    actionItems={preview ? [
      { id: 'group', label: 'Перейти в группу ветки', Icon: Users },
      { id: 'forward', label: 'Переслать', Icon: PaperPlaneTilt },
      { id: 'select', label: 'Выбрать', Icon: Selection, divided: true },
    ] : undefined}
    extraItems={restricted ? [] : [{ id: 'thread', label, Icon: label === 'Просмотр ветки' ? Chats : ChatCircleDots }]}
    onClose={onClose} onReact={onReact} onAction={onAction} />;
}

function Sheet({ title, children, onClose, capture }) {
  const ref = useRef(null);
  useEffect(() => {
    if (capture) return undefined;
    const previous = document.activeElement;
    ref.current?.querySelector('button')?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [capture]);
  return <div className="qt-modal-layer"><button className="qt-scrim" aria-label="Закрыть окно" onClick={onClose} tabIndex={-1} /><section className="qt-sheet" ref={ref} role="dialog" aria-modal="true" aria-label={title} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key !== 'Tab') return;
    const items = [...ref.current.querySelectorAll('button:not([disabled]),input')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}><div className="qt-grabber" /><header className="qt-sheet-heading"><h2>{title}</h2><button aria-label="Закрыть" onClick={onClose}><X size={21} /></button></header>{children}</section></div>;
}

export default function ThreadScene({ scenario = 'chats', theme, capture = false, deliveryOutcome = 'sent' }) {
  const [threads, setThreads] = useState(() => initialThreads(scenario));
  const [active, setActive] = useState('memes');
  const [screen, setScreen] = useState(scenario === 'chats' ? 'chats' : LIST_CASES.includes(scenario) ? 'list' : GROUP_CASES.includes(scenario) ? 'group' : 'thread');
  const [origin, setOrigin] = useState('group');
  const [menu, setMenu] = useState(['create-menu', 'view-menu', 'direct-menu', 'bot-menu'].includes(scenario) ? 'message' : scenario === 'list-menu' ? 'list' : scenario === 'forward' ? 'forward' : scenario === 'send-error-dialog' ? 'delivery' : '');
  const [drafts, setDrafts] = useState({ 'thread:memes': ['compose', 'compose-group'].includes(scenario) ? DEFAULT_DRAFT : '' });
  const [showInGroup, setShowInGroup] = useState(scenario === 'compose-group');
  const [selection, setSelection] = useState(scenario === 'select' ? ['memes'] : null);
  const [listState, setListState] = useState(['loading', 'error'].includes(scenario) ? scenario : 'ready');
  const [failedId, setFailedId] = useState('demo-failed');
  const [notice, setNotice] = useState('');
  const [menuTarget, setMenuTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [messageReactions, setMessageReactions] = useState({ memes: { '🎉': [PEOPLE.arman], '👍': [PEOPLE.ayazhan] } });
  const bodyRef = useRef(null), sceneRef = useRef(null), sequence = useRef(0);
  const deliveryTimers = useRef(new Map());
  const listPress = useRef(null), listPressStart = useRef(null), suppressListClick = useRef(false);
  const thread = threads.find(t => t.id === active) || threads[0];
  const reactions = messageReactions[thread.id] || {};
  const menuMessageId = menu === 'list' ? confirmedReplies(thread).at(-1)?.id : menuTarget?.msg.id || thread.id;
  const draftKey = `${screen === 'thread' ? 'thread' : 'channel'}:${thread.id}`;
  const draft = drafts[draftKey] || '';
  const setDraft = value => setDrafts(values => ({ ...values, [draftKey]: value }));
  const isGroup = screen === 'group', isThread = screen === 'thread';
  const restricted = !canThread(thread.channelType);
  const list = myThreads(threads);
  const totalUnread = unreadThreads(threads);
  const latest = list[0], latestReply = latest ? confirmedReplies(latest).at(-1) : null;
  const failedReply = thread.replies.find(r => r.id === failedId && r.status === 'failed');
  const latestPreview = latestReply ? `${latestReply.author === ME ? 'Вы' : PEOPLE[latestReply.author].name.split(' ')[0]}: ${latestReply.text}` : 'Ваши обсуждения из всех групп';
  const deletingRoot = menuMessageId === thread.id;
  const closingOnDelete = !deletingRoot && thread.rootDeleted && confirmedReplies(thread).length === 1 && confirmedReplies(thread)[0].id === menuMessageId;

  useEffect(() => { if (!notice) return undefined; const timer = setTimeout(() => setNotice(''), 2800); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => () => { clearTimeout(listPress.current); deliveryTimers.current.forEach(clearTimeout); }, []);
  useEffect(() => {
    if (scenario !== 'sending' || capture) return undefined;
    const timer = setTimeout(() => setThreads(items => items.map(t => t.id === 'memes' ? setReplyStatus(t, 'demo-pending', 'sent') : t)), 1400);
    return () => clearTimeout(timer);
  }, [scenario, capture]);
  useEffect(() => { if (!menu) suppressListClick.current = false; }, [menu]);
  useEffect(() => { if (isThread) bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'instant' }); }, [isThread, thread.replies.length]);
  useEffect(() => {
    if (capture) return undefined;
    const el = sceneRef.current;
    const onKey = event => { if (event.key === 'Escape') { setMenu(''); } };
    el?.addEventListener('keydown', onKey);
    return () => el?.removeEventListener('keydown', onKey);
  }, [capture]);

  function openThread(id = thread.id) {
    if (!threads.some(t => t.id === id && t.status !== 'closed')) return;
    setOrigin(screen === 'list' ? 'list' : 'group'); setActive(id); setScreen('thread'); setMenu('');
    setThreads(items => items.map(t => t.id === id ? markRead(t) : t));
  }
  function openGroup(id = thread.id) { setActive(id); setScreen('group'); setMenu(''); setSelection(null); }
  function back() {
    setMenu('');
    if (screen === 'thread') setScreen(origin);
    else { setScreen('chats'); setSelection(null); }
  }
  function completeDelivery(threadId, id, outcome = 'sent') {
    const timers = deliveryTimers.current;
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => {
      setThreads(items => items.map(t => t.id === threadId ? setReplyStatus(t, id, outcome) : t));
      timers.delete(id);
    }, 1200));
  }
  function send() {
    if (!draft.trim() || thread.status === 'closed') return;
    const id = `local-${++sequence.current}`;
    setThreads(items => items.map(t => t.id === active ? addReply(t, { id, text: draft, showInChannel: showInGroup, status: 'sending' }) : t));
    setDraft(''); setShowInGroup(false);
    completeDelivery(active, id, deliveryOutcome);
  }
  function retryFailed() {
    if (!failedReply) return;
    const id = failedReply.id;
    setThreads(items => items.map(t => t.id === active ? setReplyStatus(t, id, 'sending') : t));
    setMenu(''); completeDelivery(active, id);
  }
  function deleteFailed() {
    setThreads(items => items.map(t => t.id === active ? deleteFailedReply(t, failedId) : t));
    setMenu('');
  }
  function confirmDelete() {
    const messageId = menuMessageId;
    setThreads(items => items.map(item => item.id === thread.id ? deleteThreadMessage(item, messageId) : item));
    setMenu('');
    setMenuTarget(null);
  }
  useEffect(() => {
    if (isThread && thread.status === 'closed') {
      setScreen(origin);
      setShowInGroup(false);
      setNotice('Ветка закрыта');
    }
  }, [isThread, thread.status, origin]);
  function toggleReaction(emoji, messageId = thread.id) {
    setMessageReactions(current => {
      const groups = current[messageId] || {}, users = groups[emoji] || [];
      return { ...current, [messageId]: { ...groups, [emoji]: users.some(p => p.id === ME) ? users.filter(p => p.id !== ME) : [...users, PEOPLE.me] } };
    });
    setMenu('');
  }
  function openMessageMenu(msg, rect, node, mine = false) {
    setMenuTarget({ msg, rect, node, mine }); setMenu('message');
  }
  function chatPreview(item) {
    if (!item.group) return item.text;
    const discussion = threads.find(entry => entry.id === (item.id || 'memes'));
    if (!discussion || (!discussion.rootDeleted && !discussion.pastParticipants?.length)) return item.text;
    const last = channelReplies(discussion).at(-1);
    return last ? `${last.author === ME ? 'Вы' : PEOPLE[last.author].name}: ${last.text}` : rootLabel(discussion);
  }
  function toggleSelection(id) { setSelection(current => current?.includes(id) ? current.filter(i => i !== id) : [...(current || []), id]); }
  const threadMenuLabel = confirmedReplies(thread).length ? 'Просмотр ветки' : 'Ответить в ветке';

  const headerTitle = screen === 'chats' ? 'Чаты' : screen === 'list' ? (selection ? `Выбрано: ${selection.length}` : 'Ветки') : isThread ? `Ветка: ${rootLabel(thread)}` : restricted ? thread.channelType === 'bot' ? 'Ергиз · ассистент' : 'Аяжан Даркеева' : thread.group;
  const headerSubtitle = isThread ? thread.group : isGroup ? restricted ? 'в сети' : thread.channelType === 'private_group' ? 'Закрытая группа · 12 участников' : '99 участников' : null;
  return <div ref={sceneRef} className="qt-phone" data-theme={theme} data-state={scenario} data-capture={capture || undefined} data-testid="thread-phone">
    <div className="qt-screen" inert={menu ? true : undefined} aria-hidden={menu ? true : undefined}>
      {screen === 'chats' ? <TopBar title="Чаты" actions={<><button className="topbar-btn topbar-btn--muted" aria-label="Выбрать чаты" onClick={() => setNotice('Для выбора веток откройте список «Ветки»')}><PencilSimple size={21} weight="fill" /></button><button className="topbar-btn primary" aria-label="Новый чат" onClick={() => setNotice('Демо посвящено обсуждениям в существующих группах')}><Plus size={24} /></button></>} /> : <header className="cr-header">
        <button className="cr-back" aria-label="Назад" onClick={back}><CaretLeft size={24} /></button>
        {isGroup && <span className={`cr-avatar ${thread.channelType === 'bot' ? 'cr-avatar--bot' : ''}`}>{thread.channelType === 'bot' ? <ErgizAvatar size={40} /> : <img src={restricted ? PEOPLE.ayazhan.avatar : '/img/chats/bts-pr.png'} alt="" />}</span>}
        <div className="cr-title-wrap"><h1 className="cr-title" title={headerTitle}>{headerTitle}</h1>{headerSubtitle && <button className="cr-subtitle qt-header-subtitle" title={headerSubtitle} onClick={() => isThread ? openGroup() : setMenu('group-info')}>{headerSubtitle}</button>}</div>
        {isGroup || isThread ? <button className="cr-walkie" aria-label={isGroup && !restricted ? 'Рация' : `Позвонить в ${restricted ? headerTitle : thread.group}`} onClick={() => setMenu('call')}>{isGroup && !restricted ? <img src="/img/chats/walkie.svg" alt="" width="20" height="20" /> : <Phone size={20} />}</button> : selection ? <button className="qt-cancel" onClick={() => setSelection(null)}>Отмена</button> : null}
      </header>}

      {screen === 'chats' && <>
        <label className="qt-search"><MagnifyingGlass size={18} /><input placeholder="Поиск" aria-label="Поиск чатов" value={search} onChange={e => setSearch(e.target.value)} /></label>
        <div className="qt-chat-list">
          {!search && <button className="qt-chat-row qt-pinned" onClick={() => { setScreen('list'); setListState('ready'); }}><span className="qt-system-avatar"><ChatCircleDots size={29} weight="fill" /></span><span className="qt-chat-copy"><strong>Ветки <PushPin size={12} weight="fill" /></strong><span>{latestPreview}</span></span><span className="qt-row-end"><time>{latestReply?.time}</time><Badge count={totalUnread} label="Непрочитанных веток" /></span></button>}
          {!search && <div className="qt-chat-row"><span className="qt-system-avatar qt-system-muted"><Bell size={27} weight="fill" /></span><span className="qt-chat-copy"><strong>Уведомления</strong><span>Все рабочие события в одном месте</span></span><time>12:38</time></div>}
          {[{ title: GROUP, avatar: '/img/chats/bts-pr.png', text: 'Арман: Зажми сообщение и выбери...', group: true }, { title: 'Дизайн-команда', avatar: '/img/chats/qollab-group.png', text: 'Аяжан: Можно передавать в разработку', id: 'design', group: true }, { title: 'Qollab · Продукт', avatar: '/img/chats/qollab-group.png', text: 'План релиза на пятницу', id: 'release', group: true }, { title: 'Аяжан Даркеева', avatar: PEOPLE.ayazhan.avatar, text: 'Спасибо, посмотрю сегодня' }, { title: 'Арман А.', avatar: PEOPLE.arman.avatar, text: 'Да, всё готово 👌' }, { title: 'Айдар Султабек', avatar: PEOPLE.aidar.avatar, text: 'Договорились!' }].filter(item => item.title.toLowerCase().includes(search.toLowerCase())).map((item, i) => <button className="qt-chat-row" key={item.title} onClick={() => item.group ? openGroup(item.id || 'memes') : setNotice('Личные чаты не поддерживают ветки')}><img className="qt-list-avatar" src={item.avatar} alt="" /><span className="qt-chat-copy"><strong>{item.title}</strong><span>{chatPreview(item)}</span></span><span className="qt-row-end"><time>{['12:48', '09:42', 'Вчера', '11:32', '10:20', 'Вчера'][i]}</time>{i === 0 && <span className="qt-muted-count">3</span>}</span></button>)}
          {search && ![GROUP, 'Дизайн-команда', 'Qollab · Продукт', 'Аяжан Даркеева', 'Арман А.', 'Айдар Султабек'].some(name => name.toLowerCase().includes(search.toLowerCase())) && <p className="qt-no-results">Чаты не найдены</p>}
        </div>
        <nav className="bottomnav" aria-label="Разделы приложения"><div className="bottomnav-row qt-nav-row"><span className="navtab-pill qt-nav-pill" aria-hidden="true" />{[['home', 'Главная'], ['news', 'Лента'], ['grid', 'Сервисы'], ['chat', 'Чаты'], ['person', 'Профиль']].map(([icon, label]) => <button key={label} className={`navtab ${label === 'Чаты' ? 'active' : ''}`} onClick={() => label === 'Чаты' ? setSearch('') : setNotice('Демо посвящено веткам в чатах')}><span className="navtab-icon-wrap"><NavIcon name={icon} active={label === 'Чаты'} />{label === 'Чаты' && <span className="navtab-badge">3</span>}</span><span className="navtab-label">{label}</span></button>)}</div></nav>
      </>}

      {screen === 'list' && <>
        {listState === 'loading' ? <ThreadsSkeleton /> : listState === 'error' ? <div className="qt-empty"><span className="qt-empty-icon"><WarningCircle size={34} /></span><h2>Не удалось загрузить ветки</h2><p>Проверьте подключение и попробуйте ещё раз.</p><button className="qt-primary" onClick={() => setListState('ready')}>Повторить</button></div> : list.length === 0 ? <div className="qt-empty"><span className="qt-empty-icon"><ChatCircleDots size={38} /></span><h2>Пока нет веток</h2><p>Здесь появятся обсуждения, в которых вы ответили, вас упомянули или ответили на ваше сообщение.</p><button className="qt-primary" onClick={() => setScreen('chats')}>Перейти к чатам</button></div> : <div className="qt-list-body">{list.map(t => <article className={`qt-thread-preview ${t.unread ? 'is-unread' : ''} ${selection?.includes(t.id) ? 'is-selected' : ''}`} key={t.id} data-thread-id={t.id} onContextMenu={e => { e.preventDefault(); setActive(t.id); setMenu('list'); }}
          onPointerDown={e => { if (selection || e.target.closest('input,.rx-pill')) return; listPressStart.current = [e.clientX, e.clientY]; listPress.current = setTimeout(() => { suppressListClick.current = true; setActive(t.id); setMenu('list'); }, 450); }}
          onPointerUp={() => clearTimeout(listPress.current)} onPointerCancel={() => clearTimeout(listPress.current)} onPointerLeave={() => clearTimeout(listPress.current)}
          onPointerMove={e => { if (listPressStart.current && Math.hypot(e.clientX - listPressStart.current[0], e.clientY - listPressStart.current[1]) > 10) clearTimeout(listPress.current); }}
          onClickCapture={e => { if (suppressListClick.current) { e.preventDefault(); e.stopPropagation(); suppressListClick.current = false; } }}>
          <div className="qt-preview-source">{selection && <input type="checkbox" aria-label={`Выбрать ${rootLabel(t)}`} checked={selection.includes(t.id)} onChange={() => toggleSelection(t.id)} />}<span>{t.group}</span></div>
          <div className="qt-preview-message" role="group" aria-label={`Ветка ${rootLabel(t)}`} onClick={event => { if (!event.target.closest('.rx-pill')) { if (selection) toggleSelection(t.id); else openThread(t.id); } }}>
            <Message msg={{ ...confirmedReplies(t).at(-1), status: 'delivered' }} mine={confirmedReplies(t).at(-1)?.author === ME} firstOfGroup lastOfGroup
              reactions={messageReactions[confirmedReplies(t).at(-1)?.id]} onToggleReaction={emoji => toggleReaction(emoji, confirmedReplies(t).at(-1)?.id)}
              authorLabel={PEOPLE[confirmedReplies(t).at(-1)?.author]?.name} authorColor="var(--color-primary)" avatar={<Avatar id={confirmedReplies(t).at(-1)?.author} size={40} />}
              bubbleHeader={<ThreadReference thread={t} onOpen={() => selection ? toggleSelection(t.id) : openThread(t.id)} />}
              bubbleFooter={<ReplyFooter thread={t} onOpen={() => selection ? toggleSelection(t.id) : openThread(t.id)} />} />
          </div>
        </article>)}</div>}
        {selection && <div className="qt-selection-bar"><button className="qt-primary" disabled={!selection.length} onClick={() => { setMenu('forward'); }}><PaperPlaneTilt size={18} />Переслать{selection.length ? ` · ${selection.length}` : ''}</button></div>}
      </>}

      {(isGroup || isThread) && <>
        <div className={`qt-messages ${isThread ? 'qt-messages-thread' : ''}`} ref={bodyRef}>
          <div className="qt-message-flow"><span className="qt-date">Сегодня</span>
            {isGroup && <><Message msg={{ id: 'hello', text: 'Коллеги, всем привет! 👋', time: '09:10' }} firstOfGroup lastOfGroup authorLabel="Аяжан Д." authorColor="var(--color-primary)" avatar={<Avatar id="ayazhan" size={40} />} /><Message msg={{ id: 'hello-me', text: 'Привет! Как проходит день?', time: '09:12' }} mine firstOfGroup lastOfGroup /></>}
            {restricted ? <Message msg={{ id: 'dm-msg', text: thread.channelType === 'bot' ? 'Чем могу помочь сегодня?' : 'Привет! Пришли, пожалуйста, новые макеты.', time: '09:19' }} firstOfGroup lastOfGroup onLongPress={openMessageMenu} /> : <RootBubble thread={thread} footer={isGroup} onOpen={() => openThread()} onMenu={openMessageMenu} reactions={reactions} onReact={toggleReaction} />}
            {isThread && <div className="qt-discussion-start"><span />Начало обсуждения<span /></div>}
            {(isThread ? thread.replies : channelReplies(thread)).map(reply => <div className={`qt-reply-wrap ${reply.author === ME ? 'mine' : ''} ${reply.status === 'failed' ? 'is-failed' : ''}`} key={reply.id}>
              <Message msg={{ ...reply, status: reply.status || 'delivered' }} mine={reply.author === ME}
                reactions={messageReactions[reply.id]} onToggleReaction={emoji => toggleReaction(emoji, reply.id)} onLongPress={(msg, rect, node) => openMessageMenu(msg, rect, node, reply.author === ME)} firstOfGroup lastOfGroup authorLabel={PEOPLE[reply.author].name} authorColor="var(--color-primary)" avatar={<Avatar id={reply.author} size={40} />}
                bubbleHeader={isGroup ? <ThreadReference thread={thread} onOpen={() => openThread()} /> : reply.author === ME && reply.showInChannel && reply.status !== 'sending' && reply.status !== 'failed' ? <button className="qt-posted-context" onClick={() => openGroup()}><ArrowUpRight size={14} />Также отправлено в группу</button> : null} />
              {reply.status === 'failed' && <button className="qt-send-failed" aria-label="Не отправлено. Открыть действия" onClick={() => { setFailedId(reply.id); setMenu('delivery'); }}><WarningCircle size={25} weight="fill" /></button>}
            </div>)}
            {isThread && thread.replies.length === 0 && <p className="qt-first-answer">Напишите первый ответ в этой ветке</p>}
          </div>
        </div>
        <div className="qt-compose">
          {isThread && <label className="qt-send-group"><ArrowUpRight size={16} /><span>Отправить в группу: <b title={thread.group}>{thread.group}</b></span><input type="checkbox" aria-label={`Отправить в группу: ${thread.group}`} checked={showInGroup} onChange={e => setShowInGroup(e.target.checked)} /></label>}
          <div className="cr-writebar"><button className="cr-write-btn" aria-label="Прикрепить" onClick={() => setMenu('attach')}><Plus size={24} /></button><div className="cr-input"><ComposeInput value={draft} onChange={setDraft} placeholder={isThread ? 'Ответить в ветке…' : 'Сообщение…'} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (isThread) send(); else setNotice('Откройте ветку, чтобы отправить ответ'); } }} /></div>{draft.trim() ? <button className="cr-write-btn cr-send" aria-label="Отправить ответ" onClick={() => isThread ? send() : setNotice('Откройте ветку, чтобы отправить ответ')}><PaperPlaneRight size={23} weight="fill" color="#fff" /></button> : <button className="cr-write-btn" aria-label="Голосовое сообщение" onClick={() => setNotice('В этом демо отправляем текстовые ответы')}><Microphone size={24} /></button>}</div>
        </div>
      </>}
    </div>

    {menu === 'message' && <ThreadMessageMenu sceneRef={sceneRef} thread={thread} restricted={restricted} label={isThread ? 'Просмотр ветки' : threadMenuLabel} target={menuTarget} reactions={messageReactions[menuMessageId] || {}} onClose={() => setMenu('')} onReact={emoji => toggleReaction(emoji, menuMessageId)} onAction={action => {
      if (action === 'thread') { if (isThread) setMenu(''); else openThread(); }
      else if (action === 'forward') { setMenu('forward'); }
      else if (action === 'delete' && !restricted) { setMenu('delete-message'); }
      else if (action === 'copy') { navigator.clipboard?.writeText(menuTarget?.msg.text || thread.title).then(() => setNotice('Текст скопирован')).catch(() => setNotice('Копирование недоступно')); setMenu(''); }
      else { setMenu(''); setNotice('Обычное действие с сообщением · демо'); }
    }} />}
    {menu === 'delete-message' && <ConfirmDialog title="Удалить сообщение?" danger
      text={deletingRoot && confirmedReplies(thread).length > 0
        ? 'Вместо сообщения появится отметка об удалении. Ответы останутся в ветке.'
        : closingOnDelete ? 'Это последний ответ. После его удаления ветка закроется.' : 'Сообщение будет удалено у всех участников.'}
      confirmLabel="Удалить" onCancel={() => setMenu('')} onConfirm={confirmDelete} />}
    {menu === 'delivery' && failedReply && <DeliveryDialog reply={failedReply} onClose={() => setMenu('')} onRetry={retryFailed} onDelete={deleteFailed} capture={capture} />}
    {menu === 'list' && <ThreadMessageMenu sceneRef={sceneRef} thread={thread} preview reactions={messageReactions[menuMessageId] || {}} onClose={() => setMenu('')} onReact={emoji => toggleReaction(emoji, menuMessageId)} onAction={action => {
      if (action === 'group') openGroup();
      else if (action === 'forward') setMenu('forward');
      else if (action === 'select') { setSelection([thread.id]); setMenu(''); }
    }} />}
    {menu === 'forward' && <ForwardSheet onClose={() => setMenu('')} onPick={chat => {
      setMenu(''); setSelection(null); setNotice(`Переслано: ${chat.name}`);
    }} />}
    {['attach', 'group-info', 'call'].includes(menu) && <Sheet title={menu === 'attach' ? 'Вложение' : menu === 'group-info' ? 'Группа' : 'Звонок в группу'} onClose={() => setMenu('')} capture={capture}>
      {menu === 'attach' && <div className="qt-sheet-copy"><FileText size={32} /><h3>Вложения в ответах</h3><p>Ветка использует обычное меню вложений чата. Здесь показан основной сценарий с текстовым ответом.</p><button className="qt-primary" onClick={() => { setDraft('📎 Макеты готовы, приложу файл к ответу.'); setMenu(''); }}>Показать пример ответа</button></div>}
      {menu === 'group-info' && <div className="qt-sheet-copy"><Users size={36} /><h3>{thread.group}</h3><p>{thread.channelType === 'private_group' ? 'Закрытая группа' : 'Открытая группа'} · обсуждения доступны всем участникам группы.</p><button className="qt-primary" onClick={() => setMenu('')}>Готово</button></div>}
      {menu === 'call' && <div className="qt-sheet-copy"><Phone size={36} /><h3>{restricted ? headerTitle : thread.group}</h3><p>Звонок участникам родительской группы. Ветка не создаёт отдельный звонок.</p><button className="qt-primary" onClick={() => { setMenu(''); setNotice('Переход к звонку группы · локальное демо'); }}>Показать переход к звонку</button></div>}
    </Sheet>}
    {notice && <div className="qt-toast" role="status">{notice}</div>}
  </div>;
}
