import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import TopBar, { DotsIcon } from '../components/TopBar';
import ScreenMenu from '../components/ScreenMenu';
import Widgets from '../components/Widgets';
import { useSkeleton, HomeSkeleton, FadeIn } from '../components/Skeleton';
import { toggleTheme } from '../utils/theme';
import { FeedTabs, PostCard, EventCard } from '../components/Feed';
import { basePosts, events } from '../data/feed';
import { allServicesTile } from '../data/services';
import { usefulLinks } from '../data/widgets';
import { LINK_ICONS } from '../components/Widgets';
import { banners } from '../data/banners';
import { useFavorites } from '../context/FavoritesContext';
import { unreadTotal } from '../data/notifications';
import { MagnifyingGlass, BellSimple, CaretRight } from '@phosphor-icons/react';
import './Home.css';

// Ассеты экспортированы из Figma в public/img/home (см. README).
const stories = [
  { img: '/img/home/story-1.png', name: 'ERG News', seen: false },
  { img: '/img/home/story-2.png', name: 'BTS News', seen: false },
  { img: '/img/home/story-3.png', name: 'Безопасность', seen: false },
  { img: '/img/home/story-4.png', name: 'Вакансии', seen: true },
  { img: '/img/home/story-5.png', name: 'Eco Life ERG', seen: true },
];

export default function Home() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const [feedTab, setFeedTab] = useState('posts');
  const [menuOpen, setMenuOpen] = useState(false);
  // Уведомления переехали с отдельной вкладки в иконку шапки Главной
  const actions = (
    <>
      <button
        className="topbar-btn topbar-btn--badged"
        aria-label={`Уведомления${unreadTotal ? `, непрочитанных: ${unreadTotal}` : ''}`}
        onClick={() => navigate('/notifications', { state: { background: location } })}
      >
        <BellSimple size={20} weight="fill" />
        {unreadTotal > 0 && <span className="topbar-badge">{unreadTotal}</span>}
      </button>
      <button className="topbar-btn" aria-label="Меню" onClick={() => setMenuOpen(true)}><DotsIcon /></button>
    </>
  );

  // Оверлеи (шит сервисов/поиск/баннер/избранное) открываются поверх Главной
  // через background-трюк — она остаётся смонтированной под ними.
  // Боттом-шит каталога пока не используем: «Все сервисы» ведёт во вкладку
  // (вернуть шит — navigate('/services/sheet', { state: { background: location } })).
  const openServices = () => navigate('/services');
  const openSearch = () => navigate('/search', { state: { background: location } });
  const openFavorites = () => navigate('/favorites', { state: { background: location } });
  const openBanner = (id) => navigate('/banner', { state: { id, background: location } });
  const openApp = (app) => navigate(`/app/${app}`, { state: { background: location } });
  const openEvent = (e) => navigate('/event', { state: { id: e.id, background: location } });

  if (loading) {
    return <TabLayout topbar={<TopBar logo actions={actions} onLogoClick={toggleTheme} />}><HomeSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={<TopBar logo actions={actions} onLogoClick={toggleTheme} />}>
      <FadeIn><div className="home">
        {/* Поиск + баннеры в одной карточке — сторис пока скрыты по просьбе заказчика (вернуть: убрать false &&) */}
        <section className="card card--first">
          <button className="search-pill" onClick={openSearch}>
            <MagnifyingGlass size={20} color="var(--color-weak)" />
            <span>Поиск</span>
          </button>
          {false && (
            <div className="story-row no-scrollbar edge-scroll">
              {stories.map((s, i) => (
                <div className="story-item" key={i}>
                  <span className={`story-ring ${s.seen ? 'seen' : 'unseen'}`}>
                    <span className="story-inner">
                      <span className="story-avatar"><img src={s.img} alt="" /></span>
                    </span>
                  </span>
                  <span className="story-name">{s.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="promo-row no-scrollbar edge-scroll">
            {banners.map((b) => (
              <button
                className={`promo-card ${b.textOnDark ? 'on-dark' : ''}`}
                style={{ background: b.bg }}
                key={b.id}
                onClick={() => openBanner(b.id)}
              >
                {b.badgePos === 'top' && <span className={`promo-badge promo-badge--${b.badgeVariant}`}>{b.badge}</span>}
                <div className="promo-title">{b.title}</div>
                {b.badgePos === 'bottom' && <span className={`promo-badge promo-badge--${b.badgeVariant}`}>{b.badge}</span>}
                <img className="promo-img" src={b.img} alt="" />
              </button>
            ))}
          </div>
        </section>

        {/* Мои сервисы: сетка из избранного пользователя + плитка «Все сервисы».
            Раньше здесь было два блока — общий каталог и отдельное «Избранное»;
            они занимали пол-экрана и дублировали друг друга, а «Все» вело туда
            же, куда и вкладка. Теперь сетку набирает сам пользователь. */}
        <section className="card">
          <div className="block">
            <div className="row-between">
              <h3 className="section-title" style={{ margin: 0 }}>Мои сервисы</h3>
              <button className="section-link" onClick={openFavorites}>Настроить</button>
            </div>
            <div className="services-grid">
              {favorites.map((s) => (
                <button className="service-item" key={s.id} onClick={() => openApp(s.app || s.id)}>
                  <img className="service-icon" src={s.img} alt="" />
                  <span className={s.wrap ? 'service-name service-name--wrap' : 'service-name'}>{s.name}</span>
                </button>
              ))}
              <button className="service-item" onClick={openServices}>
                <img className="service-icon" src={allServicesTile} alt="" />
                <span className="service-name">Все сервисы</span>
              </button>
            </div>
          </div>
        </section>

        {/* Виджеты — сразу после сервисов. На вебе они стоят колонкой справа,
            на телефоне такой колонки нет, поэтому лента с прокруткой вбок. */}
        <Widgets />

        {/* Миссия и ценности — пока скрыт по просьбе заказчика (вернуть: убрать false &&) */}
        {false && (
          <section className="card card--mission">
            <img className="mission-img" src="/img/home/mission.png" alt="" />
            <h3 className="mission-title">Миссия и Ценности Компании</h3>
            <p className="mission-text">
              Быть лучшими в том, что мы делаем. Развиваться вместе с миром, оставаясь верными
              своим ценностям. Бережно раскрывая потенциал Земли и человечества, обеспечивать
              процветание тех, кто на нас полагается.
            </p>
          </section>
        )}

        {/* Публикации / Мероприятия — единый вид как в Ленте, по 4 карточки */}
        <section className="card">
          <FeedTabs tab={feedTab} onChange={setFeedTab} />
          {feedTab === 'posts' ? (
            <>
              <div className="home-feed">
                {basePosts.slice(0, 4).map((p, i) => (
                  <div className="home-feed-item" key={i}><PostCard p={p} compact /></div>
                ))}
              </div>
              <button className="all-pub-btn" onClick={() => navigate('/posts')}>
                Все публикации<CaretRight size={18} color="var(--color-light)" />
              </button>
            </>
          ) : (
            <>
              <div className="home-events">
                {events.slice(0, 4).map((e) => (
                  <EventCard key={e.id} e={e} onOpen={openEvent} />
                ))}
              </div>
              <button className="all-pub-btn" onClick={() => navigate('/posts')}>
                Все мероприятия<CaretRight size={18} color="var(--color-light)" />
              </button>
            </>
          )}
        </section>

        {/* Актуальное */}
        <section className="card card--actual">
          <h3 className="section-title">Актуальное</h3>
          {/* Тот же список, что и в виджете «Полезные ссылки» — источник один */}
          {usefulLinks.map(({ icon, title, sub }) => {
            const Icon = LINK_ICONS[icon];
            return (
            <div className="actual-row" key={title}>
              {Icon && <Icon size={24} color="var(--color-primary)" />}
              <div className="actual-body">
                <div className="actual-title">{title}</div>
                <div className="actual-sub">{sub}</div>
              </div>
              <CaretRight size={16} color="var(--color-light)" />
            </div>
            );
          })}
        </section>
      </div></FadeIn>
      <ScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </TabLayout>
  );
}
