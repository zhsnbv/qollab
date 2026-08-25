import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabLayout from '../components/TabLayout';
import { DotsIcon } from '../components/TopBar';
import ScreenMenu from '../components/ScreenMenu';
import SideMenu from '../components/SideMenu';
import ProfileHero from '../components/ProfileHero';
import {
  CaretRight, Info, ArrowsClockwise, Plus, DotsThreeVertical, SquaresFour,
  IdentificationCard, QrCode, AddressBook, Hash,
  UserFocus, Headset,
} from '@phosphor-icons/react';
import {
  ContactCard24Filled, QrCode24Filled, PersonNote24Filled, NumberSymbol24Filled,
} from '@fluentui/react-icons';
import { useSkeleton, ProfileSkeleton, FadeIn } from '../components/Skeleton';
import {
  me, quickActions, balance, myTasks, sosContacts,
  corpData, structure, indicators, interests, certificates,
} from '../data/profile';
import './PersonProfile.css';
import './Profile.css';

// Иконки быстрых действий — из Fluent, как в остальных профилях
const QUICK_ICONS = {
  IdentificationCard: ContactCard24Filled,
  QrCode: QrCode24Filled,
  AddressBook: PersonNote24Filled,
  Hash: NumberSymbol24Filled,
};
const TASK_ICONS = { UserFocus, Headset };

// Плитка со значением: эмодзи или картинка + число + подпись
function StatCard({ value, label, emoji, img }) {
  return (
    <button className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">
          {img ? <img src={img} alt="" className="stat-icon-img" /> : emoji}
        </span>
        <span className="stat-value">{value}</span>
        <CaretRight size={18} color="var(--color-light)" />
      </div>
      <div className="stat-label">{label}</div>
    </button>
  );
}

export default function Profile() {
  const loading = useSkeleton();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const open = (path) => navigate(path, { state: { background: location } });

  const topbar = (
    <header className="topbar">
      <button className="topbar-btn" aria-label="Настройки" onClick={() => open('/settings')}>
        <img src="/img/profile/settings.svg" alt="" width="20" height="20" />
      </button>
      <div className="topbar-actions">
        <button className="topbar-btn topbar-btn--muted" aria-label="Рабочие сервисы" onClick={() => setMenu(true)}>
          <SquaresFour size={20} weight="fill" />
        </button>
        <button className="topbar-btn" aria-label="Меню" onClick={() => setMenuOpen(true)}><DotsIcon /></button>
      </div>
    </header>
  );

  if (loading) {
    return <TabLayout topbar={topbar}><ProfileSkeleton /></TabLayout>;
  }

  return (
    <>
    <TabLayout topbar={topbar}>
      <FadeIn><div className="profile">
        <ProfileHero me={me} onPhoto={() => open('/profile/photo')}>
          {/* Быстрые действия — в том же блоке, что аватар: общий фон */}
          <div className="pp-actions">
            {quickActions.map(({ id, label, icon }) => {
              const Icon = QUICK_ICONS[icon];
              return (
                <button className="quick-item" key={id}>
                  <span className="quick-ico">{Icon && <Icon />}</span>
                  <span className="quick-label">{label}</span>
                </button>
              );
            })}
          </div>
        </ProfileHero>

        {/* Баланс */}
        <section className="pcard">
          <div className="pcard-head">
            <h3>Баланс</h3>
            <span className="pcard-note">Этот блок виден только вам</span>
          </div>
          <div className="stat-grid">
            {balance.map((b) => <StatCard key={b.id} {...b} />)}
          </div>
        </section>

        {/* Мои задачи */}
        <section className="pcard">
          <div className="pcard-head">
            <h3>Мои задачи</h3>
            <button className="refresh-btn"><ArrowsClockwise size={12} />Обновить</button>
          </div>
          <div className="task-grid">
            {myTasks.map((t) => {
              const Icon = TASK_ICONS[t.icon];
              return (
                <button className={`task-card ${t.wide ? 'wide' : ''}`} key={t.id}>
                  <span className="task-top">
                    <span className="task-title">{t.title}</span>
                    <CaretRight size={12} color="var(--color-light)" />
                  </span>
                  <span className="task-value">{t.value}</span>
                  <span className="task-source">{Icon && <Icon size={16} />}{t.source}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SOS-контакты */}
        <section className="pcard">
          <div className="pcard-head">
            <h3>SOS-контакты</h3>
            <button className="refresh-btn"><Plus size={12} weight="bold" />Добавить контакт</button>
          </div>
          <div className="sos-list">
            {sosContacts.map((c) => (
              <div className="sos-row" key={c.id}>
                <div className="sos-line">
                  <span className="sos-name">{c.name}</span>
                  <span className="sos-tag">{c.tag}</span>
                  <button className="sos-more" aria-label="Действия"><DotsThreeVertical size={16} weight="bold" /></button>
                </div>
                <span className="sos-phone">{c.phone}</span>
                {c.note && <span className="sos-note">{c.note}</span>}
              </div>
            ))}
          </div>
          <p className="sos-hint">SOS-контакты не видны другим сотрудникам — только вам, руководителю, HR и СБ.</p>
        </section>

        {/* Корпоративные данные */}
        <section className="pcard">
          <div className="pcard-head">
            <h3>Корпоративные данные</h3>
            <button className="refresh-btn"><ArrowsClockwise size={12} />Обновить</button>
          </div>
          <div className="data-list">
            {corpData.map((d, i) => (
              <div className={`data-row ${i === corpData.length - 1 ? 'last' : ''}`} key={d.label}>
                <div className="data-label">{d.label}</div>
                <div className="data-value-line">
                  <span className={`data-value ${d.link ? 'link' : ''}`}>{d.value}</span>
                  {d.tag && <span className="data-tag">{d.tag}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Структура: руководитель и команда */}
        <section className="pcard">
          <div className="pcard-head"><h3>Структура</h3></div>
          <div className="org-label">Руководитель</div>
          <button className="org-row">
            <span className="org-avatar">{structure.supervisor.initials}</span>
            <span className="org-texts">
              <span className="org-name">{structure.supervisor.name}</span>
              <span className="org-role">{structure.supervisor.role}</span>
            </span>
            <CaretRight size={18} color="var(--color-light)" />
          </button>

          <div className="org-label">Моя команда · {structure.teamCount}</div>
          {structure.team.map((m) => (
            <button className="org-row" key={m.initials}>
              <span className="org-avatar">{m.initials}</span>
              <span className="org-texts">
                <span className="org-name">{m.name}</span>
                <span className="org-role">{m.role}</span>
              </span>
              <CaretRight size={18} color="var(--color-light)" />
            </button>
          ))}
          <button className="org-more">
            Показать ещё {structure.teamCount - structure.team.length}
            <CaretRight size={16} />
          </button>
        </section>

        {/* Мои показатели */}
        <section className="pcard">
          <div className="pcard-head"><h3>Мои показатели</h3></div>
          <div className="stat-grid">
            {indicators.map((b) => <StatCard key={b.id} {...b} />)}
          </div>
        </section>

        {/* Персональные данные */}
        <section className="pcard">
          <div className="pcard-head"><h3>Персональные данные</h3></div>
          <div className="data-list">
            <div className="data-row">
              <div className="data-label">Мобильный номер</div>
              <span className="data-value link">{me.phone}</span>
            </div>
            <div className="data-row">
              <div className="data-label">Электронная почта</div>
              <span className="data-value link">{me.email}</span>
            </div>
            <div className="data-row">
              <div className="data-label">Обо мне</div>
              <p className="data-about">{me.about}</p>
              <button className="data-more">Показать больше...</button>
            </div>
            <div className="data-row last">
              <div className="data-label">Мои интересы</div>
              <div className="tags-row">
                {interests.map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* Мои сертификаты */}
        <section className="pcard">
          <div className="pcard-head">
            <h3>Мои сертификаты</h3>
            <button className="refresh-btn">Показать все</button>
            <Info size={20} weight="fill" color="var(--color-light)" />
          </div>
          {certificates.map((c) => (
            <div className="cert-card" key={c.id}>
              <div className="cert-head">
                <img src="/img/profile/certificate.svg" alt="" width="32" height="32" />
                <div className="cert-texts">
                  <b>{c.title}</b>
                  <span>{c.sub}</span>
                </div>
              </div>
              <div className="cert-dates">
                <div>
                  <div className="data-label">Дата начала</div>
                  <span className="data-value">{c.from}</span>
                </div>
                <div>
                  <div className="data-label">Срок действия</div>
                  <span className="data-value">{c.to}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div></FadeIn>
    </TabLayout>
    {/* Вне TabLayout: внутри .scroll-area панель обрезалась бы его
        переполнением и ездила вместе с контентом. */}
    <SideMenu open={menu} onClose={() => setMenu(false)} />
    <ScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
