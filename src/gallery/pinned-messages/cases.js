// Each card starts at a different point in the same real group conversation.
const nurlan = { short: 'Нурлан Б.', initials: 'НБ', tint: 'green', color: '#389617' };
const dinara = { short: 'Динара Т.', avatar: '/img/chats/ayazhan.png', color: '#cf3487' };
const messages = [
  { id: 'hello', author: dinara, time: '09:40', text: 'Коллеги, во сколько встречаемся завтра?' },
  { id: 'meeting', author: nurlan, time: '09:42', text: 'Встречаемся в 10:00 в переговорной «Алатау».' },
  { id: 'agenda', mine: true, time: '09:44', text: 'Начнём с плана релиза, затем обсудим сроки.' },
  { id: 'file', mine: true, time: '09:45', kind: 'document', name: 'План релиза.pdf', size: '482 КБ' },
  { id: 'thanks', author: dinara, time: '09:47', text: 'Спасибо, до завтра!' },
];
const one = ['meeting'];
const many = ['meeting', 'agenda', 'file'];
const pinnedNotice = 'Вы закрепили сообщение «' + messages[1].text + '»';
const state = (id, title, note, ids, opts = {}) => ({
  id, title: 'Закрепы · ' + title, note,
  preview: { messages, ids, ...opts },
});
export const PIN_CASES = [
  state('pin-menu', 'Закрепить сообщение', 'Долгое нажатие на сообщение открывает меню. Выберите «Закрепить».', [], { menuId: 'meeting' }),
  state('pin-one', 'Один закреп', 'Под шапкой — текст сообщения без счётчика. Нажмите на плашку, чтобы открыть список.', one, { notice: pinnedNotice }),
  state('pin-many', 'Несколько закрепов', 'На плашке — последнее закреплённое сообщение и общее число. Для файла без подписи видно его имя.', many),
  state('pinned', 'Список закреплённых', 'Свои и чужие сообщения. Можно открепить одно или все сразу.', many, { list: true }),
  state('pin-list-one', 'В списке остался один', 'Массового действия нет. После снятия последнего закрепа список закроется.', one, { list: true }),
  state('pin-unpin-menu', 'Открепить через меню', 'Повторное долгое нажатие на закреплённое сообщение предлагает «Открепить».', one, { menuId: 'meeting' }),
  state('pin-cleared', 'Все закрепы сняты', 'Плашка исчезает, исходные сообщения остаются в чате.', [], { notice: 'Вы открепили все сообщения' }),
];
