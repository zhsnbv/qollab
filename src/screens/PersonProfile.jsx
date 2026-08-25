import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, CaretRight, FileText, LinkSimple, Play } from '@phosphor-icons/react';
import {
  Chat24Filled, Call24Filled, Heart24Filled, Search24Filled,
  Alert24Filled, AlertOff24Filled,
} from '@fluentui/react-icons';
import { DotsIcon } from '../components/TopBar';
import ScreenMenu from '../components/ScreenMenu';
import { getPerson } from '../data/person';
import { useScrolled } from '../utils/useScrolled';
import ProfileHero from '../components/ProfileHero';
import Toast from '../components/Toast';
import './Profile.css';
import './ChatProfile.css';
import './PersonProfile.css';

// Профиль коллеги: та же вёрстка, что у своего профиля (карточки .pcard,
// плитки .stat-card, строки .org-row), только состав другой — вместо личных
// блоков переписка. Экран один: из чата, поиска, участников группы.

// Вкладки профиля: «Сведения» — вся анкета, остальные — то, что было
// «Общим с вами», только прямо на экране, без перехода.
const TABS = [
  { id: 'info', label: 'Сведения' },
  { id: 'media', label: 'Медиа', count: (p) => p.media.length },
  { id: 'files', label: 'Файлы', count: (p) => p.files.length },
  { id: 'links', label: 'Ссылки', count: (p) => p.links.length },
  { id: 'groups', label: 'Общие группы', count: (p) => p.groups.length },
];

export default function PersonProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, onScroll] = useScrolled();
  const { id, employee, background } = location.state || {};
  const p = getPerson(id, employee);

  const [closing, setClosing] = useState(false);
  const [screenMenu, setScreenMenu] = useState(false);
  const [muted, setMuted] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [tab, setTab] = useState('info');
  const [toast, setToast] = useState('');

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 240);
  };

  // Вложения открываем прежним экраном профиля чата: там уже есть вкладки и
  // вёрстка списков, дублировать её незачем.
  const openShared = (tab) => navigate('/chat-profile', {
    state: { id: p.id, kind: 'user', tab, sharedOnly: true, background },
  });

  const write = () => navigate('/chats/dm', {
    // DMChat ждёт готовую строку списка чатов, а не id человека
    state: {
      chat: {
        profileId: p.id, title: p.name, avatar: p.avatar,
        initials: p.initials, tint: p.tint, online: true,
        fresh: true, preview: '', time: '',
      },
      background,
    },
  });

  const toggleMute = () => {
    setMuted((m) => !m);
    setToast(muted ? 'Уведомления включены' : 'Уведомления отключены');
  };

  // «Ещё» больше нет: поиск и звук вынесены в ряд, а «поделиться ссылкой»
  // живёт в «трёх точках» шапки.
  const actions = [
    { id: 'write', label: 'Написать', Icon: Chat24Filled, onClick: write },
    { id: 'call', label: 'Звонок', Icon: Call24Filled, onClick: () => setToast(`Звоним: ${p.name}`) },
    { id: 'thanks', label: 'Рахмет', Icon: Heart24Filled, onClick: () => setToast('Рахмет отправлен') },
    { id: 'search', label: 'Поиск', Icon: Search24Filled, onClick: () => setToast('Поиск по переписке') },
    { id: 'mute', label: 'Звук', Icon: muted ? AlertOff24Filled : Alert24Filled, onClick: toggleMute },
  ];

  // Пилюля — только установленный статус. Присутствие всегда строкой под ним:
  // это не статус, а факт последнего визита.
  const status = (
    <>
      {p.work && (
        <span className={`status-btn phero-status status-btn--${p.work.kind}`}>{p.work.text}</span>
      )}
      <div className="phero-presence">{p.status}</div>
    </>
  );

  return (
    <div className={`person ${closing ? 'closing' : ''}`}>
      <header className={`pp-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="pp-back" onClick={close} aria-label="Назад"><CaretLeft size={22} /></button>
        <h1 className="pp-title">Профиль</h1>
        <button className="pp-back" onClick={() => setScreenMenu(true)} aria-label="Меню"><DotsIcon /></button>
      </header>

      <div className="pp-scroll" onScroll={onScroll}>
        <div className="profile">
          <ProfileHero me={p} status={status}>
            {/* Действия и вкладки — в том же блоке, что аватар: общий фон */}
            <div className="pp-actions">
              {actions.map(({ id: aid, label, Icon, onClick }) => (
                <button className="quick-item" key={aid} onClick={onClick}>
                  <span className="quick-ico"><Icon /></span>
                  <span className="quick-label">{label}</span>
                </button>
              ))}
            </div>
          </ProfileHero>

          <div className="pp-tabs no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`cp-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.count && <span className="pp-tab-count">{t.count(p)}</span>}
              </button>
            ))}
          </div>

          {tab === 'info' && (<>
          {/* Корпоративные данные */}
          <section className="pcard">
            <div className="pcard-head"><h3>Корпоративные данные</h3></div>
            <div className="data-list">
              <div className="data-row">
                <div className="data-label">Табельный номер</div>
                <div className="data-value-line">
                  <span className="data-value">{p.tabNumber}</span>
                  <span className="data-tag">Основной</span>
                </div>
              </div>
              <div className="data-row">
                <div className="data-label">Предприятие</div>
                <span className="data-value">{p.company}</span>
              </div>
              <div className="data-row">
                <div className="data-label">Должность</div>
                <span className="data-value">{p.role}</span>
              </div>
              <div className="data-row">
                <div className="data-label">Подразделение</div>
                <span className="data-value">{p.unit}</span>
              </div>
              <div className="data-row last">
                <div className="data-label">Административный руководитель</div>
                <span className="data-value link">{p.chief}</span>
              </div>
            </div>
          </section>

          {/* Структура */}
          <section className="pcard">
            <div className="pcard-head"><h3>Структура</h3></div>
            <div className="org-label">Руководитель</div>
            <button className="org-row" onClick={() => setToast(p.supervisor.name)}>
              <span className="org-avatar">{p.supervisor.initials}</span>
              <span className="org-texts">
                <span className="org-name">{p.supervisor.name}</span>
                <span className="org-role">{p.supervisor.role}</span>
              </span>
              <CaretRight size={18} color="var(--color-light)" />
            </button>

            <div className="org-label">Команда · {p.team.length}</div>
            {p.team.map((m) => (
              <button className="org-row" key={m.initials} onClick={() => setToast(m.name)}>
                <span className="org-avatar">{m.initials}</span>
                <span className="org-texts">
                  <span className="org-name">{m.name}</span>
                  <span className="org-role">{m.role}</span>
                </span>
                <CaretRight size={18} color="var(--color-light)" />
              </button>
            ))}
          </section>

          {/* Показатели: у коллеги публичная часть — благодарности */}
          <section className="pcard">
            <div className="pcard-head"><h3>Показатели</h3></div>
            <div className="stat-grid stat-grid--single">
              <button className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-icon">🙂</span>
                  <span className="stat-value">{p.thanks}</span>
                  <CaretRight size={18} color="var(--color-light)" />
                </div>
                <div className="stat-label">Благодарность</div>
              </button>
            </div>
          </section>

          {/* Персональные данные */}
          <section className="pcard">
            <div className="pcard-head"><h3>Персональные данные</h3></div>
            <div className="data-list">
              <div className="data-row">
                <div className="data-label">Мобильный номер</div>
                <span className="data-value link">{p.phone}</span>
              </div>
              <div className="data-row">
                <div className="data-label">Электронная почта</div>
                <span className="data-value link">{p.email}</span>
              </div>
              <div className="data-row">
                <div className="data-label">Обо мне</div>
                <p className={`data-about ${aboutOpen ? '' : 'clamped'}`}>{p.about}</p>
                {!aboutOpen && <button className="data-more" onClick={() => setAboutOpen(true)}>Показать больше...</button>}
              </div>
              <div className="data-row last">
                <div className="data-label">Интересы</div>
                <div className="tags-row">
                  {p.interests.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          </section>
          </>)}

          {tab === 'media' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Медиа</h3>
                <span className="pcard-note">{p.media.length}</span>
              </div>
              <div className="pp-media">
                {p.media.map((m) => (
                  <div className="cp-media-cell" key={m.id}>
                    <img src={m.img} alt="" loading="lazy" />
                    {m.video && (
                      <>
                        <span className="cp-media-play"><Play size={20} weight="fill" /></span>
                        <span className="cp-media-time">{m.video}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'files' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Файлы</h3>
                <span className="pcard-note">{p.files.length}</span>
              </div>
              <div className="cp-rows">
                {p.files.map((f) => (
                  <div className="cp-row cp-row--file" key={f.id}>
                    <span className="cp-file-ico"><FileText size={20} weight="fill" /></span>
                    <span className="cp-row-texts">
                      <span className="cp-row-title">{f.name}</span>
                      <span className="cp-row-sub">{f.size}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'links' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Ссылки</h3>
                <span className="pcard-note">{p.links.length}</span>
              </div>
              <div className="cp-rows">
                {p.links.map((l) => (
                  <div className="cp-row" key={l.id}>
                    <span className="cp-file-ico"><LinkSimple size={20} weight="bold" /></span>
                    <span className="cp-row-texts">
                      <span className="cp-row-title cp-row-title--link">{l.url}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'groups' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Общие группы</h3>
                <span className="pcard-note">{p.groups.length}</span>
              </div>
              <div className="cp-rows">
                {p.groups.map((g) => (
                  <button className="cp-row" key={g.id} onClick={() => setToast(g.name)}>
                    <span className="pp-group-ava">
                      {g.img ? <img src={g.img} alt="" /> : g.initials}
                    </span>
                    <span className="cp-row-texts"><span className="cp-row-title">{g.name}</span></span>
                    <CaretRight size={18} color="var(--color-light)" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ScreenMenu open={screenMenu} onClose={() => setScreenMenu(false)} />
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
