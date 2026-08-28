import { useState } from 'react';
import { MagnifyingGlass, Archive, CaretRight } from '@phosphor-icons/react';
import SideMenu from './SideMenu';
import { ergizDialogs, ergizArchived } from '../data/ergiz';
import './ErgizHistory.css';

// История разговоров с ассистентом. Живёт в той же боковой панели, что
// рабочие сервисы: механика открытия у них одна. Архив — второй уровень
// внутри панели, а не отдельный экран: возвращаться из него нужно к списку,
// а не в чат.
export default function ErgizHistory({ open, onClose, onPick }) {
  const [archive, setArchive] = useState(false);
  const [query, setQuery] = useState('');

  const close = () => { setArchive(false); setQuery(''); onClose(); };
  const list = (archive ? ergizArchived : ergizDialogs)
    .filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <SideMenu
      open={open}
      onClose={close}
      title={archive ? 'Архив диалогов' : 'Диалоги'}
      onBack={archive ? () => setArchive(false) : undefined}
    >
      {!archive && (
        <div className="ergh-head">
          <label className="ergh-search">
            <MagnifyingGlass size={20} color="var(--color-weak)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск"
              aria-label="Поиск по диалогам"
            />
          </label>
          <button className="ergh-archive" onClick={() => setArchive(true)}>
            <Archive size={20} />
            Архив диалогов
            <CaretRight size={16} color="var(--color-light)" />
          </button>
        </div>
      )}

      {list.length > 0 && (
        <>
          {!archive && <h3 className="ergh-section">Недавние</h3>}
          {list.map((d) => (
            <button className="ergh-row" key={d.id} onClick={() => { close(); onPick?.(d); }}>
              <span className="ergh-line">
                <span className="ergh-title">{d.title}</span>
                <span className="ergh-time">{d.time}</span>
              </span>
              <span className="ergh-preview">{d.preview}</span>
            </button>
          ))}
        </>
      )}

      {!list.length && (
        <p className="ergh-empty">
          {archive
            ? 'Сюда попадают диалоги, убранные из списка. Пока таких нет.'
            : query
              ? `По запросу «${query.trim()}» ничего не нашлось`
              : 'Разговоры с ассистентом появятся здесь'}
        </p>
      )}
    </SideMenu>
  );
}
