import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import {
  Chat24Regular, Call24Regular, Ribbon24Regular, MoreHorizontal24Regular,
  Alert24Regular, Search24Regular, Share24Regular, PersonProhibited24Regular,
} from '@fluentui/react-icons';
import { getPerson } from '../data/person';
import ActionSheet from '../components/ActionSheet';
import Toast from '../components/Toast';
import './PersonProfile.css';

// Объединённый профиль человека: рабочие данные и переписка на одном экране.
// Открывается одинаково из чата, поиска и оргструктуры — порядок блоков от
// точки входа не зависит.
const MENU_ITEMS = [
  { id: 'mute', label: 'Отключить звук', Icon: Alert24Regular },
  { id: 'search', label: 'Поиск по переписке', Icon: Search24Regular },
  { id: 'share', label: 'Поделиться контактом', Icon: Share24Regular },
  { id: 'block', label: 'Заблокировать', Icon: PersonProhibited24Regular, danger: true },
];

export default function PersonProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, employee, background } = location.state || {};
  const p = getPerson(id, employee);

  const [closing, setClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 240);
  };

  // Вложения открываем существующим экраном профиля чата: там уже есть вкладки
  // и вёрстка списков, дублировать её незачем.
  const openShared = (tab) => navigate('/chat-profile', {
    state: { id: p.id, kind: 'user', tab, sharedOnly: true, background },
  });

  const onMenuPick = (mid) => {
    setMenuOpen(false);
    if (mid === 'mute') setToast('Уведомления отключены');
    if (mid === 'search') setToast('Поиск по переписке');
    if (mid === 'share') setToast('Контакт скопирован');
    if (mid === 'block') setToast('Пользователь заблокирован');
  };

  const counts = [
    { id: 'files', n: p.files.length, label: 'файлов' },
    { id: 'media', n: p.media.length, label: 'медиа' },
    { id: 'links', n: p.links.length, label: 'ссылки' },
    { id: 'groups', n: p.groups.length, label: 'группы' },
  ];

  return (
    <div className={`person ${closing ? 'closing' : ''}`}>
      <header className="pp-top">
        <button className="pp-back" onClick={close} aria-label="Назад"><CaretLeft size={22} /></button>
        <h1 className="pp-title">Профиль</h1>
        <span className="pp-back" style={{ visibility: 'hidden' }} aria-hidden="true" />
      </header>

      <div className="pp-scroll">
        <section className="pp-hero">
          <span className="pp-art" aria-hidden="true" />
          <span className={`pp-ava tint-${p.tint || 'orange'}`}>
            {p.avatar ? <img src={p.avatar} alt="" /> : p.initials}
          </span>
          <h2 className="pp-name">{p.name}</h2>
          <div className="pp-role">{p.role}</div>
          {/* Чип — только рабочий статус из HR или настроек. Присутствие
              («в сети», «был(-а)…») остаётся строкой: это факт, а не статус. */}
          {p.work && (
            <span className={`pp-status pp-status--${p.work.kind}`}>
              <span className="dot" />{p.work.text}
            </span>
          )}
          <div className="pp-presence">{p.status}</div>
        </section>

        <div className="pp-actions">
          <button
            className="pp-action pp-action--primary"
            onClick={() => navigate('/chats/dm', {
              // DMChat ждёт готовую строку списка чатов, а не id человека
              state: {
                chat: {
                  profileId: p.id, title: p.name, avatar: p.avatar,
                  initials: p.initials, tint: p.tint, online: true,
                  // Переписку начинаем с чистого листа: истории у этого
                  // перехода нет, а поля превью экран ждёт обязательными.
                  fresh: true, preview: '', time: '',
                },
                background,
              },
            })}
          >
            <span className="ico"><Chat24Regular /></span>Написать
          </button>
          <button className="pp-action" onClick={() => setToast(`Звоним: ${p.name}`)}>
            <span className="ico"><Call24Regular /></span>Звонок
          </button>
          <button className="pp-action" onClick={() => setToast('Рахмет отправлен')}>
            <span className="ico"><Ribbon24Regular /></span>Рахмет
          </button>
          <button className="pp-action" onClick={() => setMenuOpen(true)}>
            <span className="ico"><MoreHorizontal24Regular /></span>Ещё
          </button>
        </div>

        {p.work && (
          <div className="pp-note">
            <span>
              {p.work.deputy ? <>{p.work.note} <b>{p.work.deputy}</b></> : p.work.note}
            </span>
            {p.work.deputy && (
              <span className="lnk" onClick={() => setToast('Открыли бы чат с замещающим')}>Написать ему</span>
            )}
          </div>
        )}

        {/* Общее с вами — счётчики: блок остаётся низким, а каждый ведёт в свой список */}
        <section className="pp-card">
          <div className="pp-card-head">
            <h3>Общее с вами</h3>
            <button className="link" onClick={() => openShared('files')}>Всё</button>
          </div>
          <div className="pp-counts">
            {counts.map((c) => (
              <button className="pp-count" key={c.id} onClick={() => openShared(c.id)}>
                <b>{c.n}</b><span>{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pp-card">
          <div className="pp-card-head"><h3>Корпоративные данные</h3></div>
          <div className="pp-field"><span className="label">Табельный номер</span><span className="value">{p.tabNumber}</span></div>
          <div className="pp-field"><span className="label">Предприятие</span><span className="value">{p.company}</span></div>
          <div className="pp-field"><span className="label">Должность</span><span className="value">{p.role}</span></div>
          <div className="pp-field"><span className="label">Подразделение</span><span className="value">{p.unit}</span></div>
        </section>

        <section className="pp-card">
          <div className="pp-card-head"><h3>Структура</h3></div>
          <button className="pp-row" onClick={() => setToast(p.supervisor.name)}>
            <span className="ini">{p.supervisor.initials}</span>
            <span className="texts"><b>{p.supervisor.name}</b><span>{p.supervisor.role}</span></span>
          </button>
          {p.team.map((m) => (
            <button className="pp-row" key={m.initials} onClick={() => setToast(m.name)}>
              <span className="ini">{m.initials}</span>
              <span className="texts"><b>{m.name}</b><span>{m.role}</span></span>
            </button>
          ))}
        </section>

        <section className="pp-card">
          <div className="pp-card-head"><h3>Показатели</h3></div>
          <div className="pp-metric">
            <span className="em">🙂</span>
            <span className="texts"><b>{p.thanks}</b><span>Благодарность</span></span>
          </div>
        </section>

        <section className="pp-card">
          <div className="pp-card-head"><h3>Персональные данные</h3></div>
          <div className="pp-field"><span className="label">Мобильный номер</span><span className="value link">{p.phone}</span></div>
          <div className="pp-field">
            <span className="label">Интересы</span>
            <span className="pp-chips">
              {p.interests.map((i) => <span className="pp-chip" key={i}>{i}</span>)}
            </span>
          </div>
        </section>

        <div className="pp-spacer" />
      </div>

      {menuOpen && (
        <ActionSheet items={MENU_ITEMS} onClose={() => setMenuOpen(false)} onPick={onMenuPick} />
      )}
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
