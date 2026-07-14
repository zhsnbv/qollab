// Общие данные ленты (публикации + мероприятия) для Главной и Новостей.

export const channels = [
  { name: 'Все каналы', img: '/img/posts/ch-all.png', all: true },
  { name: 'ERG News', img: '/img/posts/ch-erg-news.png' },
  { name: 'Блог ERG', img: '/img/posts/ch-erg-blog.png' },
  { name: 'ERG Sport', img: '/img/posts/ch-erg-sport.png' },
  { name: 'BTS News', img: '/img/posts/ch-bts-news.png' },
  { name: 'ERG CU', img: '/img/posts/ch-erg-cu.png', cu: true },
];

export const basePosts = [
  {
    channel: 'ERG News', avatar: '/img/posts/ch-erg-news.png',
    title: 'Что скрывается за словами «Цифровой цех»?',
    excerpt: 'Разбираемся, как цифровизация меняет производственные площадки ERG и что это даёт сотрудникам на местах.',
    date: '8 окт', likes: '155', comments: '12',
    thumb: '/img/posts/thumb-1.png',
  },
  {
    channel: 'ERG News', avatar: '/img/posts/ch-erg-news.png',
    title: 'Первый после майских событий массовый взрыв произведен на шахте «Болашақ»',
    excerpt: 'Работы возобновлены после плановой паузы — рассказываем о мерах безопасности и объёмах.',
    date: '5 сент', likes: '35', comments: '4',
  },
  {
    channel: 'ERG Sport', avatar: '/img/posts/ch-erg-sport.png',
    title: 'Команда ЕЭК стала чемпионом турнира памяти Константина Примакова',
    excerpt: 'Финальный матч прошёл в упорной борьбе и завершился уверенной победой наших спортсменов.',
    date: '4 сент', likes: '545', comments: '453',
    thumb: '/img/posts/thumb-3.png', read: true,
  },
  {
    channel: 'BTS News', avatar: '/img/posts/ch-bts-news.png',
    title: 'Что нового в qollab data 2.4.0?',
    excerpt: 'Обновили аналитику, ускорили отчёты и добавили тёмную тему — коротко о главном в релизе.',
    date: '3 сент', likes: '545', comments: '453',
    thumb: '/img/posts/thumb-4.png', read: true,
  },
  {
    channel: 'ERG News', avatar: '/img/posts/ch-erg-news.png',
    title: 'День шахтера и 40-летие предприятий с размахом отметили в ERG',
    excerpt: 'Концерты, награждения и семейный праздник объединили тысячи сотрудников по всей стране.',
    date: '2 сент', likes: '3 325', comments: '1 115',
    thumb: '/img/posts/thumb-5.png', read: true,
  },
];

const channelByName = {
  news: { channel: 'ERG News', avatar: '/img/posts/ch-erg-news.png' },
  sport: { channel: 'ERG Sport', avatar: '/img/posts/ch-erg-sport.png' },
  bts: { channel: 'BTS News', avatar: '/img/posts/ch-bts-news.png' },
  blog: { channel: 'Блог ERG', avatar: '/img/posts/ch-erg-blog.png' },
};

const feed = [
  { ch: 'news', kw: 'excavator,mining', title: 'На разрезе «Восточный» ввели в строй новый карьерный экскаватор', excerpt: 'Машина повысит объём вскрышных работ и заменит устаревшую технику на участке.' },
  { ch: 'news', kw: 'steel,factory', title: 'Актюбинский завод ферросплавов нарастил выпуск продукции на 12%', excerpt: 'Рост обеспечили модернизация печей и оптимизация логистики сырья.' },
  { ch: 'blog', kw: 'foundry,steel', title: 'Как работает сталеплавильный цех: репортаж из горячего сердца завода', excerpt: 'Прошли весь путь металла — от загрузки шихты до готового сляба.' },
  { ch: 'news', kw: 'mining,plant', title: 'Модернизация обогатительной фабрики выходит на финальный этап', excerpt: 'Новое оборудование повысит извлечение полезного компонента из руды.' },
  { ch: 'blog', kw: 'turbine,powerplant', title: 'Инженеры ERG внедрили новую турбину на энергоблоке ТЭЦ', excerpt: 'Замена повысит КПД станции и снизит удельный расход топлива.' },
  { ch: 'news', kw: 'pipeline,industry', title: 'Завершена реконструкция магистрального трубопровода на комбинате', excerpt: 'Работы прошли без остановки основного производства.' },
  { ch: 'news', kw: 'solar,energy', title: 'Энергоэффективность предприятий ERG выросла по итогам полугодия', excerpt: 'Экономию дали автоматизация и программы бережливого производства.' },
  { ch: 'news', kw: 'construction,factory', title: 'На строительной площадке нового цеха стартовал монтаж оборудования', excerpt: 'Запуск линии запланирован уже на следующий квартал.' },
  { ch: 'bts', kw: 'truck,mining', title: 'Обновлён парк большегрузных самосвалов для горных работ', excerpt: 'Новые машины грузоподъёмностью до 220 тонн вышли на маршруты.' },
  { ch: 'news', kw: 'warehouse,logistics', title: 'Открыт современный логистический склад на Соколовско-Сарбайском ГОК', excerpt: 'Автоматизированное хранение ускорит отгрузку и учёт материалов.' },
  { ch: 'blog', kw: 'laboratory,data', title: 'Цифровая лаборатория ERG: как данные меняют производство', excerpt: 'Модели предсказывают отказы оборудования раньше, чем они случаются.' },
  { ch: 'sport', kw: 'athletics,sport', title: 'Команда ERG стала призёром корпоративной спартакиады', excerpt: 'Наши атлеты завоевали медали сразу в пяти дисциплинах.' },
];
const dates = ['28 авг', '25 авг', '21 авг', '18 авг', '14 авг', '11 авг', '7 авг', '4 авг', '31 июл', '28 июл'];

export function makePost(i) {
  const f = feed[i % feed.length];
  return {
    ...channelByName[f.ch],
    title: f.title,
    excerpt: f.excerpt,
    date: dates[Math.min(Math.floor(i / 1.5), dates.length - 1)],
    likes: String(40 + (i * 137) % 900),
    comments: String(2 + (i * 41) % 180),
    thumb: i % 4 === 3 ? undefined : `/img/posts/news/n${(i % feed.length) + 1}.jpg`,
    read: true,
  };
}

// Мероприятия — вид из Figma (node 19796:3387). ~9 карточек с релевантными мок-данными.
export const events = [
  { img: '/img/posts/events/e1.jpg', when: 'Среда, 2 янв 19:30 – 30 янв 21:00', title: 'Беговые тренировки в манеже в декабре', org: '4 организатора' },
  { img: '/img/posts/events/e2.jpg', when: 'Четверг, 26 янв 15:30 – 18:00', title: 'Новогодний Stand-Up ERG', org: '2 организатора' },
  { img: '/img/posts/events/e3.jpg', when: 'Понедельник, 26 янв 15:30 – 18:00', title: 'Корпоративный гала-ужин по итогам года', org: '3 организатора' },
  { img: '/img/posts/events/e4.jpg', when: 'Вторник, 4 фев 10:00 – 13:00', title: 'Семинар по промышленной безопасности', org: '1 организатор' },
  { img: '/img/posts/events/e5.jpg', when: 'Пятница, 14 фев 19:00 – 22:00', title: 'Концерт ко Дню защитника Отечества', org: '5 организаторов' },
  { img: '/img/posts/events/e6.jpg', when: 'Суббота, 22 фев 11:00 – 16:00', title: 'День открытых дверей на комбинате', org: '3 организатора' },
  { img: '/img/posts/events/e7.jpg', when: 'Среда, 5 мар 14:00 – 17:00', title: 'Мастер-класс по бережливому производству', org: '2 организатора' },
  { img: '/img/posts/events/e8.jpg', when: 'Пятница, 7 мар 18:00 – 21:00', title: 'Праздничный вечер к 8 Марта', org: '6 организаторов' },
  { img: '/img/posts/events/e9.jpg', when: 'Понедельник, 17 мар 09:30 – 13:00', title: 'Форум молодых специалистов ERG', org: '4 организатора' },
];
