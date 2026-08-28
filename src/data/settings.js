// Данные экранов настроек: push-уведомления по сервисам, разрешения,
// устройства и карточка «данные об устройстве» для обращения в поддержку.

// Push-уведомления приходят от сервисов, а не «вообще»: выключить можно
// каждый по отдельности. Порядок — как в приложении, служебные внизу.
export const pushSources = [
  { id: 'unlock', label: 'Разблокировать УЗ', emoji: '🔓', on: true },
  { id: 'ticket', label: 'Тикет система', emoji: '🎫', on: true },
  { id: 'noreply', label: 'qollab-no-reply', logo: true, on: true },
  { id: 'queue', label: 'Электронная очередь', emoji: '🗂️', on: true },
  { id: 'rtm', label: 'Учет операций РТМ', emoji: '📋', on: true },
  { id: 'safety', label: 'ОТиПБ', emoji: '👷', on: true },
  { id: 'mes', label: 'MES', emoji: '🏭', on: true },
  { id: 'sales', label: 'Sales Market', emoji: '🏪', on: true },
  { id: 'profile', label: 'Профиль', logo: true, on: true },
  { id: 'stage', label: 'Сервисы STAGE', logo: true, on: true },
  { id: 'dev', label: 'Сервисы — DEV', logo: true, on: true },
  { id: 'channels', label: 'Каналы', logo: true, on: true },
];

// Разрешения устройства. В прототипе состояние своё: настоящие выдаёт система,
// и подменять её диалоги приложение не должно.
export const permissions = [
  { id: 'push', label: 'Уведомления', icon: 'BellSimple', on: true },
  { id: 'camera', label: 'Доступ к камере', icon: 'Camera', on: true },
  { id: 'mic', label: 'Доступ к микрофону', icon: 'Microphone', on: true },
  { id: 'gallery', label: 'Доступ к галерее', icon: 'Image', on: true },
  { id: 'geo', label: 'Доступ к геолокации', icon: 'MapPin', on: false },
  { id: 'bt', label: 'Доступ к Bluetooth', icon: 'BluetoothIcon', on: false },
];

export const thisDevice = { id: 'iphone', name: 'iPhone', when: 'активно', kind: 'phone' };

export const activeSessions = [
  { id: 'chrome', name: 'Chrome', when: 'сегодня в 13:39', kind: 'desktop' },
];

// Карточка для поддержки: её копируют целиком и присылают в обращении,
// поэтому поля и порядок совпадают с тем, что просит первая линия.
export const deviceInfo = [
  ['Версия приложения', '3.0.2.7'],
  ['Название девайса', 'iPhone'],
  ['Модель девайса', 'iPhone 15 Pro'],
  ['OS девайса', 'ios 26.6'],
  ['Время девайса', '28.08.2026, 15:27:24'],
  ['Оператор телефонной связи', '—'],
  ['Тип подключенной сети', 'wifi'],
  ['Свободное встроенное пространство', '75.43 Gb'],
  ['Номер телефона', '77000000991'],
];

export const languages = [
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'kk', label: 'Қазақ тілі', flag: '🇰🇿' },
];
