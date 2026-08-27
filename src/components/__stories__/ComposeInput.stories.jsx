import { useState } from 'react';
import { Plus, Microphone, PaperPlaneRight } from '@phosphor-icons/react';
import ComposeInput from '../ComposeInput';
import '../../screens/ChatRoom.css';

export default {
  title: 'Молекулы/Поле ввода сообщения',
  component: ComposeInput,
  parameters: {
    docs: {
      description: {
        component:
          'Редактируемый блок, а не <input>: iOS вешает системную панель со стрелками только на '
          + 'элементы формы. Enter отправляет, вставка приводится к чистому тексту, плейсхолдер '
          + 'рисуется своим.',
      },
    },
  },
};

export const Писбар = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="cr-writebar" style={{ position: 'static' }}>
        <button className="cr-write-btn" aria-label="Вложение"><Plus size={24} color="var(--color-text)" /></button>
        <div className="cr-input">
          <ComposeInput value={value} onChange={setValue} onKeyDown={() => {}} placeholder="Сообщение…" />
        </div>
        {value.trim() ? (
          <button className="cr-write-btn cr-send" aria-label="Отправить"><PaperPlaneRight size={22} weight="fill" color="#fff" /></button>
        ) : (
          <button className="cr-write-btn" aria-label="Голосовое"><Microphone size={24} color="var(--color-text)" /></button>
        )}
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Наберите текст: кнопка микрофона сменится на отправку.' } } },
};
