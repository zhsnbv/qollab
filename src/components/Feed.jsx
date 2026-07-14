import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, ChatCircle, BookmarkSimple, DotsThree,
  ShareNetwork, CalendarBlank,
} from '@phosphor-icons/react';
import './Feed.css';

// Капсульные табы «Публикации / Мероприятия» — иконки-маски меняют цвет
// с серого на оранжевый у активного (без запечённого фона).
export function FeedTabs({ tab, onChange }) {
  return (
    <div className="feed-tabs">
      <button
        className={`feed-tab ${tab === 'posts' ? 'active' : ''}`}
        onClick={() => onChange('posts')}
      >
        <span className="feed-tab-ico feed-tab-ico--news" />Публикации
      </button>
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
// строка действий (лайк, комменты, репост · закладка, ещё).
export function PostCard({ p, compact }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
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
        <span className="post-actions-gap" />
        <button
          className={`post-act post-act--icon ${saved ? 'saved' : ''}`}
          onClick={() => setSaved((v) => !v)}
          aria-label="В избранное"
        >
          <BookmarkSimple size={18} weight={saved ? 'fill' : 'regular'} />
        </button>
        <button className="post-act post-act--icon" aria-label="Ещё"><DotsThree size={20} weight="bold" /></button>
      </div>
    </article>
  );
}

// Карточка мероприятия: картинка, дата, заголовок, организаторы, «Подробнее».
export function EventCard({ e }) {
  return (
    <article className="event-card press-scale">
      <div className="event-img"><img src={e.img} alt="" loading="lazy" /></div>
      <div className="event-body">
        <div className="event-when">{e.when}</div>
        <h3 className="event-title">{e.title}</h3>
        <div className="event-org"><CalendarBlank size={16} color="var(--color-weak)" />{e.org}</div>
        <div className="event-cta">
          <button className="event-more">Подробнее</button>
          <button className="event-share" aria-label="Поделиться"><ShareNetwork size={18} color="var(--color-primary)" /></button>
        </div>
      </div>
    </article>
  );
}
