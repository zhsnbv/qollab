import { useEffect, useRef, useState } from 'react';
import { Smiley, HandWaving, PawPrint, Orange, Basketball, Car, Lightbulb, Heart, Flag, MagnifyingGlass, X } from '@phosphor-icons/react';
import { categories, allEmoji } from './emojiData';
import usePickerGesture from './usePickerGesture';
const icons = [Smiley, HandWaving, PawPrint, Orange, Basketball, Car, Lightbulb, Heart, Flag];

export default function EmojiPicker({ autoFocus = true, selected, onSelect, onClose, onMove, closing, platform, initialQuery = '', initialCategory = 'faces', messageText = 'Коллеги, макеты готовы.' }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const root = useRef(null);
  const scroll = useRef(null);
  const gesture = usePickerGesture({ platform, root, onMove, onClose, closing });
  const current = categories.find(item => item.id === category);
  const normalized = query.trim().toLocaleLowerCase('ru');
  const items = normalized ? allEmoji.filter(item => `${item.name} ${item.emoji}`.includes(normalized)) : current.items;

  useEffect(() => {
    if (!autoFocus) return;
    const previous = document.activeElement;
    root.current?.querySelector('[aria-label="Закрыть пикер"]')?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [autoFocus]);
  useEffect(() => { scroll.current?.scrollTo(0, 0); }, [category, query]);

  const keyDown = event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const focusable = [...root.current.querySelectorAll('button, input')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.target.classList.contains('rp-emoji') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      const buttons = [...root.current.querySelectorAll('.rp-emoji')];
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[event.key];
      const next = Math.max(0, Math.min(buttons.length - 1, buttons.indexOf(event.target) + delta));
      event.preventDefault(); buttons[next]?.focus();
    }
  };
  return <section ref={root} className={`rp-picker rp-picker--${platform} ${gesture.className} ${closing ? 'is-closing' : ''}`} style={gesture.style} role="dialog" aria-modal={platform === 'mobile'} aria-label="Все реакции" onKeyDown={keyDown} inert={closing ? true : undefined}>
    <div className="rp-picker-top" {...gesture.handlers}>
      {platform === 'mobile' && <div className="rp-handle" aria-hidden="true" />}
      <header className="rp-picker-head"><h2>Реакции</h2><button aria-label="Закрыть пикер" onClick={onClose}><X size={20} /></button></header>
      {platform === 'mobile' && <p className="rp-message-context">К сообщению «{messageText.length > 28 ? `${messageText.slice(0, 28)}…` : messageText}»</p>}
    </div>
    <div className="rp-search"><MagnifyingGlass size={20} /><input aria-label="Поиск эмодзи" placeholder="Поиск эмодзи" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={16} /></button>}</div>
    <div className="rp-categories" aria-label="Категории эмодзи">{categories.map((item, i) => { const Icon = icons[i]; return <button key={item.id} aria-label={item.title} title={item.title} aria-pressed={!normalized && category === item.id} onClick={() => { setCategory(item.id); setQuery(''); }}><Icon size={22} /></button>; })}</div>
    <div className="rp-picker-content" ref={scroll}>
      <div className="rp-grid-title" aria-live="polite">{normalized ? `Результаты поиска · ${items.length}` : current.title}</div>
      {items.length ? <div className="rp-emoji-grid" aria-label="Эмодзи">{items.map(item => <button key={item.emoji} className={`rp-emoji ${selected === item.emoji ? 'is-selected' : ''}`} aria-label={`${item.emoji} ${item.name}${selected === item.emoji ? ', ваша реакция' : ''}`} title={item.name} aria-pressed={selected === item.emoji} onClick={() => onSelect(item.emoji)}><span>{item.emoji}</span></button>)}</div> : <div className="rp-empty"><MagnifyingGlass size={32} /><strong>Ничего не найдено</strong><p>Попробуйте другое слово<br />или выберите категорию</p></div>}
    </div>
    <footer className="rp-picker-foot">{selected ? <><span>{selected}</span> Ваша реакция · нажмите ещё раз, чтобы убрать</> : 'Выберите эмодзи, чтобы поставить реакцию'}</footer>
    {platform === 'mobile' && <div className="rp-home-indicator" aria-hidden="true" />}
  </section>;
}
