import { useEffect, useId, useRef, useState } from 'react';
import SheetTop from './SheetTop';
import useSheetSwipe from '../utils/useSheetSwipe';
import { Search24Regular, Dismiss20Regular, Bookmark20Filled, Link24Regular, Checkmark20Regular, Send20Regular } from '@fluentui/react-icons';
import { searchShareRecipients } from '../utils/sharing';
import ProfileShareCard from './ProfileShareCard';
import './ForwardSheet.css';

export default function ForwardSheet({ onClose, onPick, payload, shareUrl, preview = {} }) {
  const swipe = useSheetSwipe(onClose);
  const [query, setQuery] = useState(preview.query || '');
  const [selected, setSelected] = useState(preview.selected || null);
  const [copied, setCopied] = useState(!!preview.copied);
  const [copyError, setCopyError] = useState(false);
  const [sending, setSending] = useState(false);
  const sheetRef = useRef(null), closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  const { chats, people } = searchShareRecipients(query);
  const isProfile = !!payload?.profile;
  const title = isProfile ? 'Поделиться профилем' : payload ? 'Переслать сообщение' : 'Выберите чат';
  useEffect(() => {
    // Board frames remain scrollable without grabbing focus or trapping Tab.
    if (preview.capture) return;
    const previous = document.activeElement;
    const sheet = sheetRef.current;
    sheet?.focus({ preventScroll: true });
    const key = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const focusable = [...sheet.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === sheet)) { event.preventDefault(); first?.focus(); }
    };
    sheet?.addEventListener('keydown', key);
    return () => { sheet?.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [preview.capture]);
  const copy = async () => {
    setCopyError(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch { setCopyError(true); setCopied(false); }
  };
  const row = item => <button className={`fwd-row ${selected?.id === item.id ? 'is-selected' : ''}`} key={item.id} aria-pressed={selected?.id === item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)}>
    {item.saved ? <span className="fwd-ava fwd-ava--saved"><Bookmark20Filled /></span> : item.avatar ? <span className="fwd-ava"><img src={item.avatar} alt="" /></span> : <span className={`fwd-ava fwd-ava--initials tint-${item.tint || 'orange'}`}>{item.initials || item.name.split(' ').slice(0, 2).map(word => word[0]).join('')}</span>}
    <span className="fwd-person"><span className="fwd-name">{item.name}</span>{item.role && <small>{item.role}</small>}</span>
    <span className="fwd-radio" aria-hidden="true">{selected?.id === item.id && <Checkmark20Regular />}</span>
  </button>;
  return <div className="fwd-wrap">
    <button className="fwd-scrim" onClick={onClose} aria-label="Закрыть выбор получателя" tabIndex={-1} />
    <div ref={sheetRef} className={`fwd-sheet ${swipe.className}`} style={swipe.style} role={preview.capture ? 'region' : 'dialog'} aria-modal={preview.capture ? undefined : true} aria-labelledby={titleId} tabIndex={-1}>
      <SheetTop onClose={onClose} swipe={swipe}><h3 className="fwd-title" id={titleId}>{title}</h3></SheetTop>
      {(payload || shareUrl) && <div className="fwd-preview">{payload && (isProfile ? <ProfileShareCard person={payload.profile} compact /> : <div className="fwd-message-preview"><small>{payload.forwardedFrom ? `От ${payload.forwardedFrom}` : 'Сообщение'}</small><p>{payload.text || payload.name || 'Вложение'}</p></div>)}{shareUrl && <button className={`fwd-copy ${copied ? 'is-copied' : ''}`} aria-label={copied ? 'Ссылка скопирована' : 'Скопировать ссылку'} title={copied ? 'Ссылка скопирована' : 'Скопировать ссылку'} onClick={copy}>{copied ? <Checkmark20Regular /> : <Link24Regular />}</button>}<span className="fwd-copy-status" role="status">{copied ? 'Ссылка скопирована' : ''}</span></div>}
      {copyError && <label className="fwd-copy-error">Не удалось скопировать. Выделите ссылку:<input aria-label="Ссылка для копирования" readOnly value={shareUrl} onFocus={event => event.target.select()} /></label>}
      <div className="fwd-search-wrap"><div className="fwd-search"><Search24Regular className="fwd-search-ico" /><input aria-label="Поиск получателя" value={query} onChange={event => setQuery(event.target.value)} placeholder="Имя, телефон или должность" />{query && <button aria-label="Очистить поиск" onClick={() => setQuery('')}><Dismiss20Regular /></button>}</div></div>
      <div className="fwd-body">
        {!!chats.length && <><h4 className="fwd-section">Активные чаты</h4>{chats.map(row)}</>}
        {!!people.length && <><h4 className="fwd-section">Сотрудники</h4>{people.map(row)}</>}
        {!chats.length && !people.length && <div className="fwd-empty"><Search24Regular /><strong>Никого не нашли</strong><p>Проверьте имя, телефон или попробуйте другую должность.</p><button onClick={() => setQuery('')}>Сбросить поиск</button></div>}
      </div>
      {(payload || shareUrl) && <footer className="fwd-footer">
        <button className="fwd-send" disabled={!selected || sending} onClick={async () => { setSending(true); try { await onPick(selected); } finally { setSending(false); } }}><Send20Regular />{sending ? 'Отправляем…' : 'Отправить'}</button>
      </footer>}
      {!payload && !shareUrl && selected && <footer className="fwd-footer"><button className="fwd-send" onClick={() => onPick(selected)}><Send20Regular />Переслать</button></footer>}
    </div>
  </div>;
}
