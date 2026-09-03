import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import TopBar, { DotsIcon } from '../components/TopBar';
import { MagnifyingGlass, CaretRight, GearSix, Megaphone } from '@phosphor-icons/react';
import { useSkeleton, PostsSkeleton, FadeIn } from '../components/Skeleton';
import { FeedTabs, PostCard, EventCard } from '../components/Feed';
import { basePosts, makePost, events } from '../data/feed';
import { channelScopes } from '../data/channels';
import { useChannels } from '../context/ChannelsContext';
import ScreenMenu from '../components/ScreenMenu';
import './Posts.css';

const BATCH = 8;
const EVENTS_BATCH = 3;

export default function Posts() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const location = useLocation();
  // Подписки берём из контекста, а не из данных: их правит экран настройки,
  // и вкладка должна видеть изменения сразу.
  const { channels: channelList } = useChannels();
  const openEvent = (e) => navigate('/event', { state: { id: e.id, background: location } });
  const [tab, setTab] = useState('posts'); // posts | channels | events
  const [channel, setChannel] = useState('Все каналы');
  const [scope, setScope] = useState('available');
  const [chanQuery, setChanQuery] = useState('');
  const [extraCount, setExtraCount] = useState(BATCH);
  const [eventsShown, setEventsShown] = useState(EVENTS_BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const pendingRef = useRef(false);
  const sentinelRef = useRef(null);
  // «Три точки» открывают лист снизу — как контекстные меню на остальных
  // экранах, вместо выпадающего меню поверх контента.
  const [menuOpen, setMenuOpen] = useState(false);

  // Обновление ленты — и жестом сверху, и пунктом меню: возвращаем список к
  // первой странице, подгруженные партии сбрасываются.
  const refresh = () => {
    setExtraCount(BATCH);
    setEventsShown(EVENTS_BATCH);
  };

  // Публикации — бесконечно; мероприятия — лениво до полного списка (~9)
  const eventsDone = eventsShown >= events.length;
  useEffect(() => {
    if (loading) return;
    if (tab === 'events' && eventsDone) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || pendingRef.current) return;
      pendingRef.current = true;
      setLoadingMore(true);
      setTimeout(() => {
        if (tab === 'posts') setExtraCount((c) => c + BATCH);
        else setEventsShown((c) => Math.min(c + EVENTS_BATCH, events.length));
        setLoadingMore(false);
        pendingRef.current = false;
      }, 600);
    }, { rootMargin: '200px' });
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [loading, tab, eventsDone]);

  // Лента каналов — это подписки, а не отдельный список: раньше их было два,
  // и настройка правила один, а полоса показывала другой.
  const subscribed = channelList.filter((c) => c.subscribed);
  const strip = [
    { name: 'Все каналы', img: '/img/posts/ch-all.png', all: true },
    ...subscribed.map((c) => ({ name: c.name, img: c.avatar, initials: c.initials, tint: c.tint, fit: c.fit })),
  ];

  const allPosts = [...basePosts, ...Array.from({ length: extraCount }, (_, i) => makePost(i))];
  // «Все каналы» — это все мои каналы: публикации от того, на что не подписан,
  // в ленте появляться не должны.
  const myPosts = allPosts.filter((p) => subscribed.some((c) => c.name === p.channel));
  const posts = channel === 'Все каналы' ? myPosts : myPosts.filter((p) => p.channel === channel);
  const selectedChannel = strip.find((c) => c.name === channel && !c.all);

  // «Мои каналы» — те, что веду сам; в прототипе это подмножество подписок.
  const scoped = scope === 'subscribed'
    ? channelList.filter((c) => c.subscribed)
    : scope === 'mine'
      ? channelList.filter((c) => c.id === 'bts-news')
      : channelList;
  const shownChannels = scoped.filter((c) => c.name.toLowerCase().includes(chanQuery.trim().toLowerCase()));

  // «Три точки» — всегда крайние справа, как на остальных экранах
  const actions = (
    <>
      {/* Закладки временно скрыты по просьбе заказчика (вернуть — убрать false) */}
      <button className="topbar-btn" aria-label="Меню" onClick={() => setMenuOpen(true)}><DotsIcon /></button>
    </>
  );

  if (loading) {
    return <TabLayout topbar={<TopBar title="Лента" actions={actions} />}><PostsSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={<TopBar title="Лента" actions={actions} />} onRefresh={refresh}>
      <FadeIn><div className="posts">
        <div className="posts-tabs-wrap">
          <FeedTabs tab={tab} onChange={setTab} withChannels />
        </div>

        {tab === 'channels' && (
          <>
            {/* Подтабы области видимости — текстовые, с подчёркиванием активного */}
            <div className="chan-scopes no-scrollbar">
              {channelScopes.map((s) => (
                <button
                  key={s.id}
                  className={`chan-scope ${scope === s.id ? 'active' : ''}`}
                  onClick={() => setScope(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="chan-search-wrap">
              <div className="chan-search">
                <MagnifyingGlass size={20} color="var(--color-weak)" />
                <input
                  value={chanQuery}
                  onChange={(e) => setChanQuery(e.target.value)}
                  placeholder="Поиск канала"
                />
              </div>
            </div>

            <div className="chan-list">
              {shownChannels.map((c) => (
                <button
                  className="chan-card"
                  key={c.id}
                  onClick={() => navigate(`/channel/${c.id}`, { state: { background: location } })}
                >
                  <span className="chan-cover"><img src={c.cover} alt="" loading="lazy" /></span>
                  <span className="chan-row">
                    <span className="chan-avatar"><img src={c.avatar} alt="" /></span>
                    <span className="chan-texts">
                      <span className="chan-name">{c.name}</span>
                      <span className="chan-posts">{c.posts}</span>
                    </span>
                  </span>
                </button>
              ))}
              {shownChannels.length === 0 && <p className="chan-empty">Каналы не найдены</p>}
            </div>
          </>
        )}

        {tab === 'posts' && (
          <>
            {/* Лента каналов — выбор любого канала или «Все каналы».
                «Настройка» стоит в конце: начало ленты занято фильтрами, и
                действие среди них читалось бы как ещё один канал. */}
            <div className="channel-row no-scrollbar">
              {strip.map((ch, i) => (
                <button className="channel-item" key={i} onClick={() => setChannel(ch.name)}>
                  <span className={`channel-ring ${channel === ch.name ? 'active' : ''} ${ch.all ? 'channel-ring--square' : ''}`}>
                    <span className={`channel-avatar ${ch.all ? 'channel-avatar--all' : ''} ${ch.fit === 'contain' ? 'channel-avatar--cu' : ''}`}>
                      {ch.img
                        ? <img src={ch.img} alt="" />
                        : <span className={`channel-initials tint-${ch.tint || 'orange'}`}>{ch.initials}</span>}
                    </span>
                  </span>
                  <span className="channel-name">{ch.name}</span>
                </button>
              ))}
              <button
                className="channel-item"
                onClick={() => navigate('/channels/settings', { state: { background: location } })}
              >
                <span className="channel-ring channel-ring--square">
                  <span className="channel-avatar channel-avatar--set"><GearSix size={26} weight="fill" /></span>
                </span>
                <span className="channel-name">Настройка</span>
              </button>
            </div>

            {/* Шапка выбранного канала (Medium: имя + «Перейти в канал») */}
            {selectedChannel && (
              <div className="channel-header">
                <span className="channel-header-avatar"><img src={selectedChannel.img} alt="" /></span>
                <span className="channel-header-name">{selectedChannel.name}</span>
                <button className="channel-header-link">Перейти в канал<CaretRight size={14} weight="bold" /></button>
              </div>
            )}

            {/* Без подписок лента пуста по делу, а не по ошибке — говорим,
                что делать, и ведём туда же, куда ведёт «Настройка». */}
            {!subscribed.length ? (
              <div className="post-empty">
                <Megaphone size={40} weight="fill" />
                <b>Вы ни на что не подписаны</b>
                <p>Выберите каналы — их публикации появятся в ленте</p>
                <button onClick={() => navigate('/channels/settings', { state: { background: location } })}>
                  Выбрать каналы
                </button>
              </div>
            ) : (
              <div className="post-list">
                {posts.map((p, i) => <PostCard key={i} p={p} />)}
                <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
              </div>
            )}
            {loadingMore && <div className="spinner-row"><span className="spinner" /></div>}
          </>
        )}

        {tab === 'events' && (
          <>
            <div className="event-list">
              {events.slice(0, eventsShown).map((e) => (
                <EventCard key={e.id} e={e} onOpen={openEvent} />
              ))}
              <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
            </div>
            {loadingMore && <div className="spinner-row"><span className="spinner" /></div>}
          </>
        )}
      </div></FadeIn>

      <ScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} onRefresh={refresh} />
    </TabLayout>
  );
}
