// Adapted from the linked official ERG articles. Keep facts and source dates intact.
const photo = name => ({ id: name, src: `/img/publications-web/${name}`, caption: '' });
const paragraph = (text, heading = false) => [
  { insert: text }, { insert: '\n', ...(heading ? { attributes: { header: 2 } } : {}) },
];
const base = { type: 'news', comments: true, anonymous: false, cardAppearance: 'cover', mediaBackdrop: 'solid', videos: [], files: [], likes: 0, commentCount: 0, views: '0' };
export const EDITORIAL_SAMPLE_BATCH = 'editorial-articles-2026-10-15';
export const EDITORIAL_POSTS = [
  {
    ...base, id: 'erg-run-fest-2026', rubric: 'sport', channel: 'ERG Sport', channelId: 'erg-sport', channelAvatar: '/img/posts/ch-erg-sport.png', date: '21 сент 2026',
    title: 'ERG Run Fest: три города и более 7 млн тенге для спорта',
    lead: 'Участники забегов в Аксу, Хромтау и Рудном помогли собрать средства для детского спорта и городского бассейна.',
    description: { ops: [
      ...paragraph('Дистанция для каждого', true),
      ...paragraph('Взрослым предложили забеги на 3, 5, 10 и 21 километр. Для детей от 6 до 13 лет подготовили отдельные старты. Сотрудники предприятий ERG бежали вместе с жителями городов; у трассы их поддерживали семьи, друзья и коллеги.'),
      ...paragraph('От Аксу до Рудного', true),
      ...paragraph('Серия началась в Аксу 30 августа. Следующий этап прошёл 13 сентября в Хромтау: на старт вышли 1 200 человек из 17 городов и населённых пунктов. Рудный принял заключительный забег 20 сентября — места на него разобрали за две недели.'),
      ...paragraph('Куда направят средства', true),
      ...paragraph('В Аксу участники собрали 2,6 млн тенге, в Хромтау — 1,9 млн. Эти средства предназначены для детского спортивного инвентаря. В Рудном собрали более 2,5 млн тенге: на них планируют приобрести дозатор для бассейна МСК «Горняк».'),
    ] },
    images: [photo('erg-run-fest-2026.webp')],
    source: { url: 'https://erg.kz/ru/news/show/3871', captured: '2026-10-15', note: 'Краткая редакционная адаптация официального материала ERG.' },
  },
  {
    ...base, id: 'erg-ssgpo-trees-2025', rubric: 'ecology', channel: 'Новости ERG', channelId: 'erg-production', channelAvatar: '/img/posts/ch-erg-news.png', date: '10 апр 2025',
    title: 'ССГПО высадило 15 тысяч деревьев в рамках «Таза Қазақстан»',
    lead: 'Новые тополя появились у отвалов и склада готовой продукции. К сотрудникам предприятия присоединились студенты колледжей.',
    description: { ops: [
      ...paragraph('Зелёная полоса у предприятия', true),
      ...paragraph('Весеннюю посадку начали с 14 тысяч деревьев вдоль отвалов ССГПО. Ещё тысячу пирамидальных тополей высадили между складом готовой продукции и городом. Так у промышленной площадки появилась дополнительная зелёная полоса.'),
      ...paragraph('Общая работа', true),
      ...paragraph('В акции участвовали экологи объединения, сотрудники подрядной организации и учащиеся колледжей. С посадкой тысячи саженцев команда справилась менее чем за час. Озеленение проходит ежегодно и входит в экологическую стратегию ERG, действующую с 2018 года.'),
      ...paragraph('После посадки', true),
      ...paragraph('Экологи продолжают наблюдать за состоянием деревьев. Из более чем 17 тысяч саженцев, высаженных в 2023 году, прижилось свыше 80%. Засохшие деревья планируют заменить. Уход за посадками помогает сохранить результат акции и постепенно увеличить зелёный фонд региона.'),
    ] },
    images: [photo('erg-ssgpo-trees-2025.webp')],
    source: { url: 'https://www.erg.kz/ru/news/show/3560', captured: '2026-10-15', note: 'Краткая редакционная адаптация официального материала ERG.' },
  },
];
export const EDITORIAL_CASE_POSTS = { sport: 'erg-run-fest-2026', safety: 'prod-fire-drill', production: 'news', ecology: 'erg-ssgpo-trees-2025' };
export const PUBLICATION_FEED_ORDER = { news: 0, audit: 1, 'prod-project-aglo': 2, 'erg-run-fest-2026': 3, 'prod-fire-drill': 4, 'erg-ssgpo-trees-2025': 5 };

// Migrate once, preserving edits, discussions, subscriptions and deliberate deletions.
export function addEditorialSamples(saved) {
  if (saved.sampleBatches?.includes(EDITORIAL_SAMPLE_BATCH)) return saved;
  const ids = new Set(saved.posts.map(post => post.id));
  const additions = EDITORIAL_POSTS.filter(post => !ids.has(post.id));
  return { ...saved, posts: [...saved.posts, ...additions],
    discussions: { ...Object.fromEntries(additions.map(post => [post.id, []])), ...saved.discussions },
    sampleBatches: [...(saved.sampleBatches || []), EDITORIAL_SAMPLE_BATCH] };
}
