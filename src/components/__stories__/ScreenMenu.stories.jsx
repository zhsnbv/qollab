import ScreenMenu, { SCREEN_MENU_ITEMS } from '../ScreenMenu';
import SideMenu from '../SideMenu';

export default {
  title: 'Организмы/Меню экрана',
  component: ScreenMenu,
  parameters: {
    device: 'full',
    options: { showPanel: false },
    docs: {
      description: {
        component:
          'Одно меню на все кор-экраны: «три точки» открывают один и тот же набор. Раньше лист был '
          + 'только в Ленте и мини-приложениях, а на Главной и в Профиле кнопка молчала.',
      },
    },
  },
};

export const ТриТочки = {
  name: 'Меню «трёх точек»',
  render: () => <ScreenMenu open onClose={() => {}} onRefresh={() => {}} />,
};

export const Пункты = {
  render: () => (
    <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--color-text)' }}>
      {SCREEN_MENU_ITEMS.map((i) => <li key={i.id} style={{ padding: '4px 0' }}>{i.label}</li>)}
    </ul>
  ),
  parameters: { docs: { description: { story: 'Состав меню задан одним массивом — экраны его не переопределяют.' } } },
};

export const БоковаяПанель = {
  name: 'Боковая панель',
  render: () => <SideMenu open onClose={() => {}} />,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { story: 'Рабочие сервисы профиля: их до дюжины, в ленте экрана такой список занял бы больше места, чем все остальные блоки.' } },
  },
};
