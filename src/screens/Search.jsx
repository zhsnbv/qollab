import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, MagnifyingGlass, X, CaretRight, SmileySad } from '@phosphor-icons/react';
import { allServices } from '../data/services';
import { basePosts, events } from '../data/feed';
import './Search.css';

// Небольшой мок-справочник сотрудников — тем же приёмом, что и бесконечная
// лента чатов (см. Chats.jsx): имя+фамилия из двух списков, портрет с
// randomuser.me по полу. Здесь не бесконечный, просто фиксированный набор.
const firstNames = ['Нурлан', 'Асель', 'Ерлан', 'Мадина', 'Азамат', 'Гульнара', 'Тимур', 'Айгерим', 'Бекзат', 'Динара', 'Серик', 'Жанар'];
const lastNamesM = ['Ибрагимов', 'Сулейменов', 'Кулубеков', 'Байтенов', 'Ержанов'];
const lastNamesF = ['Нурланова', 'Сериккызы', 'Оспанова', 'Ералиева', 'Бекова', 'Жумабаева'];
const roles = ['Специалист отдела кадров', 'Инженер-технолог', 'Менеджер проекта', 'Специалист IT-поддержки', 'Ведущий бухгалтер', 'Юрисконсульт', 'Специалист по охране труда', 'Аналитик данных'];
const depts = ['ТОО «Kazakhmys Energy»', 'ТОО «АктюбТЭК»', 'Головной офис ERG', 'Соколовско-Сарбайское ГПО', 'Аксуский завод ферросплавов'];

const employees = Array.from({ length: 12 }, (_, i) => {
  const male = i % 2 === 0;
  const last = male ? lastNamesM[i % lastNamesM.length] : lastNamesF[i % lastNamesF.length];
  return {
    id: i,
    name: `${firstNames[i]} ${last}`,
    role: roles[i % roles.length],
    dept: depts[i % depts.length],
    avatar: `https://randomuser.me/api/portraits/${male ? 'men' : 'women'}/${(i * 11) % 90}.jpg`,
  };
});

const TABS = [
  { id: 'people', label: 'Сотрудники' },
  { id: 'services', label: 'Сервисы' },
  { id: 'posts', label: 'Публикации' },
  { id: 'events', label: 'Мероприятия' },
];

const norm = (s) => (s || '').toLowerCase();

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  // Домашний background нужен для дальнейшей навигации в статью «поверх»
  // поиска: если взять background самого поиска (pathname '/search'), базовый
  // слой (Home) перестанет матчиться в первом <Routes> и пропадёт из-под
  // статьи. Пробрасываем исходный.
  const homeBackground = location.state?.background || { pathname: '/' };

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('people');
  const q = norm(query.trim());

  const results = useMemo(() => {
    if (!q) return null;
    if (tab === 'people') {
      return employees.filter((e) => norm(e.name).includes(q) || norm(e.role).includes(q) || norm(e.dept).includes(q));
    }
    if (tab === 'services') {
      return allServices.filter((s) => norm(s.name).includes(q) || norm(s.sub).includes(q));
    }
    if (tab === 'posts') {
      return basePosts.filter((p) => norm(p.title).includes(q) || norm(p.excerpt).includes(q) || norm(p.channel).includes(q));
    }
    return events.filter((e) => norm(e.title).includes(q));
  }, [q, tab]);

  const openPost = (p) => navigate('/article', { state: { post: p, background: homeBackground } });

  return (
    <div className="searchscreen">
      <header className="se-top">
        <button className="se-back" onClick={() => navigate(-1)} aria-label="Назад"><CaretLeft size={24} /></button>
        <div className="se-input">
          <MagnifyingGlass size={20} color="var(--color-weak)" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            enterKeyHint="search"
          />
          {query && (
            <button className="se-clear" onClick={() => setQuery('')} aria-label="Очистить"><X size={14} weight="bold" /></button>
          )}
        </div>
      </header>

      <div className="se-tabs no-scrollbar">
        {TABS.map((t) => (
          <button key={t.id} className={`se-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="se-scroll scroll-area--tabbar">
        {results === null && (
          <div className="se-empty">
            <span className="se-empty-ico"><MagnifyingGlass size={28} weight="bold" color="var(--color-primary)" /></span>
            <p className="se-empty-title">Поиск по qollab</p>
            <p className="se-empty-sub">Ищите сотрудников, полезные сервисы, публикации и мероприятия</p>
          </div>
        )}

        {results !== null && results.length === 0 && (
          <div className="se-empty">
            <span className="se-empty-ico se-empty-ico--sad"><SmileySad size={28} weight="bold" color="var(--color-danger)" /></span>
            <p className="se-empty-title">Ничего не найдено</p>
            <p className="se-empty-sub">Возможно, в запросе опечатка. Попробуйте другой запрос</p>
          </div>
        )}

        {results !== null && results.length > 0 && tab === 'people' && (
          <div className="se-list">
            {results.map((e) => (
              <div className="se-row" key={e.id}>
                <span className="se-avatar"><img src={e.avatar} alt="" loading="lazy" /></span>
                <span className="se-texts">
                  <span className="se-name">{e.name}</span>
                  <span className="se-sub">{e.role} · {e.dept}</span>
                </span>
                <CaretRight size={16} color="var(--color-light)" />
              </div>
            ))}
          </div>
        )}

        {results !== null && results.length > 0 && tab === 'services' && (
          <div className="se-list">
            {results.map((s) => (
              <div className="se-row" key={s.id}>
                <img className="se-svc-icon" src={s.img} alt="" />
                <span className="se-texts">
                  <span className="se-name">{s.name}</span>
                  <span className="se-sub">{s.sub}</span>
                </span>
                <CaretRight size={16} color="var(--color-light)" />
              </div>
            ))}
          </div>
        )}

        {results !== null && results.length > 0 && tab === 'posts' && (
          <div className="se-list">
            {results.map((p, i) => (
              <button className="se-post" key={i} onClick={() => openPost(p)}>
                <span className="se-texts">
                  <span className="se-post-meta">{p.channel} · {p.date}</span>
                  <span className="se-name">{p.title}</span>
                  {p.excerpt && <span className="se-sub se-post-excerpt">{p.excerpt}</span>}
                </span>
                {p.thumb && <span className="se-post-thumb"><img src={p.thumb} alt="" loading="lazy" /></span>}
              </button>
            ))}
          </div>
        )}

        {results !== null && results.length > 0 && tab === 'events' && (
          <div className="se-list">
            {results.map((e, i) => (
              <div className="se-row se-row--event" key={i}>
                <span className="se-event-thumb"><img src={e.img} alt="" loading="lazy" /></span>
                <span className="se-texts">
                  <span className="se-name">{e.title}</span>
                  <span className="se-sub">{e.when}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
