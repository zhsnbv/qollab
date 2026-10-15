import { refreshPublicationMedia } from './publicationMediaRefresh';
import { addEditorialSamples, EDITORIAL_POSTS, EDITORIAL_SAMPLE_BATCH, PUBLICATION_FEED_ORDER } from './editorialSamples';
import { usePublicationScenario } from '../publication-screens/ScenarioContext';
import '@ant-design/v5-patch-for-react-19';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { App as AntApp, Button, ConfigProvider, Dropdown, Empty, Input, Modal, message } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { Add20Regular, ChevronDown20Regular, TextBulletList20Regular, Grid20Regular, News20Regular, ClipboardTask20Regular, Lightbulb20Regular, Home20Regular, Apps20Regular, Chat20Regular, Calendar20Regular, People20Regular, Organization20Regular, Megaphone20Regular, Settings20Regular, Search20Regular, PanelLeftContract20Regular, WeatherSunny20Regular, Globe20Regular, ArrowLeft20Regular, ChevronRight20Regular, Alert20Regular } from '@fluentui/react-icons';
import PortalShell from './PortalShell';
import ScrollToTop from '../../components/ScrollToTop';
import PublicationEditor from './PublicationEditor';
import PublicationSound from './PublicationSound';
import ChannelHeader from './ChannelHeader';
import FeedChannels from './FeedChannels.jsx';
import { OWN_CHANNEL_ID, publicationChannelId, publicationChannels } from './publicationChannelsData';
import { INITIAL_CHANNEL } from './channelData';
import { ChannelAvatar, PublicationCard, PublicationReader } from './PostViews';
import { INITIAL_POSTS, TYPES, emptyPost, titleOf } from './data';
import { upgradePublicationExamples } from './productionExamples';
import { addFeedSamples, FEED_SAMPLE_BATCH, MORE_FEED_POSTS } from './feedSamples';
import { addProductionImprovement, IMPROVEMENT_SAMPLE_BATCH, PRODUCTION_IMPROVEMENT } from './productionImprovement';
import { loadReview, saveReview } from './storage';
import { documentText } from './blockDocument';
import { hasCoverMedia, isFeedPublication } from './cardAppearance';
import './PublicationsWeb.css';
import './PublicationDocument.css';
import './PublicationPolish.css';
import './PublicationProperties.css';
import './PublicationComments.css';
import './PublicationAppearance.css';

const productionNav = [['Публикации', News20Regular, 'feed'], ['Руководство', People20Regular], ['Чаты', Chat20Regular], ['Орг. структура', Organization20Regular], ['Мероприятия', Calendar20Regular], ['Электронный вестник', News20Regular], ['Каналы', Megaphone20Regular, 'channel'], ['Подписки', TextBulletList20Regular]];
const services = ['Мой календарь обучения', 'ОТиПБ', 'Dispatch', 'ERG Access', 'Sales Market', 'Эл.очередь', 'ERG Partners', 'qData', 'qDocs'];
const feedExampleOrder = PUBLICATION_FEED_ORDER;
function Shell({ admin, onNavigate, onInfo, children, query, onQuery, locked }) {
  const navigate = page => locked ? onInfo('Сначала сохраните изменения или нажмите «Отмена» в форме') : onNavigate(page);
  return <div className={`pw-app ${admin ? 'pw-admin-shell' : 'pw-feed-shell'}`}>
    <header className="pw-shell-header"><button className="pw-logo" onClick={() => navigate('feed')} aria-label="На главную"><img src="/img/common/qollab-logo.svg" alt="qollab" /></button>{admin && <Button className="pw-menu-collapse" icon={<PanelLeftContract20Regular />} aria-label="Свернуть меню" onClick={() => onInfo('Сворачивание меню сейчас недоступно')} />}<Input className="pw-global-search" placeholder={admin ? 'Найти: сотрудника, канал, пост, мероприятие' : 'Поиск публикаций'} prefix={!admin && <Search20Regular />} suffix={admin && <Search20Regular />} value={query} onChange={e => onQuery(e.target.value)} disabled={admin} allowClear={!admin} /><div className="pw-header-right"><Button className="pw-chat-button" icon={<Chat20Regular />} aria-label="Чаты" onClick={() => onInfo('Не удалось открыть чаты. Попробуйте позже.')}>{admin ? 'Чаты' : null}</Button>{admin ? <><Button icon={<WeatherSunny20Regular />} aria-label="Тема" onClick={() => onInfo('Выбрана светлая тема')} /><Button icon={<Globe20Regular />} aria-label="Язык" onClick={() => onInfo('Язык: русский')} /></> : <Button shape="circle" icon={<Alert20Regular />} aria-label="Уведомления" onClick={() => onInfo('Не удалось загрузить уведомления. Попробуйте позже.')} />}<button className="pw-user" onClick={() => onInfo('Не удалось открыть профиль. Попробуйте позже.')}><img src="/img/profile/avatar-photo.png" alt="" />{admin && <span>Автор публикации<small>Сотрудник</small></span>}</button></div></header>
    {admin ? <aside className="pw-prod-sidebar"><p>Главная</p><nav>{productionNav.map(([label, Icon, page]) => <button key={label} onClick={() => page ? navigate(page) : onInfo('Раздел сейчас недоступен')}><Icon /><span>{label}</span>{label === 'Подписки' && <ChevronDown20Regular />}</button>)}</nav><p>Сервисы</p><nav>{services.map((label, i) => <button key={label} onClick={() => onInfo('Сервис сейчас недоступен')}><span className={`pw-service-dot dot-${i % 4}`}>{label[0]}</span><span>{label}</span></button>)}</nav></aside> : <aside className="pw-feed-sidebar">{[['Главная', Home20Regular, 'feed'], ['Сервисы', Apps20Regular], ['Виджеты', Grid20Regular], ['Рук-во', People20Regular], ['Структура', Organization20Regular], ['Чаты', Chat20Regular]].map(([label, Icon, page]) => <button key={label} className={page === 'feed' ? 'is-active' : ''} onClick={() => page ? navigate(page) : onInfo('Раздел сейчас недоступен')}><span><Icon /></span>{label}</button>)}<div className="pw-rail-divider" /><button onClick={() => navigate('channel')}><ChannelAvatar size={40} />Мой канал</button><button className="pw-rail-settings" onClick={() => onInfo('Настройки сейчас недоступны')}><span><Settings20Regular /></span>Настройка</button></aside>}
    <main className="pw-main">{children}</main>
  </div>;
}
function CreateButton({ onCreate, channel }) { return <Dropdown trigger={['click']} placement="bottomRight" menu={{ items: Object.entries(TYPES).filter(([key]) => key === 'news' || channel?.[key] !== false).map(([key, label]) => ({ key, label, icon: key === 'news' ? <News20Regular /> : key === 'audit' ? <ClipboardTask20Regular /> : <Lightbulb20Regular /> })), onClick: ({ key }) => onCreate(key) }}><Button type="primary" shape="round" icon={<Add20Regular />}>Создать публикацию<ChevronDown20Regular /></Button></Dropdown>; }
function WebReview() {
  const scenario = usePublicationScenario();
  const [posts, setPosts] = useState(() => scenario?.posts || INITIAL_POSTS);
  const [channel, setChannel] = useState(INITIAL_CHANNEL);
  const readerOrigin = useRef({ page: 'feed', query: '', scroll: 0, filter: null, channelId: OWN_CHANNEL_ID }), restoreScroll = useRef(null);
  const initialId = new URLSearchParams(window.location.hash.slice(1)).get('post');
  const initialChannelId = new URLSearchParams(window.location.hash.slice(1)).get('channel');
  const initialSection = new URLSearchParams(window.location.search).get('section');
  const [page, setPage] = useState(scenario?.page || (initialId ? 'reader' : initialChannelId ? 'channel' : initialSection === 'chats' ? 'portal' : 'feed'));
  const [feedChannelId, setFeedChannelId] = useState(scenario?.filter || null), [activeChannelId, setActiveChannelId] = useState(scenario?.channel || initialChannelId || OWN_CHANNEL_ID);
  const [feedSubscriptions, setFeedSubscriptions] = useState(scenario?.unsubscribed ? { [scenario.channel]: false } : {});
  const [channelNotifications, setChannelNotifications] = useState({});
  const [selectedId, setSelectedId] = useState(scenario?.post || initialId || 'news');
  const [editor, setEditor] = useState(scenario?.editor || null), [preview, setPreview] = useState(scenario?.preview ? scenario.editor : null);
  const [query, setQuery] = useState(scenario?.query || '');
  const [deleting, setDeleting] = useState(null), [discussions, setDiscussions] = useState(() => scenario?.discussions || Object.fromEntries([PRODUCTION_IMPROVEMENT, ...MORE_FEED_POSTS, ...EDITORIAL_POSTS].map(post => [post.id, []])));
  const [sampleBatches, setSampleBatches] = useState([FEED_SAMPLE_BATCH, IMPROVEMENT_SAMPLE_BATCH, EDITORIAL_SAMPLE_BATCH]);
  const [messageApi, contextHolder] = message.useMessage();
  const [loaded, setLoaded] = useState(!!scenario);
  useEffect(() => {
    if (scenario) return;
    let active = true;
    loadReview().then(saved => { if (active && saved?.posts) { const expanded = addEditorialSamples(addProductionImprovement(addFeedSamples(saved))); setPosts(upgradePublicationExamples(expanded.posts).map(refreshPublicationMedia).map(post => INITIAL_POSTS.some(sample => sample.id === post.id) ? { ...post, mediaBackdrop: 'solid' } : post)); setDiscussions(expanded.discussions || {}); setSampleBatches(expanded.sampleBatches); setChannel({ ...INITIAL_CHANNEL, ...saved.channel }); setFeedSubscriptions(saved.feedSubscriptions || {}); setChannelNotifications(saved.channelNotifications || {}); } }).catch(() => {}).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [scenario]);
  useEffect(() => { if (!loaded || scenario) return; saveReview({ posts, discussions, channel, feedSubscriptions, channelNotifications, sampleBatches }).catch(() => messageApi.warning('Не удалось сохранить изменения. Не закрывайте вкладку, чтобы не потерять данные.')); }, [posts, discussions, channel, feedSubscriptions, channelNotifications, sampleBatches, loaded, messageApi, scenario]);
  const info = text => messageApi.info(text);
  useEffect(() => { document.documentElement.classList.add('publications-web-review'); const title = document.title; document.title = 'Публикации — Qollab'; return () => { document.documentElement.classList.remove('publications-web-review'); document.title = title; }; }, []);
  const navigate = next => { setPage(next); setQuery(''); window.scrollTo(0, 0); window.history.replaceState(null, '', window.location.pathname + (scenario ? window.location.search : '')); };
  const openChannel = id => { setActiveChannelId(id || OWN_CHANNEL_ID); navigate('channel'); window.history.replaceState(null, '', `#channel=${encodeURIComponent(id || OWN_CHANNEL_ID)}`); };
  const create = type => { setEditor({ ...emptyPost(type), assistantId: crypto.randomUUID(), channel: channel.name, channelId: OWN_CHANNEL_ID, channelAvatar: channel.avatar }); setPreview(null); navigate('editor'); };
  const edit = post => { setEditor(structuredClone(post)); setPreview(null); navigate('editor'); };
  const open = post => { readerOrigin.current = { page, query, scroll: window.scrollY, filter: feedChannelId, channelId: activeChannelId }; setSelectedId(post.id); setPage('reader'); window.scrollTo(0, 0); window.history.pushState({ pwReader: true }, '', `#post=${encodeURIComponent(post.id)}`); };
  const restoreFeed = () => { const origin = readerOrigin.current; restoreScroll.current = origin.scroll; setQuery(origin.query); setFeedChannelId(origin.filter); setActiveChannelId(origin.channelId); setPage(origin.page); };
  const backToFeed = () => { if (window.history.state?.pwReader) window.history.back(); else { window.history.replaceState(null, '', window.location.pathname + (scenario ? window.location.search : '')); restoreFeed(); } };
  useLayoutEffect(() => {
    if (page === 'reader' || restoreScroll.current === null) return;
    const top = restoreScroll.current;
    restoreScroll.current = null;
    const frame = requestAnimationFrame(() => window.scrollTo({ top, behavior: 'instant' }));
    return () => cancelAnimationFrame(frame);
  }, [page]);
  useEffect(() => {
    const restoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onPop = () => { const id = new URLSearchParams(window.location.hash.slice(1)).get('post'); if (id) { setSelectedId(id); setPage('reader'); window.scrollTo(0, 0); } else restoreFeed(); };
    window.addEventListener('popstate', onPop); return () => { window.removeEventListener('popstate', onPop); window.history.scrollRestoration = restoration; };
  }, []);
  const changeChannel = changes => { setChannel(v => ({ ...v, ...changes })); if (changes.name || changes.avatar) setPosts(v => v.map(p => publicationChannelId(p, channel) === OWN_CHANNEL_ID ? ({ ...p, channelId: OWN_CHANNEL_ID, ...(changes.name ? { channel: changes.name } : {}), ...(changes.avatar ? { channelAvatar: changes.avatar } : {}) }) : p));  };
  const update = (id, changes) => setPosts(list => list.map(p => p.id === id ? { ...p, ...changes } : p));
  const like = post => update(post.id, { liked: !post.liked });
  const share = async post => { const url = new URL(window.location.pathname, window.location.origin); url.hash = `post=${post.id}`; if (scenario) { Modal.info({ title: 'Ссылка на публикацию', content: <Input readOnly value={url.href} /> }); return; } try { await navigator.clipboard.writeText(url.href); messageApi.success('Ссылка на публикацию скопирована'); } catch { Modal.info({ title: 'Ссылка на публикацию', content: <Input readOnly value={url.href} onFocus={e => e.target.select()} /> }); } };
  const save = draft => { const post = { ...draft, id: draft.id || crypto.randomUUID(), channel: draft.channel || channel.name, channelId: draft.channelId || (draft.id ? publicationChannelId(draft, channel) : OWN_CHANNEL_ID), channelAvatar: draft.channelAvatar || channel.avatar, date: draft.date || 'Только что', likes: draft.likes || 0, commentCount: draft.commentCount || 0, views: draft.views || '0', lead: draft.lead || (draft.type === 'audit' ? documentText(draft.description).trim().slice(0, 220) : '') }; setPosts(list => draft.id ? list.map(p => p.id === draft.id ? post : p) : [post, ...list]); if (!draft.id) setDiscussions(v => ({ ...v, [post.id]: [] })); setEditor(null); setPreview(null); openChannel(publicationChannelId(post, channel)); messageApi.success(draft.id ? 'Изменения сохранены' : 'Публикация создана'); };
  const selected = posts.find(p => p.id === selectedId);
  const channels = publicationChannels(posts, channel, feedSubscriptions);
  const selectedFeedChannel = channels.find(item => item.id === feedChannelId);
  const activeChannel = channels.find(item => item.id === activeChannelId) || channels[0];
  const canManageChannel = activeChannel.id === OWN_CHANNEL_ID;
  const channelHeader = canManageChannel ? { ...channel, id: OWN_CHANNEL_ID } : { ...INITIAL_CHANNEL, ...activeChannel, description: activeChannel.about || '', members: [], archived: false };
  const followedIds = new Set(channels.filter(item => item.subscribed).map(item => item.id));
  const filtered = posts.filter(post => {
    // Temporarily show only regular media articles in the feed; keep all types in channels.
    if (page === 'feed' && !isFeedPublication(post)) return false;
    const id = publicationChannelId(post, channel);
    const inChannel = page === 'channel' ? id === activeChannel.id : followedIds.has(id) && (!feedChannelId || id === feedChannelId);
    return inChannel && `${titleOf(post)} ${post.lead || ''}`.toLowerCase().includes(query.toLowerCase());
  });
  const ordered = [...filtered].sort((a, b) => Number(hasCoverMedia(b)) - Number(hasCoverMedia(a))
    || Number(!!b.pinned) - Number(!!a.pinned)
    || (page === 'feed' ? (feedExampleOrder[a.id] ?? 6) - (feedExampleOrder[b.id] ?? 6) : 0));
  const selectFeedChannel = id => { setFeedChannelId(id); setQuery(''); if (page !== 'feed') navigate('feed'); };
  const toggleSubscription = item => {
    if (item.required) return;
    if (item.id === OWN_CHANNEL_ID) changeChannel({ subscribed: !item.subscribed });
    else setFeedSubscriptions(values => ({ ...values, [item.id]: !item.subscribed }));
    if (item.subscribed) setChannelNotifications(values => ({ ...values, [item.id]: 'none' }));
    if (item.subscribed && feedChannelId === item.id) setFeedChannelId(null);
  };
  const changeNotifications = (item, mode) => {
    if (mode === 'all' && !item.subscribed) toggleSubscription(item);
    setChannelNotifications(values => ({ ...values, [item.id]: mode }));
    messageApi.success(mode === 'all' ? 'Уведомления о новых статьях включены' : 'Уведомления канала выключены');
  };
  const shellNavigate = next => { if (next === 'portal') { setPage(next); window.history.replaceState(null, '', window.location.pathname + (scenario ? window.location.search : '')); } else if (next === 'channel') openChannel(OWN_CHANNEL_ID); else { if (next === 'feed') setFeedChannelId(null); navigate(next); } };
  return <>{contextHolder}<PortalShell page={page} query={query} onSearch={value => { if (page === 'reader' || page === 'portal') navigate('feed'); setQuery(value); }} onNavigate={shellNavigate} channelsContent={<FeedChannels channels={channels} selectedId={feedChannelId} onSelect={selectFeedChannel} onToggle={toggleSubscription} />}>
    {page === 'reader' && loaded && !selected && <div className="pw-empty"><Empty description="Публикация недоступна" /><Button onClick={() => navigate('channel')}>Вернуться в канал</Button></div>}
    {page === 'reader' && selected && <div className="pw-reader-layout"><div className="pw-feed-column"><div className="pw-reader-nav"><Button type="text" shape="round" icon={<ArrowLeft20Regular />} onClick={backToFeed}>{readerOrigin.current.page === 'feed' ? 'К публикациям' : 'В канал'}</Button><Button shape="round" onClick={() => edit(selected)}>Редактировать</Button></div><PublicationReader key={selected.id} post={selected} onLike={() => like(selected)} onShare={() => share(selected)} comments={discussions[selected.id]} onComments={items => { setDiscussions(v => ({ ...v, [selected.id]: items })); const count = nodes => nodes.reduce((n, c) => n + 1 + count(c.replies), 0); update(selected.id, { commentCount: count(items) }); }} /></div></div>}
    {['feed', 'channel'].includes(page) && <div className="pw-feed-layout"><div className="pw-feed-column">
      {page === 'channel' && <><Button className="pw-to-feed" type="text" icon={<ArrowLeft20Regular />} onClick={() => { setFeedChannelId(null); navigate('feed'); }}>Все публикации</Button><ChannelHeader channel={channelHeader} count={activeChannel.count} canManage={canManageChannel} onChange={changeChannel} onSubscribe={() => toggleSubscription(activeChannel)} notificationMode={channelNotifications[activeChannel.id] || 'none'} onNotifications={mode => changeNotifications(activeChannel, mode)} /></>}
      {!(page === 'channel' && channelHeader.archived) && <>
      {page === 'feed' && selectedFeedChannel && <div className="pw-selected-feed-channel"><img src={selectedFeedChannel.avatar} alt="" /><strong>{selectedFeedChannel.name}</strong><Button type="text" shape="round" onClick={() => openChannel(selectedFeedChannel.id)}>Перейти в канал<ChevronRight20Regular /></Button></div>}
      {page === 'channel' && canManageChannel && <div className="pw-feed-heading"><CreateButton onCreate={create} channel={channel} /></div>}
      <div className="pw-posts">{ordered.map(post => <PublicationCard key={post.id} post={post} onOpen={() => open(post)} onLike={() => like(post)} onShare={() => share(post)} onEdit={() => edit(post)} onPin={() => update(post.id, { pinned: !post.pinned })} onDelete={() => setDeleting(post)} onChannel={() => openChannel(publicationChannelId(post, channel))} />)}{!ordered.length && <div className="pw-empty"><Empty description={query ? 'Публикации не найдены' : selectedFeedChannel || page === 'channel' ? 'В этом канале пока нет публикаций' : 'В ленте пока нет публикаций'} />{query ? <Button onClick={() => setQuery('')}>Сбросить поиск</Button> : page === 'channel' && canManageChannel && <CreateButton onCreate={create} channel={channel} />}</div>}</div>
      <p className="pw-feed-end">Все публикации загружены</p></>}
    </div></div>}
    {['feed', 'channel', 'reader'].includes(page) && <ScrollToTop key={`${page}-${selectedId}-${activeChannelId}`} documentScroll />}
  </PortalShell>{page === 'editor' && <Shell admin locked={!!editor} onNavigate={navigate} onInfo={info} query={query} onQuery={setQuery}>    {page === 'editor' && editor && <><div hidden={!!preview}><PublicationEditor key={editor.id || editor.type} initial={editor} onCancel={() => { setEditor(null); navigate('channel'); }} onPreview={post => { setPreview(post); window.scrollTo(0, 0); }} onSave={save} /></div>{preview && <><header className="pw-prod-page-header pw-preview-bar"><Button icon={<ArrowLeft20Regular />} onClick={() => setPreview(null)}>Вернуться к редактированию</Button><h1>Предпросмотр публикации</h1><Button type="primary" onClick={() => save(preview)}>{preview.id ? 'Сохранить изменения' : 'Создать пост'}</Button></header><div className="pw-preview-content"><PublicationReader post={preview} preview onLike={() => info('Реакции доступны после создания публикации')} onShare={() => info('Ссылка появится после создания публикации')} /></div></>}</>}
</Shell>}<Modal title="Удалить публикацию?" open={!!deleting} onCancel={() => setDeleting(null)} okText="Удалить" cancelText="Отмена" okButtonProps={{ danger: true }} onOk={() => { const deleted = deleting; setPosts(list => list.filter(p => p.id !== deleted.id)); setDeleting(null); messageApi.open({ type: 'success', duration: 10, content: <span>Публикация удалена. <button className="pw-undo" onClick={() => { setPosts(list => list.some(p => p.id === deleted.id) ? list : [deleted, ...list]); messageApi.destroy(); }}>Восстановить</button></span> }); }}><p>«{deleting && titleOf(deleting)}» будет удалена.</p></Modal></>;
}
export default function PublicationsWeb() {
  return <ConfigProvider prefixCls="qpub" locale={ruRU} theme={{ token: { colorPrimary: '#ef7f1a', colorText: '#333333', colorTextSecondary: '#999999', colorBorder: '#cfcfcf', colorBgLayout: '#f7f7f7', borderRadius: 6, controlHeight: 32, fontSize: 14, fontFamily: 'Inter, sans-serif' }, components: { Form: { itemMarginBottom: 24 }, Button: { primaryShadow: 'none' } } }}><AntApp><PublicationSound><WebReview /></PublicationSound></AntApp></ConfigProvider>;
}
