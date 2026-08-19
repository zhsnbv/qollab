import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, Phone, User, BellSimple, MagnifyingGlass, DotsThree,
  Play, FileText, LinkSimple,
} from '@phosphor-icons/react';
import { userProfiles, groupProfiles } from '../data/chatProfiles';
import './ChatProfile.css';

// Профиль из чата (Figma node 25110-107882). Один экран на два случая:
// человек — открывается тапом по шапке личного чата и по аватарке в группе;
// группа — тапом по шапке группового чата. Отличаются только «шапочной»
// частью, поэтому разводим их флагом, а не двумя почти одинаковыми экранами.
const TABS = [
  { id: 'groups', label: 'Группы' },
  { id: 'media', label: 'Медиа' },
  { id: 'files', label: 'Файлы' },
  { id: 'links', label: 'Ссылки' },
];

const ACTIONS_USER = [
  { id: 'call', label: 'Звонок', Icon: Phone },
  { id: 'profile', label: 'Профиль', Icon: User },
  { id: 'mute', label: 'Звук', Icon: BellSimple },
  { id: 'search', label: 'Поиск', Icon: MagnifyingGlass },
  { id: 'more', label: 'Ещё', Icon: DotsThree },
];

const ACTIONS_GROUP = [
  { id: 'mute', label: 'Звук', Icon: BellSimple },
  { id: 'search', label: 'Поиск', Icon: MagnifyingGlass },
  { id: 'more', label: 'Ещё', Icon: DotsThree },
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
  const navigate = useNavigate();
  const location = useLocation();
  const { id, kind } = location.state || {};
  const isGroup = kind === 'group';
  const p = (isGroup ? groupProfiles[id] : userProfiles[id]) || userProfiles.ayazhan;

  const [closing, setClosing] = useState(false);
  // У группы вкладки «Группы» нет — вместо неё список участников выше
  const tabs = isGroup ? TABS.filter((t) => t.id !== 'groups') : TABS;
  const [tab, setTab] = useState(tabs[0].id);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const openUser = (userId) => navigate('/chat-profile', {
    state: { id: userId, kind: 'user', background: location.state?.background },
    replace: true,
  });

  return (
    <div className={`chatprofile ${closing ? 'closing' : ''}`}>
      <header className="cp-top">
        <button className="cp-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="cp-title">{isGroup ? 'Группа' : 'Профиль'}</h1>
        <span className="cp-back" aria-hidden="true" />
      </header>

      <div className="cp-scroll">
        <section className="cp-card cp-hero">
          <Avatar item={p} size={100} />
          <h2 className="cp-name">{p.name}</h2>
          <p className="cp-status">
            {isGroup ? `${p.membersCount} участника` : p.status}
          </p>

          <div className="cp-actions">
            {(isGroup ? ACTIONS_GROUP : ACTIONS_USER).map(({ id: aid, label, Icon }) => (
              <button className="cp-action" key={aid}>
                <span className="cp-action-ico"><Icon size={20} weight="fill" /></span>
                <span className="cp-action-label">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {isGroup ? (
          <section className="cp-card">
            <div className="cp-field">
              <div className="cp-field-label">Описание</div>
              <div className="cp-field-value cp-field-value--wrap">{p.description}</div>
            </div>
          </section>
        ) : (
          <section className="cp-card">
            <div className="cp-field">
              <div className="cp-field-label">Должность</div>
              <div className="cp-field-value">{p.role}</div>
            </div>
            <div className="cp-field cp-field--last">
              <div className="cp-field-label">Мобильный телефон</div>
              <div className="cp-field-value cp-field-value--link">{p.phone}</div>
            </div>
          </section>
        )}

        {isGroup && (
          <section className="cp-card">
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
          </section>
        )}

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
                <div className="cp-row" key={f.id}>
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
