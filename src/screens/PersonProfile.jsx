import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, CaretRight, ChatCircle, Phone, Heart, DotsThree,
  FileText, ImageSquare, LinkSimple, UsersThree,
} from '@phosphor-icons/react';
import {
  Alert24Regular, Search24Regular, Share24Regular, PersonProhibited24Regular,
} from '@fluentui/react-icons';
import { DotsIcon } from '../components/TopBar';
import { getPerson } from '../data/person';
import { useScrolled } from '../utils/useScrolled';
import ProfileHero from '../components/ProfileHero';
import ActionSheet from '../components/ActionSheet';
import Toast from '../components/Toast';
import './Profile.css';
import './PersonProfile.css';

// Профиль коллеги: та же вёрстка, что у своего профиля (карточки .pcard,
// плитки .stat-card, строки .org-row), только состав другой — вместо личных
// блоков переписка. Экран один: из чата, поиска, участников группы.
const MENU_ITEMS = [
  { id: 'mute', label: 'Отключить звук', Icon: Alert24Regular },
  { id: 'search', label: 'Поиск по переписке', Icon: Search24Regular },
  { id: 'share', label: 'Поделиться контактом', Icon: Share24Regular },
  { id: 'block', label: 'Заблокировать', Icon: PersonProhibited24Regular, danger: true },
];

// Счётчик вложений: та же карточка-в-карточке, что у баланса, только
// компактная — четыре в ряд, без шеврона.
function CountCard({ Icon, value, label, onOpen }) {
  return (
    <button className="stat-card count-card" onClick={onOpen}>
      <span className="stat-icon"><Icon size={18} weight="fill" color="var(--color-primary)" /></span>
      <span className="count-value">{value}</span>
      <span className="stat-label">{label}</span>
    </button>
  );
}

export default function PersonProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, onScroll] = useScrolled();
  const { id, employee, background } = location.state || {};
  const p = getPerson(id, employee);

  const [closing, setClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    if (mid === 'block') setToast('Пользователь заблокирован');
  };

  const actions = [
    { id: 'write', label: 'Написать', Icon: ChatCircle, onClick: write },
    { id: 'call', label: 'Звонок', Icon: Phone, onClick: () => setToast(`Звоним: ${p.name}`) },
    { id: 'thanks', label: 'Рахмет', Icon: Heart, onClick: () => setToast('Рахмет отправлен') },
    { id: 'more', label: 'Ещё', Icon: DotsThree, onClick: () => setMenuOpen(true) },
  ];

  // Пилюля показывает рабочий статус, а если его нет — присутствие: иначе
  // одна и та же строка дублировалась бы под ней.
  const status = (
    <>
      <span className={`status-btn phero-status ${p.work ? `status-btn--${p.work.kind}` : ''}`}>
        {p.work ? p.work.text : p.status}
      </span>
      {p.work && <div className="phero-presence">{p.status}</div>}
    </>
  );

  return (
    <div className={`person ${closing ? 'closing' : ''}`}>
      <header className={`pp-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="pp-back" onClick={close} aria-label="Назад"><CaretLeft size={22} /></button>
        <h1 className="pp-title">Профиль</h1>
        <button className="pp-back" onClick={() => setMenuOpen(true)} aria-label="Меню"><DotsIcon /></button>
      </header>

      <div className="pp-scroll" onScroll={onScroll}>
        <div className="profile">
          <ProfileHero me={p} status={status} />

          {/* Быстрые действия — тот же ряд плиток, что в своём профиле */}
          <div className="quick-wrap">
            <div className="quick-row">
              {actions.map(({ id: aid, label, Icon, onClick }) => (
                <button className="quick-item" key={aid} onClick={onClick}>
                  <span className="quick-ico"><Icon size={20} weight="fill" /></span>
                  <span className="quick-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Общее с вами */}
          <section className="pcard">
            <div className="pcard-head">
              <h3>Общее с вами</h3>
              <button className="refresh-btn" onClick={() => openShared('files')}>Показать всё</button>
            </div>
            <div className="count-row">
              <CountCard Icon={FileText} value={p.files.length} label="Файлы" onOpen={() => openShared('files')} />
              <CountCard Icon={ImageSquare} value={p.media.length} label="Медиа" onOpen={() => openShared('media')} />
              <CountCard Icon={LinkSimple} value={p.links.length} label="Ссылки" onOpen={() => openShared('links')} />
              <CountCard Icon={UsersThree} value={p.groups.length} label="Группы" onOpen={() => openShared('groups')} />
            </div>
          </section>

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
              <div className="data-row last">
                <div className="data-label">Интересы</div>
                <div className="tags-row">
                  {p.interests.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {menuOpen && (
        <ActionSheet items={MENU_ITEMS} onClose={() => setMenuOpen(false)} onPick={onMenuPick} />
      )}
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
