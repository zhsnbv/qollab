import { ACTIVE_SHARE_CHATS, profilePayload, forwardedPayload, recipientChat } from '../../utils/sharing';
import { getPerson } from '../../data/person';
import { employees } from '../../data/employees';
export const SHARE_PERSON = getPerson('ayazhan');
export const SHARE_CONTACT = profilePayload(SHARE_PERSON);
export const SHARE_COLLEAGUE = employees.find(person => person.id === 'nurlan-ibragimov');
export const SHARE_RECIPIENT = ACTIVE_SHARE_CHATS.find(person => person.id === 'daniyar');
export const SHARE_MESSAGE = { id: 'share-demo-message', mine: false, text: 'Коллеги, финальные макеты готовы. Посмотрите, пожалуйста, перед встречей в 15:00.', forwardedFrom: 'Аяжан Сериккызы', time: '11:28' };
const card = { ...SHARE_CONTACT, id: 'share-demo-card', time: '11:33', status: 'delivered' };
export const SHARE_CASES = [
  { id: 'profile', title: 'Кнопка в шапке', note: 'Поделиться слева от «…». Заголовок остаётся по центру.', stage: 0 },
  { id: 'chats', title: 'Активные чаты', note: 'Компактная плашка с иконкой ссылки и недавние чаты.', stage: 0, preview: { open: true } },
  { id: 'search', title: 'Поиск коллеги', note: 'Поиск по имени, телефону и должности.', stage: 0, preview: { open: true, query: 'Нурлан' } },
  { id: 'selected', title: 'Получатель выбран', note: 'Получатель отмечен галочкой. Повторный тап снимает выбор.', stage: 0, preview: { open: true, query: 'Нурлан', selected: SHARE_COLLEAGUE } },
  { id: 'sent', title: 'Карточка в чате', note: 'Аватарка и имя. Нажатие открывает профиль.', stage: 1, messages: [{ id: 'intro', text: 'Пришли, пожалуйста, профиль руководителя проекта.', time: '11:31' }, { ...card, mine: true }] },
  { id: 'received', title: 'Переслать карточку', note: 'Удерживайте полученную карточку и выберите «Переслать».', stage: 1, messages: [{ id: 'intro', text: 'Вот профиль Аяжан, она поможет с проектом.', time: '11:32' }, { ...card, mine: false }] },
  { id: 'card-forward', title: 'Пересылка профиля', note: 'Тот же выбор чата. Карточка сохраняет аватарку и имя.', stage: 1, messages: [{ ...card, mine: false }], forward: forwardedPayload(card, 'Данияр Кенжебаев') },
  { id: 'message', title: 'Пересланное сообщение', note: 'Повторная пересылка сохраняет первоначального автора.', stage: 2, messages: [SHARE_MESSAGE] },
  { id: 'message-forward', title: 'Выбор чата для сообщения', note: 'Активные чаты и поиск работают так же, как для профиля.', stage: 2, messages: [SHARE_MESSAGE], forward: { ...forwardedPayload(SHARE_MESSAGE, 'Данияр Кенжебаев'), source: { chatId: 'daniyar', messageId: SHARE_MESSAGE.id } } },
  { id: 'message-sent', title: 'Сообщение отправлено', note: 'Текст и автор сохранены в новом чате.', stage: 2, messages: [{ ...SHARE_MESSAGE, id: 'share-demo-forwarded', mine: true, time: '11:34', status: 'delivered' }] },
  { id: 'copied', title: 'Ссылка скопирована', note: 'Иконка ссылки в плашке меняется на галочку.', stage: 3, preview: { open: true, copied: true } },
  { id: 'empty', title: 'Ничего не найдено', note: 'Можно изменить запрос, сбросить поиск или скопировать ссылку.', stage: 3, preview: { open: true, query: 'Александр Петрович' } },
];
export function shareEntry(item, capture = false) {
  return item.messages ? { pathname: '/chats/dm', state: { chat: recipientChat(SHARE_RECIPIENT), sharePreview: { messages: item.messages, forward: item.forward, capture } } } : { pathname: '/person', state: { id: 'ayazhan', online: true, sharePreview: item.preview } };
}
