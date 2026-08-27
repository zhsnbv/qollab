import { useState } from 'react';
import Toast from '../Toast';

export default {
  title: 'Атомы/Тост',
  component: Toast,
  parameters: {
    docs: {
      description: {
        component: 'Сообщает результат действия и исчезает через 2,2 секунды. Монтируется порталом в корень экрана.',
      },
    },
  },
};

export const Обычный = {
  args: { text: 'Ссылка скопирована' },
  render: (args) => <Toast {...args} onDone={() => {}} />,
};

export const ПоНажатию = {
  name: 'По нажатию',
  render: () => {
    const [text, setText] = useState('');
    return (
      <>
        <button className="stsheet-apply" style={{ height: 48, borderRadius: 999, background: 'var(--color-primary)', color: '#fff', padding: '0 24px' }}
          onClick={() => setText('Рахмет отправлен')}>
          Отправить рахмет
        </button>
        <Toast text={text} onDone={() => setText('')} />
      </>
    );
  },
};
