import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, Play, FileText, LinkSimple } from '@phosphor-icons/react';
import { userProfiles, groupProfiles } from '../data/chatProfiles';
import './ChatProfile.css';
import { useScrolled } from '../utils/useScrolled';
import { PROFILE_V2 } from '../config';

// Профиль из чата (Figma node 25110-107882). Один экран на два случая:
// человек — тап по шапке личного чата и по аватарке в группе; группа — тап по
// шапке группового чата. Отличается только состав вкладок и пара полей,
// поэтому разводим флагом, а не двумя почти одинаковыми экранами.
// Иконки действий — те же SVG, что в макете (fluent, залиты #EF7F1A).
const ACTIONS_USER = [
  { id: 'call', label: 'Звонок', ico: 'call' },
  { id: 'profile', label: 'Профиль', ico: 'person' },
  { id: 'mute', label: 'Звук', ico: 'bell' },
  { id: 'search', label: 'Поиск', ico: 'search' },
  { id: 'more', label: 'Ещё', ico: 'more' },
];

const ACTIONS_GROUP = [
  { id: 'mute', label: 'Звук', ico: 'bell' },
  { id: 'search', label: 'Поиск', ico: 'search' },
  { id: 'more', label: 'Ещё', ico: 'more' },
];

function Avatar({ item, size }) {
  const style = { width: size, height: size };
  if (item.avatar || item.img) {
    return <span className="cp-ava" style={style}><img src={item.avatar || item.img} alt="" /></span>;
  }
  return (
    <span className={`cp-ava cp-ava--initials tint-${item.tint || 'orange'}`} style={style}>
      {item.initials}
    </span>
  );
}

export default function ChatProfile() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const location = useLocation();
  // sharedOnly — экран открыт как список вложений из объединённого профиля:
  // шапка и реквизиты там уже показаны, поэтому оставляем только вкладки.
  const { id, kind, employee, tab: startTab, sharedOnly } = location.state || {};
  const isGroup = kind === 'group';
  const known = isGroup ? groupProfiles[id] : userProfiles[id];
  const fromEmployee = employee && {
    ...employee,
    status: employee.dismissed ? 'Сотрудник уволен' : 'был(-а) в сети недавно',
    // Медиа, файлы и ссылки в прототипе общие — берём набор из демо-профиля
    groups: userProfiles.ayazhan.groups,
    media: userProfiles.ayazhan.media,
    files: userProfiles.ayazhan.files,
    links: userProfiles.ayazhan.links,
  };
  const p = known || fromEmployee || userProfiles.ayazhan;

  const [closing, setClosing] = useState(false);
  // У группы первая вкладка — участники, у человека — его группы
  const tabs = isGroup
    ? [{ id: 'members', label: 'Участники' }, { id: 'media', label: 'Медиа' }, { id: 'files', label: 'Файлы' }, { id: 'links', label: 'Ссылки' }]
    : [{ id: 'groups', label: 'Группы' }, { id: 'media', label: 'Медиа' }, { id: 'files', label: 'Файлы' }, { id: 'links', label: 'Ссылки' }];
  const [tab, setTab] = useState(startTab && tabs.some((t) => t.id === startTab) ? startTab : tabs[0].id);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  // Участник группы открывается объединённым профилем — тем же экраном, что
  // из чата и из поиска.
  const openUser = (userId) => navigate(PROFILE_V2 ? '/person' : '/chat-profile', {
    state: { id: userId, kind: 'user', background: location.state?.background },
    replace: !PROFILE_V2,
  });

  return (
    <div className={`chatprofile ${closing ? 'closing' : ''}`}>
      <header className={`cp-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="cp-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="cp-title">
          {sharedOnly ? `Общее с ${p.name.split(' ')[0]}` : (isGroup ? 'Группа' : 'Профиль')}
        </h1>
        <span className="cp-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="cp-scroll" onScroll={onScroll}>
        {!sharedOnly && (<>
        <section className="cp-card cp-hero">
          <Avatar item={p} size={100} />
          <h2 className="cp-name">{p.name}</h2>
          <p className="cp-status">{isGroup ? `${p.membersCount} участника` : p.status}</p>

          <div className="cp-actions">
            {(isGroup ? ACTIONS_GROUP : ACTIONS_USER).map(({ id: aid, label, ico }) => (
              <button className="cp-action" key={aid}>
                <span className="cp-action-ico">
                  <img src={`/img/chat-profile/${ico}.svg`} alt="" width="20" height="20" />
                </span>
                <span className="cp-action-label">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cp-card">
          {isGroup ? (
            <div className="cp-field cp-field--last">
              <div className="cp-field-label">Описание</div>
              <div className="cp-field-value cp-field-value--wrap">{p.description}</div>
            </div>
          ) : (
            <>
              <div className="cp-field">
                <div className="cp-field-label">Должность</div>
                <div className="cp-field-value">{p.role}</div>
              </div>
              <div className="cp-field cp-field--last">
                <div className="cp-field-label">Мобильный телефон</div>
                <div className="cp-field-value cp-field-value--link">{p.phone}</div>
              </div>
            </>
          )}
        </section>
        </>)}

        {/* Один блок: пилюли и их содержимое — участники группы тоже вкладка,
            а не отдельная карточка выше */}
        <section className="cp-card">
          <div className="cp-tabs no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`cp-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'members' && (
            <div className="cp-rows">
              {p.members.map((m) => (
                <button className="cp-row" key={m.id} onClick={() => openUser(m.id)}>
                  <Avatar item={userProfiles[m.id] || m} size={36} />
                  <span className="cp-row-texts">
                    <span className="cp-row-title">{m.name}</span>
                    <span className="cp-row-sub">{m.role}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {tab === 'groups' && (
            <div className="cp-rows">
              {p.groups.map((g) => (
                <div className="cp-row" key={g.id}>
                  <Avatar item={g} size={36} />
                  <span className="cp-row-texts"><span className="cp-row-title">{g.name}</span></span>
                </div>
              ))}
            </div>
          )}

          {tab === 'media' && (
            <div className="cp-media">
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
          )}

          {tab === 'files' && (
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
          )}

          {tab === 'links' && (
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
          )}
        </section>

        <div className="cp-bottom-spacer" />
      </div>
    </div>
  );
}
