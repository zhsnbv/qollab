import { ASSET, PEOPLE } from './data';

export const INITIAL_CHANNEL = {
  name: 'ERG News', description: 'Люди, события и проекты ERG. Рассказываем о главном в жизни компании.',
  avatar: '/img/posts/ch-erg-news.png', cover: ASSET + 'digital-workshop.png',
  subscribed: true, type: 'public', visibility: 'erg', authorship: 'admins',
  audit: true, project: true, hidden: false, notifications: true,
  members: [{ value: 'me', label: 'Вы', job: 'Администратор канала', avatar: '/img/profile/avatar-photo.png', role: 'admin' }, ...PEOPLE.filter(p => ['ivan', 'aliya', 'nurmukhametov', 'makashev'].includes(p.value)).map(p => ({ ...p, role: 'subscriber' }))],
};
