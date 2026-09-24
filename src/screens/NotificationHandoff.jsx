import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DeviceHost } from '../components/Portal';
import GroupProfile from './GroupProfile';
import PersonProfile from './PersonProfile';
import Chats from './Chats';
import BottomNav from '../components/BottomNav';
import './AllScreens.css';
import './NotificationHandoff.css';

const cases = [
  ['01', 'Группа · точка входа', 'on', {}, 'Нажать «Уведомления» → 02. Исходный режим включён.'],
  ['02', 'Группа · все уведомления', 'on', { open: true }, 'Галочка показывает сохранённый режим. Выбрать упоминания → 05.'],
  ['03', 'Группа · только упоминания', 'mentions', { open: true }, 'Только явные упоминания. Повторное открытие сохраняет галочку.'],
  ['04', 'Группа · уведомления отключены', 'off', { open: true }, 'Все уведомления чата выключены. Отдельного режима «Без звука» нет.'],
  ['05', 'Группа · подтверждение выбора', 'on', { open: true, pending: 'mentions' }, 'Галочка и подложка меняются сразу. 280 мс → закрытие. Повторный тап заблокирован.'],
  ['06', 'Группа · сохранено', 'mentions', { toast: 'Только упоминания' }, 'Успех: @ в профиле и списке; тост 2200 мс. Выбор сохраняется.'],
  ['07', 'Группа · ошибка и повтор', 'on', { failed: 'mentions' }, 'Откат к старому режиму. «Повторить» → 05 → 06; повторная ошибка → 07.'],
  ['08', 'Системный запрет уведомлений', 'on', { permission: true }, 'Вместо меню — пояснение. «Настройки разрешений» открывает настройки.'],
  ['09', 'Личный чат · включены', 'on', { open: true }, 'Два режима. «Только упоминания» отсутствует. Выключить → 11.'],
  ['10', 'Личный чат · отключены', 'off', { open: true }, 'Галочка и зачёркнутый колокольчик отражают текущий режим.'],
  ['11', 'Личный чат · подтверждение', 'on', { open: true, pending: 'off' }, 'Та же анимация 280 мс; при успехе → 12, при ошибке → 13.'],
  ['12', 'Личный чат · сохранено', 'off', { toast: 'Уведомления отключены' }, 'Тост 2200 мс; после перезагрузки сохраняется режим.'],
  ['13', 'Личный чат · ошибка и повтор', 'on', { failed: 'off' }, 'Исходный режим остаётся включённым. Повтор применяет неудавшийся выбор.'],
  ['14', 'Список чатов · разные режимы', 'on', {}, 'PR01DEV: @. Групповой qollab: колокольчик зачёркнут. У Аяжан: включены, значка нет.'],
];
function Screen({ item }) {
  const [host, setHost] = useState(null);
  const [id, title, mode, state, note] = item;
  const personal = Number(id) >= 9 && Number(id) <= 13;
  const list = id === '14';
  return <figure className="nh-cell">
    <figcaption><h2>{id} · {title}</h2><p>{note}</p></figcaption>
    <div className="device gal-device nh-screen" data-handoff-screen={id} aria-label={`${id} · ${title}`} ref={setHost}>
      {host && <DeviceHost.Provider value={host}><MemoryRouter initialEntries={[{ pathname: list ? '/chats' : personal ? '/person' : '/group', state: { id: personal ? 'ayazhan' : 'prodev' } }]}>
        {list ? <><Chats notificationPreview={{ prodev: 'mentions', ayazhan: 'on', 'Групповой чат qollab': 'off' }} /><BottomNav /></> : personal ? <PersonProfile notificationPreview={{mode,...state}} /> : <GroupProfile notificationPreview={{mode,...state}} />}
      </MemoryRouter></DeviceHost.Provider>}
    </div>
  </figure>;
}
export default function NotificationHandoff() {
  const theme = new URLSearchParams(window.location.search).get('theme') === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    document.documentElement.classList.add('gallery');
    document.documentElement.dataset.theme = theme;
    return () => document.documentElement.classList.remove('gallery');
  }, [theme]);
  return <main className="nh-board" id="notification-handoff">
    <header><p className="nh-eyebrow">QOLLAB MOBILE · QM-2492 · HANDOFF</p><h1>Уведомления чатов · {theme === 'dark' ? 'Тёмная' : 'Светлая'} тема</h1><p>14 состояний · каждый экран 402×820 px · компонентный UI прототипа · 24.09.2026</p><p>Группа: включены / только упоминания / отключены. Личный чат: включены / отключены. Размеры и расположение элементов сохранены.</p></header>
    <div className="nh-grid">{cases.map(item => <Screen key={item[0]} item={item}/>)}</div>
    <footer>При Reduced Motion галочка появляется без анимации. Ошибка не исчезает по таймеру: доступны «Повторить» и закрытие. Для прототипа состояние хранится локально; в продукте требуется API и синхронизация устройств. QM-2514 не входит в эту задачу.</footer>
  </main>;
}
