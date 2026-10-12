import { ASSET, PROJECT_FIELDS } from './data';
import { documentHasContent } from './blockDocument';

export function hasBody(post) {
  return post.type === 'project' ? PROJECT_FIELDS.some(([key]) => key !== 'lead' && post[key]?.trim()) || (!post.anonymous && !!post.authors?.length) : documentHasContent(post.description);
}

export const initialComments = [
  { id: 'c1', name: 'Алия Смагулова', avatar: '/img/chats/ayazhan.png', text: 'Интересно увидеть, как это работает на других площадках. Будет продолжение?', date: '6 окт', likes: 8, replies: [{ id: 'c2', name: 'ERG News', avatar: '/img/posts/ch-erg-news.png', text: 'Да, готовим материал с примерами внедрения. Поделимся в канале.', date: '6 окт', likes: 3, channel: true, replies: [{ id: 'c3', name: 'Алия Смагулова', avatar: '/img/chats/ayazhan.png', text: 'Спасибо, буду ждать!', date: '6 окт', likes: 1, replies: [] }] }] },
  { id: 'c4', name: 'Иван Иванов', avatar: ASSET + 'person.png', text: 'У нас на участке такой подход уже помог сократить время проверки оборудования.', date: '6 окт', likes: 4, replies: [] },
];
