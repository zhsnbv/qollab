import { usePublicationScenario } from '../publication-screens/ScenarioContext';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button, Dropdown, Input, Rate, Select } from 'antd';
import { ArrowUp16Regular, Heart20Regular, Heart20Filled, Comment20Regular, Share20Regular, MoreVertical20Filled, Pin20Regular, Edit20Regular, Delete20Regular, Location20Regular, Document20Regular, ChevronUp20Regular, ChevronDown20Regular, Send20Filled, ArrowTrending20Filled, Star16Filled } from '@fluentui/react-icons';
import { PEOPLE, PROJECT_FIELDS, titleOf } from './data';
import RichEditor from './RichEditor';
import Media from './PublicationMedia';
import PublicationPeople from './PublicationPeople';
import PublicationStats from './PublicationStats';
import PublicationIdentity from './PublicationIdentity';
import { useLikeSound } from './likeSoundContext';
import { rubricStyle, rubricValue } from './publicationRubrics';
import { cardAppearance } from './cardAppearance';
import { documentText } from './blockDocument';
import { hasBody, initialComments } from './publicationContent';

export function ChannelAvatar({ size = 20, src = '/img/posts/ch-erg-news.png' }) { return <img className="pw-channel-avatar" src={src} width={size} height={size} alt="" />; }
function Metadata({ post }) {
  return post.type !== 'news' && <div className="pw-post-meta">
    {post.type === 'audit' ? <span className="pw-outcome-badge pw-meta-rating" role="img" aria-label={`Оценка обхода: ${post.rating || 0} из 5`}>
      <span className="pw-outcome-label" aria-hidden="true">Оценка</span>
      <span className="pw-outcome-stars" aria-hidden="true"><Rate disabled character={<Star16Filled />} value={post.rating || 0} /></span>
      <strong className="pw-outcome-value" aria-hidden="true">{post.rating || 0}<span className="pw-outcome-scale"> из 5</span></strong>
    </span> : <span className="pw-outcome-badge pw-meta-effect">
      <ArrowTrending20Filled aria-hidden="true" /><span className="pw-outcome-label">Эффект</span><strong className="pw-outcome-value">{post.effect == null ? '—' : `${post.effect} млн ₸`}</strong>
    </span>}
    <span className="pw-meta-company" title={post.company}><Location20Regular /><span>{post.company || 'Предприятие не указано'}</span></span>
  </div>;
}
export function PublicationDetails({ post }) {
  return post.type !== 'news' && <section className={`pw-publication-details pw-details-${post.type}`} aria-label={post.type === 'audit' ? 'Сведения об обходе' : 'Сведения о проекте'}><Metadata post={post} /><PublicationPeople post={post} /></section>;
}
export function LikeButton({ liked, count, onClick, comment = false, className = '', HeartIcon }) {
  const [burst, setBurst] = useState(0);
  const playLikeSound = useLikeSound();
  const Icon = HeartIcon || (liked ? Heart20Filled : Heart20Regular);
  return <button type="button" className={`pw-like-button ${liked ? 'is-liked' : ''} ${className}`} aria-label={liked ? (comment ? 'Убрать лайк с комментария' : 'Убрать лайк') : (comment ? 'Нравится комментарий' : 'Нравится')} aria-pressed={!!liked} onClick={() => { setBurst(value => liked ? 0 : value + 1); if (!liked) playLikeSound(); onClick(); }}>
    <span className="pw-like-icon" key={burst}>
      <Icon {...(HeartIcon ? { weight: liked ? 'fill' : 'regular' } : {})} className={liked && burst ? 'pw-heart-pop' : ''} />
      {!!burst && liked && <span className="pw-heart-bubbles" aria-hidden="true">{[-18, 4, 21, -8, 12].map((x, i) => <Heart20Filled key={i} style={{ '--heart-x': `${x}px`, '--heart-rise': `${42 + i % 3 * 10}px`, '--heart-delay': `${300 + i * 65}ms`, '--heart-size': `${7 + i % 3 * 2}px` }} />)}</span>}
    </span><span className="pw-like-count">{count}</span>
  </button>;
}
function PostActions({ post, onOpen, onLike, onShare }) {
  return <div className="pw-post-actions"><LikeButton liked={post.liked} count={(post.likes || 0) + (post.liked ? 1 : 0)} onClick={onLike} /><button aria-label={post.comments ? 'Комментарии' : 'Комментарии отключены'} onClick={onOpen}><Comment20Regular /><span>{post.comments ? post.commentCount || 0 : '—'}</span></button><button aria-label="Поделиться публикацией" onClick={onShare}><Share20Regular /></button><PublicationStats post={post} /></div>;
}
export function FileList({ files }) { return !!files?.length && <div className="pw-card-files">{files.map(f => <a key={f.id} href={f.url} download={f.name}><Document20Regular /><span><strong>{f.name}</strong><small>{f.size}</small></span><span>Скачать</span></a>)}</div>; }
function auditDocument(description) {
  if (!description?.ops?.every(op => typeof op.insert === 'string' && !op.attributes)) return description;
  const headings = new Set(['Охрана труда', 'Производственная система', 'Из диалога с сотрудником', 'Положительные моменты', 'Зоны улучшений', 'Зоны для улучшений', 'Обратная связь лидера']);
  const lines = description.ops.map(op => op.insert).join('').trimEnd().split('\n');
  return { ops: lines.flatMap(line => headings.has(line.trim().replace(/:$/, ''))
    ? [{ insert: line.trim().replace(/:$/, '') }, { insert: '\n', attributes: { header: 2 } }]
    : [{ insert: line + '\n' }]) };
}
export function PublicationBody({ post, id }) {
  return post.type === 'project' ? <div className="pw-project-body">{PROJECT_FIELDS.filter(([key]) => key !== 'lead').map(([key, label]) => post[key] && <section key={key} data-section={key}><h2>{label}</h2><p>{post[key]}</p></section>)}{!post.anonymous && !!post.authors?.length && <section data-section="authors"><h2>Авторы проекта</h2>{post.authors.map(authorId => <div key={authorId}><h3>{PEOPLE.find(p => p.value === authorId)?.label}</h3><p>{post.dossiers?.[authorId]}</p></div>)}</section>}</div> : <RichEditor id={id} value={post.type === 'audit' ? auditDocument(post.description) : post.description} readOnly />;
}

function bodyPreview(post) {
  const text = post.type === 'project'
    ? PROJECT_FIELDS.filter(([key]) => key !== 'lead').map(([key]) => post[key] || '').join('\n')
    : documentText(post.description);
  return text.replace(/\s+/g, ' ').trim();
}
export function CollapsibleBody({ post, id, expanded }) {
  const root = useRef(null), [previewHeight, setPreviewHeight] = useState(77);
  useLayoutEffect(() => {
    const element = root.current;
    const measure = () => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const lines = [];
      while (walker.nextNode() && lines.length < 4) {
        if (!walker.currentNode.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          const previous = lines.at(-1);
          if (previous && rect.top < previous.bottom && rect.bottom > previous.top) previous.bottom = Math.max(previous.bottom, rect.bottom);
          else lines.push({ top: rect.top, bottom: rect.bottom });
          if (lines.length === 4) break;
        }
      }
      if (lines.length) setPreviewHeight(Math.ceil(lines[Math.min(2, lines.length - 1)].bottom - element.getBoundingClientRect().top + 2));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, [post.type]);
  return <div ref={root} id={id} className={`pw-card-full-text ${expanded ? '' : 'is-collapsed'}`} style={{ maxHeight: expanded ? undefined : previewHeight }} inert={!expanded} aria-hidden={!expanded}>
    <PublicationBody post={post} id={`pw-tile-${id}`} />
  </div>;
}
export function PublicationCard({ post, preview = false, onOpen, onLike, onShare, onEdit, onPin, onDelete, onChannel }) {
  const scenario = usePublicationScenario();
  const [expanded, setExpanded] = useState(!!scenario?.expanded), [mediaActions, setMediaActions] = useState(null);
  const bodyId = useId(), card = useRef(null);
  const hasText = !preview && hasBody(post), isCover = cardAppearance(post) === 'cover';
  const toggleBody = () => {
    if (expanded && card.current?.getBoundingClientRect().top < 72) card.current.scrollIntoView({ block: 'start' });
    setExpanded(!expanded);
  };
  const menu = { items: [{ key: 'edit', icon: <Edit20Regular />, label: 'Редактировать' }, { key: 'pin', icon: <Pin20Regular />, label: post.pinned ? 'Открепить' : 'Закрепить' }, { type: 'divider' }, { key: 'delete', icon: <Delete20Regular />, label: 'Удалить публикацию', danger: true }], onClick: ({ key, domEvent }) => { domEvent.stopPropagation(); ({ edit: onEdit, pin: onPin, delete: onDelete }[key]?.()); } };
  const lead = post.lead && <div className="pw-card-text"><p>{post.lead}</p></div>;
  const channelHeader = <div className="pw-card-channel"><PublicationIdentity post={post} onChannel={preview ? undefined : onChannel} />{post.anonymous && <span className="pw-anonymous">Анонимно</span>}{post.pinned && <Pin20Regular className="pw-pinned" />}<span className="pw-header-media-actions" ref={setMediaActions} />{preview ? <Button className="pw-more-button" shape="circle" disabled aria-label="Действия публикации" icon={<MoreVertical20Filled />} /> : <Dropdown menu={menu} trigger={['click']} placement="bottomRight"><Button className="pw-more-button" shape="circle" aria-label={`Действия: ${titleOf(post)}`} icon={<MoreVertical20Filled />} /></Dropdown>}</div>;
  return <article ref={card} className={`pw-publication-card pw-card-tile ${isCover ? 'pw-card-cover' : ''} ${expanded ? 'is-expanded' : ''}`} style={rubricStyle(post)} data-rubric={rubricValue(post)} data-source-node="7805:3193">
    {isCover ? <Media key={`cover-${post.coverImageId || 'first'}`} post={post} onImageClick={preview ? undefined : onOpen} headerControls controlsTarget={mediaActions} cover={{ header: channelHeader, title: titleOf(post), lead: post.lead, onOpen: preview ? undefined : onOpen }} /> : channelHeader}
    <div className="pw-card-inner">
      {isCover ? <PublicationDetails post={post} /> : <>
        {preview ? <h3 className="pw-title-link">{titleOf(post)}</h3> : <button className="pw-title-link" onClick={onOpen}>{titleOf(post)}</button>}
        <PublicationDetails post={post} />
        {lead}
        <Media key="standard" post={post} onImageClick={preview ? undefined : onOpen} headerControls controlsTarget={mediaActions} />
      </>}
      {hasText && <div className="pw-card-disclosure">
        {!expanded && <span className="pw-sr-only">{bodyPreview(post).slice(0, 260)}</span>}
        <CollapsibleBody post={post} id={bodyId} expanded={expanded} />
        <button type="button" className="pw-read-more" aria-expanded={expanded} aria-controls={bodyId} onClick={toggleBody}>{expanded ? 'Скрыть' : 'Показать полностью'}{expanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}</button>
      </div>}
      {!preview && <><FileList files={post.files} /><PostActions post={post} onOpen={onOpen} onLike={onLike} onShare={onShare} /></>}
    </div>
  </article>;
}

function CommentComposer({ onSend, replyingTo, onCancel }) {
  const scenario = usePublicationScenario();
  const [text, setText] = useState(scenario?.comments === 'draft' ? 'Спасибо за подробный материал! Поделюсь с командой.' : ''), [expanded, setExpanded] = useState(!!replyingTo || scenario?.comments === 'draft');
  const input = useRef(null);
  useLayoutEffect(() => { if (expanded && !scenario) input.current?.focus(); }, [expanded, scenario]);
  if (!expanded) return <button type="button" className="pw-comment-prompt" aria-expanded={false} onClick={() => setExpanded(true)}>Написать комментарий…</button>;
  const cancel = () => { if (replyingTo) onCancel(); else { setText(''); setExpanded(false); } };
  return <div className="pw-comment-compose" onBlur={event => { if (!replyingTo && !text.trim() && !event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }} onKeyDown={event => { if (event.key === 'Escape' && !text.trim()) cancel(); }}>
    {replyingTo && <div className="pw-replying">Ответ {replyingTo}<button type="button" onClick={cancel}>Отмена</button></div>}
    <Input.TextArea ref={input} aria-label={replyingTo ? 'Текст ответа' : 'Текст комментария'} value={text} onChange={e => setText(e.target.value)} placeholder={replyingTo ? 'Написать ответ…' : 'Написать комментарий…'} autoSize={{ minRows: 3, maxRows: 8 }} />
    <div className="pw-comment-compose-actions">{!replyingTo && <Button type="text" shape="round" onClick={cancel}>Отмена</Button>}<Button className="pw-comment-send" type="primary" shape="round" disabled={!text.trim()} icon={<Send20Filled />} onClick={() => { onSend(text.trim()); setText(''); if (!replyingTo) setExpanded(false); }}>{replyingTo ? 'Ответить' : 'Отправить'}</Button></div>
  </div>;
}
function countReplies(items) {
  return items.reduce((sum, item) => sum + 1 + countReplies(item.replies || []), 0);
}
function Comment({ item, onReply, depth = 0, parent, onParent }) {
  const scenario = usePublicationScenario();
  const replyCount = countReplies(item.replies);
  const [liked, setLiked] = useState(false), [reply, setReply] = useState(false);
  const [expanded, setExpanded] = useState(() => scenario?.comments === 'expanded' || replyCount <= 3);
  const repliesId = useId(), head = useRef(null), previousReplyCount = useRef(replyCount);
  useEffect(() => {
    if (replyCount > previousReplyCount.current) setExpanded(true);
    previousReplyCount.current = replyCount;
  }, [replyCount]);
  return <div className={`pw-comment ${depth ? 'pw-comment--reply' : ''}`}>
    <div className="pw-comment-top" ref={head}>
      <img src={item.avatar} alt="" />
      <div className="pw-comment-identity"><div className="pw-comment-name">
        <strong>{item.name}</strong>
        {parent && <button type="button" className="pw-comment-parent" aria-label={`К комментарию: ${parent.name}`} title={`Ответ для ${parent.name}`} onClick={onParent}><ArrowUp16Regular /></button>}
        {item.channel && <span className="pw-comment-channel">Канал</span>}
      </div><time>{item.date}</time></div>
    </div>
    <div className="pw-comment-body">
      <p>{item.text}</p>
      <div className="pw-comment-actions">
        {!!replyCount && <button type="button" className="pw-collapse-replies" aria-expanded={expanded} aria-controls={repliesId} aria-label={expanded ? `Свернуть ответы (${replyCount})` : `Развернуть ответы (${replyCount})`} onClick={() => setExpanded(!expanded)}>{expanded ? 'Свернуть' : `Ответы (${replyCount})`}{expanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}</button>}
        <button type="button" className="pw-comment-reply" onClick={() => setReply(!reply)}>Ответить</button>
        <LikeButton comment liked={liked} count={item.likes + Number(liked) || ''} onClick={() => setLiked(!liked)} />
      </div>
      {reply && <CommentComposer replyingTo={item.name} onCancel={() => setReply(false)} onSend={text => { onReply(item.id, text); setReply(false); }} />}
    </div>
    {!!replyCount && expanded && <div id={repliesId} className={`pw-replies ${depth >= 2 ? 'pw-replies--deep' : ''}`}>
      {item.replies.map(child => <Comment key={child.id} item={child} onReply={onReply} depth={depth + 1} parent={item} onParent={() => head.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} />)}
    </div>}
  </div>;
}
export function Comments({ enabled, items, onChange }) {
  const [sort, setSort] = useState('popular');
  const comments = items || initialComments;
  const reply = (id, text) => { const newComment = { id: crypto.randomUUID(), name: 'Вы', avatar: '/img/profile/avatar-photo.png', text, date: 'Только что', likes: 0, replies: [] }; const update = nodes => nodes.map(n => n.id === id ? { ...n, replies: [...n.replies, newComment] } : { ...n, replies: update(n.replies) }); onChange(id ? update(comments) : [newComment, ...comments]); };
  if (!enabled) return <section className="pw-comments pw-comments-disabled"><Comment20Regular /><h2>Комментарии отключены</h2><p>Канал ограничил обсуждение этой публикации.</p></section>;
  const count = nodes => nodes.reduce((sum, c) => sum + 1 + count(c.replies), 0);
  return <section className="pw-comments"><header><h2>Комментарии <span>{count(comments)}</span></h2><Select className="pw-comment-sort" classNames={{ popup: { root: 'pw-comment-sort-popup' } }} aria-label="Порядок комментариев" value={sort} onChange={setSort} options={[{ value: 'popular', label: 'Популярные' }, { value: 'new', label: 'Новые' }]} /></header><CommentComposer onSend={text => reply(null, text)} /><div className="pw-comment-list">{[...comments].sort((a, b) => sort === 'popular' ? b.likes - a.likes : (b.date === 'Только что') - (a.date === 'Только что')).map(c => <Comment key={c.id} item={c} onReply={reply} />)}</div></section>;
}
export function PublicationReader({ post, onLike, onShare, preview, comments, onComments }) {
  return <div className="pw-reader" style={rubricStyle(post)}><article className="pw-article"><div className="pw-card-channel"><PublicationIdentity post={post} />{post.anonymous && <span>Анонимно</span>}</div><h1>{titleOf(post)}</h1><PublicationDetails post={post} />{post.lead && <p className="pw-article-lead">{post.lead}</p>}
    <PublicationBody post={post} id={`pw-read-${post.id || 'preview'}`} />
    <Media post={post} /><FileList files={post.files} /><PostActions post={post} onOpen={() => document.getElementById('pw-discussion')?.scrollIntoView({ behavior: 'smooth' })} onLike={onLike} onShare={onShare} />
  </article>{!preview && <div id="pw-discussion"><Comments enabled={post.comments} items={comments} onChange={onComments} /></div>}{preview && !post.comments && <p className="pw-preview-comments">Комментарии отключены</p>}</div>;
}
