import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, CaretRight, FileText, LinkSimple, Play } from '@phosphor-icons/react';
import {
  Chat24Filled, Call24Filled, Heart24Filled, Search24Filled,
  Alert24Filled, AlertOff24Filled,
  PersonInfo16Regular, Image16Regular, Document16Regular, Link16Regular, People16Regular,
  Image24Filled, Document24Filled, Link24Filled, People24Filled,
} from '@fluentui/react-icons';
import { DotsIcon } from '../components/TopBar';
import ScreenMenu from '../components/ScreenMenu';
import EmptyTab from '../components/EmptyTab';
import { getPerson } from '../data/person';
import { useScrolled } from '../utils/useScrolled';
import ProfileHero from '../components/ProfileHero';
import StatusBubble from '../components/StatusBubble';
import ErgizAvatar from '../components/ErgizAvatar';
import ProfileTabs from '../components/ProfileTabs';
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
  { id: 'info', label: 'Сведения', Icon: PersonInfo16Regular },
  { id: 'media', label: 'Медиа', Icon: Image16Regular, count: (p) => p.media.length },
  { id: 'files', label: 'Файлы', Icon: Document16Regular, count: (p) => p.files.length },
  { id: 'links', label: 'Ссылки', Icon: Link16Regular, count: (p) => p.links.length },
  { id: 'groups', label: 'Общие группы', Icon: People16Regular, count: (p) => p.groups.length },
];

export default function PersonProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, onScroll] = useScrolled();
  const { id, employee, background, online, bot } = location.state || {};
  const p = getPerson(id, employee);
  // «в сети» — не строка из данных, а текущее состояние: оно приходит оттуда,
  // откуда профиль открыли. Без этого шапка чата и профиль расходились.
  // У ассистента присутствия нет вовсе — вместо него то же, что в шапке чата.
  const presence = bot ? 'AI-помощник qollab' : (online ? 'в сети' : p.status);
  // У ассистента нет анкеты: ни табельного номера, ни руководителя, ни
  // благодарностей. Вкладка «Сведения» была бы пустой, поэтому её нет,
  // и профиль открывается сразу на общем с ним.
  // «Общие группы» у ассистента тоже нет: в группы его не добавляют.
  const tabs = bot ? TABS.filter((t) => t.id !== 'info' && t.id !== 'groups') : TABS;

  const [closing, setClosing] = useState(false);
  const [screenMenu, setScreenMenu] = useState(false);
  const [muted, setMuted] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [tab, setTab] = useState(bot ? 'files' : 'info');
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
        initials: p.initials, tint: p.tint, online: !!online,
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
  // Ассистенту не звонят и не говорят «рахмет» — это не человек. Остаются
  // действия над самой перепиской.
  const actions = [
    { id: 'write', label: 'Написать', Icon: Chat24Filled, onClick: write },
    ...(bot ? [] : [
      { id: 'call', label: 'Звонок', Icon: Call24Filled, onClick: () => setToast(`Звоним: ${p.name}`) },
      { id: 'thanks', label: 'Рахмет', Icon: Heart24Filled, onClick: () => setToast('Рахмет отправлен') },
    ]),
    { id: 'search', label: 'Поиск', Icon: Search24Filled, onClick: () => setToast('Поиск по переписке') },
    { id: 'mute', label: 'Звук', Icon: muted ? AlertOff24Filled : Alert24Filled, onClick: toggleMute },
  ];

  // Профиль уволенного — тот же шаблон, но урезанный: действий над человеком,
  // которого нет в компании, не осталось, а корпоративные данные к нему уже
  // не относятся. Остаётся то, что ещё имеет смысл: как его зовут, как с ним
  // связаться вне qollab и почему всё остальное недоступно.
  if (p.dismissed) {
    return (
      <div className={`person ${closing ? 'closing' : ''}`}>
        <header className={`pp-top ${scrolled ? 'hdr-shadow' : ''}`}>
          <button className="pp-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
          <h1 className="pp-title">Профиль</h1>
        </header>

        <div className="pp-scroll" onScroll={onScroll}>
          <div className="profile">
            <ProfileHero
              me={{ ...p, role: undefined }}
              badge={<span className="sbubble sbubble--flat tone--muted">Бывший сотрудник</span>}
              presence={p.status}
            />

            {/* Та же карточка корпоративных данных, что у работающего коллеги, —
                просто из неё осталась одна доступная строка */}
            <section className="pcard">
              <div className="pcard-head"><h3>Корпоративные данные</h3></div>
              <div className="data-list">
                <div className="data-row last">
                  <div className="data-label">Мобильный телефон</div>
                  <div className="data-value-line">
                    <a className="data-value link" href={`tel:${p.phone.replace(/[^+\d]/g, '')}`}>{p.phone}</a>
                  </div>
                </div>
              </div>
            </section>

            <p className="pp-dismissed-hint">
              Пользователь больше не является сотрудником компании.
              Переписка в архиве, новые сообщения недоступны.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`person ${closing ? 'closing' : ''}`}>
      <header className={`pp-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="pp-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="pp-title">Профиль</h1>
        <button className="pp-back" onClick={() => setScreenMenu(true)} aria-label="Меню"><DotsIcon /></button>
      </header>

      <div className="pp-scroll" onScroll={onScroll}>
        <div className="profile">
          <ProfileHero
            me={p}
            /* У ассистента аватарка со своим оформлением — кольцо и значок ИИ */
            avatarNode={bot ? <ErgizAvatar size={128} /> : undefined}
            status={bot ? null : <StatusBubble status={p.work} />}
            presence={presence}
          >
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

          <ProfileTabs tabs={tabs} value={tab} onChange={setTab} data={p} />

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
              {p.media.length === 0 ? (
                <EmptyTab
                  Icon={Image24Filled}
                  title="Общих фото и видео нет"
                  text={`Вы ещё не отправляли друг другу медиа`}
                />
              ) : (
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
              )}
            </section>
          )}

          {tab === 'files' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Файлы</h3>
                <span className="pcard-note">{p.files.length}</span>
              </div>
              {p.files.length === 0 ? (
                <EmptyTab
                  Icon={Document24Filled}
                  title="Файлов пока нет"
                  text="Документы из переписки появятся здесь"
                />
              ) : (
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
            </section>
          )}

          {tab === 'links' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Ссылки</h3>
                <span className="pcard-note">{p.links.length}</span>
              </div>
              {p.links.length === 0 ? (
                <EmptyTab
                  Icon={Link24Filled}
                  title="Ссылок пока нет"
                  text="Ссылки из переписки будут собираться здесь"
                />
              ) : (
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
          )}

          {tab === 'groups' && (
            <section className="pcard">
              <div className="pcard-head">
                <h3>Общие группы</h3>
                <span className="pcard-note">{p.groups.length}</span>
              </div>
              {p.groups.length === 0 ? (
                <EmptyTab
                  Icon={People24Filled}
                  title="Общих групп нет"
                  text="Вы пока не состоите в одних и тех же группах"
                />
              ) : (
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
              )}
            </section>
          )}
        </div>
      </div>

      <ScreenMenu open={screenMenu} onClose={() => setScreenMenu(false)} />
      <Toast text={toast} onDone={() => setToast('')} />
    </div>
  );
}
