import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CaretLeft, CaretRight, MagnifyingGlass, X, Info,
  UsersThree, NotePencil, UserPlus,
} from '@phosphor-icons/react';
import { searchEmployees } from '../data/employees';
import './NewChat.css';

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
        <Info size={20} />
      </button>
    </div>
  );
}

export default function NewChat() {
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
      chat: { title: e.name, avatar: e.avatar, initials: e.initials, tint: e.tint, profileId: e.id },
      background: location.state?.background,
    },
  });

  const openInfo = (e) => navigate('/chat-profile', {
    state: { id: e.id, kind: 'user', employee: e, background: location.state?.background },
  });

  return (
    <div className={`newchat ${closing ? 'closing' : ''}`}>
      <header className="nc-top">
        <button className="nc-back" onClick={close} aria-label="Назад"><CaretLeft size={24} /></button>
        <h1 className="nc-title">Написать сообщение</h1>
        <span className="nc-back hdr-spacer" aria-hidden="true" />
      </header>

      <div className="nc-search-row">
        <div className="nc-search">
          <MagnifyingGlass size={20} color="var(--color-weak)" />
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Поиск по ФИ, Тел, Должн..."
            enterKeyHint="search"
            autoFocus
          />
          {query && (
            <button className="nc-clear" onClick={() => setQuery('')} aria-label="Очистить">
              <X size={12} weight="bold" />
            </button>
          )}
        </div>
        <button className="nc-struct" aria-label="Оргструктура"><UsersThree size={20} /></button>
      </div>

      <button className="nc-group">
        <span className="nc-group-ico"><UsersThree size={24} weight="fill" /></span>
        <span className="nc-group-label">Создать группу</span>
        <CaretRight size={16} color="var(--color-light)" />
      </button>

      <div className="nc-scroll">
        {found.length === 0 && (
          <div className="nc-empty">
            <div className="nc-empty-icons">
              <span className="nc-empty-circle nc-empty-circle--side"><NotePencil size={20} color="var(--color-weak)" /></span>
              <span className="nc-empty-circle nc-empty-circle--main"><UserPlus size={28} weight="fill" color="var(--color-primary)" /></span>
              <span className="nc-empty-circle nc-empty-circle--side"><MagnifyingGlass size={20} color="var(--color-weak)" /></span>
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
