import { useState } from 'react';
import { FeedTabs, PostCard, EventCard } from '../Feed';
import { basePosts, events } from '../../data/feed';
import '../Feed.css';

export default {
  title: 'Организмы/Лента',
  parameters: {
    docs: {
      description: {
        component:
          'Публикации и мероприятия. Карточка публикации сделана по образцу Medium: канал и дата, '
          + 'заголовок с превью, миниатюра справа, метрики снизу. Действия (закладка, «ещё») живут '
          + 'на экране самой публикации — в ленте карточка только открывается.',
      },
    },
  },
};

export const Вкладки = {
  render: () => {
    const [tab, setTab] = useState('posts');
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <FeedTabs tab={tab} onChange={setTab} withChannels />
        <FeedTabs tab={tab} onChange={setTab} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Сверху — вариант из Ленты с «Каналами», снизу — из Главной, где табов два и они растянуты '
          + 'на всю ширину. Иконки-маски перекрашиваются в акцент у активной вкладки.',
      },
    },
  },
};

export const Публикация = {
  render: () => <PostCard p={basePosts[0]} />,
};

export const ПубликацияБезКартинки = {
  name: 'Публикация без картинки',
  render: () => <PostCard p={{ ...basePosts[1], thumb: null }} />,
  parameters: { docs: { description: { story: 'Без миниатюры текст занимает всю ширину — отдельной вёрстки не требуется.' } } },
};

export const Прочитанная = {
  render: () => <PostCard p={{ ...basePosts[2], read: true }} />,
  parameters: { docs: { description: { story: 'Прочитанное гасим цветом заголовка, а не иконкой: так список читается как почта.' } } },
};

export const Компактная = {
  render: () => <PostCard p={basePosts[0]} compact />,
  parameters: { docs: { description: { story: 'Компактный режим — для блока публикаций на Главной, где карточек всего три.' } } },
};

export const Мероприятие = {
  render: () => <EventCard e={events[0]} onOpen={() => {}} />,
  parameters: { docs: { description: { story: 'У мероприятия обложка сверху, дата отдельной строкой над заголовком и ряд организаторов внахлёст.' } } },
};

export const Список = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {basePosts.slice(0, 3).map((p) => <PostCard key={p.id} p={p} />)}
    </div>
  ),
};
