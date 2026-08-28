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

export const Ассистент = {
  render: () => <DMChat />,
  parameters: {
    route: {
      pathname: '/chats/dm',
      state: {
        chat: {
          kind: 'bot', avatar: '/img/chats/ergiz-avatar.png',
          title: 'ERGiz – Искусственный интеллект',
          preview: 'Привет! хочу задать вам пару коротких вопросов', time: '13:44',
        },
      },
    },
    docs: {
      description: {
        story:
          'Про шифрование говорим один раз в начале переписки — это не сообщение, поэтому широкая '
          + 'плашка, а не бабл. Под приветствием три подсказки: пустое поле ввода не объясняет, '
          + 'о чём ассистента вообще можно спросить. Нажмите любую — она уходит как ваше сообщение, '
          + 'и на неё есть готовый ответ. Как только вы спросили сами, подсказки убираются. '
          + 'В шапке — новый диалог и история разговоров.',
      },
    },
  },
};

export const Уволенный = {
  render: () => <DMChat />,
  parameters: {
    route: {
      pathname: '/chats/dm',
      state: {
        chat: {
          id: 'ekaterina', profileId: 'ekaterina', dismissed: true,
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          title: 'Екатерина Сорокина', preview: 'спасибо!', time: '08.08',
          lastSeen: '19.06.2026 в 14:55',
        },
      },
    },
    docs: {
      description: {
        story:
          'Переписка остаётся, писать в неё нельзя. Плашка занимает место поля ввода — та же '
          + 'плавающая «стеклянная» подложка, только вместо кнопок объяснение. Звонок из шапки '
          + 'убран, долгое нажатие по сообщению отключено: архив только читают. В подписи стоит '
          + 'точная дата последнего входа — «был(-а) недавно» о человеке, которого в компании '
          + 'уже нет, звучит неправдой.',
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
