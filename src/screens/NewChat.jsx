import { useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight20Regular, Search24Regular, Dismiss12Regular,
  Info24Regular, PeopleAdd24Regular, Organization24Filled,
  Whiteboard24Regular, PersonAdd24Regular, Search24Filled,
} from '@fluentui/react-icons';
import { searchEmployees } from '../data/employees';
import './NewChat.css';
import { useScrolled } from '../utils/useScrolled';
import { PROFILE_V2 } from '../config';

// «Написать сообщение» (Figma node 25122-109360): два состояния одного экрана —
// пустой поиск с подсказкой и список найденных сотрудников. Тап по строке
// открывает чат с человеком, тап по «i» — его профиль.
function Person({ e, onOpen, onInfo }) {
  const avatar = e.avatar
    ? <span className="nc-ava"><img src={e.avatar} alt="" /></span>
    : <span className={`nc-ava nc-ava--initials tint-${e.tint || 'grey'}`}>{e.initials}</span>;

  return (
    <div className={`nc-row ${e.dismissed ? 'dismissed' : ''}`}>
      <button className="nc-row-main" onClick={() => !e.dismissed && onOpen(e)} disabled={e.dismissed}>
        {avatar}
        <span className="nc-texts">
          <span className="nc-line">
            <span className="nc-name">{e.name}</span>
            {e.company && <span className="nc-company">• {e.company}</span>}
          </span>
          <span className="nc-line nc-line--sub">
            {e.dismissed
              ? <span className="nc-sub">Сотрудник уволен</span>
              : <><span className="nc-sub">{e.phone}</span><span className="nc-sub">• {e.role}</span></>}
          </span>
        </span>
      </button>
      <button className="nc-info" onClick={() => onInfo(e)} aria-label={`О сотруднике: ${e.name}`}>
        <Info24Regular />
      </button>
    </div>
  );
}

export default function NewChat() {
  const [scrolled, onScroll] = useScrolled();
  const navigate = useNavigate();
  const location = useLocation();
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState('');
  const found = searchEmployees(query);

  const close = () => {
    setClosing(true);
    setTimeout(() => navigate(-1), 260);
  };

  // Чат с сотрудником — тот же экран личной переписки, что и из списка чатов
  const openChat = (e) => navigate('/chats/dm', {
    state: {
      chat: { title: e.name, avatar: e.avatar, initials: e.initials, tint: e.tint, profileId: e.id, fresh: true },
      background: location.state?.background,
    },
  });

  const openInfo = (e) => navigate(PROFILE_V2 ? '/person' : '/chat-profile', {
    state: { id: e.id, kind: 'user', employee: e, background: location.state?.background },
  });

  return (
    <div className={`newchat ${closing ? 'closing' : ''}`}>
      <header className={`nc-top ${scrolled ? 'hdr-shadow' : ''}`}>
        <button className="nc-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="nc-title">Написать сообщение</h1>
        <span className="nc-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="nc-search-row">
        <div className="nc-search">
          <Search24Regular className="nc-search-ico" />
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Поиск по ФИ, Тел, Должность"
            enterKeyHint="search"
            autoFocus
          />
          {query && (
            <button className="nc-clear" onClick={() => setQuery('')} aria-label="Очистить">
              <Dismiss12Regular />
            </button>
          )}
        </div>
        <button className="nc-struct" aria-label="Оргструктура"><Organization24Filled /></button>
      </div>

      <button className="nc-group">
        <span className="nc-group-ico"><PeopleAdd24Regular /></span>
        <span className="nc-group-label">Создать группу</span>
        <ChevronRight20Regular className="nc-chevron" />
      </button>

      <div className="nc-scroll" onScroll={onScroll}>
        {found.length === 0 && (
          <div className="nc-empty">
            <div className="nc-empty-icons">
              <span className="nc-empty-circle nc-empty-circle--side"><Whiteboard24Regular /></span>
              <span className="nc-empty-circle nc-empty-circle--main"><PersonAdd24Regular /></span>
              <span className="nc-empty-circle nc-empty-circle--side"><Search24Filled /></span>
            </div>
            <p className="nc-empty-title">Поиск собеседника</p>
            <p className="nc-empty-sub">
              Для поиска введите в поиск имя, должность, предприятие или номер телефона собеседника
            </p>
          </div>
        )}

        {found.map((e) => (
          <Person key={e.id} e={e} onOpen={openChat} onInfo={openInfo} />
        ))}

        <div className="nc-bottom-spacer" />
      </div>
    </div>
  );
}
