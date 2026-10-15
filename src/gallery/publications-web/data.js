import { refreshPublicationMedia } from './publicationMediaRefresh';
import { EDITORIAL_POSTS } from './editorialSamples';
import { PRODUCTION_EXAMPLES } from './productionExamples';
import { MORE_FEED_POSTS } from './feedSamples';
import { IMPROVEMENT_PEOPLE, PRODUCTION_IMPROVEMENT } from './productionImprovement';
export const ASSET = '/img/publications-web/';
export const TYPES = { news: 'Новостная публикация', audit: 'Публикация с обходом', project: 'Проект-улучшение' };
export const PEOPLE = [
  ...IMPROVEMENT_PEOPLE,
  { value: 'ivan', label: 'Иванов Иван', shortLabel: 'Иванов И.', job: 'Руководитель участка' },
  { value: 'aliya', label: 'Смагулова Алия', shortLabel: 'Смагулова А.', job: 'Инженер' },
  { value: 'demo', label: 'Автор публикации', job: 'Сотрудник' },
  { value: 'nurmukhametov', label: 'Нурислам Нурисламович Нурмухаметов', shortLabel: 'Нурмухаметов Н. Н.', job: 'Менеджер по организации производства', initials: 'НН' },
  { value: 'makashev', label: 'Мусабек Жамансарович Макашев', shortLabel: 'Макашев М. Ж.', job: 'Директор', initials: 'ММ' },
];
export const COMPANIES = ['АО «ЕЭК»', 'АО «ССГПО»', 'АО «ТНК «Казхром»', 'ТОО «БТС»'].map(value => ({ value, label: value }));
export const PROJECT_FIELDS = [
  ['lead', 'Лид', 'Напишите лид'],
  ['problem', 'Описание проблемы', 'Напишите описание', true],
  ['idea', 'Главная идея', 'Напишите идею'],
  ['body', 'Основные шаги реализации', 'Напишите шаги реализации', true],
  ['difficulties', 'Сложности и зоны роста', 'Напишите сложности'],
  ['conclusion', 'Решение с выгодами от реализации проекта', 'Напишите результаты'],
  ['contacts', 'Контакты авторов для обмена опытом', 'Напишите контакты'],
];
export const PHOTO_STATUSES = ['Зоны для улучшений', 'Некритичное замечание', 'Положительные моменты'];
const photo = (name = 'prod-furnace-02.webp', caption = '') => ({ id: name, src: ASSET + name, name, caption, status: PHOTO_STATUSES[2] });
const base = { type: 'news', channel: 'ERG News', date: '6 окт, 10:30', comments: true, anonymous: false, images: [], videos: [], files: [], likes: 155, commentCount: 12, views: '1,2 тыс.', description: { ops: [{ insert: 'Цифровые инструменты помогают команде видеть состояние оборудования, быстрее замечать отклонения и принимать решения на основе данных.\n\nО том, как меняется ежедневная работа, рассказывают сотрудники производственной площадки.\n' }] } };
export const INITIAL_POSTS = [
  PRODUCTION_IMPROVEMENT,
  ...MORE_FEED_POSTS,
  ...EDITORIAL_POSTS,
  { ...base, id: 'news', ...PRODUCTION_EXAMPLES.news },
  { ...base, id: 'text', title: 'Обновлён порядок подачи заявок в Service Desk', lead: 'Собрали в одном месте ответы на частые вопросы и объяснили, как быстрее получить помощь.', pinned: true },
  { ...base, id: 'gallery', ...PRODUCTION_EXAMPLES.gallery },
  { ...base, id: 'video', title: 'Как работает цифровой мониторинг оборудования', lead: 'Короткое видео о том, как специалисты замечают отклонения и принимают решения.', videos: [{ id: 'video1', provider: 'youtube', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' }] },
  { ...base, id: 'file', title: 'Новая памятка по промышленной безопасности', lead: 'Правила подготовки рабочего места и чек-лист перед началом смены — в приложенном документе.', files: [{ id: 'file1', name: 'Памятка по безопасности.pdf', url: '/publications-demo.pdf', size: 'PDF' }] },
  { ...base, id: 'audit', type: 'audit', likes: 35, commentCount: 4, ...PRODUCTION_EXAMPLES.audit },
  { ...base, id: 'project', type: 'project', title: 'Сокращение времени обслуживания', lead: 'Команда предложила новый порядок подготовки оборудования и сократила время плановых работ.', author: 'demo', authors: ['ivan', 'aliya'], company: 'АО «ЕЭК»', effect: 12, likes: 35, commentCount: 4, dossiers: { ivan: 'Руководит производственным участком. Участвует в проектах повышения эффективности.', aliya: 'Инженер проекта. Отвечает за анализ процессов и внедрение улучшений.' }, problem: 'Подготовка оборудования занимала слишком много времени.', idea: 'Стандартизировать подготовку и выполнять часть работ параллельно.', body: 'Команда проанализировала процесс, подготовила чек-листы и провела пилот на одном участке.', difficulties: 'Согласовать новый порядок работы со всеми участниками.', conclusion: 'Сокращено время обслуживания. Экономический эффект — 12 млн тенге.', contacts: 'Команда проекта в Qollab', images: [photo()] },
].map(post => ({ ...refreshPublicationMedia(post), mediaBackdrop: 'solid' }));
export function emptyPost(type) {
  return { type, title: '', lead: '', cardAppearance: 'cover', description: { ops: [{ insert: '\n' }] }, images: [], videos: [], files: [], comments: true, anonymous: false, rating: 0, author: 'demo', authors: [], dossiers: {} };
}
export function titleOf(post) { return post.type === 'project' ? 'Проект-улучшение: ' + post.title : post.title; }
export function videoEmbed(video) {
  try {
    const u = new URL(video.url);
    if (u.protocol !== 'https:') return null;
    if (video.provider === 'youtube') {
      const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(u.hostname) ? u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1] : null;
      return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    const id = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(u.hostname) && u.pathname.match(/(?:\/video)?\/(\d+)$/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  } catch { return null; }
}
