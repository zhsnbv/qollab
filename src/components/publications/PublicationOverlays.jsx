import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark24Regular, Bookmark24Filled, Share24Regular, ChevronRight24Regular, Link20Regular } from '@fluentui/react-icons';
import ActionSheet from '../ActionSheet';
import Portal from '../Portal';
import { usePublications } from './usePublications';
import MobileComments from '../../gallery/publications-mobile/MobileComments';
import MobileSheet from '../../gallery/publications-mobile/MobileSheet';
import { titleOf } from '../../gallery/publications-web/data';
import './Publications.css';

export default function PublicationOverlays() {
  const { saved, sheet, setSheet, resolve, change, threads } = usePublications();
  const location = useLocation(), navigate = useNavigate();
  const [toast, setToast] = useState(''), timer = useRef(null);
  const post = resolve(sheet?.post), close = () => setSheet(null);
  const notice = text => { clearTimeout(timer.current); setToast(text); timer.current = setTimeout(() => setToast(''), 2600); };
  useEffect(() => () => clearTimeout(timer.current), []);
  // Browser back and tab navigation close the sheet before changing the underlying screen.
  useEffect(() => { setSheet(null); }, [location.key, setSheet]);
  const url = post ? `${window.location.origin}/article?post=${encodeURIComponent(post.id)}` : '';
  return <>
    {post && sheet.type === 'comments' && <MobileComments sheetVariant="app" post={post} items={threads(post.id)} draft={saved.drafts?.[post.id] || ''} onDraft={value => change('drafts', post.id, value)} onChange={value => change('threads', post.id, value)} onClose={close} />}
    {post && sheet.type === 'menu' && <ActionSheet title="Публикация" onClose={close} items={[
      { id: 'save', label: saved.bookmarks?.[post.id] ? 'Убрать из сохранённого' : 'Сохранить публикацию', Icon: saved.bookmarks?.[post.id] ? Bookmark24Filled : Bookmark24Regular },
      { id: 'share', label: 'Поделиться', Icon: Share24Regular },
      { id: 'channel', label: 'Перейти в канал', Icon: ChevronRight24Regular },
    ]} onPick={id => {
      if (id === 'save') { change('bookmarks', post.id, current => !current); notice(saved.bookmarks?.[post.id] ? 'Удалено из сохранённого' : 'Публикация сохранена'); close(); }
      if (id === 'share') setSheet({ type: 'share', post });
      if (id === 'channel') { close(); navigate(`/channel/${post.channelId}`, { state: { background: location } }); }
    }} />}
    {post && sheet.type === 'stats' && <MobileSheet variant="app" title="Статистика публикации" onClose={close}><div className="pm-sheet-content"><p className="pm-stats-title">{titleOf(post)}</p><dl className="pm-stats"><div><dt>Показы в ленте</dt><dd>{post.views || '0'}</dd></div><div><dt>Открытия статьи</dt><dd>{post.opens ?? '—'}</dd></div><div><dt>Реакции</dt><dd>{post.likes + Number(!!post.liked)}</dd></div><div><dt>Комментарии</dt><dd>{post.commentCount}</dd></div></dl><p className="pm-stats-caption">Показы — появления карточки в ленте. Открытия — переходы в статью.</p><span className="pm-stats-period">За всё время</span></div></MobileSheet>}
    {post && sheet.type === 'share' && <MobileSheet variant="app" title="Поделиться публикацией" onClose={close}><div className="pm-sheet-content"><p>{titleOf(post)}</p><input className="pm-share-url" aria-label="Ссылка на публикацию" value={url} readOnly onFocus={event => event.target.select()} /><button className="pm-primary" onClick={async () => { try { await navigator.clipboard.writeText(url); notice('Ссылка скопирована'); close(); } catch { notice('Выделите и скопируйте ссылку'); } }}><Link20Regular />Скопировать ссылку</button>{!!navigator.share && <button className="pm-native-share" onClick={async () => { try { await navigator.share({ title: titleOf(post), url }); close(); } catch { /* User can cancel native sharing. */ } }}><Share24Regular />Другие приложения</button>}</div></MobileSheet>}
    {toast && <Portal><div className="pm-toast" role="status">{toast}</div></Portal>}
  </>;
}
