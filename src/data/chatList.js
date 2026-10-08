import { BookmarkSimple, VideoCamera, Camera, FileText } from '@phosphor-icons/react';

// Первый экран — данные из Figma-макета Chats (Type=Chats), аватары в public/img/chats.
export const baseChats = [
  // Уведомления переехали в иконку-колокольчик на Главной — в списке чатов
  // их дублировать не нужно. Оставлено закомментированным на случай отката.
  // { kind: 'system', icon: BellSimple, title: 'Уведомления', preview: 'Новый вход в qollab: Устройство: iPhone', time: '09:12' },
  { kind: 'system', icon: BookmarkSimple, title: 'Избранное', preview: 'Мои задачи на неделю:', time: '12:02' },
  { kind: 'bot', avatar: '/img/chats/ergiz-avatar.png', title: 'ERGiz – Искусственный интеллект', preview: 'Привет! хочу задать вам пару коротких вопросов', time: '13:44' },
  { avatar: '/img/chats/bts-pr.png', title: 'PR01DEV + ROBOTS', to: '/chats/prodev', sender: 'Арман А.:', preview: 'не узнал', time: '11:34', muted: true },
  { profileId: 'ayazhan', avatar: '/img/chats/ayazhan.png', title: 'Аяжан Сериккызы', preview: 'Салем, там задача', time: '13:21', online: true, unreadCount: 2 },
  { avatar: '/img/chats/daniyar.png', title: 'Данияр Кенжебаев', preview: 'Вот зал куда мы ходим', time: '10:51', online: true, contentIcon: VideoCamera, attachKind: 'video' },
  { avatar: '/img/chats/qollab-group.png', title: 'Групповой чат qollab', kind: 'group', sender: 'Айдар С.:', preview: 'Вот скрин приложения с о', time: '10:01', muted: true, contentIcon: Camera, attachKind: 'photo' },
  { avatar: '/img/chats/aray.png', title: 'Ерлан Абишев', preview: 'Подпиши этот договор', time: '09:01', contentIcon: FileText, attachKind: 'document' },
  // Уволенный: переписка остаётся, писать в неё уже нельзя
  {
    id: 'ekaterina', profileId: 'ekaterina', dismissed: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    title: 'Екатерина Сорокина', preview: 'спасибо!', time: '08.08',
    lastSeen: '19.06.2026 в 14:55',
  },
];
