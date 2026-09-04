// Виджеты главной — состав из ТЗ «Настраиваемые виджеты главной страницы».
// Тип задаётся здесь, а не в коде экрана: по ТЗ администратор меняет признак
// в своём интерфейсе, и перевод виджета в настраиваемые не требует разработки.
//
// На старте настраиваемые только два новых — «Мои встречи» и «Почта».
// Остальные постоянные: привычный вид главной не меняется у тех, кто ничего
// настраивать не станет, а механизм проверяется на новых карточках.
export const widgetList = [
  {
    id: 'meet',
    name: 'Мои встречи',
    title: 'Встречи на сегодня',
    icon: 'CalendarDots',
    user: true,
  },
  {
    id: 'mail',
    name: 'Почта',
    title: 'Электронная почта',
    icon: 'EnvelopeSimple',
    user: true,
  },
  {
    id: 'important',
    name: 'Важное и полезное',
    title: 'Важное',
    icon: 'WarningCircle',
    user: false,
  },
  {
    id: 'safety',
    name: 'Безопасность',
    title: 'Безопасность',
    icon: 'ShieldCheck',
    user: false,
  },
  {
    id: 'links',
    name: 'Полезные ссылки',
    title: 'Полезные ссылки',
    icon: 'LinkSimple',
    user: false,
  },
  {
    id: 'journal',
    name: 'Корпоративный журнал',
    title: 'Корпоративный журнал',
    icon: 'BookOpen',
    user: false,
  },
];

// Данные виджетов. В прототипе они статичные — на проде это ответы
// /widgets/meetings и /mail-bridge/mailbox/summary.
export const widgetData = {
  meetings: [
    { id: 'm1', title: 'Синк по релизу 3.1', from: '10:00', to: '11:00', now: true },
    { id: 'm2', title: 'Комитет по безопасности', from: '13:00', to: '13:45' },
    { id: 'm3', title: '1-on-1 с Динарой Т.', from: '16:30', to: '17:00' },
  ],
  meetingsMore: 2,
  mail: {
    unread: 17,
    messages: [
      { id: 'e1', from: 'Динара Т.', subject: 'Согласование бюджета Q4', time: '14:02', unread: true },
      { id: 'e2', from: 'HR-портал', subject: 'Заявка на отпуск одобрена', time: '11:40', unread: true },
      { id: 'e3', from: 'Нурлан Б.', subject: 'Правки по макетам', time: '09:18', unread: false },
    ],
  },
  safetyDays: 214,
  important: { text: 'Изменился номер контакт-центра', value: '7777' },
  links: ['Заявка в Service Desk', 'Горячая линия ERG', 'Кадровые справки'],
  journal: 'Выпуск №4 · сентябрь 2026',
};
