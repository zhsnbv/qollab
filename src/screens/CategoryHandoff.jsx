import { useEffect } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Notifications from './Notifications';
import NotificationGroup from './NotificationGroup';
import NotificationDetail from './NotificationDetail';
import MiniApp from './MiniApp';
import { NotificationSettings } from './SettingsPages';
import NotificationIcon from '../components/NotificationIcon';
import { notificationGroups } from '../data/notifications';
import './CategoryHandoff.css';
// Retain background layers just like the main app. Returning reveals the
// existing DOM, preserving scroll position and avoiding a second entry animation.
function PreviewLayers({ empty }) {
  const current = useLocation();
  const layers = [current];
  let background = current.state?.background;
  while (background) {
    layers.unshift(background);
    background = background.state?.background;
  }
  return layers.map((location, index) => <div
    key={location.key || location.pathname}
    className="category-layer"
    data-active={index === layers.length - 1}
    inert={index !== layers.length - 1}
    aria-hidden={index !== layers.length - 1 || undefined}
    style={{ zIndex: index }}
  ><Routes location={location}>
    <Route path="/" element={<Notifications />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/notifications/:groupId" element={<NotificationGroup previewEmpty={empty} />} />
    <Route path="/notifications/:groupId/:messageId" element={<NotificationDetail />} />
    <Route path="/settings/notifications" element={<NotificationSettings />} />
    <Route path="/app/*" element={<MiniApp />} />
  </Routes></div>);
}
function Preview({ path = '/notifications', empty = false }) {
  return <MemoryRouter initialEntries={[path]}><PreviewLayers empty={empty} /></MemoryRouter>;
}
export default function CategoryHandoff() {
  const interactive = new URLSearchParams(window.location.search).get('view') === 'prototype';
  useEffect(() => { document.documentElement.dataset.theme = 'light'; }, []);
  if (interactive) return <div className="device category-prototype"><Preview /></div>;
  return <main className="category-board"><header><h1>Уведомления · категории</h1><p>402 × 820 · production-категории · демонстрационные уведомления</p><a href="?view=prototype">Открыть интерактивный прототип</a></header><div className="category-frames">
    <section><h2>01 · Категории</h2><div className="device category-frame" data-category-frame="main"><Preview /></div></section>
    <aside className="category-icons"><h2>Все иконки начального экрана</h2><p>10 категорий + Qollab + запасная иконка</p>{[...notificationGroups, {id: 'fallback', name: 'Без иконки', tone: '#78838F'}].map(g => <div key={g.id}><NotificationIcon group={g} /><span>{g.name}<small>{g.id} · {g.tone}</small></span></div>)}</aside>
    <section><h2>02 · Сотруднику</h2><div className="device category-frame" data-category-frame="feed"><Preview path="/notifications/employee-services" /></div></section>
    <section><h2>03 · Документ ЕСЭД</h2><div className="device category-frame" data-category-frame="detail"><Preview path="/notifications/employee-services/document" /></div></section>
    <section><h2>04 · Пустая категория</h2><div className="device category-frame" data-category-frame="empty"><Preview path="/notifications/information" /></div></section>
  </div></main>;
}
