import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CaretLeft, Plus, Microphone, PaperPlaneRight, MagnifyingGlass, PencilSimple, ChatCircle, Newspaper, Users, CalendarBlank, ArrowRight, ArrowCounterClockwise, Monitor, DeviceMobile, Sun, Moon } from '@phosphor-icons/react';
import Message from '../../components/Message';
import ComposeInput from '../../components/ComposeInput';
import EmojiPicker from './EmojiPicker';
import ReviewMessageMenu from './ReviewMessageMenu';
import '../../screens/ChatRoom.css';
import './ReactionPickerReview.css';

const scenarios = [
  { id: 'quick', title: 'Быстрая капсула', note: 'Текущие 6 реакций и «+»', description: 'Нажми «+», чтобы открыть все реакции. Размеры кнопок и порядок быстрых эмодзи сохранены.' },
  { id: 'full', title: 'Все реакции', note: 'Сетка, поиск и 9 категорий', description: 'Выбери категорию или найди эмодзи по названию. Нажатие добавляет реакцию и закрывает пикер.' },
  { id: 'selected', title: 'Уже выбрано', note: 'Реакция вне быстрых шести', description: 'Ракета выделена круглой подложкой. Повторное нажатие снимает её; другой эмодзи заменяет текущую реакцию.' },
  { id: 'search', title: 'Поиск', note: 'Результаты во всех категориях', description: 'Поиск работает по русским и английским названиям, а также по самому эмодзи. «×» очищает запрос.' },
  { id: 'empty', title: 'Ничего не найдено', note: 'Пустой результат поиска', description: 'Можно очистить запрос или сразу перейти в категорию. Закрытие пикера не меняет реакцию.' },
  { id: 'result', title: 'Реакция в сообщении', note: 'Результат выбора', description: 'Новый эмодзи виден под сообщением. Открой пикер снова: выбранная реакция остаётся отмеченной.' },
];
const target = { id: 3, text: 'Коллеги, макеты готовы. Посмотрите, пожалуйста, когда будет время.', time: '11:20' };
const messages = [
  { id: 1, text: 'Всем привет! Как продвигаются макеты?', time: '11:15' },
  { id: 2, mine: true, text: 'Привет! Заканчиваем последние правки 👌', time: '11:18', status: 'read' },
  target,
  { id: 4, mine: true, text: 'Спасибо! Посмотрю до обеда.', time: '11:21', status: 'read' },
];
const me = { id: 'me', initials: 'Я' };
const ayazhan = { id: 'ayazhan', avatar: '/img/chats/ayazhan.png' };

function Scene({ scenario, platform, capture = false }) {
  const [selections, setSelections] = useState(['selected', 'result'].includes(scenario) ? { [target.id]: '🚀' } : {});
  const [mode, setMode] = useState(scenario === 'result' ? 'chat' : scenario === 'quick' ? 'quick' : 'full');
  const [menu, setMenu] = useState(null);
  const [pickerClosing, setPickerClosing] = useState(false);
  const pendingChoice = useRef(null);
  const selected = selections[menu?.msg.id || target.id] || null;
  const [notice, setNotice] = useState('');
  const [input, setInput] = useState('');
  const stage = useRef(null);
  const targetRef = useRef(null);
  const [anchor, setAnchor] = useState({ left: 16, top: 150 });
  const open = (msg, rect, node, pointer) => { setMenu({ msg, rect, node, pointer }); setMode('quick'); };
  const measure = () => {
    const node = targetRef.current?.querySelector('.msg');
    const col = node?.querySelector('.msg-col');
    if (!col || !stage.current) return;
    const rect = col.getBoundingClientRect();
    const bounds = stage.current.getBoundingClientRect();
    setMenu({ msg: target, rect, node, pointer: { x: rect.left - bounds.left + 60, y: rect.top - bounds.top + 28 } });
    setAnchor({ left: Math.min(bounds.width - 392, Math.max(16, rect.left - bounds.left)), top: Math.max(16, Math.min(bounds.height - 492, rect.bottom - bounds.top + 10)) });
  };
  useLayoutEffect(() => { measure(); }, []);
  useEffect(() => {
    if (mode === 'chat') return;
    const escape = event => { if (event.key === 'Escape') { if (mode === 'full') setPickerClosing(true); else { setMode('chat'); setMenu(null); } } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [mode]);
  useEffect(() => {
    if (!pickerClosing) return;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : platform === 'mobile' ? 260 : 180;
    const timer = setTimeout(() => {
      setMode('chat'); setMenu(null); setPickerClosing(false);
      pendingChoice.current?.(); pendingChoice.current = null;
    }, duration);
    return () => clearTimeout(timer);
  }, [pickerClosing, platform]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(timer);
  }, [notice]);
  const choose = (emoji, id = menu?.msg.id || target.id) => {
    if (pickerClosing) return;
    const removed = selections[id] === emoji;
    const commit = () => { setSelections(value => ({ ...value, [id]: removed ? null : emoji })); setNotice(removed ? 'Реакция убрана' : `Реакция ${emoji} добавлена`); };
    if (mode === 'full') { pendingChoice.current = commit; setPickerClosing(true); }
    else { commit(); setMode('chat'); setMenu(null); }
  };
  const close = () => { if (mode === 'full') setPickerClosing(true); else { setMode('chat'); setMenu(null); } };
  const send = () => { if (input.trim()) { setInput(''); setNotice('Демо отправки сообщения'); } };
  const reactionGroups = id => { const emoji = selections[id]; return { ...(id === target.id ? { '👍': [ayazhan] } : {}), ...(emoji ? { [emoji]: id === target.id && emoji === '👍' ? [ayazhan, me] : [me] } : {}) }; };
  const expand = () => {
    if (platform === 'web' && stage.current && menu) {
      const bounds = stage.current.getBoundingClientRect();
      setAnchor({ left: Math.max(12, Math.min(bounds.width - 388, (menu.pointer?.x || 16) + 8)), top: Math.max(12, Math.min(bounds.height - 488, (menu.pointer?.y || 16) + 8)) });
    }
    setMode('full');
  };
  const conversation = <section className="chatroom rp-conversation" ref={stage}>
    <header className="cr-header">
      {platform === 'mobile' && <button className="cr-back" aria-label="Назад" onClick={() => { close(); setNotice('Демо чата для ревью'); }}><CaretLeft size={24} /></button>}
      <button className="cr-headline" aria-label="Профиль группы" onClick={() => setNotice('Демо профиля группы')}>
        <span className="cr-avatar"><img src="/img/chats/bts-pr.png" alt="" /></span>
        <span className="cr-title-wrap"><span className="cr-title">PR01DEV + ROBOTS</span><span className="cr-subtitle">73 участника</span></span>
      </button>
      <button className="cr-walkie" aria-label="Рация" onClick={() => setNotice('Демо рации')}><img src="/img/chats/walkie.svg" alt="" width="20" height="20" /></button>
    </header>
    <div className="cr-body" inert={mode !== 'chat' ? true : undefined}>
      <div className="cr-messages rp-messages"><section className="cr-day-section">
      <div className="cr-day">Сегодня</div>
      {messages.map(msg => <div key={msg.id} ref={msg.id === target.id ? targetRef : undefined} data-message-id={msg.id} data-lifted={platform === 'mobile' && mode === 'quick' && menu?.msg.id === msg.id ? 'yes' : undefined} onContextMenu={platform === 'web' ? event => { event.preventDefault(); const node = event.currentTarget.querySelector('.msg'); const rect = node.querySelector('.msg-bubble, .msg-document').getBoundingClientRect(); const bounds = stage.current.getBoundingClientRect(); open(msg, rect, node, { x: event.clientX - bounds.left, y: event.clientY - bounds.top }); } : undefined}>
        <Message msg={msg} mine={msg.mine} firstOfGroup lastOfGroup withAvatarSlot authorLabel={msg.mine ? undefined : 'Арман А.'} authorColor="#1677ff" avatar={<span className="msg-avatar msg-avatar--initials tint-blue">АА</span>}
          reactions={reactionGroups(msg.id)} onToggleReaction={emoji => choose(emoji, msg.id)}
          onLongPress={platform === 'mobile' ? open : undefined} />
      </div>)}
      </section></div>
    </div>
    <div className="cr-writebar" inert={mode !== 'chat' ? true : undefined}>
      <button className="cr-write-btn" aria-label="Вложение" onClick={() => setNotice('Демо вложения')}><Plus size={24} color="var(--color-text)" /></button>
      <div className="cr-input"><ComposeInput value={input} onChange={setInput} placeholder="Сообщение…" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} /></div>
      {input.trim() ? <button className="cr-write-btn cr-send" aria-label="Отправить" onClick={send}><PaperPlaneRight size={22} weight="fill" color="white" /></button> : <button className="cr-write-btn" aria-label="Голосовое" onClick={() => setNotice('Демо голосового сообщения')}><Microphone size={24} color="var(--color-text)" /></button>}
    </div>
    {notice && <div className="rp-toast" role="status">{notice}</div>}
    {mode === 'quick' && menu && <ReviewMessageMenu {...menu} key={`${menu.msg.id}-${menu.pointer?.x}-${menu.pointer?.y}`} platform={platform} mine={!!menu.msg.mine} selected={selected} onClose={close} onReact={choose} onExpand={expand} onAction={() => { close(); setNotice('Демо меню сообщения'); }} />}
    {mode === 'full' && <>
      <button className={`rp-picker-scrim ${pickerClosing ? 'is-closing' : ''}`} aria-label="Закрыть все реакции" onClick={close} />
      <div className="rp-picker-position" style={platform === 'web' ? anchor : undefined}>
        <EmojiPicker autoFocus={!capture} selected={selected} onSelect={emoji => choose(emoji)} messageText={menu?.msg.text || target.text} onClose={close} onMove={setAnchor} closing={pickerClosing} platform={platform} initialQuery={scenario === 'search' ? 'сердце' : scenario === 'empty' ? 'абракадабра' : ''} initialCategory={scenario === 'selected' ? 'travel' : 'faces'} />
      </div>
    </>}
  </section>;

  return <div className={`rp-stage rp-${platform}`} data-testid="reaction-picker-stage">
    {platform === 'mobile' ? conversation : <>
      <header className="rp-web-top"><img src="/img/common/qollab-logo.svg" alt="qollab" /><span><MagnifyingGlass size={16} /> Найти: сотрудника, канал, пост, мероприятие</span><ChatCircle size={20} /><div className="rp-web-user">РЖ</div></header>
      <nav className="rp-web-nav"><small>Главная</small>{[[Newspaper, 'Публикации'], [ChatCircle, 'Чаты'], [Users, 'Орг. структура'], [CalendarBlank, 'Мероприятия']].map(([Icon, title]) => <div key={title} className={title === 'Чаты' ? 'active' : ''}><Icon size={18} />{title}</div>)}<small>Сервисы</small><div><CalendarBlank size={18} />Мой календарь</div></nav>
      <div className="rp-web-main"><aside className="rp-web-chats"><h2>Чаты <PencilSimple size={18} /><Plus size={20} /></h2><div className="rp-web-search"><MagnifyingGlass size={18} />Поиск</div>{[['bts-pr.png', 'PR01DEV + ROBOTS', 'Арман А.: Макеты готовы'], ['ayazhan.png', 'Аяжан Даркеева', 'Окей, спасибо!'], ['daniyar.png', 'Данияр Кульманов', 'Посмотрю до обеда']].map(([avatar, title, text], i) => <div key={title} className={`rp-web-chat ${i === 0 ? 'active' : ''}`}><img src={`/img/chats/${avatar}`} alt="" /><span><strong>{title}</strong><small>{text}</small></span></div>)}</aside><div className="rp-web-room">{conversation}</div></div>
    </>}
  </div>;
}

export default function ReactionPickerReview() {
  const params = new URLSearchParams(window.location.search);
  const [platform, setPlatform] = useState(params.get('platform') === 'web' ? 'web' : 'mobile');
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [scenario, setScenario] = useState(scenarios.some(item => item.id === params.get('state')) ? params.get('state') : 'quick');
  const [revision, setRevision] = useState(0);
  const board = params.get('view') === 'figma';
  const current = scenarios.find(item => item.id === scenario);
  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme;
    const title = document.title;
    document.documentElement.classList.add('reaction-picker-review');
    document.title = 'QM-2591 · Пикер реакций · Qollab';
    return () => { document.documentElement.classList.remove('reaction-picker-review'); document.documentElement.dataset.theme = previousTheme; document.title = title; };
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (board) return;
    const query = new URLSearchParams({ platform, theme, state: scenario });
    window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
  }, [platform, theme, scenario, board]);
  if (board) return <main className={`rp-figma-board rp-figma-board--${platform}`}>
    <h1>QM-2591 · {platform === 'mobile' ? 'Мобильные реакции · 402 × 820' : 'Веб · панели реакций'}</h1>
    {(platform === 'mobile' ? ['light', 'dark'] : ['light']).map(boardTheme => <section key={boardTheme} className="rp-figma-row">
      <h2>{boardTheme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</h2>
      <div className="rp-figma-grid">{scenarios.map((item, i) => <article key={item.id}>
        <h3>{`0${i + 1} · ${item.title}`}</h3>
        <div className="rp-board-frame ru-board-frame rp-review" data-theme={boardTheme} data-state={item.id}>
          <Scene scenario={item.id} platform={platform} capture />
        </div>
      </article>)}</div>
    </section>)}
  </main>;
  return <main className={`rp-review rp-review--${platform}`}>
    <header className="rp-review-header"><div className="rp-brand"><img src="/img/common/qollab-logo.svg" alt="Qollab" /><span>QM-2591</span><small>На согласование</small></div><h1>Больше реакций</h1><p>Расширяем существующий пикер в чатах Qollab</p></header>
    <div className="rp-toolbar"><div className="rp-segment" aria-label="Платформа">{[['mobile', DeviceMobile, 'Мобильная'], ['web', Monitor, 'Веб']].map(([id, Icon, title]) => <button key={id} aria-pressed={platform === id} onClick={() => setPlatform(id)}><Icon size={18} />{title}</button>)}</div><div className="rp-segment" aria-label="Тема">{[['light', Sun, 'Светлая'], ['dark', Moon, 'Тёмная']].map(([id, Icon, title]) => <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}><Icon size={18} />{title}</button>)}</div><button className="rp-reset" onClick={() => setRevision(value => value + 1)}><ArrowCounterClockwise size={17} />Сбросить</button></div>
    <div className="rp-scenarios" aria-label="Состояния пикера">{scenarios.map((item, index) => <button key={item.id} aria-pressed={scenario === item.id} onClick={() => { setScenario(item.id); setRevision(value => value + 1); }}><small>0{index + 1}</small><strong>{item.title}</strong><span>{item.note}</span></button>)}</div>
    <div className="rp-preview-caption"><span>{platform === 'mobile' ? 'Мобильный экран · 402 × 820' : 'Веб · 1120 × 700'}</span><span>{current.title}</span></div>
    <Scene key={`${platform}-${scenario}-${revision}`} scenario={scenario} platform={platform} />
    <div className="rp-review-description"><ArrowRight size={18} /><p>{current.description}</p></div>
    <footer className="rp-review-footer"><span>{platform === 'mobile' ? 'Удерживай любое сообщение, чтобы открыть меню' : 'Правая кнопка мыши по сообщению — меню у курсора'} · Esc закрывает пикер</span><a href="https://jira2.erg.kz/browse/QM-2591" target="_blank" rel="noreferrer">Задача в Jira ↗</a></footer>
  </main>;
}
