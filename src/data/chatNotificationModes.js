import { Alert24Filled, AlertOff24Filled, Mention24Filled } from '@fluentui/react-icons';

export const NOTIFICATION_MODES = [
  { id: 'on', label: 'Включить уведомления', Icon: Alert24Filled },
  { id: 'mentions', label: 'Только упоминания', Icon: Mention24Filled },
  { id: 'off', label: 'Выключить уведомления', Icon: AlertOff24Filled, danger: true },
];
