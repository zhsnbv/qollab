// Каналы (Figma node 24627-79597): вкладка «Каналы» в Ленте и экран просмотра
// канала. Обложки берём из существующих новостных снимков — отдельных
// экспортов под обложки в макете нет.
export const channelList = [
  {
    id: 'erg-news',
    name: 'ERG News',
    avatar: '/img/posts/ch-erg-news.png',
    cover: '/img/posts/news/n1.jpg',
    posts: '1500 публикаций',
    subscribers: '1500 подписчиков',
    about: 'Eurasian Resources Group (ERG) — одна из ведущих в мире компаний в сфере добычи и переработки природных ресурсов.',
    subscribed: false,
  },
  {
    id: 'bts-news',
    name: 'BTS News',
    avatar: '/img/posts/ch-bts-news.png',
    cover: '/img/posts/news/n2.jpg',
    posts: '1500 публикаций',
    subscribers: '860 подписчиков',
    about: 'Новости цифровой трансформации Группы: релизы qollab, внутренние сервисы и всё, что делает работу удобнее.',
    subscribed: true,
  },
  {
    id: 'erg-blog',
    name: 'Блог ERG',
    avatar: '/img/posts/ch-erg-blog.png',
    cover: '/img/posts/news/n3.jpg',
    posts: '670 публикаций',
    subscribers: '1 240 подписчиков',
    about: 'Репортажи с площадок, истории сотрудников и разборы производственных процессов изнутри.',
    subscribed: false,
  },
  {
    id: 'erg-sport',
    name: 'ERG Sport',
    avatar: '/img/posts/ch-erg-sport.png',
    cover: '/img/posts/news/n4.jpg',
    posts: '1020 публикаций',
    subscribers: '940 подписчиков',
    about: 'Спортивная жизнь Группы: турниры, спартакиады, победы наших команд и анонсы тренировок.',
    subscribed: true,
  },
  {
    id: 'erg-cu',
    name: 'ERG Corporate University',
    avatar: '/img/posts/ch-erg-cu.png',
    cover: '/img/posts/news/n5.jpg',
    posts: '420 публикаций',
    subscribers: '2 100 подписчиков',
    about: 'Обучение и развитие персонала: курсы, программы кадрового резерва и корпоративные интенсивы.',
    subscribed: false,
  },
];

// Подтабы вкладки «Каналы» из макета
export const channelScopes = [
  { id: 'available', label: 'Доступные мне' },
  { id: 'subscribed', label: 'Мои подписки' },
  { id: 'mine', label: 'Мои каналы' },
];
