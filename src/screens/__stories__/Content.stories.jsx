import { Routes, Route } from 'react-router-dom';
import ArticleView from '../ArticleView';
import EventView from '../EventView';
import ChannelView from '../ChannelView';
import BannerDetail from '../BannerDetail';
import MiniApp from '../MiniApp';
import ServicesSheet from '../ServicesSheet';
import { events } from '../../data/feed';

export default {
  title: 'Экраны/Контент',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Всё, что открывается поверх вкладок: публикация, мероприятие, канал, баннер, '
          + 'мини-приложение и каталог сервисов. Открываются оверлеем — под ними остаётся живой '
          + 'экран вкладки, поэтому закрытие возвращает прокрутку туда же, где её оставили.',
      },
    },
  },
};

export const Публикация = {
  render: () => <ArticleView />,
  parameters: { route: '/article' },
};

export const Мероприятие = {
  render: () => <EventView />,
  parameters: { route: { pathname: '/event', state: { id: events[0].id } } },
};

export const Канал = {
  render: () => (
    <Routes><Route path="/channel/:channelId" element={<ChannelView />} /></Routes>
  ),
  parameters: { route: '/channel/erg-news' },
};

export const Баннер = {
  render: () => <BannerDetail />,
  parameters: { route: '/banner' },
};

export const МиниПриложение = {
  name: 'Мини-приложение',
  render: () => <Routes><Route path="/app/*" element={<MiniApp />} /></Routes>,
  parameters: {
    route: '/app/esed',
    docs: { description: { story: 'Сервис открывается внутри приложения: своя шапка с «тремя точками» и та же навигация назад.' } },
  },
};

export const КаталогСервисов = {
  name: 'Каталог сервисов',
  render: () => <ServicesSheet />,
  parameters: { route: '/services/sheet' },
};
