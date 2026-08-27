import PersonProfile from '../PersonProfile';
import { employees } from '../../data/employees';
import GroupProfile from '../GroupProfile';
import ProfilePhoto from '../ProfilePhoto';
import Settings from '../Settings';
import Favorites from '../Favorites';

export default {
  title: 'Экраны/Профили',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Профиль коллеги один на всё приложение: и из оргструктуры, и из чата открывается один '
          + 'и тот же экран — раньше их было два с разным набором блоков. Отличается только то, '
          + 'что о человеке известно. Старый вариант с волной остался за флагом PROFILE_V2 '
          + 'в src/config.js — на случай отката.',
      },
    },
  },
};

export const Коллега = {
  render: () => <PersonProfile />,
  parameters: { route: { pathname: '/person', state: { id: 'ayazhan' } } },
};

export const КоллегаБезИстории = {
  name: 'Коллега без общей истории',
  render: () => <PersonProfile />,
  parameters: {
    route: {
      pathname: '/person',
      state: { id: 'aliya-seitova', employee: employees.find((e) => e.id === 'aliya-seitova') },
    },
    docs: {
      description: {
        story:
          'Если общих чатов, файлов и групп нет — вкладки честно пустые, с объяснением. '
          + 'Показывать нули в счётчиках хуже: выглядит как ошибка загрузки.',
      },
    },
  },
};

export const Группа = {
  render: () => <GroupProfile />,
  parameters: {
    route: { pathname: '/group', state: { id: 'prodev' } },
    docs: {
      description: {
        story:
          'Та же композиция, что у человека: шапка, действия, вкладки. Вместо «Ещё» — «Покинуть '
          + 'группу» красным, с подтверждением.',
      },
    },
  },
};

export const Фотография = {
  render: () => <ProfilePhoto />,
  parameters: { route: '/profile/photo' },
};

export const Настройки = {
  render: () => <Settings />,
  parameters: { route: '/settings' },
};

export const Избранные = {
  name: 'Настройка избранного',
  render: () => <Favorites />,
  parameters: {
    route: '/favorites',
    docs: { description: { story: 'Избранное — выборка из общего каталога сервисов: храним id, а подписи берём из каталога.' } },
  },
};
