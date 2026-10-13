import { usePublicationScenario } from '../publication-screens/ScenarioContext';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp16Regular, ChevronDown20Regular, ChevronUp20Regular, Dismiss20Regular, Send20Filled, Comment24Regular } from '@fluentui/react-icons';
import { LikeButton } from '../publications-web/PostViews';
import { appendComment, commentCount, sortComments, toggleCommentLike } from './mobileDiscussion';
import MobileSheet from './MobileSheet';

function Comment({ item, onReply, onLike, depth = 0, parent, onParent }) {
  const scenario = usePublicationScenario();
  const replyCount = commentCount(item.replies);
  const [expanded, setExpanded] = useState(() => scenario?.comments === 'expanded' || replyCount <= 3);
  const repliesId = useId();
  const head = useRef(null);
  const previousReplyCount = useRef(replyCount);
  useEffect(() => {
    if (replyCount > previousReplyCount.current) setExpanded(true);
    previousReplyCount.current = replyCount;
  }, [replyCount]);
  return <div className={`pm-comment ${depth ? 'pm-comment--reply' : ''}`}>
    <div className="pm-comment-head" ref={head}><img src={item.avatar} alt="" /><div className="pm-comment-author"><div className="pm-comment-author-line"><strong>{item.name}</strong>{parent && <button className="pm-comment-parent" aria-label={`К комментарию: ${parent.name}`} title={`Ответ для ${parent.name}`} onClick={onParent}><ArrowUp16Regular /></button>}{item.channel && <span className="pm-channel-label">Канал</span>}</div><time>{item.date}</time></div></div>
    <p>{item.text}</p>
    <div className="pm-comment-actions">
      {!!replyCount && <button className="pm-replies-toggle" aria-expanded={expanded} aria-controls={repliesId} aria-label={expanded ? `Свернуть ответы (${replyCount})` : `Развернуть ответы (${replyCount})`} onClick={() => setExpanded(!expanded)}>{expanded ? 'Свернуть' : `Ответы (${replyCount})`}{expanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}</button>}
      <button className="pm-comment-reply" onClick={() => onReply(item)}>Ответить</button>
      <LikeButton comment liked={item.liked} count={(item.likes || 0) + Number(!!item.liked)} onClick={() => onLike(item.id)} />
    </div>
    {!!replyCount && expanded && <div id={repliesId} className={`pm-replies ${depth >= 2 ? 'pm-replies--deep' : ''}`}>{item.replies.map(reply => <Comment key={reply.id} item={reply} onReply={onReply} onLike={onLike} depth={depth + 1} parent={item} onParent={() => head.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} />)}</div>}
  </div>;
}

export default function MobileComments({ post, items, onChange, draft, onDraft, onClose, sheetVariant }) {
  const scenario = usePublicationScenario();
  const [sort, setSort] = useState('popular'), [replying, setReplying] = useState(scenario?.comments === 'reply' ? items[0] : null);
  const [sent, setSent] = useState(false);
  const input = useRef(null), list = useRef(null);
  useLayoutEffect(() => {
    if (!input.current) return;
    input.current.style.height = 'auto';
    // Stay one line on focus; grow only when the entered text needs more room.
    input.current.style.height = `${Math.max(42, Math.min(110, input.current.scrollHeight + 2))}px`;
  }, [draft]);
  const reply = item => { setReplying(item); requestAnimationFrame(() => input.current?.focus()); };
  const send = event => {
    event.preventDefault();
    if (!draft.trim()) return;
    const item = { id: crypto.randomUUID(), name: 'Вы', avatar: '/img/profile/avatar-photo.png', text: draft.trim(), date: 'Только что', createdAt: Date.now(), likes: 0, replies: [] };
    onChange(appendComment(items, replying?.id, item));
    if (!replying) { setSort('new'); list.current?.scrollTo({ top: 0 }); }
    setReplying(null); onDraft(''); setSent(true); input.current?.blur();
  };
  return <MobileSheet variant={sheetVariant} title={<>Комментарии <span className="pm-sheet-count">{commentCount(items)}</span></>} onClose={onClose} tall className="pm-comments-sheet">
    {post.comments ? <>
      <div className="pm-comments-toolbar"><label className="pm-sort"><select aria-label="Порядок комментариев" value={sort} onChange={event => setSort(event.target.value)}><option value="popular">Популярные</option><option value="new">Сначала новые</option></select><ChevronDown20Regular /></label></div>
      <div className="pm-comments-list" ref={list}>{items.length ? sortComments(items, sort).map(item => <Comment key={item.id} item={item} onReply={reply} onLike={id => onChange(toggleCommentLike(items, id))} />) : <div className="pm-empty-comments"><Comment24Regular /><h3>Начните обсуждение</h3><p>Поделитесь своим мнением о публикации.</p></div>}</div>
      <form className="pm-composer" onSubmit={send}>
        {replying && <div className="pm-replying"><span>Ответ: <strong>{replying.name}</strong></span><button type="button" aria-label="Отменить ответ" onClick={() => setReplying(null)}><Dismiss20Regular /></button></div>}
        <div className="pm-composer-row"><img src="/img/profile/avatar-photo.png" alt="" />
          <textarea ref={input} rows={1} aria-label={replying ? 'Текст ответа' : 'Текст комментария'} placeholder={replying ? 'Написать ответ…' : 'Написать комментарий…'} value={draft} onChange={event => { onDraft(event.target.value); setSent(false); }} onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') send(event); }} />
          <button type="submit" className="pm-send" aria-label="Отправить комментарий" disabled={!draft.trim()}><Send20Filled /></button>
        </div>
        <span className="pw-sr-only" role="status">{sent ? 'Комментарий отправлен' : ''}</span>
      </form>
    </> : <div className="pm-empty-comments"><Comment24Regular /><h3>Комментарии отключены</h3><p>Канал ограничил обсуждение этой публикации.</p></div>}
  </MobileSheet>;
}
