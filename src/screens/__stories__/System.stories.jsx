import { Routes, Route } from 'react-router-dom';
import Auth from '../Auth';
import Search from '../Search';
import Notifications from '../Notifications';
import NotificationGroup from '../NotificationGroup';

export default {
  title: 'Экраны/Системные',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component: 'Вход, глобальный поиск и уведомления — то, что окружает основной сценарий.',
      },
    },
  },
};

export const Вход = {
  render: () => <Auth />,
  parameters: {
    route: '/auth',
    docs: { description: { story: 'Выбор пространства листом снизу: от него зависят цвета всего приложения — переключатель в тулбаре делает ровно то же.' } },
  },
};

export const Поиск = {
  render: () => <Search />,
  parameters: { route: '/search' },
};

export const Уведомления = {
  render: () => <Notifications />,
  parameters: { route: '/notifications' },
};

export const ГруппаУведомлений = {
  name: 'Группа уведомлений',
  render: () => (
    <Routes><Route path="/notifications/:groupId" element={<NotificationGroup />} /></Routes>
  ),
  parameters: { route: '/notifications/tasks' },
};
