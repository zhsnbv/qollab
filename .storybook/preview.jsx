import { MemoryRouter } from 'react-router-dom';
import { CompanyProvider } from '../src/context/CompanyContext';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
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
// иначе оверлеи окажутся не в том слое. Провайдеры берём настоящие, из
// приложения: экранам нужны компания, вход и избранное, а подделка контекста
// быстро разъедется с тем, что показывает прод.
const DeviceFrame = (Story, context) => {
  const { theme, company } = context.globals;
  document.documentElement.dataset.theme = theme;
  // CompanyProvider читает выбор из sessionStorage, поэтому тулбар пишет туда же,
  // а key заставляет провайдер перечитать значение при переключении.
  try { sessionStorage.setItem('qollab.company', company); } catch { /* ignore */ }

  const full = context.parameters.device === 'full';
  const route = context.parameters.route || '/';

  return (
    <MemoryRouter initialEntries={[route]}>
      <CompanyProvider key={company}>
        <AuthProvider>
          <FavoritesProvider>
            <div className={`device sb-device ${full ? 'sb-device--full' : ''}`}>
              <div className="sb-canvas">
                <Story />
              </div>
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </CompanyProvider>
    </MemoryRouter>
  );
};

export const decorators = [DeviceFrame];

export const parameters = {
  layout: 'centered',
  controls: { expanded: true },
  options: {
    storySort: {
      order: [
        'Начало', ['Введение', 'Установка', 'Как добавлять'],
        'Основы',
        'Атомы',
        'Молекулы',
        'Организмы',
        'Паттерны',
        'Экраны',
      ],
    },
  },
};
