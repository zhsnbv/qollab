import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CaretLeft, Checks, DotsThree, Plus, Microphone, ArrowCounterClockwise, Sun, Moon, ArrowUpRight } from '@phosphor-icons/react';
import Message from '../../components/Message';
import ReadReceiptMenu from './ReadReceiptMenu';
import { demoReaders, readSummary, readTime, RECEIPT_STATES } from './readReceiptsModel';
import '../../screens/ChatRoom.css';
import './ReadReceiptsReview.css';

function ReaderAvatar({ reader }) {
  return <span className="rr-avatar">{reader.avatar ? <img src={reader.avatar} alt="" /> : reader.name.split(' ').slice(0, 2).map(word => word[0]).join('')}</span>;
}

function ReadersScreen({ readers, onBack, capture }) {
  const back = useRef(null);
  useEffect(() => { if (!capture) back.current?.focus({ preventScroll: true }); }, [capture]);
  return <section className="rr-readers" aria-label="Просмотры сообщения">
    <header className="rr-readers-header"><button ref={back} aria-label="Назад в чат" onClick={onBack}><CaretLeft size={24} /></button><h1>Просмотры сообщения</h1><span aria-hidden="true" /></header>
    <div className="rr-reader-scroll" tabIndex={0} aria-label="Список прочитавших">
      <h2>Прочитали <span>{readers.length}</span></h2>
      <ul className="rr-reader-list">{readers.map(reader => <li key={reader.userId}>
        <ReaderAvatar reader={reader} />
        <div className="rr-reader-info"><strong>{reader.name}</strong><time dateTime={reader.readAt}>{readTime(reader.readAt).replace(/^./, character => character.toUpperCase())}</time></div>
        <Checks size={20} className="rr-read-icon" aria-label="Прочитано" />
      </li>)}</ul>
    </div>
  </section>;
}

function ReceiptScene({ scenario, capture = false }) {
  const [view, setView] = useState(scenario.view);
  const [menu, setMenu] = useState(null);
  const [notice, setNotice] = useState('');
  const targetRef = useRef(null), menuButton = useRef(null);
  const readers = demoReaders(scenario.count);
  const target = useMemo(() => ({ id: 'receipt-target', mine: !scenario.incoming, text: scenario.personal ? 'Привет! Отправляю финальные макеты. Посмотри, пожалуйста.' : 'Коллеги, макеты готовы. Посмотрите, пожалуйста, когда будет время.', time: scenario.count ? '16:30' : '10:59', status: scenario.count ? 'read' : 'sent' }), [scenario]);
  const summary = readSummary({ mine: target.mine, readers });
  const close = useCallback(() => { setView('chat'); setMenu(null); requestAnimationFrame(() => menuButton.current?.focus({ preventScroll: true })); }, []);
  const openMenu = useCallback(() => {
    const node = targetRef.current?.querySelector('.msg');
    if (!node) return;
    setMenu({ msg: target, node, rect: node.querySelector('.msg-bubble').getBoundingClientRect() }); setView('menu');
  }, [target]);
  useLayoutEffect(() => { if (scenario.view === 'menu') openMenu(); }, [scenario.view, openMenu]);
  useEffect(() => {
    if (capture) return;
    const key = event => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [capture, close]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 2000); return () => clearTimeout(timer); } }, [notice]);
  return <div className="rr-phone" data-state={scenario.id} data-capture={capture || undefined} data-testid="read-receipts-phone">
    <section className="chatroom rr-chat" inert={view !== 'chat' ? true : undefined} aria-hidden={view !== 'chat' ? true : undefined}>
      <header className="cr-header"><button className="cr-back" aria-label="Назад" onClick={() => setNotice('Пример чата для проверки')}><CaretLeft size={24} /></button><div className="cr-headline"><span className="cr-avatar"><img src={scenario.personal ? '/img/chats/ayazhan.png' : '/img/chats/bts-pr.png'} alt="" /></span><span className="cr-title-wrap"><span className="cr-title">{scenario.personal ? 'Аяжан Сериккызы' : 'PR01DEV + ROBOTS'}</span><span className="cr-subtitle">{scenario.personal ? 'была вчера в 16:40' : '96 участников'}</span></span></div></header>
      <div className="cr-body rr-chat-body"><div className="cr-messages"><div className="cr-day">{scenario.count ? 'Вчера' : 'Сегодня'}</div>
        <Message msg={{ id: 'intro', text: scenario.personal ? 'Привет! Пришли, пожалуйста, новые макеты.' : 'Всем привет! Когда будут готовы макеты?', time: scenario.count ? '16:25' : '10:58' }} mine={false} firstOfGroup lastOfGroup authorLabel={scenario.personal ? undefined : 'Аяжан С.'} authorColor="#1677ff" avatar={<span className="msg-avatar"><img src="/img/chats/ayazhan.png" alt="" /></span>} />
        <div ref={targetRef} data-receipt-target onContextMenu={event => { event.preventDefault(); openMenu(); }}><Message msg={target} mine={target.mine} firstOfGroup lastOfGroup authorLabel={target.mine ? undefined : 'Арман А.'} authorColor="#1677ff" onLongPress={openMenu} avatar={<span className="msg-avatar msg-avatar--initials tint-blue">АА</span>} /></div>
        <div className="rr-message-tools"><button ref={menuButton} aria-label="Открыть меню сообщения" onClick={openMenu}><DotsThree size={22} /></button></div>
      </div></div>
      <div className="cr-writebar"><button className="cr-write-btn" aria-label="Вложение" onClick={() => setNotice('Пример чата для проверки')}><Plus size={24} /></button><div className="cr-input rr-compose">Сообщение…</div><button className="cr-write-btn" aria-label="Голосовое" onClick={() => setNotice('Пример чата для проверки')}><Microphone size={24} /></button></div>
    </section>
    {view === 'menu' && menu && <ReadReceiptMenu {...menu} summary={summary} capture={capture} onClose={close} onReaders={() => setView('list')} onAction={label => { close(); setNotice(`${label} · пример действия`); }} />}
    {view === 'list' && summary && <ReadersScreen readers={readers} capture={capture} onBack={close} />}
    {notice && <div className="rr-toast" role="status">{notice}</div>}
    <span className="rr-home-indicator" aria-hidden="true" />
  </div>;
}

export default function ReadReceiptsReview() {
  const params = new URLSearchParams(window.location.search);
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [state, setState] = useState(RECEIPT_STATES.some(item => item.id === params.get('state')) ? params.get('state') : 'two');
  const [revision, setRevision] = useState(0);
  const board = params.get('view') === 'figma', frame = params.get('view') === 'frame';
  const current = RECEIPT_STATES.find(item => item.id === state);
  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme, title = document.title;
    document.documentElement.classList.add('read-receipts-review');
    document.title = 'QM-2604 · Прочитано · Qollab';
    return () => { document.documentElement.classList.remove('read-receipts-review'); document.documentElement.dataset.theme = previousTheme; document.title = title; };
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (board || frame) return;
    window.history.replaceState(null, '', `${window.location.pathname}?${new URLSearchParams({ state, theme })}`);
  }, [state, theme, board, frame]);
  if (frame) return <ReceiptScene scenario={current} capture />;
  if (board) return <main className="rr-board"><h1>QM-2604 · Прочитано · {theme === 'dark' ? 'Тёмная' : 'Светлая'} тема</h1><p>11 состояний · каждый экран 402 × 820</p><div className="rr-board-grid">{RECEIPT_STATES.map((item, index) => <article key={item.id}><h2>{String(index + 1).padStart(2, '0')} · {item.title}</h2><p>{item.note}</p><ReceiptScene scenario={item} capture /></article>)}</div></main>;
  return <main className="rr-review">
    <header className="rr-review-header"><div className="rr-brand"><img src="/img/common/qollab-logo.svg" alt="qollab" /><span>QM-2604</span><small>Локальная проверка</small></div><h1>Кто прочитал сообщение</h1><p>Меню сообщения и список прочитавших</p></header>
    <div className="rr-layout"><aside className="rr-controls"><div className="rr-theme" aria-label="Тема">{[['light', Sun, 'Светлая'], ['dark', Moon, 'Тёмная']].map(([id, Icon, label]) => <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}><Icon size={17} />{label}</button>)}</div><nav className="rr-states" aria-label="Состояния прочтения">{RECEIPT_STATES.map((item, index) => <button key={item.id} aria-pressed={state === item.id} onClick={() => { setState(item.id); setRevision(value => value + 1); }}><small>{String(index + 1).padStart(2, '0')}</small><span><strong>{item.title}</strong><small>{item.note}</small></span></button>)}</nav><button className="rr-reset" onClick={() => setRevision(value => value + 1)}><ArrowCounterClockwise size={16} />Сбросить сценарий</button></aside>
    <div className="rr-preview"><div className="rr-preview-label"><span>{current.title}</span><span>402 × 820</span></div><ReceiptScene key={`${state}-${revision}`} scenario={current} /><p className="rr-hint">Удерживай сообщение или нажми «⋯». Строка со шевроном открывает список. «Назад» возвращает в чат.</p></div>
    <aside className="rr-decisions"><span className="rr-eyebrow">РЕШЕНИЯ ПО МАКЕТУ</span><h2>Одно прочтение — один человек</h2><ol><li><strong>0 читателей</strong><p>Строки нет. Меню сохраняет привычные действия.</p></li><li><strong>1 читатель / от 2 читателей</strong><p>«Прочитано вчера в 16:35» / «Просмотров сообщения: N».</p></li><li><strong>Переход в список</strong><p>Шеврон справа, двойная галочка слева. Вся строка нажимается.</p></li><li><strong>Большая группа</strong><p>Один прокручиваемый список. Шапка закреплена, без «Показать ещё».</p></li><li><strong>Порядок</strong><p>Новые прочтения сверху. При одинаковом времени — по имени.</p></li><li><strong>Только для автора</strong><p>На своих сообщениях в группе и в 1:1. В личном чате — один собеседник.</p></li></ol><p className="rr-decision-note">Иконка Checks совпадает с текущим статусом сообщения. Показываем только прочитавших; время берём из события открытия чата.</p><a href={`/handoff/read-receipts?view=figma&theme=${theme}`} target="_blank" rel="noreferrer">Все состояния одной страницей <ArrowUpRight size={16} /></a><a href="https://jira2.erg.kz/browse/QM-2604" target="_blank" rel="noreferrer">Открыть задачу <ArrowUpRight size={16} /></a></aside>
    </div>
  </main>;
}
