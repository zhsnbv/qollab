import { useState } from 'react';
import { ConnectingSkeleton, EmptyState } from '../ChatState';
import MessageReactions from '../MessageReactions';
import MessageMenu, { REACTIONS } from '../MessageMenu';
import { PinnedBar, PinnedList } from '../PinnedBar';
import ForwardSheet from '../ForwardSheet';
import '../../screens/ChatRoom.css';

export default {
  title: 'Организмы/Чат',
  parameters: {
    device: 'full',
    docs: {
      description: {
        component:
          'Части экрана переписки: состояние подключения, пустой чат, реакции, меню сообщения, '
          + 'закреплённые и пересылка. Все они собираются вокруг ленты сообщений.',
      },
    },
  },
};

export const Подключение = {
  render: () => <ConnectingSkeleton />,
  parameters: { docs: { description: { story: 'Показывается, пока чат «подключается» — вместо пустого экрана.' } } },
};

export const ПустойЧат = {
  name: 'Пустой чат',
  render: () => <EmptyState />,
  parameters: { docs: { description: { story: 'Переписки ещё нет: объясняем, что делать, а не пишем «пусто».' } } },
};

export const Реакции = {
  render: () => {
    const [groups, setGroups] = useState([
      { emoji: '❤️', people: [{ id: 'a', initials: 'АА', tint: 'blue' }] },
      { emoji: '👍', people: [
        { id: 'b', initials: 'НБ', tint: 'green' },
        { id: 'c', initials: 'МК', tint: 'orange' },
        { id: 'd', initials: 'ДТ', tint: 'blue' },
        { id: 'e', initials: 'СБ', tint: 'green' },
      ] },
      { emoji: '🙏', people: [{ id: 'me', initials: 'Я', tint: 'orange', me: true }] },
    ]);
    return (
      <div style={{ background: 'var(--color-background)', padding: 12, borderRadius: 16 }}>
        <MessageReactions groups={groups} onToggle={() => setGroups((g) => g)} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Один человек — одна реакция. До трёх лиц показываются аватарками, дальше счётчик. '
          + 'Своя реакция подсвечена акцентом, чужие — чуть темнее бабла.',
      },
    },
  },
};

export const Палитра = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, fontSize: 26 }}>
      {REACTIONS.map((r) => <span key={r}>{r}</span>)}
    </div>
  ),
  parameters: { docs: { description: { story: 'Набор реакций в меню сообщения — шесть, больше не помещается в ряд.' } } },
};

export const Закреплённые = {
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [
      { id: 1, author: 'Нурлан Б.', text: 'Релиз переносим на пятницу', time: '10:12' },
      { id: 2, author: 'Динара Т.', text: 'Ссылка на макеты в закрепе', time: '11:40' },
    ];
    return (
      <>
        <PinnedBar message={items[1]} count={items.length} onOpenList={() => setOpen(true)} />
        {open && <PinnedList items={items} onClose={() => setOpen(false)} onUnpin={() => {}} onUnpinAll={() => setOpen(false)} />}
      </>
    );
  },
  parameters: { docs: { description: { story: 'Полоса под шапкой открывает список закреплённых листом снизу.' } } },
};

export const Пересылка = {
  render: () => <ForwardSheet onClose={() => {}} onPick={() => {}} />,
  parameters: {
    options: { showPanel: false },
    docs: { description: { story: '«Избранное» стоит первым: это чат с самим собой, куда пересылают чаще всего.' } },
  },
};
