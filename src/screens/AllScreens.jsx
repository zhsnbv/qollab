import { useEffect, useRef, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { DeviceHost } from '../components/Portal';
import { SCREEN_GROUPS, SCREEN_COUNT } from '../gallery/registry';
import { companies } from '../data/companies';
import './AllScreens.css';

// Одна карточка витрины: настоящая рамка «телефона» со своим роутером.
// Экран внутри не знает, что он в витрине, — это тот же код, что на проде.
function Cell({ item }) {
  const boxRef = useRef(null);
  const [host, setHost] = useState(null);
  const [live, setLive] = useState(false);

  // Экранов под полсотни, и каждый со своими таймерами и наблюдателями:
  // поднимаем карточку, только когда она подъезжает к экрану, и больше
  // не гасим — иначе состояние сбрасывалось бы при каждой прокрутке.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || live) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setLive(true); io.disconnect(); }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  const { title, note, route, render, kind } = item;
  const entry = typeof route === 'string' ? route : route || '/';

  return (
    <figure className="gal-cell" ref={boxRef}>
      <div className="gal-frame">
        <div className="device gal-device" ref={setHost}>
          {live && host && (
            <DeviceHost.Provider value={host}>
              <MemoryRouter initialEntries={[entry]}>{render()}</MemoryRouter>
            </DeviceHost.Provider>
          )}
        </div>
      </div>
      <figcaption className="gal-caption">
        <span className="gal-title">
          {title}
          {/* Оверлеи стоят вперемешку с экранами — рядом с тем, откуда
              вызываются, — поэтому помечаем, что это лист, а не экран. */}
          {kind === 'overlay' && <span className="gal-tag">оверлей</span>}
        </span>
        {note && <span className="gal-note">{note}</span>}
      </figcaption>
    </figure>
  );
}

// Витрина: все экраны приложения и все оверлеи — каждый поверх того экрана,
// откуда он вызывается. Живёт вне рамки «телефона», потому что рамок здесь
// много и им нужна вся ширина окна.
const THEMES = [
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' },
];

export default function AllScreens() {
  const [group, setGroup] = useState('all');
  const [theme, setTheme] = useState('light');
  const [company, setCompany] = useState('erg');

  // Возвращаем документу прокрутку: в приложении она заблокирована на уровне
  // страницы, чтобы «резинка» на iPhone не уносила бары.
  useEffect(() => {
    document.documentElement.classList.add('gallery');
    return () => document.documentElement.classList.remove('gallery');
  }, []);

  // Тема и пространство переключаются теми же атрибутами на <html>, что и
  // в приложении: все полсотни рамок перекрашиваются разом, без перезагрузки.
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.documentElement.dataset.company = company; }, [company]);
  const groups = group === 'all' ? SCREEN_GROUPS : SCREEN_GROUPS.filter((g) => g.id === group);

  return (
    <div className="gal">
      <header className="gal-top">
        <div className="gal-head">
          <h1>Все экраны</h1>
          <p>{SCREEN_COUNT} состояний приложения. Каждая рамка — живой экран, а не картинка.</p>
        </div>
        <div className="gal-switches">
          <div className="gal-seg">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`gal-seg-btn ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="gal-seg">
            {companies.map((c) => (
              <button
                key={c.id}
                className={`gal-seg-btn ${company === c.id ? 'active' : ''}`}
                onClick={() => setCompany(c.id)}
              >
                {c.short || c.name}
              </button>
            ))}
          </div>
        </div>

        <nav className="gal-nav no-scrollbar">
          <button
            className={`gal-chip ${group === 'all' ? 'active' : ''}`}
            onClick={() => setGroup('all')}
          >
            Все
          </button>
          {SCREEN_GROUPS.map((g) => (
            <button
              key={g.id}
              className={`gal-chip ${group === g.id ? 'active' : ''}`}
              onClick={() => setGroup(g.id)}
            >
              {g.title}
              <span className="gal-chip-count">{g.items.length}</span>
            </button>
          ))}
        </nav>
      </header>

      {groups.map((g) => (
        <section className="gal-group" key={g.id}>
          <h2 className="gal-group-title">
            {g.title}
            <span className="gal-group-count">{g.items.length}</span>
          </h2>
          {g.hint && <p className="gal-group-hint">{g.hint}</p>}
          <div className="gal-grid">
            {g.items.map((item) => <Cell key={item.id} item={item} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
