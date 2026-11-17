import { useEffect, useState } from 'react';
import Message from '../../components/Message';
import ChatWallpaper from '../../components/ChatWallpaper';
import MobileMessageMenu from '../../components/MobileMessageMenu';
import Portal, { DeviceHost } from '../../components/Portal';
import { CompanyProvider, useCompany } from '../../context/CompanyContext';
import { CHAT_PRESETS, appearanceClass, appearanceStyle, useChatAppearance } from '../../utils/chatAppearance';
import '../../screens/ChatRoom.css';
import './ChatThemeStates.css';

const PERSON = { id: 'theme-reader', userId: 'theme-reader', name: 'Аяжан Сериккызы', avatar: '/img/chats/ayazhan.png', initials: 'АС' };
const CASES = [
  { id: 'sending', text: 'Ожидает отправки', status: 'sending' },
  { id: 'sent', text: 'Сообщение отправлено', status: 'sent' },
  { id: 'delivered', text: 'Сообщение доставлено', status: 'delivered' },
  { id: 'read', text: 'Прочитано — цвет выбранной темы', status: 'read' },
  { id: 'failed', text: 'Не удалось отправить сообщение', status: 'failed' },
  { id: 'quote', text: 'Да, всё готово 🙌', status: 'read', quote: { author: 'Аяжан', text: 'Получилось посмотреть макеты?' } },
  { id: 'photo', kind: 'photo', text: 'Фотография с подписью', img: '/img/chat-themes/art-coast.webp', status: 'read' },
  { id: 'video', kind: 'video', img: '/img/chat-themes/live-lake.webp', status: 'delivered' },
  { id: 'voice', kind: 'voice', duration: '0:08', status: 'read' },
  { id: 'document', kind: 'document', name: 'Макеты.pdf', size: '2,4 МБ', status: 'read' },
  { id: 'profile', kind: 'profile', profile: { ...PERSON, role: 'Дизайнер' }, status: 'read' },
  { id: 'forward', text: 'Итоги встречи и следующие шаги', forwardedFrom: 'Аяжан', status: 'read' },
  { id: 'link', kind: 'link', text: 'https://qollab.kz', status: 'read' },
];

export default function ChatThemeStates() {
  return <CompanyProvider><ThemeStates /></CompanyProvider>;
}
function ThemeStates() {
  const { companyId, setCompanyId } = useCompany();
  const { appearance, update } = useChatAppearance();
  const params = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [kind, setKind] = useState('statuses');
  const [host, setHost] = useState(null);
  const [menu, setMenu] = useState(null);
  const [notice, setNotice] = useState('');
  const [reactions, setReactions] = useState({});
  useEffect(() => { const before = document.documentElement.dataset.theme; const title = document.title; document.title = 'Темы чатов · состояния · qollab'; return () => { document.documentElement.dataset.theme = before; document.title = title; }; }, []);
  useEffect(() => { document.documentElement.dataset.theme = mode; }, [mode]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 2200); return () => clearTimeout(timer); }, [notice]);
  const choose = (name, action) => { setMenu(null); setNotice(''); action(name); };
  const react = (id, emoji) => setReactions(current => ({ ...current, [id]: current[id] === emoji ? null : emoji }));
  const messages = kind === 'statuses' ? CASES.slice(0, 5) : CASES.slice(5);
  const open = (msg, rect, node) => setMenu({ msg, rect, node, mine: msg.mine });
  return <main className="ct-review">
    <header className="ct-header"><a href="/handoff/settings">qollab / Настройки</a><h1>Темы чатов · состояния</h1><p>Реальные компоненты сообщений и меню. Эта страница проверяет внешний вид; рабочие действия доступны в прототипе чата.</p></header>
    <div className="ct-layout"><aside className="ct-controls">
      <label data-brand-preserve>Рабочее пространство<select aria-label="Рабочее пространство" value={companyId} onChange={event => choose(event.target.value, setCompanyId)}><option value="erg">ERG</option><option value="integra">Integra</option></select></label>
      <label>Тема чата<select aria-label="Тема чата" value={appearance.preset} onChange={event => choose(event.target.value, preset => update({ preset }))}>{CHAT_PRESETS.map(preset => <option value={preset.id} key={preset.id}>{preset.name}</option>)}</select></label>
      <div className="ct-switch" role="group" aria-label="Режим приложения">{[['light', 'Светлая'], ['dark', 'Тёмная']].map(([id, label]) => <button key={id} aria-pressed={mode === id} onClick={() => choose(id, setMode)}>{label}</button>)}</div>
      <div className="ct-switch" role="group" aria-label="Тип сообщений">{[['statuses', 'Статусы'], ['rich', 'Вложения']].map(([id, label]) => <button key={id} aria-pressed={kind === id} onClick={() => choose(id, setKind)}>{label}</button>)}</div>
      <p>Удерживайте сообщение или нажмите Shift + F10 на нём. Цвета в поднятом бабле должны совпадать с чатом.</p>
      <a href="/handoff/chat-interactions?chat=personal">Личный чат →</a><a href="/handoff/chat-interactions?chat=group">Групповой чат →</a>
    </aside><section className="ct-stage" ref={setHost} aria-label="Состояния сообщений">
      {host && <DeviceHost.Provider value={host}>
        <div className={`ct-chat ${appearanceClass(appearance)}`} style={appearanceStyle(appearance)}><ChatWallpaper appearance={appearance} /><div className="ct-scroll"><div className="cr-messages">
          {messages.map(item => <div className="ct-case" key={item.id} data-case={item.id}>
            <span className="ct-case-label">{item.id}</span>
            {[false, true].map(mine => { const msg = { ...item, id: `${item.id}-${mine ? 'out' : 'in'}`, mine, time: '14:32' }; const emoji = reactions[msg.id] || (item.id === 'quote' ? '❤️' : null); return <Message key={msg.id} msg={msg} mine={mine} withAvatarSlot={false} firstOfGroup lastOfGroup onLongPress={open} onToggleReaction={value => react(msg.id, value)} reactions={emoji ? { [emoji]: [PERSON] } : undefined} />; })}
          </div>)}
        </div></div></div>
        {menu && <Portal><MobileMessageMenu {...menu} activity={{ personal: false, readers: menu.msg.mine && menu.msg.status === 'read' ? [{ ...PERSON, readAt: '2026-11-17T09:32:00+05:00' }] : [], reactions: {} }} selected={reactions[menu.msg.id]} onClose={() => setMenu(null)} onReact={emoji => { react(menu.msg.id, emoji); setMenu(null); }} onAction={() => { setMenu(null); setNotice('Это проверка внешнего вида. Действия доступны в прототипе чата.'); }} /></Portal>}
        {notice && <div className="ct-notice" role="status">{notice}</div>}
      </DeviceHost.Provider>}
    </section></div>
  </main>;
}
