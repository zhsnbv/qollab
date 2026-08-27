import { MemoryRouter } from 'react-router-dom';
import '../src/styles/tokens.css';
import '../src/styles/companies.css';
import '@fontsource-variable/inter';
import './storybook.css';

// Тема и пространство переключаются в тулбаре: те же атрибуты на <html>,
// что и в приложении, поэтому компоненты ведут себя один в один.
export const globalTypes = {
  theme: {
    description: 'Оформление',
    toolbar: {
      title: 'Тема',
      icon: 'contrast',
      items: [
        { value: 'light', title: 'Светлая' },
        { value: 'dark', title: 'Тёмная' },
      ],
      dynamicTitle: true,
    },
  },
  company: {
    description: 'Рабочее пространство',
    toolbar: {
      title: 'Пространство',
      icon: 'globe',
      items: [
        { value: 'erg', title: 'ERG' },
        { value: 'integra', title: 'Integra' },
        { value: 'bts', title: 'BTS' },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = { theme: 'light', company: 'erg' };

// Portal монтирует листы и тосты в .device — в историях эта обёртка тоже нужна,
// иначе оверлеи окажутся не в том слое.
const DeviceFrame = (Story, context) => {
  const { theme, company } = context.globals;
  document.documentElement.dataset.theme = theme;
  if (company === 'erg') delete document.documentElement.dataset.company;
  else document.documentElement.dataset.company = company;

  const full = context.parameters.device === 'full';
  return (
    <MemoryRouter>
      <div className={`device sb-device ${full ? 'sb-device--full' : ''}`}>
        <div className="sb-canvas">
          <Story />
        </div>
      </div>
    </MemoryRouter>
  );
};

export const decorators = [DeviceFrame];

export const parameters = {
  layout: 'centered',
  controls: { expanded: true },
  options: {
    storySort: {
      order: ['Основы', 'Атомы', 'Молекулы', 'Организмы', 'Экраны'],
    },
  },
};
