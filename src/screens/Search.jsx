import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, MagnifyingGlass, X, CaretRight, SmileySad,
  ChatCircleDots, SlidersHorizontal, ShareNetwork, CalendarBlank,
} from '@phosphor-icons/react';
import { allServices } from '../data/services';
import { basePosts, events } from '../data/feed';
import { employees, guests, searchChannels, enterprises } from '../data/people';
import './Search.css';
import SheetTop from '../components/SheetTop';
import useSheetSwipe from '../utils/useSheetSwipe';

// Вкладки поиска — как в макете (node 23930-6898).
const TABS = [
  { id: 'people', label: 'Сотрудники' },
  { id: 'services', label: 'Сервисы' },
  { id: 'posts', label: 'Публикации' },
  { id: 'channels', label: 'Каналы' },
  { id: 'events', label: 'Мероприятия' },
  { id: 'guests', label: 'Гости' },
];

// Фильтр есть только у людей и публикаций (у публикаций — расширенный).
const FILTER_TABS = { people: 'simple', guests: 'simple', posts: 'full' };

const POST_KINDS = ['Новость', 'Обзор'];
const SORTS = ['По умолчанию', 'Сначала новые', 'Сначала старые', 'По оценке (высокая)', 'По оценке (низкая)'];

// Палитра кружков с инициалами — как в макете, по кругу через индекс.
const AVATAR_COLORS = ['#4caf50', '#26c6da', '#ec407a', '#ef5350', '#ff9800', '#7e57c2'];

const norm = (s) => (s || '').toLowerCase();

function initials(name) {
  const parts = name.split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function PersonAvatar({ person, index }) {
  if (person.avatar) {
    return <span className="se-avatar"><img src={person.avatar} alt="" loading="lazy" /></span>;
  }
  return (
    <span className="se-avatar se-avatar--initials" style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials(person.name)}
    </span>
  );
}

// Боттом-шит фильтра. simple — только «Предприятие» (сотрудники, гости),
// full — плюс тип публикации, сортировка и диапазон дат (публикации).
function FilterSheet({ kind, open, onClose, value, onChange }) {
  const swipe = useSheetSwipe(onClose);
  const [orgQuery, setOrgQuery] = useState('');
  if (!kind) return null;

  const orgs = enterprises.filter((e) => norm(e).includes(norm(orgQuery)));
  const set = (patch) => onChange({ ...value, ...patch });
  const reset = () => onChange({ postKind: null, sort: SORTS[0], org: null, from: '', to: '' });

  return (
    <div className={`fs-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden={!open}>
      <div
        className={`fs-sheet ${swipe.className}`}
        style={swipe.style}
        onClick={(e) => e.stopPropagation()}
      >
        <SheetTop onClose={onClose} swipe={swipe}>
          <h2 className="fs-title">Фильтр</h2>
          <button className="fs-reset" onClick={reset}>Сбросить фильтр</button>
        </SheetTop>

        <div className="fs-body">
          {kind === 'full' && (
            <>
              <div className="fs-group">
                <h3 className="fs-label">Тип публикации</h3>
                {POST_KINDS.map((k) => (
                  <label className="fs-radio" key={k}>
                    <input type="radio" name="postKind" checked={value.postKind === k} onChange={() => set({ postKind: k })} />
                    <span className="fs-dot" />{k}
                  </label>
                ))}
              </div>

              <div className="fs-group">
                <h3 className="fs-label">Сортировка</h3>
                {SORTS.map((s) => (
                  <label className="fs-radio" key={s}>
                    <input type="radio" name="sort" checked={value.sort === s} onChange={() => set({ sort: s })} />
                    <span className="fs-dot" />{s}
                  </label>
                ))}
              </div>
            </>
          )}

          <div className="fs-group">
            <h3 className="fs-label">Предприятие</h3>
            <div className="fs-search">
              <MagnifyingGlass size={20} color="var(--color-weak)" />
              <input value={orgQuery} onChange={(e) => setOrgQuery(e.target.value)} placeholder="Поиск" />
            </div>
            {orgs.map((o) => (
              <label className="fs-radio" key={o}>
                <input type="radio" name="org" checked={value.org === o} onChange={() => set({ org: o })} />
                <span className="fs-dot" />{o}
              </label>
            ))}
            {orgs.length === 0 && <p className="fs-none">Ничего не найдено</p>}
          </div>

          {kind === 'full' && (
            <div className="fs-group">
              <h3 className="fs-label">Диапазон дат публикации</h3>
              <div className="fs-dates">
                <input type="text" placeholder="Start date" value={value.from} onChange={(e) => set({ from: e.target.value })} />
                <span className="fs-arrow">→</span>
                <input type="text" placeholder="End date" value={value.to} onChange={(e) => set({ to: e.target.value })} />
                <CalendarBlank size={20} color="var(--color-weak)" />
              </div>
            </div>
          )}
        </div>

        <div className="fs-foot">
          <button className="fs-save" onClick={onClose}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

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
  const [closing, setClosing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ postKind: null, sort: SORTS[0], org: null, from: '', to: '' });
  const q = norm(query.trim());
  const tabsRef = useRef(null);

  // Подтягиваем активный таб в вид: крайние («Каналы», «Гости») не помещаются
  // в полосу, и после клика по частично видимому табу подсветка оставалась за
  // кадром. Скроллим только саму полосу, не трогая вертикальный скролл.
  useEffect(() => {
    const bar = tabsRef.current;
    const el = bar?.querySelector('.se-tab.active');
    if (!bar || !el) return;
    const target = el.offsetLeft - (bar.clientWidth - el.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [tab]);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const results = useMemo(() => {
    if (!q) return null;
    const byOrg = (list) => (filters.org ? list.filter((p) => p.org === filters.org) : list);
    switch (tab) {
      case 'people':
        return byOrg(employees.filter((e) => norm(e.name).includes(q) || norm(e.role).includes(q) || norm(e.org).includes(q)));
      case 'guests':
        return guests.filter((g) => norm(g.name).includes(q));
      case 'services':
        return allServices.filter((s) => norm(s.name).includes(q) || norm(s.sub).includes(q));
      case 'posts': {
        let list = basePosts.filter((p) => norm(p.title).includes(q) || norm(p.excerpt).includes(q) || norm(p.channel).includes(q));
        if (filters.sort === 'Сначала старые') list = [...list].reverse();
        return list;
      }
      case 'channels':
        return searchChannels.filter((c) => norm(c.name).includes(q));
      default:
        return events.filter((e) => norm(e.title).includes(q));
    }
  }, [q, tab, filters]);

  const openPost = (p) => navigate('/article', { state: { post: p, background: homeBackground } });
  const filterKind = FILTER_TABS[tab] || null;
  const hasResults = results !== null && results.length > 0;

  return (
    <div className={`searchscreen ${closing ? 'closing' : ''}`}>
      <header className="se-top">
        <button className="se-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="se-title">Поиск</h1>
        <span className="se-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="se-input-wrap">
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
            <button className="se-clear" onClick={() => setQuery('')} aria-label="Очистить"><X size={12} weight="bold" /></button>
          )}
        </div>
      </div>

      <div className="se-tabs no-scrollbar" ref={tabsRef}>
        {TABS.map((t) => (
          <button key={t.id} className={`se-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {hasResults && (
        <div className="se-resbar">
          <h2 className="se-restitle">Результаты поиска</h2>
          {filterKind && (
            <button className="se-filter" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal size={18} weight="bold" />Фильтр
            </button>
          )}
        </div>
      )}

      <div className="se-scroll">
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

        {hasResults && (tab === 'people' || tab === 'guests') && (
          <div className="se-list">
            {results.map((p, i) => (
              <div className="se-row" key={p.id}>
                <PersonAvatar person={p} index={i} />
                <span className="se-texts">
                  <span className="se-name">{p.name}</span>
                  <span className="se-sub">{tab === 'guests' ? 'Гость' : `${p.org} • ${p.role}`}</span>
                </span>
                <button className="se-chat" aria-label={`Написать: ${p.name}`}>
                  <ChatCircleDots size={22} />
                </button>
              </div>
            ))}
          </div>
        )}

        {hasResults && tab === 'services' && (
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

        {hasResults && tab === 'channels' && (
          <div className="se-list">
            {results.map((c) => (
              <div className="se-row" key={c.id}>
                <span className="se-avatar"><img src={c.img} alt="" loading="lazy" /></span>
                <span className="se-texts">
                  <span className="se-name">{c.name}</span>
                  <span className="se-sub">{c.posts}</span>
                </span>
                <CaretRight size={16} color="var(--color-light)" />
              </div>
            ))}
          </div>
        )}

        {hasResults && tab === 'posts' && (
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

        {hasResults && tab === 'events' && (
          <div className="se-events">
            {results.map((e, i) => (
              <article className="se-event" key={i}>
                <div className="se-event-cover"><img src={e.img} alt="" loading="lazy" /></div>
                <div className="se-event-body">
                  <p className="se-event-when">{e.when}</p>
                  <h3 className="se-event-title">{e.title}</h3>
                  <div className="se-event-org">
                    <span className="se-event-avatars">
                      {[0, 1, 2].map((n) => (
                        <span key={n} className="se-event-av" style={{ background: AVATAR_COLORS[(i + n) % AVATAR_COLORS.length] }} />
                      ))}
                    </span>
                    <span className="se-event-orgtext">{e.org}</span>
                  </div>
                  <div className="se-event-actions">
                    <button className="se-event-more">Подробнее</button>
                    <button className="se-event-share" aria-label="Поделиться"><ShareNetwork size={20} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="se-bottom-spacer" />
      </div>

      <FilterSheet
        kind={filterOpen ? filterKind : null}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </div>
  );
}
