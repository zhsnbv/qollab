import { useState } from 'react';
import Message from '../Message';
import '../../screens/ChatRoom.css';

export default {
  title: 'Организмы/Сообщение',
  component: Message,
  parameters: {
    docs: {
      description: {
        component:
          'Бабл со временем внутри. Аватар показывается только в группах и только на последнем '
          + 'сообщении серии. Долгое нажатие открывает меню, свайп вправо — ответ.',
      },
    },
  },
  argTypes: {
    mine: { control: 'boolean' },
    firstOfGroup: { control: 'boolean' },
    lastOfGroup: { control: 'boolean' },
    withAvatarSlot: { control: 'boolean' },
  },
};

const base = { id: 1, text: 'Привет! Как продвигается задача?', time: '13:21' };

export const Входящее = {
  args: { msg: base, firstOfGroup: true, lastOfGroup: true, mine: false, withAvatarSlot: false },
};

export const Исходящее = {
  args: { msg: { ...base, text: 'Сегодня доделаю и скину на ревью', status: 'read' }, mine: true, firstOfGroup: true, lastOfGroup: true },
};

export const ВГруппе = {
  name: 'В группе',
  args: {
    msg: { ...base, text: 'Плюсую 👍 Давайте синкнемся в 16:00' },
    mine: false, firstOfGroup: true, lastOfGroup: true, withAvatarSlot: true,
    authorLabel: 'Мадина К.', authorColor: '#d4380d',
    avatar: <span className="msg-avatar msg-avatar--initials tint-green">МК</span>,
  },
};

export const СРеакциями = {
  name: 'С реакциями',
  render: () => {
    const [reactions, setReactions] = useState([
      { emoji: '❤️', people: [{ id: 'a', initials: 'АА', tint: 'blue' }] },
      { emoji: '😂', people: [{ id: 'b', initials: 'НБ', tint: 'green' }, { id: 'c', initials: 'Я', tint: 'orange' }] },
    ]);
    return (
      <Message
        msg={{ id: 2, text: 'Ок, я за 🚀', time: '14:02' }}
        firstOfGroup lastOfGroup withAvatarSlot={false}
        reactions={reactions}
        onToggleReaction={() => setReactions((r) => r)}
      />
    );
  },
  parameters: { docs: { description: { story: 'Реакции живут внутри бабла на одной линии со временем.' } } },
};

export const Серия = {
  render: () => (
    <>
      <Message msg={{ id: 3, text: 'Первое сообщение серии', time: '10:00' }} firstOfGroup withAvatarSlot={false} />
      <Message msg={{ id: 4, text: 'Второе', time: '10:00' }} withAvatarSlot={false} />
      <Message msg={{ id: 5, text: 'Последнее — у него хвостик', time: '10:01' }} lastOfGroup withAvatarSlot={false} />
    </>
  ),
};
