import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, ChatCircle, Eye } from '@phosphor-icons/react';
import { MobileCard } from '../../gallery/publications-mobile/MobilePublicationParts';
import { LikeButton } from '../../gallery/publications-web/PostViews';
import { PublicationsProvider } from './PublicationContext';
import { usePublications } from './usePublications';
import { coverImage } from '../../gallery/publications-web/cardAppearance';
import './Publications.css';

function FeedPublicationActions({ post, onLike, onComments, onStats }) {
  return <div className="post-actions" aria-label="Действия с публикацией">
    <LikeButton className="post-act" HeartIcon={Heart} liked={post.liked} count={post.likes + Number(!!post.liked)} onClick={onLike} />
    <button className="post-act" aria-label={`Комментарии: ${post.commentCount}`} onClick={onComments}><ChatCircle size={18} />{post.comments ? post.commentCount : '—'}</button>
    <span className="post-actions-gap" />
    <button className="post-act post-act--stat" aria-label={`Статистика: ${post.views || '0'} показов`} onClick={onStats}><Eye size={18} />{post.views || '0'}</button>
  </div>;
}

function ConnectedCard({ p }) {
  const location = useLocation(), navigate = useNavigate();
  const publications = usePublications();
  const post = publications.resolve(p);
  return <div className="pm-publications pw-app"><MobileCard post={post} Actions={FeedPublicationActions}
    onOpen={() => navigate(`/article?post=${encodeURIComponent(post.id)}`, { state: { post, background: location } })}
    onChannel={() => navigate(`/channel/${post.channelId}`, { state: { background: location } })}
    onMenu={() => publications.setSheet({ type: 'menu', post })}
    {...publications.actions(post)} /></div>;
}
export default function PublicationCard(props) {
  const context = usePublications();
  // Isolated component previews get their own state; the app uses one shared provider.
  return context ? <ConnectedCard {...props} /> : <PublicationsProvider><ConnectedCard {...props} /></PublicationsProvider>;
}

// Home keeps its compact editorial list inside the shared section card.
export function HomePublicationCard({ p }) {
  const location = useLocation(), navigate = useNavigate();
  const publications = usePublications();
  const post = publications.resolve(p);
  const thumbnail = coverImage(post)?.src || post.videos[0]?.poster;
  const open = () => navigate(`/article?post=${encodeURIComponent(post.id)}`, { state: { post, background: location } });
  return <article className="post-item post-item--compact home-publication" data-post-id={post.id}>
    <div className="post-channel">
      <button className="home-publication-channel" onClick={() => navigate(`/channel/${post.channelId}`, { state: { background: location } })} aria-label={`Открыть канал ${post.channel}`}>
        <span className="post-channel-avatar"><img src={post.channelAvatar} alt="" loading="lazy" /></span>
        <span className="post-channel-name">{post.channel}</span>
      </button>
      <span className="post-dot" aria-hidden="true" />
      <time className="post-date">{post.date}</time>
    </div>
    <button className="post-row home-publication-open" onClick={open} aria-label={`Открыть статью: ${post.title}`}>
      <span className="post-body">
        <span className="post-title">{post.title}</span>
        {post.lead && <span className="post-excerpt">{post.lead}</span>}
      </span>
      {thumbnail && <span className="post-thumb"><img src={thumbnail} alt="" loading="lazy" /></span>}
    </button>
    <FeedPublicationActions post={post} {...publications.actions(post)} />
  </article>;
}
