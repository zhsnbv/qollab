import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import { ChevronDown20Regular } from '@fluentui/react-icons';
import ActionSheet from '../components/ActionSheet';
import ProfileTabs from '../components/ProfileTabs';
import { me, corpData } from '../data/profile';
import { useScrolled } from '../utils/useScrolled';
import './Settings.css';
import './IdCard.css';

const TABS = [
  { id: 'must', label: 'Обязательное обучение' },
  { id: 'corp', label: 'Корпоративное обучение' },
];

const STATUSES = [
  { id: 'all', label: 'Все' },
  { id: 'done', label: 'Пройдено' },
  { id: 'active', label: 'В процессе' },
  { id: 'expired', label: 'Просрочено' },
];

const tabNumber = corpData.find((d) => d.label === 'Табельный номер')?.value || '';
const company = corpData.find((d) => d.label === 'Предприятие')?.value || '';

// Моя ID-карта: карточка сотрудника и документы об обучении. Заголовок экрана
// свой, а не «Профиль»: человек ушёл с вкладки и должен видеть, где он.
export default function IdCard() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [tab, setTab] = useState('must');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('all');
  const [statusSheet, setStatusSheet] = useState(false);
  const [applied, setApplied] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const reset = () => { setCourse(''); setStatus('all'); setApplied(false); };
  const statusLabel = STATUSES.find((s) => s.id === status)?.label;

  return (
    <div className={`settings ${closing ? 'closing' : ''}`}>
      <header className={`st-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="st-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="st-title">Моя ID карта</h1>
        <span className="st-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="st-scroll" onScroll={onScroll}>
        <section className="pcard idc-head">
          <img className="idc-photo" src={me.avatar} alt="" />
          <div className="idc-texts">
            <h2 className="idc-name">{me.name}</h2>
            <div className="idc-line">Профиль ID: {tabNumber}</div>
            <div className="idc-line">{company}</div>
          </div>
        </section>

        <ProfileTabs tabs={TABS} value={tab} onChange={setTab} />

        <section className="pcard idc-filter">
          <label className="idc-field">
            <span className="idc-label">Наименование курса</span>
            <input
              className="idc-input"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Введите наименование"
            />
          </label>

          <div className="idc-field">
            <span className="idc-label">Статус</span>
            <button className="idc-input idc-select" onClick={() => setStatusSheet(true)}>
              {statusLabel}
              <ChevronDown20Regular />
            </button>
          </div>

          <div className="idc-actions">
            <button className="idc-btn" onClick={reset}>Сбросить</button>
            <button className="idc-btn idc-btn--primary" onClick={() => setApplied(true)}>Применить</button>
          </div>
        </section>

        {/* Пустое состояние объясняет, откуда возьмутся документы: их заводит
            не человек, а система обучения. */}
        <p className="idc-empty">
          {applied || course
            ? 'По этим условиям документов не нашлось'
            : 'Документы об обучении появятся здесь после того, как вы пройдёте курс'}
        </p>

        <div className="st-bottom-spacer" />
      </div>

      {statusSheet && (
        <ActionSheet
          title="Статус"
          items={STATUSES}
          selected={status}
          onClose={() => setStatusSheet(false)}
          onPick={(id) => { setStatus(id); setStatusSheet(false); }}
        />
      )}
    </div>
  );
}
