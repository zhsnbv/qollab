// Профили из чатов (Figma node 25110-107882): открываются тапом по шапке
// личного чата и по аватарке участника в групповом.
// Медиа/файлы/ссылки — общий демонстрационный набор: в прототипе они одни
// на всех, отдельные подборки на каждого человека ничего не добавляют.
const media = [
  { id: 'm1', img: '/img/posts/events/e1.jpg' },
  { id: 'm2', img: '/img/posts/events/e2.jpg' },
  { id: 'm3', img: '/img/posts/events/e3.jpg', video: '0:45' },
  { id: 'm4', img: '/img/posts/events/e4.jpg' },
  { id: 'm5', img: '/img/posts/events/e5.jpg' },
  { id: 'm6', img: '/img/posts/events/e6.jpg' },
];

const files = [
  { id: 'f1', name: 'presentation.pdf', size: '1.1 МБ' },
  { id: 'f2', name: 'archive.zip', size: '0,5 КБ' },
];

const links = [
  { id: 'l1', url: 'https://qollab.kz/' },
  { id: 'l2', url: 'https://google.com/' },
];

const groups = [
  { id: 'g1', name: 'qollab bugs & offers', img: '/img/chats/qollab-group.png' },
  { id: 'g2', name: 'qollab', img: '/img/chats/qollab-group.png' },
  { id: 'g3', name: 'Электронное наряд задание', initials: 'ЭН', tint: 'green' },
  { id: 'g4', name: 'Группа поддержки qollab', img: '/img/chats/bts-pr.png' },
];

export const userProfiles = {
  ayazhan: {
    id: 'ayazhan',
    name: 'Аяжан Сериккызы',
    status: 'был(-а) в сети 3 минуты назад',
    avatar: '/img/chats/ayazhan.png',
    role: 'Руководитель проекта',
    phone: '+7 (700) 000-09-91',
    groups, media, files, links,
  },
  dinara: {
    id: 'dinara',
    name: 'Динара Токтарова',
    status: 'в сети',
    avatar: '/img/chats/ayazhan.png',
    role: 'Бизнес-аналитик',
    phone: '+7 (700) 000-11-24',
    groups, media, files, links,
  },
  nurlan: {
    id: 'nurlan',
    name: 'Нурлан Бейсенов',
    status: 'был(-а) в сети 12 минут назад',
    initials: 'НБ',
    tint: 'green',
    role: 'Backend разработчик (Python)',
    phone: '+7 (700) 000-45-08',
    groups, media, files, links,
  },
  arman: {
    id: 'arman',
    name: 'Арман Ахметов',
    status: 'был(-а) в сети час назад',
    initials: 'АА',
    tint: 'blue',
    role: 'Team Lead Product Manager',
    phone: '+7 (700) 000-77-315',
    groups, media, files, links,
  },
  madina: {
    id: 'madina',
    name: 'Мадина Касымова',
    status: 'был(-а) в сети вчера',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'QA тестировщик',
    phone: '+7 (700) 000-32-90',
    groups, media, files, links,
  },
};

// Профиль группы: то же ядро, но вместо должности и телефона — описание,
// а вместо «был(-а) в сети» — число участников.
export const groupProfiles = {
  prodev: {
    id: 'prodev',
    name: 'PR01DEV + ROBOTS',
    avatar: '/img/chats/bts-pr.png',
    membersCount: 73,
    description: 'https://link.qollab.kz/?command=invite&token=ve4dEx-5PWLxPnMVpBfbUSoRluDFN0eMF',
    members: [
      { id: 'dinara', name: 'Динара Т.', role: 'Бизнес-аналитик' },
      { id: 'nurlan', name: 'Нурлан Б.', role: 'Backend разработчик (Python)' },
      { id: 'arman', name: 'Арман А.', role: 'Team Lead Product Manager' },
      { id: 'madina', name: 'Мадина К.', role: 'QA тестировщик' },
      { id: 'ayazhan', name: 'Аяжан С.', role: 'Руководитель проекта' },
    ],
    media, files, links,
  },
};
