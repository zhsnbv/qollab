import { useEffect, useRef } from 'react';
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

// Режим выбора живёт состоянием внутри экрана, поэтому история не подделывает
// его разметку, а нажимает тот же карандаш, что и человек — после скелетона.
function ChatsSelecting() {
  const done = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      const pencil = document.querySelector('[aria-label="Выбрать чаты"]');
      if (!pencil || done.current) return;
      done.current = true;
      pencil.click();
      clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, []);
  return <Chats />;
}

export const ВыборЧатов = {
  name: 'Чаты: режим выбора',
  render: () => (
    <>
      <ChatsSelecting />
      <BottomNav />
    </>
  ),
  parameters: {
    route: '/chats',
    docs: {
      description: {
        story:
          'Карандаш в шапке. Заголовок сменяется на счётчик, справа остаётся одна кнопка — выйти, '
          + 'у строк появляются круглые галочки, а таб-бар уступает место двум действиям. '
          + 'Таб-бар живёт в App, поэтому убирается классом .selecting на <html>: пробрасывать '
          + 'ради этого состояние наверх пришлось бы через все вкладки. Пока ничего не выбрано, '
          + '«Прочитать все» относится ко всему списку, а «Удалить» погашено.',
      },
    },
  },
};
