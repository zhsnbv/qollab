import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, CaretRight, ChatCircle, Phone, Heart, FileText, LinkSimple, Play,
} from '@phosphor-icons/react';
import { Alert24Regular, Search24Regular, Share24Regular } from '@fluentui/react-icons';
import { DotsIcon } from '../components/TopBar';
import ScreenMenu from '../components/ScreenMenu';
import { getPerson } from '../data/person';
import { useScrolled } from '../utils/useScrolled';
import ProfileHero from '../components/ProfileHero';
import ActionSheet from '../components/ActionSheet';
import Toast from '../components/Toast';
import './Profile.css';
import './ChatProfile.css';
import './PersonProfile.css';

// Профиль коллеги: та же вёрстка, что у своего профиля (карточки .pcard,
// плитки .stat-card, строки .org-row), только состав другой — вместо личных
// блоков переписка. Экран один: из чата, поиска, участников группы.
const MENU_ITEMS = [
  { id: 'mute', label: 'Отключить звук', Icon: Alert24Regular },
  { id: 'search', label: 'Поиск по переписке', Icon: Search24Regular },
  { id: 'share', label: 'Поделиться контактом', Icon: Share24Regular },
];

// Три точки действия — иконка из макета (Figma 25099-78231), цвет наследуется
function DotsThreeAction({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13.5 3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 1.75C3.5 2.7165 2.7165 3.5 1.75 3.5C0.783502 3.5 0 2.7165 0 1.75C0 0.783502 0.783502 0 1.75 0C2.7165 0 3.5 0.783502 3.5 1.75ZM8.5 1.75C8.5 2.7165 7.7165 3.5 6.75 3.5C5.7835 3.5 5 2.7165 5 1.75C5 0.783502 5.7835 0 6.75 0C7.7165 0 8.5 0.783502 8.5 1.75ZM11.75 3.5C12.7165 3.5 13.5 2.7165 13.5 1.75C13.5 0.783502 12.7165 0 11.75 0C10.7835 0 10 0.783502 10 1.75C10 2.7165 10.7835 3.5 11.75 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Счётчик вложений: та же карточка-в-карточке, что у баланса, только
// компактная — четыре в ряд, число крупно, без иконки и шеврона.
function CountCard({ value, label, onOpen }) {
  return (
    <button className="stat-card count-card" onClick={onOpen}>
      <span className="count-value">{value}</span>
      <span className="stat-label">{label}</span>
    </button>
  );
}

// Вкладки профиля: «Сведения» — вся анкета, остальные — то, что было
// «Общим с вами», только прямо на экране, без перехода.
const TABS = [
  { id: 'info', label: 'Сведения' },
  { id: 'media', label: 'Медиа' },
  { id: 'files', label: 'Файлы' },
  { id: 'links', label: 'Ссылки' },
  { id: 'groups', label: 'Общие группы' },
];

export default function PersonProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, onScroll] = useScrolled();
  const { id, employee, background } = location.state || {};
  const p = getPerson(id, employee);

  const [closing, setClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [screenMenu, setScreenMenu] = useState(false);
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

  const onMenuPick = (mid) => {
    setMenuOpen(false);
    if (mid === 'mute') setToast('Уведомления отключены');
    if (mid === 'search') setToast('Поиск по переписке');
    if (mid === 'share') setToast('Контакт скопирован');
  };

  const actions = [
    { id: 'write', label: 'Написать', Icon: ChatCircle, onClick: write },
    { id: 'call', label: 'Звонок', Icon: Phone, onClick: () => setToast(`Звоним: ${p.name}`) },
    { id: 'thanks', label: 'Рахмет', Icon: Heart, onClick: () => setToast('Рахмет отправлен') },
    { id: 'more', label: 'Ещё', Icon: DotsThreeAction, onClick: () => setMenuOpen(true) },
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
                  <span className="quick-ico"><Icon size={20} weight="fill" /></span>
                  <span className="quick-label">{label}</span>
                </button>
              ))}
            </div>

            <div className="pp-tabs no-scrollbar">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`cp-tab ${tab === t.id ? 'active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </ProfileHero>

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
            <section className="pcard pcard--flush">
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

      {menuOpen && (
        <ActionSheet items={MENU_ITEMS} onClose={() => setMenuOpen(false)} onPick={onMenuPick} />
      )}
      <ScreenMenu open={screenMenu} onClose={() => setScreenMenu(false)} />
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
