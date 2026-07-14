import TabLayout from '../components/TabLayout';
import { DotsIcon } from '../components/TopBar';
import { CaretRight, Info, ArrowsClockwise } from '@phosphor-icons/react';
import { useSkeleton, ProfileSkeleton, FadeIn } from '../components/Skeleton';
import './Profile.css';

// Данные из Figma-макета Screens (Type=Profile). Ассеты — public/img/profile.
const balance = [
  { icon: <img src="/img/profile/erg-coin.png" alt="" className="stat-icon-img" />, value: '5 200', label: 'ERG Coins' },
  { icon: '🏝️', value: '21', label: 'Баланс отпусков' },
  { icon: '🏥', value: '51 550 ₸', label: 'Мед. страховка' },
  { icon: '🍕', value: '12 540 ₸', label: 'Кошелек питания' },
];

const indicators = [
  { icon: '🏆', value: '84%', label: 'Манифест' },
  { icon: '🙂', value: '21', label: 'Благодарность' },
  { icon: <img src="/img/profile/pumpkin.png" alt="" className="stat-icon-img" />, value: '1', label: 'Тыква' },
  { icon: '🍉', value: '25', label: 'Арбуз' },
];

const corpData = [
  { label: 'Табельный номер', value: '16002874', tag: 'Основной' },
  { label: 'Предприятие', value: 'ТОО “BTS”' },
  { label: 'Должность', value: 'Руководитель проекта' },
  { label: 'Подразделение', value: 'Управление продуктовой разработки' },
  { label: 'Административный руководитель', value: 'Айдар Султанбек', link: true },
];

const interests = ['Баскетбол', 'Кино', 'Музыка', 'Путешествия', 'Видеоигры'];

function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-value">{value}</span>
        <CaretRight size={18} color="var(--color-light)" />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Profile() {
  const loading = useSkeleton();
  const topbar = (
    <header className="topbar">
      <button className="topbar-btn" aria-label="Настройки">
        <img src="/img/profile/settings.svg" alt="" width="20" height="20" />
      </button>
      <div className="topbar-actions">
        <button className="topbar-btn" aria-label="Меню"><DotsIcon /></button>
        <button className="qr-btn"><img src="/img/profile/qr.svg" alt="" width="20" height="20" />Мой QR</button>
      </div>
    </header>
  );

  if (loading) {
    return <TabLayout topbar={topbar}><ProfileSkeleton /></TabLayout>;
  }

  return (
    <TabLayout topbar={topbar}>
      <FadeIn><div className="profile">
        {/* Шапка: оранжевая волна проходит за аватаром и карточками уровня/ранга */}
        <section className="profile-hero">
          <img className="profile-decor" src="/img/profile/header-decor.png" alt="" />
          <div className="profile-head">
            <div className="profile-avatar-wrap">
              <img className="profile-avatar" src="/img/profile/avatar-photo.png" alt="" />
              <span className="profile-avatar-cam">
                <img src="/img/profile/camera.svg" alt="" width="16" height="16" />
              </span>
            </div>
            <h2 className="profile-name">Алуа Мырзахметова</h2>
            <div className="profile-role">Руководитель проекта</div>
          </div>
          <div className="gamify-row no-scrollbar">
            <div className="gamify-card gamify-card--level">
              <div className="gamify-title">Уровень вашего профиля</div>
              <div className="gamify-line">
                <b>Lv. 4</b>
                <Info size={16} color="var(--color-weak)" />
                <b className="gamify-pct">36%</b>
              </div>
              <div className="gamify-bar"><span className="gamify-bar-fill level" style={{ width: '36%' }} /></div>
            </div>
            <div className="gamify-card gamify-card--rank">
              <div className="gamify-title">Ваш ранг в qollab</div>
              <div className="gamify-rank-line">
                <div className="gamify-rank-left">
                  <b>Серебряная лига</b>
                  <div className="gamify-bar"><span className="gamify-bar-fill rank" style={{ width: '22%' }} /></div>
                </div>
                <img className="gamify-rank-badge" src="/img/profile/rank-badge.png" alt="" />
              </div>
            </div>
          </div>
        </section>

        {/* Мои профили */}
        <div className="profiles-row-wrap">
          <button className="profiles-row">
            <span className="profiles-row-icon"><img src="/img/profile/user.svg" alt="" width="16" height="16" /></span>
            <span className="profiles-row-title">Мои профили</span>
            <CaretRight size={18} color="var(--color-light)" />
          </button>
        </div>

        {/* Баланс */}
        <section className="pcard">
          <div className="pcard-head">
            <h3>Баланс</h3>
            <span className="pcard-note">Этот блок виден только вам</span>
          </div>
          <div className="stat-grid">
            {balance.map((b) => <StatCard key={b.label} {...b} />)}
          </div>
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

        {/* Мои показатели */}
        <section className="pcard">
          <div className="pcard-head"><h3>Мои показатели</h3></div>
          <div className="stat-grid">
            {indicators.map((b) => <StatCard key={b.label} {...b} />)}
          </div>
        </section>

        {/* Персональные данные */}
        <section className="pcard">
          <div className="pcard-head"><h3>Персональные данные</h3></div>
          <div className="data-list">
            <div className="data-row">
              <div className="data-label">Мобильный номер</div>
              <span className="data-value link">+7 700 757 88 99</span>
            </div>
            <div className="data-row">
              <div className="data-label">Электронная почта</div>
              <span className="data-value link">alua.myrzahmetova@erg.kz</span>
            </div>
            <div className="data-row">
              <div className="data-label">Обо мне</div>
              <p className="data-about">
                Как проектный менеджер, я увлечена аналитикой и вниманием к деталям. Мне нравится
                находить простые решения для сложных задач, развивать команды и постоянно учиться
                новому. В своей работе я ценю структуру, результат и гармонию.
              </p>
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
        <section className="pcard pcard--last">
          <div className="pcard-head">
            <h3>Мои сертификаты</h3>
            <Info size={20} weight="fill" color="var(--color-light)" />
          </div>
          <div className="cert-card">
            <div className="cert-head">
              <img src="/img/profile/certificate.svg" alt="" width="32" height="32" />
              <div className="cert-texts">
                <b>Курсы Compliance</b>
                <span>Конфликт интересов (2023 РСС)</span>
              </div>
            </div>
            <div className="cert-dates">
              <div>
                <div className="data-label">Дата начала</div>
                <span className="data-value">2024-11-14</span>
              </div>
              <div>
                <div className="data-label">Срок действия</div>
                <span className="data-value">9999-12-31</span>
              </div>
            </div>
          </div>
        </section>
      </div></FadeIn>
    </TabLayout>
  );
}
