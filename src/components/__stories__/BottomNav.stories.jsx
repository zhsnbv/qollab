import BottomNav from '../BottomNav';
import { NavIcon, NAV_ICONS } from '../NavIcons';

export default {
  title: 'Организмы/Таб-бар',
  component: BottomNav,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Плавающая капсула поверх контента. Живёт в App и переживает смену роута — плашка '
          + 'активного таба доезжает до нового места, а не создаётся заново. Область прокрутки '
          + 'экрана получает нижний отступ, чтобы контент не прятался под баром.',
      },
    },
  },
};

export const Бар = {
  render: () => (
    <div style={{ position: 'relative', height: '100%', background: 'var(--page-bg)' }}>
      <BottomNav />
    </div>
  ),
};

export const Иконки = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, padding: 20, flexWrap: 'wrap' }}>
      {Object.keys(NAV_ICONS).map((name) => (
        <span key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--color-weak)' }}>
          <NavIcon name={name} />
          <span style={{ fontSize: 11 }}>{name}</span>
        </span>
      ))}
      {Object.keys(NAV_ICONS).map((name) => (
        <span key={`${name}-on`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--color-primary)' }}>
          <NavIcon name={name} active />
          <span style={{ fontSize: 11 }}>активная</span>
        </span>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: 'Набор иконок навигации в двух состояниях: контурная и залитая акцентом.' } } },
};
