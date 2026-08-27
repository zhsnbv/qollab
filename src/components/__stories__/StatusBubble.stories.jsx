import StatusBubble from '../StatusBubble';
import { STATUSES, emptyStatus } from '../../data/statuses';
import '../../screens/Profile.css';

// Настоящий компонент из src/components/StatusBubble.jsx — не копия.
export default {
  title: 'Атомы/Статус',
  component: StatusBubble,
  parameters: {
    docs: {
      description: {
        component:
          'Пилюля с хвостиком под аватаркой. Свой статус кликабельный и открывает выбор, '
          + 'чужой только читается. Если статуса нет, компонент возвращает null — элемента не будет вовсе.',
      },
    },
  },
  argTypes: {
    status: { control: false },
    onClick: { control: false },
  },
};

export const Все = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, paddingTop: 16 }}>
      {STATUSES.map((s) => <StatusBubble key={s.id} status={s} />)}
    </div>
  ),
};

export const Свой = {
  args: { status: STATUSES[2], onClick: () => {} },
  parameters: { docs: { description: { story: 'Кликабельный вариант: тап открывает лист выбора.' } } },
};

export const Пустой = {
  args: { status: emptyStatus, onClick: () => {} },
  parameters: { docs: { description: { story: 'Статус не установлен — тот же бабл, серый и с плюсом.' } } },
};

export const Отсутствует = {
  args: { status: null },
  parameters: { docs: { description: { story: 'У коллеги без статуса компонент не рисует ничего.' } } },
};
