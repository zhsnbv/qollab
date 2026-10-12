import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft24Regular, MoreVertical20Filled, Bookmark20Filled, Bookmark20Regular, Comment20Regular, Eye20Regular, Share20Regular } from '@fluentui/react-icons';
import { MobileArticleContent } from '../gallery/publications-mobile/MobilePublicationParts';
import { LikeButton } from '../gallery/publications-web/PostViews';
import { usePublications } from '../components/publications/usePublications';
import { useScrolled } from '../utils/useScrolled';
import ScrollToTop from '../components/ScrollToTop';
import './ArticleView.css';
import '../components/publications/Publications.css';

export default function ArticleView() {
  const location = useLocation(), navigate = useNavigate();
  const { resolve, posts, actions, saved, change, setSheet } = usePublications();
  const requestedId = new URLSearchParams(location.search).get('post');
  const post = resolve(requestedId || location.state?.post || posts[0]);
  const [closing, setClosing] = useState(false), [scrolled, onScroll] = useScrolled();
  const timer = useRef(null);
  const scrollRef = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const close = () => {
    if (closing) return;
    setClosing(true);
    timer.current = setTimeout(() => location.state?.background ? navigate(-1) : navigate('/posts', { replace: true }), 260);
  };
  const openChannel = () => navigate(`/channel/${post.channelId}`, { state: { background: location } });
  const postActions = post ? actions(post) : null;
  return <section className={`article pm-publications pw-app app-publication-reader ${closing ? 'closing' : ''}`} aria-label="Статья">
    <header className={`ar-header ${scrolled ? 'hdr-shadow' : ''}`}>
      <button className="ar-back" aria-label={location.state?.background?.pathname.startsWith('/channel/') ? 'Назад в канал' : location.state?.background?.pathname === '/search' ? 'Назад к поиску' : 'Назад к публикациям'} onClick={close}><ChevronLeft24Regular /></button>
      <span className="ar-header-gap" aria-hidden="true" />
      {post && <><button className={`ar-header-save ${saved.bookmarks?.[post.id] ? 'active' : ''}`} aria-label={saved.bookmarks?.[post.id] ? 'Убрать из сохранённого' : 'Сохранить публикацию'} aria-pressed={!!saved.bookmarks?.[post.id]} onClick={() => change('bookmarks', post.id, current => !current)}>{saved.bookmarks?.[post.id] ? <Bookmark20Filled /> : <Bookmark20Regular />}</button><button className="ar-back" aria-label="Действия со статьёй" onClick={() => setSheet({ type: 'menu', post })}><MoreVertical20Filled /></button></>}
    </header>
    {post ? <>
      <div ref={scrollRef} className="ar-body pm-reader-scroll" onScroll={onScroll}><MobileArticleContent post={post} onChannel={openChannel} onComments={postActions.onComments} /></div>
      <div className="ar-actions" aria-label="Действия с публикацией">
        <ScrollToTop scrollRef={scrollRef} aboveBar />
        <LikeButton className="ar-act" liked={post.liked} count={post.likes + Number(!!post.liked)} onClick={postActions.onLike} />
        <button className="ar-act" aria-label={`Комментарии: ${post.commentCount}`} onClick={postActions.onComments}><Comment20Regular />{post.comments ? post.commentCount : '—'}</button>
        <span className="ar-actions-gap" />
        <button className="ar-act ar-act--stat" aria-label={`Статистика: ${post.views || '0'} показов`} onClick={postActions.onStats}><Eye20Regular />{post.views || '0'}</button>
        <button className="ar-act ar-act--icon" aria-label="Поделиться публикацией" onClick={postActions.onShare}><Share20Regular /></button>
      </div>
    </> : <div className="pm-empty"><h1>Статья не найдена</h1><p>Вернитесь в ленту и выберите другую публикацию.</p></div>}
  </section>;
}
