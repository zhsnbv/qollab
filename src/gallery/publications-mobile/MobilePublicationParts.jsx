import { useId, useRef, useState } from 'react';
import { MoreVertical20Filled, Settings20Filled, ChevronRight20Regular, ChevronDown20Regular, ChevronUp20Regular, Comment24Regular, Share24Regular, Eye24Regular } from '@fluentui/react-icons';
import PublicationIdentity from '../publications-web/PublicationIdentity';
import PublicationMedia from '../publications-web/PublicationMedia';
import { PublicationDetails, PublicationBody, CollapsibleBody, FileList, LikeButton } from '../publications-web/PostViews';
import { hasBody } from '../publications-web/publicationContent';
import { titleOf } from '../publications-web/data';
import { hasCoverMedia } from '../publications-web/cardAppearance';
import { rubricStyle } from '../publications-web/publicationRubrics';
import '../publications-web/PublicationDocument.css';
import '../publications-web/PublicationProperties.css';
import '../publications-web/PublicationAppearance.css';
import '../publications-web/PublicationPolish.css';
import './PublicationsMobile.css';
export function PublicationActions({ post, onLike, onComments, onShare, onStats, fixed = false }) {
  return <div className={`pm-actions ${fixed ? 'pm-actions--fixed' : ''}`} aria-label="Действия с публикацией">
    <LikeButton liked={post.liked} count={(post.likes || 0) + Number(!!post.liked)} onClick={onLike} />
    <button aria-label={`Комментарии: ${post.commentCount}`} onClick={onComments}><Comment24Regular /><span>{post.comments ? post.commentCount : '—'}</span></button>
    <button aria-label="Поделиться публикацией" onClick={onShare}><Share24Regular /></button>
    <button className="pm-views" aria-label={`Статистика: ${post.views || '0'} показов`} onClick={onStats}><Eye24Regular /><span>{post.views || '0'}</span></button>
  </div>;
}

export function MobileCard({ post, onOpen, onChannel, onMenu, Actions = PublicationActions, ...actions }) {
  const [expanded, setExpanded] = useState(false), [controls, setControls] = useState(null);
  const id = useId(), card = useRef(null);
  const channel = <div className="pm-card-channel"><PublicationIdentity post={post} onChannel={onChannel} /><span className="pw-header-media-actions" ref={setControls} /><button className="pm-more" aria-label={`Действия: ${titleOf(post)}`} onClick={onMenu}><MoreVertical20Filled /></button></div>;
  return <article ref={card} className="pm-card pw-card-tile pw-card-cover" style={rubricStyle(post)} data-post-id={post.id} onPointerDown={event => { card.current._tap = { x: event.clientX, y: event.clientY }; }} onClick={event => {
    if (!card.current.contains(event.target) || event.defaultPrevented || event.target.closest('button, a, input, textarea, select, [role="button"], .pw-people-track')) return;
    const point = card.current._tap;
    if (point && Math.hypot(event.clientX - point.x, event.clientY - point.y) > 8) return;
    if (window.getSelection()?.toString()) return;
    onOpen();
  }}>
    {hasCoverMedia(post) ? <PublicationMedia post={post} onImageClick={onOpen} headerControls controlsTarget={controls} cover={{ header: channel, title: titleOf(post), lead: post.lead, onOpen }} /> : <div className="pm-text-card">{channel}<button className="pm-text-title" onClick={onOpen}>{titleOf(post)}</button><p>{post.lead}</p></div>}
    <div className="pm-card-content"><PublicationDetails post={post} />
      {hasBody(post) && <div className="pm-disclosure"><CollapsibleBody post={post} id={id} expanded={expanded} /><button className="pw-read-more" aria-expanded={expanded} aria-controls={id} onClick={() => { if (expanded && card.current?.getBoundingClientRect().top < 0) card.current.scrollIntoView({ block: 'start' }); setExpanded(!expanded); }}>{expanded ? 'Скрыть' : 'Показать полностью'}{expanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}</button></div>}
      <FileList files={post.files} /><Actions post={post} {...actions} />
    </div>
  </article>;
}

export function ChannelStrip({ channels, selected, onSelect, onSettings }) {
  const followed = channels.filter(channel => channel.subscribed);
  return <div className="pm-channel-strip no-scrollbar" aria-label="Фильтр по каналам">
    <button className={`pm-channel-item ${!selected ? 'is-selected' : ''}`} aria-pressed={!selected} onClick={() => onSelect(null)}><span className="pm-channel-ring pm-channel-all"><span>{channels.slice(0, 4).map(channel => <img key={channel.id} src={channel.avatar} alt="" />)}</span></span><strong>Все каналы</strong></button>
    {followed.map(channel => <button key={channel.id} className={`pm-channel-item ${selected === channel.id ? 'is-selected' : ''}`} aria-pressed={selected === channel.id} onClick={() => onSelect(channel.id)}><span className="pm-channel-ring"><img src={channel.avatar} alt="" /></span><strong>{channel.name}</strong></button>)}
    <button className="pm-channel-item" onClick={onSettings}><span className="pm-channel-ring pm-channel-setting"><Settings20Filled /></span><strong>Настройка</strong></button>
  </div>;
}


export function MobileArticleContent({ post, onChannel, onComments }) {
  return <article className="pm-reader" style={rubricStyle(post)}>
    <PublicationIdentity post={post} onChannel={onChannel} />
    <h1>{titleOf(post)}</h1><PublicationDetails post={post} />
    {post.lead && <p className="pm-reader-lead">{post.lead}</p>}
    <PublicationMedia post={post} /><PublicationBody post={post} id={`pm-reader-${post.id}`} />
    <FileList files={post.files} />
    <button className="pm-open-discussion" onClick={onComments}><Comment24Regular /><span>{post.comments ? (post.commentCount ? `Обсудить статью · ${post.commentCount}` : 'Начать обсуждение') : 'Комментарии отключены'}</span><ChevronRight20Regular /></button>
  </article>;
}
