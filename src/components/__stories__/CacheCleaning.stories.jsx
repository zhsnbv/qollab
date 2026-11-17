import { useState } from 'react';
import { DeviceHost } from '../Portal';
import { CacheCleaning } from '../SettingsStorageVisuals';
import { StorageSettings } from '../../screens/SettingsExperience';

function CleaningPreview({ phase, progress }) {
  const [host, setHost] = useState(null);
  const [open, setOpen] = useState(true);
  return <div ref={setHost} style={{ position: 'relative', isolation: 'isolate', height: '100%', overflow: 'hidden' }}>
    <DeviceHost.Provider value={host}>
      <div style={{ height: '100%' }}><StorageSettings /></div>
      {!open && <button onClick={() => setOpen(true)} style={{ position: 'absolute', bottom: 20, left: 20, right: 20, padding: 14, border: 0, borderRadius: 999, color: '#fff', background: 'var(--color-primary)' }}>Показать состояние ещё раз</button>}
      {host && open && <CacheCleaning job={{ phase, progress }} onClose={() => setOpen(false)} />}
    </DeviceHost.Provider>
  </div>;
}

export default {
  id: 'cache-cleaning',
  title: 'Организмы/Очистка кэша',
  component: CleaningPreview,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: { description: { component: 'Настоящий полноэкранный CacheCleaning с реальным размытым экраном памяти. Для визуальной проверки прогресс остановлен; файлы продолжают двигаться. Полный трёхсекундный сценарий находится в экране «Память». Тема и пространство переключаются в панели Storybook.' } },
  },
  argTypes: {
    phase: { options: ['running', 'done'], control: 'radio' },
    progress: { control: { type: 'range', min: 0, max: 1, step: .01 } },
  },
};

export const Running = { name: 'Очистка', args: { phase: 'running', progress: .48 } };
export const Complete = { name: 'Готово', args: { phase: 'done', progress: 1 } };
