import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CallsProvider } from '../calls/Calls';
import { DeviceHost } from '../components/Portal';
import DMChat from './DMChat';
import ChatRoom from './ChatRoom';
import './AllScreens.css';
import './TypingHandoff.css';

const directChat = { title: 'Контакт', initials: 'К', tint: 'orange', online: true, preview: 'Тестовое сообщение', time: '11:24' };
const directMessages = [
  { id: 1, mine: false, author: directChat.title, text: 'Тестовое сообщение.', time: '11:24' },
  { id: 2, mine: true, text: 'Тестовый ответ.', time: '11:25', status: 'read' },
];
const cases = [
  ['01', 'Личный чат · обычный статус', 'direct', [], 'В шапке исходный статус «в сети». Индикатора в ленте нет.'],
  ['02', 'Личный чат · собеседник печатает', 'direct', ['Контакт'], 'Статус заменяется оранжевым «печатает…». Внизу одновременно аватар и пузырь с точками.'],
  ['03', 'Личный чат · новое сообщение', 'direct', [], 'Пузырь сразу уступает место входящему сообщению; обычный статус возвращается.'],
  ['04', 'Личный чат · набор прерван', 'direct', [], 'При паузе/истечении TTL индикаторы исчезают, остаётся исходная переписка.'],
  ['05', 'Группа · обычный статус', 'group', [], 'В шапке «73 участника». Пузыря набора в ленте нет.'],
  ['06', 'Группа · один печатает', 'group', ['Участник А'], '«Участник А печатает…» заменяет счётчик участников; только в шапке.'],
  ['07', 'Группа · двое печатают', 'group', ['Участник А', 'Участник Б'], '«Участник А и ещё 1 печатают…»; в ленте пузыря нет.'],
  ['08', 'Группа · длинное имя', 'group', ['Очень длинное имя участника группы', 'Участник Б', 'Участник В'], 'Длинная подпись обрезается многоточием в существующей ширине шапки.'],
  ['09', 'Группа · много печатают', 'group', ['А', 'Б', 'В', 'Г', 'Д'], 'При 5+ участниках — обобщённая подпись. Пузыря нет.'],
];

function Cell({ item }) {
  const [host, setHost] = useState(null);
  const [id, title, kind, people, note] = item;
  const group = kind === 'group';
  const messages = id === '03' ? [...directMessages, { id: 3, mine: false, author: directChat.title, text: 'Новое тестовое сообщение.', time: '11:26' }] : directMessages;
  return <figure className="th-cell">
    <figcaption><h2>{id} · {title}</h2><p>{note}</p></figcaption>
    <div className="device gal-device th-screen" data-typing-screen={id} aria-label={`${id} · ${title}`} ref={setHost}>
      {host && <DeviceHost.Provider value={host}><MemoryRouter initialEntries={[group ? '/chats/prodev' : { pathname: '/chats/dm', state: { chat: directChat } }]}>
        <CallsProvider showcase>{group ? <ChatRoom typingPreview={{ people }} /> : <DMChat typingPreview={{ people, messages }} />}</CallsProvider>
      </MemoryRouter></DeviceHost.Provider>}
    </div>
  </figure>;
}

export default function TypingHandoff() {
  const theme = new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    document.documentElement.classList.add('gallery');
    document.documentElement.dataset.theme = theme;
    return () => document.documentElement.classList.remove('gallery');
  }, [theme]);
  return <main className="th-board" id="typing-handoff">
    <header><p className="th-eyebrow">QOLLAB MOBILE · QM-2514 · HANDOFF</p><h1>Индикатор набора текста · {theme === 'dark' ? 'Тёмная' : 'Светлая'} тема</h1><p>9 состояний · каждый экран 402×820 px · исходные компоненты прототипа · 24.09.2026</p></header>
    <div className="th-grid">{cases.map(item => <Cell key={item[0]} item={item}/>)}</div>
    <footer>Шапка: короткий fade/slide 160 мс при смене текста. Пузырь личного чата: появление 200 мс, при новом сообщении исчезает одновременно с показом сообщения. Точки анимируются циклом 1200 мс. Reduced Motion: мгновенная смена без анимации. В прототипе ответы симулируются; в продукте состояние набора живёт по TTL и повторным сигналам, без передачи текста сообщения.</footer>
  </main>;
}
