import {
  ShareNetwork, Megaphone,
} from '@phosphor-icons/react';
import './Feed.css';

// Капсульные табы «Публикации / Мероприятия» — иконки-маски меняют цвет
// с серого на оранжевый у активного (без запечённого фона).
// withChannels — на Главной табов по-прежнему два, «Каналы» появляются только
// в Ленте (в макете третий таб есть именно там).
export function FeedTabs({ tab, onChange, withChannels }) {
  return (
    <div className={`feed-tabs no-scrollbar${withChannels ? '' : ' feed-tabs--fit'}`}>
      <button
        className={`feed-tab ${tab === 'posts' ? 'active' : ''}`}
        onClick={() => onChange('posts')}
      >
        <span className="feed-tab-ico feed-tab-ico--news" />Публикации
      </button>
      {withChannels && (
        <button
          className={`feed-tab ${tab === 'channels' ? 'active' : ''}`}
          onClick={() => onChange('channels')}
        >
          <Megaphone size={20} weight="fill" />Каналы
        </button>
      )}
      <button
        className={`feed-tab ${tab === 'events' ? 'active' : ''}`}
        onClick={() => onChange('events')}
      >
        <span className="feed-tab-ico feed-tab-ico--sport" />Мероприятия
      </button>
    </div>
  );
}

// The main feed, home and channels share the approved mobile publication card.
export { default as PostCard } from './publications/PublicationCard';

// Карточка мероприятия: картинка, дата, заголовок, организаторы, «Подробнее».
// Стопка аватарок организаторов. Пустой список — отдельное состояние из
// макета: один серый кружок с вопросом и подпись «Без организаторов».
function Organizers({ list }) {
  if (!list || list.length === 0) {
    return (
      <div className="event-org">
        <span className="event-avatars"><span className="event-avatar event-avatar--none">?</span></span>
        Без организаторов
      </div>
    );
  }
  return (
    <div className="event-org">
      <span className="event-avatars">
        {list.slice(0, 4).map((initials, i) => (
          <span className={`event-avatar tint-${i % 4}`} key={initials + i}>{initials}</span>
        ))}
      </span>
      {list.length} {plural(list.length, 'организатор', 'организатора', 'организаторов')}
    </div>
  );
}

const plural = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

export function EventCard({ e, onOpen }) {
  return (
    <article className="event-card">
      <div className="event-img"><img src={e.img} alt="" loading="lazy" /></div>
      <div className="event-body">
        <div className="event-when">{e.when}</div>
        <h3 className="event-title">{e.title}</h3>
        <Organizers list={e.organizers} />
        <div className="event-cta">
          <button className="event-more" onClick={() => onOpen?.(e)}>Подробнее</button>
          <button className="event-share" aria-label="Поделиться"><ShareNetwork size={18} color="var(--color-primary)" /></button>
        </div>
      </div>
    </article>
  );
}
