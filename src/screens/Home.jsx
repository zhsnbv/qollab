import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import TopBar, { DotsIcon } from '../components/TopBar';
import { useSkeleton, HomeSkeleton, FadeIn } from '../components/Skeleton';
import { toggleTheme } from '../utils/theme';
import { FeedTabs, PostCard, EventCard } from '../components/Feed';
import { basePosts, events } from '../data/feed';
import {
  MagnifyingGlass, Scroll, Mailbox, CalendarDots,
  Lifebuoy, Headset, CheckFat, HandHeart,
  SuitcaseRolling, CaretRight,
} from '@phosphor-icons/react';
import './Home.css';

// Ассеты экспортированы из Figma в public/img/home (см. README).
const stories = [
  { img: '/img/home/story-1.png', name: 'ERG News', seen: false },
  { img: '/img/home/story-2.png', name: 'BTS News', seen: false },
  { img: '/img/home/story-3.png', name: 'Безопасность', seen: false },
  { img: '/img/home/story-4.png', name: 'Вакансии', seen: true },
  { img: '/img/home/story-5.png', name: 'Eco Life ERG', seen: true },
];

const services = [
  { img: '/img/home/svc-1.png', name: 'Sales Market' },
  { img: '/img/home/svc-2.png', name: 'Поддержка персонала' },
  { img: '/img/home/svc-3.png', name: 'Мои задачи' },
  { img: '/img/home/svc-4.png', name: 'МТОРО' },
  { img: '/img/home/svc-5.png', name: 'ERG CU' },
  { img: '/img/home/svc-6.png', name: 'Поиск по QR' },
  { img: '/img/home/svc-7.png', name: 'ДРП' },
];

const favs = [
  { label: 'Персонал', value: 'Расчетный листок 2.0', Icon: Scroll },
  { label: 'IT услуги', value: 'Почта', Icon: Mailbox },
  { label: 'IT услуги', value: 'Мои встречи', Icon: CalendarDots },
];

const promos = [
  { cls: 'promo-1', badge: 'Опрос', title: 'Оставьте отзыв о работе в ERG' },
  { cls: 'promo-2', badge: 'До -25%', alert: true, title: 'Шины и масла со скидкой', sub: 'для сотрудников ERG' },
  { cls: 'promo-3', badge: 'Опрос', title: 'Насколько вы довольны корп. университетом ERG?' },
  { cls: 'promo-4', badge: 'Внимание!', title: 'Мошенники в Whatsapp и Telegram', badgeAtEnd: true },
];

const actual = [
  { Icon: Lifebuoy, title: 'Заявка в Service Desk', sub: 'Обратная связь' },
  { Icon: Headset, title: 'Горячая линия ERG', sub: 'Сообщить о проблеме, задать вопрос' },
  { Icon: CheckFat, title: 'ДРП в 1 клик!', sub: 'Зарегистрируйте проблему онлайн' },
  { Icon: HandHeart, title: 'Жизненно важные правила', sub: 'Обязательно к ознакомлению' },
  { Icon: SuitcaseRolling, title: 'Заявка на командировку', sub: 'Подайте заявку на командировку' },
];

export default function Home() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState('posts');
  const actions = (
    <button className="topbar-btn" aria-label="Меню"><DotsIcon /></button>
  );

  if (loading) {
    return <TabLayout topbar={<TopBar logo actions={actions} onLogoClick={toggleTheme} />}><HomeSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={<TopBar logo actions={actions} onLogoClick={toggleTheme} />}>
      <FadeIn><div className="home">
        {/* Поиск + баннеры в одной карточке — сторис пока скрыты по просьбе заказчика (вернуть: убрать false &&) */}
        <section className="card card--first">
          <div className="search-pill">
            <MagnifyingGlass size={20} color="var(--color-weak)" />
            <span>Поиск</span>
          </div>
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
            {promos.map((p, i) => (
              <div className={`promo-card ${p.cls}`} key={i}>
                {!p.badgeAtEnd && <span className={`promo-badge ${p.alert ? 'alert' : ''}`}>{p.badge}</span>}
                <div>
                  <div className="promo-title">{p.title}</div>
                  {p.sub && <div className="promo-sub">{p.sub}</div>}
                </div>
                {p.badgeAtEnd && <span className="promo-badge">{p.badge}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Сервисы + избранное */}
        <section className="card">
          <div className="block">
            <h3 className="section-title">Сервисы</h3>
            <div className="services-grid">
              {services.map((s, i) => (
                <button className="service-item" key={i}>
                  <span className="service-icon"><img src={s.img} alt="" /></span>
                  <span>{s.name}</span>
                </button>
              ))}
              <button className="service-item" onClick={() => navigate('/services')}>
                <span className="service-icon"><img src="/img/home/svc-all.png" alt="" /></span>
                <span>Все сервисы</span>
              </button>
            </div>
          </div>
          <div className="block">
            <div className="row-between">
              <h3 className="section-title" style={{ margin: 0 }}>Избранное</h3>
              <button className="fav-gear" aria-label="Настроить">
                <img src="/img/profile/settings.svg" alt="" width="24" height="24" />
              </button>
            </div>
            <div className="fav-row no-scrollbar edge-scroll">
              {favs.map(({ label, value, Icon }, i) => (
                <div className="fav-card" key={i}>
                  <div>
                    <div className="fav-label">{label}</div>
                    <div className="fav-value">{value}</div>
                  </div>
                  <Icon size={24} weight="duotone" color="var(--color-primary)" />
                </div>
              ))}
            </div>
          </div>
        </section>

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
                {events.slice(0, 4).map((e, i) => <EventCard key={i} e={e} />)}
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
          {actual.map(({ Icon, title, sub }, i) => (
            <div className="actual-row" key={i}>
              <Icon size={24} color="var(--color-primary)" />
              <div className="actual-body">
                <div className="actual-title">{title}</div>
                <div className="actual-sub">{sub}</div>
              </div>
              <CaretRight size={16} color="var(--color-light)" />
            </div>
          ))}
        </section>
      </div></FadeIn>
    </TabLayout>
  );
}
