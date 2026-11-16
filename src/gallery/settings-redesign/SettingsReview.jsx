import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowCounterClockwise, SquaresFour, DeviceMobile } from '@phosphor-icons/react';
import { DeviceHost } from '../../components/Portal';
import Settings from '../../screens/Settings';
import { AppearanceSettings, QuickReactionSettings, ChatThemeSettings, BubbleColorSettings, WallpaperSettings, LanguageSettings, StorageSettings, DeviceDetailsSettings } from '../../screens/SettingsExperience';
import { NotificationSettings, Devices, Permissions, Privacy } from '../../screens/SettingsPages';
import { updateSettingsPreferences } from '../../utils/settingsPreferences';
import { applyTheme, getThemeMode, watchSystemTheme } from '../../utils/theme';
import { CompanyProvider, useCompany } from '../../context/CompanyContext';
import './SettingsReview.css';

const SCREENS = [
  { id: 'main', title: 'Настройки', route: '/settings', note: 'Всё нужное — на одном экране. Без дублирования профиля.' },
  { id: 'appearance', title: 'Оформление', route: '/settings/appearance', note: 'Личный характер приложения. Изменения видны сразу.' },
  { id: 'storage', title: 'Данные и память', route: '/settings/storage', note: 'Понятный состав кэша и контроль над местом на устройстве.' },
  { id: 'reaction', title: 'Быстрая реакция', route: '/settings/reaction', note: 'Выберите эмодзи и дважды нажмите на сообщение.' },
  { id: 'chat-theme', title: 'Тема и цвета', route: '/settings/chat-theme', note: 'Готовая тема меняет фон и цвета вместе. Каждый параметр можно настроить отдельно.' },
  { id: 'bubbles', title: 'Цвет сообщений', route: '/settings/bubbles', note: 'Свои и входящие сообщения настраиваются независимо.' },
  { id: 'wallpaper', title: 'Фон и узор', route: '/settings/wallpaper', note: 'Живые фоны, мягкие градиенты, иллюстрации и лёгкий узор поверх фона.' },
  { id: 'language', title: 'Язык', route: '/settings/language', note: 'Выбор в нижней панели. Қазақша — первый в списке.' },
  { id: 'device', title: 'Данные устройства', route: '/settings/device', note: 'Данные для поддержки доступны прямо из настроек.' },
];
function ReviewRoutes({ onRoute }) {
  const location = useLocation();
  useEffect(() => { onRoute?.(location.pathname); }, [location.pathname, onRoute]);
  return <Routes>
    <Route path="/settings/appearance" element={<AppearanceSettings />} />
    <Route path="/settings/reaction" element={<QuickReactionSettings />} />
    <Route path="/settings/chat-theme" element={<ChatThemeSettings />} />
    <Route path="/settings/bubbles" element={<BubbleColorSettings />} />
    <Route path="/settings/wallpaper" element={<WallpaperSettings />} />
    <Route path="/settings/language" element={<LanguageSettings />} />
    <Route path="/settings/storage" element={<StorageSettings />} />
    <Route path="/settings/device" element={<DeviceDetailsSettings />} />
    <Route path="/settings/notifications" element={<NotificationSettings />} />
    <Route path="/settings/devices" element={<Devices />} />
    <Route path="/settings/permissions" element={<Permissions />} />
    <Route path="/settings/privacy" element={<Privacy />} />
    <Route path="*" element={<Settings />} />
  </Routes>;
}
function Phone({ screen, onRoute }) {
  const [host, setHost] = useState(null);
  const parents = ['/settings/wallpaper', '/settings/bubbles'].includes(screen.route) ? ['/settings', '/settings/appearance', '/settings/chat-theme'] : ['/settings/reaction', '/settings/chat-theme'].includes(screen.route) ? ['/settings', '/settings/appearance'] : ['/settings'];
  const entries = screen.route === '/settings' ? ['/settings'] : [...parents, { pathname: screen.route, state: { background: { pathname: parents.at(-1) } } }];
  return <div className="sr-phone"><div className="sr-viewport" ref={setHost}>{host && <DeviceHost.Provider value={host}><MemoryRouter initialEntries={entries}><ReviewRoutes onRoute={onRoute} /></MemoryRouter></DeviceHost.Provider>}</div></div>;
}
export default function SettingsReview() {
  return <CompanyProvider><SettingsReviewContent /></CompanyProvider>;
}
function SettingsReviewContent() {
  const { companyId, setCompanyId } = useCompany();
  const params = new URLSearchParams(window.location.search);
  const [view, setView] = useState(params.get('view') === 'frame' ? 'frame' : params.get('view') === 'prototype' || window.innerWidth < 760 ? 'prototype' : 'board');
  const [current, setCurrent] = useState(SCREENS.find(s => s.id === params.get('screen')) || SCREENS[0]);
  const [revision, setRevision] = useState(0);
  useEffect(() => { document.title = 'Настройки · qollab'; applyTheme(getThemeMode()); return watchSystemTheme(getThemeMode); }, []);
  useEffect(() => { const url = new URL(window.location.href); url.searchParams.set('view', view); url.searchParams.set('screen', current.id); window.history.replaceState(null, '', url); }, [view, current]);
  const pick = screen => { setCurrent(screen); setView('prototype'); setRevision(v => v + 1); };
  if (view === 'frame') return <main className="sr-frame-root"><Phone screen={current} /></main>;
  return <main className="sr-review">
    <header className="sr-header"><a className="sr-brand" href="/handoff/settings">qollab<span> / </span><small>Дизайн настроек</small></a><div className="sr-header-actions"><div className="sr-company-switch" data-brand-preserve><button aria-pressed={companyId === 'erg'} onClick={() => setCompanyId('erg')}>ERG</button><button aria-pressed={companyId === 'integra'} onClick={() => setCompanyId('integra')}>Integra</button></div><div className="sr-view-switch"><button aria-pressed={view === 'board'} onClick={() => setView('board')}><SquaresFour size={16} />Обзор</button><button aria-pressed={view === 'prototype'} onClick={() => setView('prototype')}><DeviceMobile size={16} />Прототип</button></div></div></header>
    <section className="sr-intro"><div><div className="sr-eyebrow">ПРИЛОЖЕНИЕ · НАСТРОЙКИ</div><h1>Всё на своём месте.</h1><p>Привычная логика. Меньше лишних шагов. Больше вашего.</p></div><span className="sr-interactive"><i />Интерактивный прототип</span></section>
    {view === 'board' ? <><div className="sr-board">{SCREENS.slice(0, 3).map((screen, i) => <article key={screen.id}><button className="sr-board-title" onClick={() => pick(screen)}><span><small>0{i + 1}</small>{screen.title}</span><ArrowUpRight size={18} /></button><Phone screen={screen} /><p className="sr-screen-note">{screen.note}</p></article>)}</div><div className="sr-more"><span>Другие экраны</span>{SCREENS.slice(3).map(screen => <button key={screen.id} onClick={() => pick(screen)}>{screen.title}<ArrowUpRight size={14} /></button>)}</div></> : <div className="sr-prototype"><aside className="sr-sidebar"><span className="sr-eyebrow">ЭКРАНЫ</span><nav>{SCREENS.map((screen, i) => <button key={screen.id} aria-current={current.id === screen.id ? 'page' : undefined} onClick={() => pick(screen)}><span>0{i + 1}</span>{screen.title}<ArrowUpRight size={14} /></button>)}</nav><p>{current.note}</p><button className="sr-restart" onClick={() => setRevision(v => v + 1)}><ArrowCounterClockwise size={15} />Начать с этого экрана</button><p className="sr-demo-note">Данные памяти и устройства демонстрационные. Очистка меняет только состояние прототипа.</p></aside><Phone key={`${current.id}-${revision}`} screen={current} /><div className="sr-right-note"><span>ПОПРОБУЙТЕ</span><p>Откройте оформление.<br />Выберите свою тему.<br />Поставьте реакцию.</p><p>Все основные переходы<br />можно пройти в телефоне.</p></div></div>}
    <footer className="sr-footer"><button className="sr-reset-cache" onClick={() => { updateSettingsPreferences({ clearedCache: [] }); setRevision(v => v + 1); }}><ArrowCounterClockwise size={12} />Восстановить демоданные кэша</button><span>Данные памяти — для демонстрации. Выбор оформления сохраняется в браузере.</span></footer>
  </main>;
}
