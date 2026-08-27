import TopBar, { DotsIcon } from '../TopBar';
import { BellSimple, PencilSimple, GearSix } from '@phosphor-icons/react';
import '../../screens/Chats.css';

export default {
  title: 'Организмы/Шапка вкладки',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Шапка кор-раздела: заголовок слева, действия справа. Кнопки — серый залитый глиф '
          + 'в сером кружке 40×40; заливка акцентом только у главного действия. Тень приходит '
          + 'классом .hdr-shadow при скролле.',
      },
    },
  },
};

export const Заголовок = { args: { title: 'Сервисы' } };

export const СЛого = {
  name: 'С лого',
  args: { logo: true },
  parameters: { docs: { description: { story: 'Главная: вместо заголовка лого, перекрашенное маской в цвет пространства.' } } },
};

export const СДействиями = {
  name: 'С действиями',
  args: {
    title: 'Лента',
    actions: (
      <>
        <button className="topbar-btn topbar-btn--badged" aria-label="Уведомления">
          <BellSimple size={20} weight="fill" />
          <span className="topbar-badge">3</span>
        </button>
        <button className="topbar-btn" aria-label="Меню"><DotsIcon /></button>
      </>
    ),
  },
};

export const СГлавнымДействием = {
  name: 'С главным действием',
  args: {
    title: 'Чаты',
    actions: (
      <>
        <button className="topbar-btn" aria-label="Редактировать">
          <PencilSimple size={20} weight="fill" color="var(--color-weak)" />
        </button>
        <button className="topbar-btn primary" aria-label="Новый чат">＋</button>
      </>
    ),
  },
};

export const Приглушённая = {
  args: {
    title: 'Сервисы',
    actions: (
      <button className="topbar-btn topbar-btn--muted" aria-label="Избранное">
        <GearSix size={20} weight="fill" />
      </button>
    ),
  },
  parameters: { docs: { description: { story: 'Модификатор --muted делает глиф серым: так выглядят второстепенные действия.' } } },
};
