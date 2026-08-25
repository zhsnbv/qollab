import { useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search24Regular, Dismiss12Regular, Info24Regular,
  SearchInfo24Filled,
} from '@fluentui/react-icons';
import { useScrolled } from '../utils/useScrolled';
import { searchEmployees } from '../data/employees';
import { recentPeople, searchMessages, splitMatch } from '../data/chatSearch';
import './ChatSearch.css';
import { PROFILE_V2 } from '../config';

// Поиск в чатах (Figma node 25122-109552): пустой экран с недавними и историей,
// две вкладки результатов — «Чаты» (люди) и «Сообщения» (текст с подсветкой
// совпадения), плюс состояние «ничего не найдено».
function Highlight({ text, query }) {
  return splitMatch(text, query).map((part, i) => (
    part.hit ? <mark className="cs-hit" key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>
  ));
}

function Avatar({ item, size = 40 }) {
  const style = { width: size, height: size };
  if (item.avatar) return <span className="cs-ava" style={style}><img src={item.avatar} alt="" /></span>;
  return (
    <span className={`cs-ava cs-ava--initials tint-${item.tint || 'grey'}`} style={style}>
      {item.initials || (item.name || '').slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function ChatSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, onScroll] = useScrolled();
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('chats');
  // История поиска живёт только в рамках сессии — бэка у прототипа нет
  const [history, setHistory] = useState(() => searchEmployees('а').slice(0, 4));

  const people = searchEmployees(query);
  // «Активные» — те, с кем чат уже заведён: у них есть карточка в демо-данных
  const activeIds = new Set(['nurlan-ibragimov', 'aizhan-serikkyzy', 'daniyar-kenzhebaev', 'erlan-abishev']);
  const activePeople = people.filter((e) => activeIds.has(e.id));
  const globalPeople = people.filter((e) => !activeIds.has(e.id));
  const messages = searchMessages(query);
  const active = query.trim().length > 0;
  const nothing = active && (tab === 'chats' ? people.length === 0 : messages.length === 0);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  const openChat = (e) => navigate('/chats/dm', {
    state: {
      chat: { title: e.name, avatar: e.avatar, initials: e.initials, tint: e.tint, profileId: e.id, fresh: true },
      background: location.state?.background,
    },
  });

  const openInfo = (e) => navigate(PROFILE_V2 ? '/person' : '/chat-profile', {
    state: { id: e.id, kind: 'user', employee: e, background: location.state?.background },
  });

  const personRow = (e) => (
    <div className={`cs-row ${e.dismissed ? 'dismissed' : ''}`} key={e.id}>
      <button className="cs-row-main" onClick={() => !e.dismissed && openChat(e)} disabled={e.dismissed}>
        <Avatar item={e} />
        <span className="cs-texts">
          <span className="cs-line">
            <span className="cs-name">{e.name}</span>
            {e.company && <span className="cs-company">• {e.company}</span>}
          </span>
          <span className="cs-line cs-line--sub">
            {e.dismissed
              ? <span className="cs-sub">Сотрудник уволен</span>
              : <><span className="cs-sub">{e.phone}</span><span className="cs-sub">• {e.role}</span></>}
          </span>
        </span>
      </button>
      <button className="cs-info" onClick={() => openInfo(e)} aria-label={`О сотруднике: ${e.name}`}>
        <Info24Regular />
      </button>
    </div>
  );

  return (
    <div className={`chatsearch ${closing ? 'closing' : ''}`}>
      <header className={`cs-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="cs-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="cs-title">Поиск</h1>
        <span className="cs-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="cs-search-wrap">
        <div className="cs-search">
          <Search24Regular className="cs-search-ico" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по ФИ, Тел, Должность"
            enterKeyHint="search"
            autoFocus
          />
          {query && (
            <button className="cs-clear" onClick={() => setQuery('')} aria-label="Очистить">
              <Dismiss12Regular />
            </button>
          )}
        </div>
      </div>

      {active && (
        <div className="cs-tabs">
          <button className={`cs-tab ${tab === 'chats' ? 'active' : ''}`} onClick={() => setTab('chats')}>Чаты</button>
          <button className={`cs-tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>Сообщения</button>
        </div>
      )}

      <div className="cs-scroll" onScroll={onScroll}>
        {!active && (
          <>
            <div className="cs-recent no-scrollbar">
              {recentPeople.map((p) => (
                <button className="cs-recent-item" key={p.id} onClick={() => setQuery(p.name)}>
                  <Avatar item={p} size={56} />
                  <span className="cs-recent-name">{p.name}</span>
                </button>
              ))}
            </div>

            <div className="cs-history-head">
              <span>История поиска</span>
              <button className="cs-clear-history" onClick={() => setHistory([])}>Очистить</button>
            </div>
            {history.map(personRow)}
            {history.length === 0 && <p className="cs-history-empty">История пуста</p>}
          </>
        )}

        {active && tab === 'chats' && (
          <>
            {activePeople.length > 0 && (
              <>
                <div className="cs-section">Активные чаты</div>
                {activePeople.map(personRow)}
              </>
            )}
            {globalPeople.length > 0 && (
              <>
                <div className="cs-section">Глобальный поиск</div>
                {globalPeople.map(personRow)}
              </>
            )}
          </>
        )}

        {active && tab === 'messages' && messages.map((m) => (
          <button className="cs-msg" key={m.id} onClick={() => setQuery(m.chat)}>
            <Avatar item={m} />
            <span className="cs-texts">
              <span className="cs-line">
                <span className="cs-name">{m.chat}</span>
                <span className="cs-time">{m.time}</span>
              </span>
              <span className="cs-msg-text">
                {m.prefix && <span className="cs-sub">{m.prefix}</span>}
                <Highlight text={m.text} query={query} />
              </span>
            </span>
          </button>
        ))}

        {nothing && (
          <div className="cs-empty">
            <span className="cs-empty-ico"><SearchInfo24Filled /></span>
            <p className="cs-empty-title">Ничего не найдено</p>
            <p className="cs-empty-sub">К сожалению мы не нашли подходящий чат или сообщение</p>
          </div>
        )}

        <div className="cs-bottom-spacer" />
      </div>
    </div>
  );
}
