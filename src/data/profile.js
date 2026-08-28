// Профиль (Figma node 24627-79595). Экран сильно вырос: к балансу и корп.
// данным добавились задачи, рабочие сервисы, SOS-контакты, структура и
// сертификаты. Держим всё данными, чтобы сам экран остался читаемым.

export const me = {
  name: 'Алуа Мырзахметова',
  role: 'Руководитель проекта',
  avatar: '/img/profile/avatar-photo.png',
  phone: '+7 700 757 88 99',
  email: 'alua.myrzahmetova@erg.kz',
  about: 'Как проектный менеджер, я увлечена аналитикой и вниманием к деталям. Мне нравится находить простые решения для сложных задач, развивать команды и постоянно учиться новому. В своей работе я ценю структуру, результат и гармонию.',
};

// Четыре плитки-действия под шапкой
export const quickActions = [
  { id: 'id', label: 'ID-карта', icon: 'IdentificationCard' },
  { id: 'qr', label: 'QR-код', icon: 'QrCode' },
  { id: 'vc', label: 'Визитка', icon: 'AddressBook' },
  { id: 'num', label: 'Таб. номер', icon: 'Hash' },
];

export const balance = [
  { id: 'coins', value: '5 200', label: 'ERG Coins', img: '/img/profile/erg-coin.png' },
  { id: 'vacation', value: '21', label: 'Баланс отпусков', emoji: '🏝️' },
  { id: 'insurance', value: '51 550 ₸', label: 'Мед. страховка', emoji: '🏥' },
  { id: 'meal', value: '12 540 ₸', label: 'Кошелек питания', emoji: '🍕' },
];

// Две узкие карточки и одна во всю ширину — как в макете
export const myTasks = [
  { id: 't1', title: 'На согласовании', value: 0, source: 'ЕСЭД', icon: 'UserFocus' },
  { id: 't2', title: 'На подписании', value: 0, source: 'ЕСЭД', icon: 'UserFocus' },
  { id: 't3', title: 'На подписании', value: 0, source: 'SMAX', icon: 'Headset', wide: true },
];

// Рабочие сервисы живут в боковом меню профиля: их до дюжины, в ленте экрана
// такой список занимал бы больше места, чем все остальные блоки вместе.
export const workServices = [
  { id: 'access', label: 'Документы по допуску', icon: 'FileText' },
  { id: 'assets', label: 'Мои основные средства', icon: 'Package' },
  { id: 'events', label: 'Мои мероприятия', icon: 'CalendarDots' },
  { id: 'study', label: 'Мой календарь обучения', icon: 'GraduationCap' },
  { id: 'requests', label: 'Мои заявки', icon: 'ClipboardText' },
  { id: 'approvals', label: 'Мои согласования', icon: 'CheckSquareOffset' },
  { id: 'trips', label: 'Мои командировки', icon: 'AirplaneTilt' },
  { id: 'vacation', label: 'Мои отпуска', icon: 'Umbrella' },
  { id: 'timesheet', label: 'Мой табель', icon: 'ClockCounterClockwise' },
  { id: 'refs', label: 'Мои справки', icon: 'FileArrowDown' },
  { id: 'passes', label: 'Мои пропуска', icon: 'IdentificationBadge' },
  { id: 'payroll', label: 'Мои начисления', icon: 'Wallet' },
];

// Степени родства для формы SOS-контакта. «Другое» держим последним: список
// закрытый, а под редкие случаи нужен запасной пункт.
export const sosRelations = [
  'Супруг(-а)', 'Родитель', 'Ребёнок', 'Брат / сестра',
  'Близкий родственник', 'Друг', 'Коллега', 'Другое',
];

// Контакты на случай происшествия. В прототипе они разные по составу нарочно:
// у кого-то есть комментарий, у кого-то нет — форма должна выглядеть живой
// и на заполненной карточке, и на пустой.
export const sosContacts = [
  {
    id: 's1', name: 'Серикулы Арман', tag: 'Супруг(-а)',
    phone: '+7 701 271 11 17', note: 'Основной контакт, всегда на связи',
  },
  {
    id: 's2', name: 'Абишева Гульмира Сериковна', tag: 'Родитель',
    phone: '+7 747 908 44 02', note: 'Мама, звонить после 18:00',
  },
  {
    id: 's3', name: 'Кульманов Данияр', tag: 'Коллега',
    phone: '+7 705 333 21 09',
  },
];

export const corpData = [
  { label: 'Табельный номер', value: '16002874', tag: 'Основной' },
  { label: 'Предприятие', value: 'ТОО «BTS»' },
  { label: 'Должность', value: 'Руководитель проекта' },
  { label: 'Подразделение', value: 'Управление продуктовой разработки' },
  { label: 'Административный руководитель', value: 'Кульманов Данияр', link: true },
];

export const structure = {
  supervisor: { initials: 'КД', name: 'Кульманов Данияр', role: 'Начальник управления' },
  teamCount: 6,
  team: [
    { initials: 'НХ', name: 'Хасанов Нурлан Курмангалиевич', role: 'Backend разработчик (Python)' },
    { initials: 'СБ', name: 'Сарман Берік Талгатұлы', role: 'Backend разработчик (Python)' },
  ],
};

export const indicators = [
  { id: 'manifest', value: '84%', label: 'Манифест', emoji: '🏆' },
  { id: 'thanks', value: '21', label: 'Благодарность', emoji: '🙂' },
  { id: 'pumpkin', value: '1', label: 'Тыква', img: '/img/profile/pumpkin.png' },
  { id: 'melon', value: '25', label: 'Арбуз', emoji: '🍉' },
];

export const interests = ['Баскетбол', 'Кино', 'Музыка', 'Путешествия', 'Видеоигры'];

export const certificates = [
  { id: 'c1', title: 'Курсы Compliance', sub: 'Конфликт интересов (2023 РСС)', from: '2024-11-14', to: '9999-12-31' },
];

// Настройки (Figma node 24313:85954)
export const settingsGroups = [
  {
    title: 'Основные',
    items: [
      { id: 'notif', label: 'Уведомления', icon: 'BellSimple' },
      { id: 'devices', label: 'Устройства', icon: 'DeviceMobile' },
      { id: 'lang', label: 'Язык', icon: 'Translate', value: 'Русский' },
      // value подставляется на экране: зависит от выбранного режима
      { id: 'theme', label: 'Оформление', icon: 'Moon' },
    ],
  },
  {
    title: 'Другие',
    items: [
      { id: 'perms', label: 'Настройки разрешений', icon: 'ShieldCheck' },
      { id: 'help', label: 'Помощь', icon: 'Question' },
      { id: 'privacy', label: 'Политика конфиденциальности', icon: 'FileLock' },
      { id: 'cache', label: 'Очистить кэш приложения', icon: 'Broom' },
    ],
  },
];
