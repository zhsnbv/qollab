import { useState } from 'react';
import { Search24Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { employees } from '../data/employees';
import './ForwardSheet.css';

// «Выберите чат» — пересылка сообщения. Сверху активные чаты, ниже поиск по
// справочнику: тот же набор данных, что в «Написать сообщение».
const ACTIVE = [
  { id: 'ergiz', name: 'ERGiz — Искусственный интеллект', avatar: '/img/chats/ergiz-avatar.png' },
  { id: 'bugs', name: 'qollab Bugs & Offers', initials: 'QB', tint: 'violet' },
  { id: 'prodev', name: 'PR01DEV + ROBOTS', avatar: '/img/chats/bts-pr.png' },
  { id: 'redesign', name: 'Редизайн qollab app & web', initials: 'PQ', tint: 'green' },
  { id: 'mobile', name: 'mobile dev', initials: 'MD', tint: 'green' },
  { id: 'ayazhan', name: 'Аяжан Сериккызы', avatar: '/img/chats/ayazhan.png' },
];

const norm = (s) => (s || '').toLowerCase();

export default function ForwardSheet({ onClose, onPick }) {
  const [query, setQuery] = useState('');
  const q = norm(query.trim());

  const active = q ? ACTIVE.filter((c) => norm(c.name).includes(q)) : ACTIVE;
  const people = q
    ? employees.filter((e) => !e.dismissed && (norm(e.name).includes(q) || norm(e.role).includes(q)))
    : [];

  const row = (item) => (
    <button className="fwd-row" key={item.id} onClick={() => onPick(item)}>
      {item.avatar
        ? <span className="fwd-ava"><img src={item.avatar} alt="" /></span>
        : <span className={`fwd-ava fwd-ava--initials tint-${item.tint || 'orange'}`}>{item.initials || item.name.slice(0, 2).toUpperCase()}</span>}
      <span className="fwd-name">{item.name}</span>
    </button>
  );

  return (
    <div className="fwd-wrap">
      <button className="fwd-scrim" onClick={onClose} aria-label="Закрыть" />
      <div className="fwd-sheet">
        <span className="fwd-handle" />
        <div className="fwd-header">
          <h3 className="fwd-title">Выберите чат</h3>
          <button className="fwd-close" onClick={onClose} aria-label="Закрыть"><Dismiss20Regular /></button>
        </div>

        <div className="fwd-search-wrap">
          <div className="fwd-search">
            <Search24Regular className="fwd-search-ico" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по ФИ, Тел, Должность"
            />
          </div>
        </div>

        <div className="fwd-body">
          {active.length > 0 && (
            <>
              <div className="fwd-section">Активные чаты</div>
              {active.map(row)}
            </>
          )}
          {people.length > 0 && (
            <>
              <div className="fwd-section">Глобальный поиск</div>
              {people.map(row)}
            </>
          )}
          {active.length === 0 && people.length === 0 && (
            <p className="fwd-empty">Ничего не найдено</p>
          )}
        </div>
      </div>
    </div>
  );
}
