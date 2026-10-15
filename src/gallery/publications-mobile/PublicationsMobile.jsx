import { PUBLICATION_FEED_ORDER } from '../publications-web/editorialSamples';
import { MobileCard, ChannelStrip, PublicationActions as Actions } from './MobilePublicationParts';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ArrowLeft24Regular, ChevronLeft24Regular, MoreVertical20Filled, Search24Regular, Settings20Filled, ChevronRight20Regular, Comment24Regular, Share24Regular, Bookmark20Regular, Bookmark20Filled, Link20Regular, Alert20Filled, AlertOff20Regular, Checkmark20Regular, Add20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import TopBar from '../../components/TopBar';
import TabLayout from '../../components/TabLayout';
import BottomNav from '../../components/BottomNav';
import { DeviceHost } from '../../components/Portal';
import { FeedTabs, EventCard } from '../../components/Feed';
import EventView from '../../screens/EventView';
import { events } from '../../data/feed';
import PublicationIdentity from '../publications-web/PublicationIdentity';
import PublicationMedia from '../publications-web/PublicationMedia';
import PublicationSound from '../publications-web/PublicationSound';
import { PublicationDetails, PublicationBody, FileList } from '../publications-web/PostViews';
import { initialComments } from '../publications-web/publicationContent';
import { INITIAL_POSTS, titleOf } from '../publications-web/data';
import { INITIAL_CHANNEL } from '../publications-web/channelData';
import { publicationChannels, publicationChannelId } from '../publications-web/publicationChannelsData';
import { hasCoverMedia, isFeedPublication } from '../publications-web/cardAppearance';
import { rubricStyle } from '../publications-web/publicationRubrics';
import { commentCount } from './mobileDiscussion';
import MobileSheet from './MobileSheet';
import MobileComments from './MobileComments';
import '../publications-web/PublicationDocument.css';
import '../publications-web/PublicationProperties.css';
import '../publications-web/PublicationAppearance.css';
import '../publications-web/PublicationPolish.css';
import './PublicationsMobile.css';

const STORAGE = 'qollab-publications-mobile-v1';
const priority = PUBLICATION_FEED_ORDER;
const seedThreads = Object.fromEntries(INITIAL_POSTS.map(post => [post.id, post.commentCount ? structuredClone(initialComments) : []]));
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || 'null') || {}; } catch { return {}; }
}

function MobileExperience() {
  const location = useLocation(), navigate = useNavigate();
  const [saved, setSaved] = useState(loadState);
  const [tab, setTab] = useState('posts'), [filter, setFilter] = useState(null), [query, setQuery] = useState(''), [searching, setSearching] = useState(false);
  const [sheet, setSheet] = useState(null), [toast, setToast] = useState('');
  const toastTimer = useRef(null), reader = useRef(null), screens = useRef(null), scrollPositions = useRef(new Map());
  const threads = { ...seedThreads, ...saved.threads };
  const own = { ...INITIAL_CHANNEL, subscribed: saved.subscriptions?.['erg-news'] ?? true };
  const posts = INITIAL_POSTS.map(post => ({ ...post, liked: !!saved.likes?.[post.id], commentCount: commentCount(threads[post.id]) }));
  const channels = publicationChannels(posts, own, saved.subscriptions || {});
  const channelId = location.pathname.startsWith('/channel/') ? decodeURIComponent(location.pathname.slice(9)) : null;
  const activeChannel = channels.find(channel => channel.id === channelId);
  const postId = location.pathname.startsWith('/article/') ? decodeURIComponent(location.pathname.slice(9)) : null;
  const article = posts.find(post => post.id === postId);
  const currentArticleId = article?.id, currentChannelId = activeChannel?.id;
  const scrollSelector = article ? '.pm-reader-scroll' : activeChannel ? '.pm-channel-scroll' : '.scroll-area';
  const isFeed = location.pathname === '/posts', isEvent = location.pathname === '/event';
  const selectedChannel = channels.find(channel => channel.id === filter);
  const followed = new Set(channels.filter(channel => channel.subscribed).map(channel => channel.id));
  const visiblePosts = posts.filter(post => isFeedPublication(post) && followed.has(publicationChannelId(post, own)) && (!filter || publicationChannelId(post, own) === filter) && `${titleOf(post)} ${post.lead}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (priority[a.id] ?? 6) - (priority[b.id] ?? 6));
  const sheetPost = posts.find(post => post.id === sheet?.postId);
  const notice = text => { clearTimeout(toastTimer.current); setToast(text); toastTimer.current = setTimeout(() => setToast(''), 2600); };
  const change = (key, id, value) => setSaved(current => ({ ...current, [key]: { ...current[key], [id]: value } }));
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(saved)); } catch { /* Keep the current session usable if storage is unavailable. */ } }, [saved]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => screens.current?.querySelector(scrollSelector)?.scrollTo({ top: scrollPositions.current.get(location.key) || 0, behavior: 'instant' }));
    return () => cancelAnimationFrame(frame);
  }, [location.key, scrollSelector]);
  useEffect(() => {
    // Reflect the current screen in a shareable/reloadable address.
    const hash = currentArticleId ? `post=${encodeURIComponent(currentArticleId)}` : currentChannelId ? `channel=${encodeURIComponent(currentChannelId)}` : '';
    window.history.replaceState(null, '', window.location.pathname + (hash ? '#' + hash : ''));
  }, [currentArticleId, currentChannelId]);
  const rememberScroll = () => scrollPositions.current.set(location.key, screens.current?.querySelector(scrollSelector)?.scrollTop || 0);
  const openPost = post => { rememberScroll(); setSheet(null); navigate(`/article/${encodeURIComponent(post.id)}`, { state: { from: location.pathname } }); };
  const openChannel = channel => { rememberScroll(); setSheet(null); navigate(`/channel/${encodeURIComponent(channel.id)}`); };
  const back = () => { rememberScroll(); if (location.key === 'default') navigate('/posts', { replace: true }); else navigate(-1); };
  const forPost = post => ({
    onLike: () => change('likes', post.id, !post.liked),
    onComments: () => setSheet({ type: 'comments', postId: post.id }),
    onShare: () => setSheet({ type: 'share', postId: post.id }),
    onStats: () => setSheet({ type: 'stats', postId: post.id }),
  });
  const card = post => <MobileCard key={post.id} post={post} onOpen={() => openPost(post)} onMenu={() => setSheet({ type: 'menu', postId: post.id })} onChannel={() => openChannel(channels.find(channel => channel.id === publicationChannelId(post, own)))} {...forPost(post)} />;
  const subscribe = channel => {
    if (channel.required) return;
    change('subscriptions', channel.id, !channel.subscribed);
    if (channel.subscribed) { change('notifications', channel.id, false); if (filter === channel.id) setFilter(null); }
  };
  const shareUrl = sheetPost ? `${window.location.origin}/handoff/publications-mobile#post=${encodeURIComponent(sheetPost.id)}` : '';
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl); notice('Ссылка скопирована'); setSheet(null); } catch { notice('Выделите и скопируйте ссылку ниже'); } };

  return <>
    <div ref={screens} className="pm-screen-stack" inert={!!sheet}>
      <div className="pm-feed-screen" inert={!isFeed} aria-hidden={!isFeed}>
        <TabLayout topbar={<TopBar title="Лента" actions={<><button className="topbar-btn" aria-label="Найти публикацию" onClick={() => setSearching(!searching)}>{searching ? <Dismiss20Regular /> : <Search24Regular />}</button><button className="topbar-btn" aria-label="Настройки ленты" onClick={() => setSheet({ type: 'settings' })}><MoreVertical20Filled /></button></>} />} onRefresh={() => notice('Лента обновлена')}>
          <div className="pm-feed-content">
            <div className="pm-feed-tabs"><FeedTabs tab={tab} onChange={setTab} withChannels /></div>
            {searching && <label className="pm-search"><Search24Regular /><input autoFocus aria-label="Поиск публикаций" placeholder="Поиск публикаций" value={query} onChange={event => setQuery(event.target.value)} /></label>}
            {tab === 'posts' && <><ChannelStrip channels={channels} selected={filter} onSelect={setFilter} onSettings={() => setSheet({ type: 'settings' })} />
              {selectedChannel && <button className="pm-channel-banner" onClick={() => openChannel(selectedChannel)}><img src={selectedChannel.avatar} alt="" /><strong>{selectedChannel.name}</strong><span>В канал<ChevronRight20Regular /></span></button>}
              <div className="pm-cards">{visiblePosts.map(card)}</div>{!visiblePosts.length && <div className="pm-empty"><h2>Публикаций пока нет</h2><p>{query ? 'Попробуйте другой запрос.' : 'Выберите другой канал или настройте подписки.'}</p></div>}
              {!!visiblePosts.length && <p className="pm-feed-end">Вы всё посмотрели</p>}
            </>}
            {tab === 'channels' && <div className="pm-channel-directory">{channels.map(channel => <button key={channel.id} onClick={() => openChannel(channel)}><img src={channel.avatar} alt="" /><span><strong>{channel.name}</strong><small>{channel.count} публикаций</small></span><ChevronRight20Regular /></button>)}</div>}
            {tab === 'events' && <div className="pm-events">{events.map(event => <EventCard key={event.id} e={event} onOpen={() => navigate('/event', { state: { id: event.id } })} />)}</div>}
          </div>
        </TabLayout>
        <div onClickCapture={event => { const link = event.target.closest('a'); if (link && link.getAttribute('href') !== '/posts') { event.preventDefault(); event.stopPropagation(); window.location.assign(link.getAttribute('href')); } }}><BottomNav /></div>
      </div>

      {activeChannel && <section className="pm-channel-screen pm-screen">
        <header className="pm-nav"><button aria-label="Назад к ленте" onClick={back}><ArrowLeft24Regular /></button><strong>Канал</strong><button aria-label="Настройки каналов" onClick={() => setSheet({ type: 'settings' })}><Settings20Filled /></button></header>
        <div className="pm-channel-scroll"><div className="pm-channel-cover"><img src={activeChannel.cover || activeChannel.avatar} alt="Обложка канала" /></div><div className="pm-channel-info"><img className="pm-channel-photo" src={activeChannel.avatar} alt="" /><h1>{activeChannel.name}</h1>{activeChannel.about && <p>{activeChannel.about}</p>}<span>{activeChannel.count} публикаций · Открытый канал</span>
          <div className="pm-subscribe-row"><button className={`pm-subscribe ${activeChannel.subscribed ? 'is-subscribed' : ''}`} disabled={activeChannel.required} onClick={() => subscribe(activeChannel)}>{activeChannel.subscribed ? <Checkmark20Regular /> : <Add20Regular />}{activeChannel.subscribed ? 'Вы подписаны' : 'Подписаться'}</button><button className={`pm-notifications ${saved.notifications?.[activeChannel.id] ? 'is-on' : ''}`} aria-label="Уведомления канала" onClick={() => setSheet({ type: 'notifications', channelId: activeChannel.id })}>{saved.notifications?.[activeChannel.id] ? <Alert20Filled /> : <AlertOff20Regular />}</button></div>
        </div><div className="pm-cards">{posts.filter(post => publicationChannelId(post, own) === activeChannel.id).sort((a, b) => Number(hasCoverMedia(b)) - Number(hasCoverMedia(a))).map(card)}</div></div>
      </section>}

      {article && <section className="pm-reader-screen pm-screen" aria-label="Статья">
        <header className="pm-nav"><button aria-label={location.state?.from?.startsWith('/channel') ? 'Назад в канал' : 'Назад к публикациям'} onClick={back}><ChevronLeft24Regular /></button><span>{article.channel}</span><button aria-label="Действия со статьёй" onClick={() => setSheet({ type: 'menu', postId: article.id })}><MoreVertical20Filled /></button></header>
        <div ref={reader} className="pm-reader-scroll"><article className="pm-reader" style={rubricStyle(article)}><PublicationIdentity post={article} onChannel={() => openChannel(channels.find(channel => channel.id === publicationChannelId(article, own)))} /><h1>{titleOf(article)}</h1><PublicationDetails post={article} />{article.lead && <p className="pm-reader-lead">{article.lead}</p>}<PublicationMedia post={article} /><PublicationBody post={article} id={`pm-reader-${article.id}`} /><FileList files={article.files} /><button className="pm-open-discussion" onClick={() => setSheet({ type: 'comments', postId: article.id })}><Comment24Regular /><span>{article.commentCount ? `Обсудить статью · ${article.commentCount}` : 'Начать обсуждение'}</span><ChevronRight20Regular /></button></article></div>
        <Actions post={article} {...forPost(article)} fixed />
      </section>}
      {postId && !article && <section className="pm-screen pm-empty"><h1>Статья не найдена</h1><button onClick={() => navigate('/posts')}>Вернуться в ленту</button></section>}
      {isEvent && <EventView />}
    </div>
    {sheet?.type === 'comments' && sheetPost && <MobileComments post={sheetPost} items={threads[sheetPost.id] || []} draft={saved.drafts?.[sheetPost.id] || ''} onDraft={value => change('drafts', sheetPost.id, value)} onChange={value => change('threads', sheetPost.id, value)} onClose={() => setSheet(null)} />}
    {sheet?.type === 'stats' && sheetPost && <MobileSheet title="Статистика публикации" onClose={() => setSheet(null)}><div className="pm-sheet-content"><p className="pm-stats-title">{titleOf(sheetPost)}</p><dl className="pm-stats"><div><dt>Показы в ленте</dt><dd>{sheetPost.views || '0'}</dd></div><div><dt>Открытия статьи</dt><dd>{sheetPost.views ? '215' : '0'}</dd></div><div><dt>Реакции</dt><dd>{(sheetPost.likes || 0) + Number(!!sheetPost.liked)}</dd></div><div><dt>Комментарии</dt><dd>{sheetPost.commentCount}</dd></div></dl><p className="pm-stats-caption">Показы — появления карточки в ленте. Открытия — переходы в статью.</p><span className="pm-stats-period">За всё время</span></div></MobileSheet>}
    {sheet?.type === 'menu' && sheetPost && <MobileSheet title="Публикация" onClose={() => setSheet(null)}><div className="pm-sheet-options"><button onClick={() => { change('bookmarks', sheetPost.id, !saved.bookmarks?.[sheetPost.id]); notice(saved.bookmarks?.[sheetPost.id] ? 'Удалено из сохранённого' : 'Публикация сохранена'); setSheet(null); }}>{saved.bookmarks?.[sheetPost.id] ? <Bookmark20Filled /> : <Bookmark20Regular />}{saved.bookmarks?.[sheetPost.id] ? 'Убрать из сохранённого' : 'Сохранить публикацию'}</button><button onClick={() => setSheet({ type: 'share', postId: sheetPost.id })}><Share24Regular />Поделиться</button><button onClick={() => openChannel(channels.find(channel => channel.id === publicationChannelId(sheetPost, own)))}><ChevronRight20Regular />Перейти в канал</button></div></MobileSheet>}
    {sheet?.type === 'share' && sheetPost && <MobileSheet title="Поделиться публикацией" onClose={() => setSheet(null)}><div className="pm-sheet-content"><p>{titleOf(sheetPost)}</p><input className="pm-share-url" aria-label="Ссылка на публикацию" value={shareUrl} readOnly onFocus={event => event.target.select()} /><button className="pm-primary" onClick={copyLink}><Link20Regular />Скопировать ссылку</button>{!!navigator.share && <button className="pm-native-share" onClick={async () => { try { await navigator.share({ title: titleOf(sheetPost), url: shareUrl }); setSheet(null); } catch { /* Cancellation leaves the share sheet available. */ } }}><Share24Regular />Другие приложения</button>}</div></MobileSheet>}
    {sheet?.type === 'settings' && <MobileSheet title="Каналы в ленте" onClose={() => setSheet(null)} tall><div className="pm-settings-list"><p>Выберите каналы, за которыми хотите следить.</p>{channels.map(channel => <label key={channel.id}><img src={channel.avatar} alt="" /><span><strong>{channel.name}</strong>{channel.required && <small>Обязательный канал</small>}</span><input type="checkbox" checked={channel.subscribed} disabled={channel.required} onChange={() => subscribe(channel)} aria-label={`Подписка: ${channel.name}`} /></label>)}</div><div className="pm-sheet-bottom"><button className="pm-primary" onClick={() => setSheet(null)}>Готово</button></div></MobileSheet>}
    {sheet?.type === 'notifications' && <MobileSheet title="Уведомления канала" onClose={() => setSheet(null)}><div className="pm-sheet-options">{[[true, 'Все новые публикации', Alert20Filled], [false, 'Без уведомлений', AlertOff20Regular]].map(([enabled, label, Icon]) => <button key={label} aria-pressed={!!saved.notifications?.[sheet.channelId] === enabled} onClick={() => { if (enabled) change('subscriptions', sheet.channelId, true); change('notifications', sheet.channelId, enabled); setSheet(null); notice(enabled ? 'Уведомления включены' : 'Уведомления выключены'); }}><Icon />{label}{!!saved.notifications?.[sheet.channelId] === enabled && <Checkmark20Regular />}</button>)}</div></MobileSheet>}
    {toast && <div className="pm-toast" role="status">{toast}</div>}
  </>;
}

export default function PublicationsMobile() {
  const [host, setHost] = useState(null);
  const [entry] = useState(() => { const hash = new URLSearchParams(window.location.hash.slice(1)); return hash.has('post') ? `/article/${encodeURIComponent(hash.get('post'))}` : hash.has('channel') ? `/channel/${encodeURIComponent(hash.get('channel'))}` : '/posts'; });
  useEffect(() => {
    document.documentElement.classList.add('publications-mobile-review');
    const title = document.title; document.title = 'Лента — Qollab';
    return () => { document.documentElement.classList.remove('publications-mobile-review'); document.title = title; };
  }, []);
  return <div className="device pm-device pw-app" ref={setHost}>{host && <DeviceHost.Provider value={host}><ConfigProvider prefixCls="qpub" getPopupContainer={() => host} theme={{ token: { colorPrimary: '#ef7f1a', fontFamily: 'Inter Variable, Inter, sans-serif', borderRadius: 16 } }}><PublicationSound><MemoryRouter initialEntries={[entry]}><MobileExperience /></MemoryRouter></PublicationSound></ConfigProvider></DeviceHost.Provider>}</div>;
}
