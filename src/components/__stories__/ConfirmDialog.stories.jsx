import ConfirmDialog from '../ConfirmDialog';

export default {
  title: 'Молекулы/Диалог подтверждения',
  component: ConfirmDialog,
  parameters: {
    device: 'full',
    options: { showPanel: false },
    docs: { description: { component: 'Спрашивает перед необратимым. Заголовок — вопрос, текст — последствие.' } },
  },
};

export const ВыходИзГруппы = {
  name: 'Выход из группы',
  args: {
    title: 'Покинуть группу?',
    text: 'Вы выйдете из «PR01DEV + ROBOTS». Переписка останется в архиве.',
    confirmLabel: 'Покинуть',
    danger: true,
  },
};

export const Удаление = {
  args: {
    title: 'Удалить сообщение?',
    text: 'Сообщение исчезнет у всех участников чата.',
    confirmLabel: 'Удалить',
    danger: true,
  },
};
