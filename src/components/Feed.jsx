import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, ChatCircle, Eye, ShareNetwork, CalendarBlank, Megaphone,
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

// Публикация в стиле Medium: канал · дата, заголовок+превью, картинка,
// строка метрик. В превью — только лайки, комментарии и просмотры: закладка и
// «ещё» уехали на экран самой публикации, здесь карточка ничего не «делает».
export function PostCard({ p, compact }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const open = () => navigate('/article', { state: { post: p, background: location } });
  return (
    <article className={`post-item ${compact ? 'post-item--compact' : ''}`} onClick={open}>
      <div className="post-channel">
        <span className="post-channel-avatar"><img src={p.avatar} alt="" /></span>
        <span className="post-channel-name">{p.channel}</span>
        <span className="post-dot" />
        <span className="post-date">{p.date}</span>
      </div>
      <div className="post-row">
        <div className="post-body">
          <h3 className={`post-title ${p.read ? 'read' : ''}`}>{p.title}</h3>
          {p.excerpt && <p className="post-excerpt">{p.excerpt}</p>}
        </div>
        {p.thumb && <div className="post-thumb"><img src={p.thumb} alt="" loading="lazy" /></div>}
      </div>
      <div className="post-actions" onClick={(e) => e.stopPropagation()}>
        <button className={`post-act ${liked ? 'liked' : ''}`} onClick={() => setLiked((v) => !v)}>
          <Heart size={18} weight={liked ? 'fill' : 'regular'} />
          {Number(String(p.likes).replace(/\s/g, '')) + (liked ? 1 : 0)}
        </button>
        <button className="post-act"><ChatCircle size={18} />{p.comments}</button>
        {/* Просмотры прижаты к правому краю — как в макете */}
        <span className="post-actions-gap" />
        <span className="post-act post-act--stat"><Eye size={18} />{p.views ?? '502'}</span>
      </div>
    </article>
  );
}

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
