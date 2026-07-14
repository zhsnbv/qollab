import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import TopBar, { DotsIcon } from '../components/TopBar';
import { MagnifyingGlass, BookmarkSimple, CaretRight } from '@phosphor-icons/react';
import { useSkeleton, PostsSkeleton, FadeIn } from '../components/Skeleton';
import { FeedTabs, PostCard, EventCard } from '../components/Feed';
import { channels, basePosts, makePost, events } from '../data/feed';
import './Posts.css';

const BATCH = 8;
const EVENTS_BATCH = 3;

export default function Posts() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const [tab, setTab] = useState('posts'); // posts | events
  const [channel, setChannel] = useState('Все каналы');
  const [extraCount, setExtraCount] = useState(BATCH);
  const [eventsShown, setEventsShown] = useState(EVENTS_BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const pendingRef = useRef(false);
  const sentinelRef = useRef(null);

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

  const allPosts = [...basePosts, ...Array.from({ length: extraCount }, (_, i) => makePost(i))];
  const posts = channel === 'Все каналы' ? allPosts : allPosts.filter((p) => p.channel === channel);
  const selectedChannel = channels.find((c) => c.name === channel && !c.all);

  const actions = (
    <>
      <button className="topbar-btn" aria-label="Меню"><DotsIcon /></button>
      <button className="topbar-btn" aria-label="Закладки">
        <span className="posts-bookmark">
          <BookmarkSimple size={20} weight="fill" color="var(--color-weak)" />
          <span className="posts-bookmark-dot" />
        </span>
      </button>
    </>
  );

  if (loading) {
    return <TabLayout topbar={<TopBar title="Лента" actions={actions} />}><PostsSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={<TopBar title="Лента" actions={actions} />}>
      <FadeIn><div className="posts">
        <div className="posts-search-wrap">
          <div className="posts-search">
            <MagnifyingGlass size={20} color="var(--color-weak)" />
            <span>Поиск</span>
          </div>
        </div>

        <div className="posts-tabs-wrap">
          <FeedTabs tab={tab} onChange={setTab} />
        </div>

        {tab === 'posts' ? (
          <>
            {/* Лента каналов — выбор любого канала или «Все каналы» */}
            <div className="channel-row no-scrollbar">
              {channels.map((ch, i) => (
                <button className="channel-item" key={i} onClick={() => setChannel(ch.name)}>
                  <span className={`channel-ring ${channel === ch.name ? 'active' : ''} ${ch.all ? 'channel-ring--square' : ''}`}>
                    <span className={`channel-avatar ${ch.all ? 'channel-avatar--all' : ''} ${ch.cu ? 'channel-avatar--cu' : ''}`}>
                      <img src={ch.img} alt="" />
                    </span>
                  </span>
                  <span className="channel-name">{ch.name}</span>
                </button>
              ))}
            </div>

            {/* Шапка выбранного канала (Medium: имя + «Перейти в канал») */}
            {selectedChannel && (
              <div className="channel-header">
                <span className="channel-header-avatar"><img src={selectedChannel.img} alt="" /></span>
                <span className="channel-header-name">{selectedChannel.name}</span>
                <button className="channel-header-link">Перейти в канал<CaretRight size={14} weight="bold" /></button>
              </div>
            )}

            <div className="post-list">
              {posts.map((p, i) => <PostCard key={i} p={p} />)}
              <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
            </div>
            {loadingMore && <div className="spinner-row"><span className="spinner" /></div>}
          </>
        ) : (
          <>
            <div className="event-list">
              {events.slice(0, eventsShown).map((e, i) => <EventCard key={i} e={e} />)}
              <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
            </div>
            {loadingMore && <div className="spinner-row"><span className="spinner" /></div>}
          </>
        )}
      </div></FadeIn>
    </TabLayout>
  );
}
