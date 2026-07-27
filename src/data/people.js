// Сотрудники и гости для поиска — имена, компании и должности из макета
// (Search - Employees / Search - Guests, node 23930-6898).
// avatar есть только у первого в каждом списке, как в макете; у остальных
// рисуются инициалы на цветном круге (цвет берётся по индексу, см. Search.jsx).

export const enterprises = [
  'ТОО «BTS»',
  'АО «КЭЗ»',
  'АО «АЭК»',
  'АО «АК»',
  'АО «ШК»',
  'ТОО «ТрансКом»',
  'АО «ССГПО»',
  'АО «АЗФ»',
];

export const employees = [
  { id: 'e1', name: 'Нурлан Ибрагимович Ибрагимов', org: 'ТОО «BTS»', role: 'Java Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'e2', name: 'Асель Анатольевна Нурлановна', org: 'АО «КЭЗ»', role: 'Эл.монтер по опер.обсл.распр.сетей' },
  { id: 'e3', name: 'Нурлан Сергеевич Кулбаев', org: 'АО «АЭК»', role: 'Мастер' },
  { id: 'e4', name: 'Айнура Нуреева Сарсенова', org: 'АО «АК»', role: 'Помощник машиниста бурового станка' },
  { id: 'e5', name: 'Ерлан Нурланович Сулейменов', org: 'АО «ШК»', role: 'Аппаратчик-гидрометаллург' },
  { id: 'e6', name: 'Нуржан Маратович Аманжолов', org: 'ТОО «ТрансКом»', role: 'Начальник смены' },
  { id: 'e7', name: 'Динара Ержановна Оспанова', org: 'АО «ССГПО»', role: 'Ведущий бухгалтер' },
  { id: 'e8', name: 'Тимур Асхатович Байтенов', org: 'АО «АЗФ»', role: 'Инженер-технолог' },
];

export const guests = [
  { id: 'g1', name: 'Алихан Серикович Тулегенов', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { id: 'g2', name: 'Динара Анатольевна Касымова' },
  { id: 'g3', name: 'Марат Серикович Жумабаев' },
  { id: 'g4', name: 'Светлана Нурлановна Баймуханова' },
  { id: 'g5', name: 'Ермек Нурланович Тлеубаев' },
  { id: 'g6', name: 'Азамат Маратович Сарсенов' },
];

// Каналы — из макета Search - Channels; аватары переиспользуем из ленты.
export const searchChannels = [
  { id: 'c1', name: 'ERG News', posts: '332 публикации', img: '/img/posts/ch-erg-news.png' },
  { id: 'c2', name: 'Блог ERG', posts: '67 публикаций', img: '/img/posts/ch-erg-blog.png' },
  { id: 'c3', name: 'ERG Sport', posts: '102 публикации', img: '/img/posts/ch-erg-sport.png' },
  { id: 'c4', name: 'ERG Corporate University', posts: '42 публикации', img: '/img/posts/ch-erg-cu.png' },
  { id: 'c5', name: 'BTS News', posts: '28 публикаций', img: '/img/posts/ch-bts-news.png' },
];
