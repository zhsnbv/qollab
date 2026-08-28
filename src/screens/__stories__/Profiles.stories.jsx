import PersonProfile from '../PersonProfile';
import { employees } from '../../data/employees';
import GroupProfile from '../GroupProfile';
import ProfilePhoto from '../ProfilePhoto';
import ProfileQr from '../ProfileQr';
import IdCard from '../IdCard';
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

export const Уволенный = {
  render: () => <PersonProfile />,
  parameters: {
    route: { pathname: '/person', state: { id: 'ekaterina' } },
    docs: {
      description: {
        story:
          'Тот же шаблон, но урезанный: действий над человеком, которого нет в компании, '
          + 'не осталось, а корпоративные данные к нему уже не относятся. Остаётся то, что ещё '
          + 'имеет смысл — как его зовут, как связаться вне qollab и почему всё остальное '
          + 'недоступно. «Бывший сотрудник» стоит под именем, а не на месте статуса: это факт '
          + 'из HR, и хвостик к аватарке ему не нужен.',
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

export const Пропуск = {
  render: () => <ProfileQr />,
  parameters: {
    route: '/profile/qr',
    docs: {
      description: {
        story:
          'Открывается плиткой «Таб. номер». Часы идут с секундами и не останавливаются: по ним '
          + 'охрана отличает живой экран от скриншота — на снимке время застынет. Код тоже меняется '
          + 'каждую секунду, так что переслать статичную картинку не выйдет. Белое поле вокруг кода '
          + 'обязательно и в тёмной теме: сканеру нужна «тихая зона».',
      },
    },
  },
};

export const IDКарта = {
  name: 'Моя ID карта',
  render: () => <IdCard />,
  parameters: {
    route: '/profile/id',
    docs: {
      description: {
        story:
          'Карточка сотрудника и документы об обучении. Заголовок экрана свой, а не «Профиль»: '
          + 'человек ушёл с вкладки и должен видеть, где он. Фото прямоугольное со скруглением, '
          + 'а не круг, — это документ, а не аватар. Статус выбирается тем же листом действий, '
          + 'что и остальные списки, а не нативным select.',
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
