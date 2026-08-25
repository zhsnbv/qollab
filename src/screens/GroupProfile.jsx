import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, CaretRight, FileText, LinkSimple, Play } from '@phosphor-icons/react';
import {
  WalkieTalkie24Filled, Search24Filled, SignOut24Filled,
  Alert24Filled, AlertOff24Filled, Mention24Filled,
} from '@fluentui/react-icons';
import { groupProfiles, userProfiles } from '../data/chatProfiles';
import { useScrolled } from '../utils/useScrolled';
import { DotsIcon } from '../components/TopBar';
import ProfileHero from '../components/ProfileHero';
import ScreenMenu from '../components/ScreenMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import ActionSheet from '../components/ActionSheet';
import Toast from '../components/Toast';
import { PROFILE_V2 } from '../config';
import './Profile.css';
import './ChatProfile.css';
import './PersonProfile.css';

// Профиль группы — по той же схеме, что профиль коллеги: шапка с действиями и
// вкладками одним блоком, ниже карточки. Отличается набор: вместо рахмета
// «Покинуть», а к вкладкам добавляются участники.
const TABS = [
  { id: 'members', label: 'Участники' },
  { id: 'media', label: 'Медиа' },
  { id: 'files', label: 'Файлы' },
  { id: 'links', label: 'Ссылки' },
];

// У группы звук не переключатель, а три режима — выбираем листом снизу
const SOUND_MODES = [
  { id: 'on', label: 'Включить звук', Icon: Alert24Filled },
  { id: 'mentions', label: 'Только упоминания', Icon: Mention24Filled },
  { id: 'off', label: 'Выключить звук', Icon: AlertOff24Filled, danger: true },
];
const SOUND_ICON = { on: Alert24Filled, mentions: Mention24Filled, off: AlertOff24Filled };
const SOUND_TOAST = {
  on: 'Уведомления включены',
  mentions: 'Уведомления только при упоминании',
  off: 'Уведомления отключены',
};

function MemberAvatar({ item }) {
  if (item.avatar || item.img) {
    return <span className="pp-group-ava"><img src={item.avatar || item.img} alt="" /></span>;
  }
  return (
    <span className={`pp-group-ava tint-${item.tint || 'orange'}`}>
      {item.initials || item.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
    </span>
  );
}

export default function GroupProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, onScroll] = useScrolled();
  const { id, background } = location.state || {};
  const g = groupProfiles[id] || groupProfiles.prodev;

  const [closing, setClosing] = useState(false);
  const [screenMenu, setScreenMenu] = useState(false);
  const [sound, setSound] = useState('on');
  const [soundOpen, setSoundOpen] = useState(false);
  const [tab, setTab] = useState('members');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [toast, setToast] = useState('');

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 240);
  };

  // Участника открываем объединённым профилем — тем же экраном, что из чата
  const openMember = (memberId) => navigate(PROFILE_V2 ? '/person' : '/chat-profile', {
    state: { id: memberId, kind: 'user', background },
  });

  const pickSound = (mode) => {
    setSound(mode);
    setSoundOpen(false);
    setToast(SOUND_TOAST[mode]);
  };

  const actions = [
    // Подпись постоянная, режим читается по иконке: колокольчик, @ или зачёркнутый
    { id: 'sound', label: 'Звук', Icon: SOUND_ICON[sound], onClick: () => setSoundOpen(true) },
    { id: 'walkie', label: 'Рация', Icon: WalkieTalkie24Filled, onClick: () => setToast('Рация включена') },
    { id: 'search', label: 'Поиск', Icon: Search24Filled, onClick: () => setToast('Поиск по переписке') },
    { id: 'leave', label: 'Покинуть', Icon: SignOut24Filled, danger: true, onClick: () => setConfirmLeave(true) },
  ];

  const hero = {
    name: g.name,
    avatar: g.avatar,
    initials: g.initials,
    role: `${g.membersCount} участника`,
  };

  return (
    <div className={`person ${closing ? 'closing' : ''}`}>
      <header className={`pp-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="pp-back" onClick={close} aria-label="Назад"><CaretLeft size={22} /></button>
        <h1 className="pp-title">Группа</h1>
        <button className="pp-back" onClick={() => setScreenMenu(true)} aria-label="Меню"><DotsIcon /></button>
      </header>

      <div className="pp-scroll" onScroll={onScroll}>
        <div className="profile">
          <ProfileHero
            me={hero}
            status={<span className="phero-presence">{g.privacy === 'private' ? 'Приватная группа' : 'Открытая группа'}</span>}
          >
            <div className="pp-actions">
              {actions.map(({ id: aid, label, Icon, onClick, danger }) => (
                <button className="quick-item" key={aid} onClick={onClick}>
                  <span className={`quick-ico ${danger ? 'quick-ico--danger' : ''}`}><Icon /></span>
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

          {tab === 'members' && (<>
            <section className="pcard">
              <div className="pcard-head"><h3>Ссылка-приглашение</h3></div>
              <div className="data-list">
                <div className="data-row last">
                  <p className="data-about">{g.description}</p>
                  <button className="data-more" onClick={() => setToast('Ссылка скопирована')}>Скопировать</button>
                </div>
              </div>
            </section>

            <section className="pcard">
              <div className="pcard-head">
                <h3>Участники</h3>
                <span className="pcard-note">{g.membersCount}</span>
              </div>
              <div className="cp-rows">
                {g.members.map((m) => (
                  <button className="cp-row" key={m.id} onClick={() => openMember(m.id)}>
                    <MemberAvatar item={userProfiles[m.id] || m} />
                    <span className="cp-row-texts">
                      <span className="cp-row-title">{m.name}</span>
                      <span className="cp-row-sub">{m.role}</span>
                    </span>
                    <CaretRight size={18} color="var(--color-light)" />
                  </button>
                ))}
              </div>
            </section>
          </>)}

          {tab === 'media' && (
            <section className="pcard pcard--flush">
              <div className="pp-media">
                {g.media.map((m) => (
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
                {g.files.map((f) => (
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
                {g.links.map((l) => (
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
        </div>
      </div>

      {confirmLeave && (
        <ConfirmDialog
          title="Покинуть группу?"
          text={`Вы выйдете из «${g.name}». Переписка останется в архиве.`}
          confirmLabel="Покинуть"
          danger
          onConfirm={() => { setConfirmLeave(false); setToast('Вы покинули группу'); }}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
      {soundOpen && (
        <ActionSheet
          title="Уведомления группы"
          items={SOUND_MODES}
          onClose={() => setSoundOpen(false)}
          onPick={pickSound}
        />
      )}
      <ScreenMenu open={screenMenu} onClose={() => setScreenMenu(false)} />
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
