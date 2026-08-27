import Home from '../Home';
import Chats from '../Chats';
import Posts from '../Posts';
import Services from '../Services';
import Profile from '../Profile';
import BottomNav from '../../components/BottomNav';

// Кор-вкладки показываем вместе с таб-баром: в приложении он живёт в App
// и переживает смену роута, поэтому по отдельности вкладка выглядит короче,
// чем на самом деле.
const withNav = (Screen) => () => (
  <>
    <Screen />
    <BottomNav />
  </>
);

export default {
  title: 'Экраны/Вкладки',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Пять корневых разделов. Все построены на одном каркасе TabLayout: шапка, прокрутка, '
          + 'потягивание для обновления и «три точки» с общим меню. Переключите тему и '
          + 'пространство в тулбаре — экраны перекрашиваются целиком, без правок в коде.',
      },
    },
  },
};

export const Главная = { render: withNav(Home), parameters: { route: '/' } };
export const Чаты = { render: withNav(Chats), parameters: { route: '/chats' } };
export const Лента = { render: withNav(Posts), parameters: { route: '/posts' } };
export const Сервисы = { render: withNav(Services), parameters: { route: '/services' } };
export const Профиль = { render: withNav(Profile), parameters: { route: '/profile' } };
