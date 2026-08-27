import { useState } from 'react';
import StatusSheet from '../StatusSheet';
import StatusActions from '../StatusActions';
import StatusBubble from '../StatusBubble';
import { statusById, emptyStatus } from '../../data/statuses';

export default {
  title: 'Молекулы/Выбор статуса',
  component: StatusSheet,
  parameters: {
    device: 'full',
    options: { showPanel: false },
    docs: {
      description: {
        component:
          'Выбор подтверждается кнопкой: пункт можно примерить и передумать. Если ничего не выбрано, '
          + 'кнопка превращается в «Убрать статус».',
      },
    },
  },
};

export const Лист = {
  render: () => <StatusSheet value="busy" onClose={() => {}} onPick={() => {}} />,
};

export const Действия = {
  render: () => <StatusActions onClose={() => {}} onEdit={() => {}} onClear={() => {}} />,
  parameters: { docs: { description: { story: 'Тап по уже поставленному статусу: изменить или сбросить.' } } },
};

export const Сценарий = {
  render: () => {
    const [status, setStatus] = useState(null);
    const [sheet, setSheet] = useState(false);
    const [menu, setMenu] = useState(false);
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
        <StatusBubble
          status={status ? statusById(status) : emptyStatus}
          onClick={() => (status ? setMenu(true) : setSheet(true))}
        />
        {sheet && <StatusSheet value={status} onClose={() => setSheet(false)} onPick={(id) => { setStatus(id); setSheet(false); }} />}
        {menu && (
          <StatusActions
            onClose={() => setMenu(false)}
            onEdit={() => { setMenu(false); setSheet(true); }}
            onClear={() => { setMenu(false); setStatus(null); }}
          />
        )}
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Полный путь: поставить, изменить, сбросить.' } } },
};
