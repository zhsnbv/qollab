import ChatRoom from '../ChatRoom';
import DMChat from '../DMChat';
import NewChat from '../NewChat';
import ChatSearch from '../ChatSearch';

export default {
  title: 'Экраны/Переписка',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Групповой чат, личная переписка, создание чата и поиск внутри чата. Поле ввода — не '
          + '<input>, а редактируемый блок: иначе iOS показывает над клавиатурой свою панель '
          + 'со стрелками и «Готово». Высота клавиатуры считается от максимума наблюдаемой высоты '
          + 'visualViewport, потому что при interactive-widget=resizes-content разница с '
          + 'innerHeight всегда нулевая.',
      },
    },
  },
};

export const Групповой = {
  render: () => <ChatRoom />,
  parameters: { route: '/chats/prodev' },
};

export const Личный = {
  render: () => <DMChat />,
  parameters: {
    route: {
      pathname: '/chats/dm',
      state: {
        chat: {
          profileId: 'ayazhan',
          avatar: '/img/chats/ayazhan.png',
          title: 'Аяжан Сериккызы',
          preview: 'Салем, там задача',
          time: '13:21',
          online: true,
        },
      },
    },
  },
};

export const НовыйЧат = {
  name: 'Новый чат',
  render: () => <NewChat />,
  parameters: {
    route: '/chats/new',
    docs: { description: { story: 'Поиск идёт по имени, телефону и должности. Уволенные видны, но с зачёркнутым именем и подписью вместо реквизитов.' } },
  },
};

export const ПоискВЧате = {
  name: 'Поиск в чате',
  render: () => <ChatSearch />,
  parameters: { route: '/chat-search' },
};
