// Каналы (Figma node 24627-79597): вкладка «Каналы» в Ленте и экран просмотра
// канала. Обложки берём из существующих новостных снимков — отдельных
// экспортов под обложки в макете нет.
export const channelList = [
  {
    id: 'erg-news',
    name: 'ERG News',
    // Обязательный: на него подписывает компания, отписаться нельзя
    required: true,
    avatar: '/img/posts/ch-erg-news.png',
    cover: '/img/posts/news/n1.jpg',
    posts: '1500 публикаций',
    subscribers: '1500 подписчиков',
    about: 'Eurasian Resources Group (ERG) — одна из ведущих в мире компаний в сфере добычи и переработки природных ресурсов.',
    subscribed: true,
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
    subscribed: true,
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
    fit: 'contain',
    cover: '/img/posts/news/n5.jpg',
    posts: '420 публикаций',
    subscribers: '2 100 подписчиков',
    about: 'Обучение и развитие персонала: курсы, программы кадрового резерва и корпоративные интенсивы.',
    subscribed: true,
  },
  // Каналы предприятий и служб. Аватарка есть у каждого: канала без лица
  // не бывает — по нему его и узнают в ленте.
  {
    id: 'ot-pb', name: 'Охрана труда и ПБ', avatar: '/img/posts/ch-ot.svg',
    required: true,
    cover: '/img/posts/news/n3.jpg',
    posts: '420 публикаций', subscribers: '3 100 подписчиков',
    about: 'Правила, инструктажи и разборы происшествий. Обязателен для производственных площадок.',
    subscribed: true,
  },
  {
    id: 'hr', name: 'HR-портал', avatar: '/img/posts/ch-hr.svg',
    cover: '/img/posts/news/n4.jpg',
    posts: '860 публикаций', subscribers: '4 800 подписчиков',
    about: 'Вакансии, обучение, льготы и всё, что касается работы в группе.',
    subscribed: false,
  },
  {
    id: 'it', name: 'IT-служба', avatar: '/img/posts/ch-it.svg',
    cover: '/img/posts/news/n5.jpg',
    posts: '310 публикаций', subscribers: '2 400 подписчиков',
    about: 'Работы на сервисах, обновления qollab и ответы на частые вопросы.',
    subscribed: false,
  },
  {
    id: 'union', name: 'Профсоюз', avatar: '/img/posts/ch-union.svg',
    cover: '/img/posts/news/n6.jpg',
    posts: '180 публикаций', subscribers: '1 900 подписчиков',
    about: 'Путёвки, материальная помощь, коллективный договор.',
    subscribed: false,
  },
  {
    id: 'shubarkol', name: 'Шубарколь Комир', avatar: '/img/posts/ch-shubarkol.svg',
    cover: '/img/posts/news/n1.jpg',
    posts: '640 публикаций', subscribers: '1 100 подписчиков',
    about: 'Новости предприятия: добыча, смены, люди.',
    subscribed: false,
  },
  {
    id: 'kez', name: 'Казахстанский электролизный завод', avatar: '/img/posts/ch-kez.svg',
    cover: '/img/posts/news/n2.jpg',
    posts: '520 публикаций', subscribers: '980 подписчиков',
    about: 'Производство алюминия: показатели, проекты и жизнь завода.',
    subscribed: false,
  },
];

// Подтабы вкладки «Каналы» из макета
export const channelScopes = [
  { id: 'available', label: 'Доступные мне' },
  { id: 'subscribed', label: 'Мои подписки' },
  { id: 'mine', label: 'Мои каналы' },
];
