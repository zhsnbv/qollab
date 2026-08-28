import { useState } from 'react';
import Switch from '../Switch';

export default {
  title: 'Атомы/Переключатель',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          'Переключатель в стиле iOS. Внутри настоящий чекбокс, приведённый к нужному виду через '
          + 'appearance: none — с клавиатуры и скринридером ведёт себя как положено, а обёртки '
          + 'вокруг не требует и вставляется в любую строку. Жил в мини-приложении, пока не '
          + 'понадобился ещё на трёх экранах настроек.',
      },
    },
  },
};

export const Состояния = {
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        <Switch checked={a} onChange={setA} label="Включено" />
        <Switch checked={b} onChange={setB} label="Выключено" />
      </div>
    );
  },
};
