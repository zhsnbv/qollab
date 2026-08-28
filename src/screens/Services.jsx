import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, X, SmileySad, GearSix } from '@phosphor-icons/react';
import TabLayout from '../components/TabLayout';
import TopBar from '../components/TopBar';
import ViewToggle from '../components/ViewToggle';
import { useSkeleton, ServicesSkeleton, FadeIn } from '../components/Skeleton';
import { serviceCategories } from '../data/services';
import './Services.css';

const norm = (s) => (s || '').toLowerCase();

// Вкладка «Сервисы» — тот же каталог, что в боттом-шите «Все сервисы»
// (единый источник — data/services.js), плюс поиск по названию и описанию.
export default function Services() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const q = norm(query.trim());

  // Фильтруем внутри категорий и выкидываем те, где ничего не осталось —
  // так у найденного сохраняется раздел, а не превращается в плоскую кашу.
  const categories = useMemo(() => {
    if (!q) return serviceCategories;
    return serviceCategories
      .map((c) => ({ ...c, items: c.items.filter((i) => norm(i.name).includes(q) || norm(i.sub).includes(q)) }))
      .filter((c) => c.items.length);
  }, [q]);

  const found = categories.reduce((n, c) => n + c.items.length, 0);
  const openApp = (app) => navigate(`/app/${app}`, { state: { background: location } });

  const topbar = (
    <TopBar
      title="Сервисы"
      actions={
        <>
          {/* Шестерёнка ведёт в настройку избранного — тот же экран, что и
              «Настроить» на Главной (Figma node 24860-3477) */}
          <button className="topbar-btn topbar-btn--muted" aria-label="Настроить избранное" onClick={() => navigate('/favorites', { state: { background: location } })}>
            <GearSix size={20} weight="fill" />
          </button>
          <ViewToggle view={view} onChange={setView} />
        </>
      }
    />
  );

  if (loading) return <TabLayout topbar={topbar}><ServicesSkeleton /></TabLayout>;

  return (
    <TabLayout topbar={topbar}>
      <FadeIn><div className="services">
        <div className="svc-search-wrap">
          <div className="svc-search">
            <MagnifyingGlass size={20} color="var(--color-weak)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по сервисам"
              enterKeyHint="search"
            />
            {query && (
              <button className="svc-search-clear" onClick={() => setQuery('')} aria-label="Очистить">
                <X size={12} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {found === 0 && (
          <div className="svc-empty">
            <span className="svc-empty-ico"><SmileySad size={28} weight="bold" color="var(--color-danger)" /></span>
            <p className="svc-empty-title">Ничего не найдено</p>
            <p className="svc-empty-sub">Попробуйте изменить запрос — поиск идёт по названию и описанию сервиса</p>
          </div>
        )}

        {categories.map((cat) => (
          <section className="svc-section" key={cat.title}>
            <h2 className="svc-section-title">{cat.title}</h2>
            <div className={view === 'list' ? 'svc-list' : 'svc-grid'}>
              {cat.items.map((item) => (
                <button className="svc-item" key={item.id} onClick={() => openApp(item.app || item.id)}>
                  <img className="svc-icon" src={item.img} alt="" />
                  <span className="svc-texts">
                    <span className="svc-name">{item.name}</span>
                    {view === 'list' && <span className="svc-sub">{item.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div></FadeIn>
    </TabLayout>
  );
}
