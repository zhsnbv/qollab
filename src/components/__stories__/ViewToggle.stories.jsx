import { useState } from 'react';
import ViewToggle from '../ViewToggle';
import '../../screens/Services.css';

export default {
  title: 'Атомы/Переключатель вида',
  component: ViewToggle,
  parameters: {
    docs: { description: { component: 'Сетка или список — в каталоге сервисов и в шите. Живёт в шапке, поэтому компактный.' } },
  },
};

export const Переключатель = {
  render: () => {
    const [view, setView] = useState('grid');
    return <ViewToggle view={view} onChange={setView} />;
  },
};
