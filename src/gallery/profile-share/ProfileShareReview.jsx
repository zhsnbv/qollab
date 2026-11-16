import { CompanyProvider } from '../../context/CompanyContext';
import { useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise, ArrowUpRight, GridFour, Play, Sun, Moon, CaretLeft, CaretRight } from '@phosphor-icons/react';
import ProfileShareScene from './ProfileShareScene';
import { SHARE_CASES } from './shareCases';
import './ProfileShareReview.css';

const STAGES = ['От профиля к получателю', 'Карточка и повторная пересылка', 'Пересылка сообщения', 'Копирование и поиск'];
function BoardStage({ title, stage, onOpen }) {
  const rowRef = useRef(null);
  const [edges, setEdges] = useState({ back: false, next: false });
  const updateEdges = () => {
    const row = rowRef.current;
    if (row) setEdges({ back: row.scrollLeft > 2, next: row.scrollLeft + row.clientWidth < row.scrollWidth - 2 });
  };
  useEffect(() => {
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rowRef.current);
    updateEdges();
    return () => observer.disconnect();
  }, []);
  const move = direction => {
    const row = rowRef.current;
    const step = row.querySelector('article').getBoundingClientRect().width + 24;
    row.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <section>
    <div className="ps-board-heading"><h2><span>0{stage + 1}</span>{title}</h2><div className="ps-board-arrows"><button aria-label={`Предыдущий экран: ${title}`} disabled={!edges.back} onClick={() => move(-1)}><CaretLeft size={20} /></button><button aria-label={`Следующий экран: ${title}`} disabled={!edges.next} onClick={() => move(1)}><CaretRight size={20} /></button></div></div>
    <div className="ps-board-flow" ref={rowRef} onScroll={updateEdges} tabIndex={0} role="group" aria-label={`Экраны: ${title}`}>
      {SHARE_CASES.filter(item => item.stage === stage).map(item => <article key={item.id}><header><button onClick={() => onOpen(item.id)}><strong>{item.title}</strong><ArrowUpRight size={18} /></button><p>{item.note}</p></header><ProfileShareScene scenario={item.id} capture /></article>)}
    </div>
  </section>;
}

export default function ProfileShareReview() {
  return <CompanyProvider><ProfileShareReviewContent /></CompanyProvider>;
}
function ProfileShareReviewContent() {
  const params = new URLSearchParams(window.location.search);
  const [view, setView] = useState(['board', 'frame'].includes(params.get('view')) ? params.get('view') : 'prototype');
  const [state, setState] = useState(SHARE_CASES.some(item => item.id === params.get('state')) ? params.get('state') : 'profile');
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [revision, setRevision] = useState(0);
  const current = SHARE_CASES.find(item => item.id === state);
  useEffect(() => {
    const title = document.title, previousTheme = document.documentElement.dataset.theme;
    document.documentElement.classList.add('ps-review-page');
    document.title = 'QM-2784 · Поделиться профилем · qollab';
    return () => { document.documentElement.classList.remove('ps-review-page'); document.documentElement.dataset.theme = previousTheme; document.title = title; };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.history.replaceState(null, '', `${window.location.pathname}?${new URLSearchParams({ view, state, theme })}`);
  }, [view, state, theme]);
  if (view === 'frame') return <ProfileShareScene scenario={state} capture />;
  return <main className="ps-review">
    <header className="ps-review-header"><div className="ps-brand"><img src="/img/common/qollab-logo.svg" alt="qollab" /><span>QM-2784</span><small>Профиль · Чаты</small></div><h1>Нужный человек.<br /><span>В нужном чате.</span></h1><p>Поделиться профилем, найти коллегу и переслать сообщение — один знакомый сценарий.</p></header>
    <div className="ps-tools"><div className="ps-switch"><button aria-pressed={view === 'prototype'} onClick={() => setView('prototype')}><Play size={16} />Пройти флоу</button><button aria-pressed={view === 'board'} onClick={() => setView('board')}><GridFour size={16} />Все экраны</button></div><div className="ps-switch">{[['light', 'Светлая', Sun], ['dark', 'Тёмная', Moon]].map(([id, label, Icon]) => <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}><Icon size={16} />{label}</button>)}</div><a href="/person?id=ayazhan" target="_blank" rel="noreferrer">Открыть в прототипе <ArrowUpRight size={16} /></a></div>
    {view === 'board' ? <div className="ps-board">{STAGES.map((title, stage) => <BoardStage key={title} title={title} stage={stage} onOpen={id => { setState(id); setView('prototype'); }} />)}</div> : <div className="ps-layout"><aside className="ps-scenarios"><p className="ps-eyebrow">СЦЕНАРИИ</p>{STAGES.map((title, stage) => <section key={title}><h2>{title}</h2>{SHARE_CASES.filter(item => item.stage === stage).map(item => <button key={item.id} aria-current={state === item.id ? 'step' : undefined} onClick={() => { setState(item.id); setRevision(value => value + 1); }}><small>{String(SHARE_CASES.indexOf(item) + 1).padStart(2, '0')}</small>{item.title}</button>)}</section>)}</aside><div className="ps-live"><div className="ps-preview-label"><span>{current.title}</span><span>402 × 820</span></div><ProfileShareScene key={`${state}-${revision}`} scenario={state} /><button className="ps-reset" onClick={() => setRevision(value => value + 1)}><ArrowCounterClockwise size={16} />Начать шаг заново</button></div><aside className="ps-notes"><span className="ps-eyebrow">МОЖНО ПОКАЗЫВАТЬ</span><h2>{current.title}</h2><p>{current.note}</p><ol><li>Нажмите «Поделиться» слева от «…» в профиле.</li><li>Выберите активный чат или найдите коллегу.</li><li>Нажмите «Отправить» и откройте карточку в чате.</li><li>Удерживайте карточку или сообщение, чтобы переслать дальше.</li></ol><div className="ps-note"><strong>Ссылка — в один шаг</strong><p>Иконка ссылки — справа в компактной плашке. Получателя выбирать не нужно.</p></div><p className="ps-demo-note">Интерактивный прототип. Отправки сохраняются в этой вкладке браузера и не уходят реальным коллегам.</p><a href="https://jira2.erg.kz/browse/QM-2784" target="_blank" rel="noreferrer">Задача QM-2784 <ArrowUpRight size={16} /></a></aside></div>}
    <footer className="ps-review-footer">12 состояний · Светлая и тёмная темы · Общие компоненты с основным прототипом</footer>
  </main>;
}
