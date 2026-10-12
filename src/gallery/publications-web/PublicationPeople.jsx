import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft20Filled, ChevronRight20Filled } from '@fluentui/react-icons';
import { PEOPLE } from './data';

export default function PublicationPeople({ post }) {
  const items = post.anonymous || post.type === 'news' ? [] : (post.type === 'audit'
    ? [[post.responsible, 'Ответственный'], [post.auditor, 'Аудитор']]
    : [[post.author, 'Автор публикации'], ...(post.authors || []).map(id => [id, 'Автор проекта'])]).filter(([id]) => id);
  const strip = useRef(null), track = useRef(null), trackId = useId();
  const [overflow, setOverflow] = useState(false);
  const [position, setPosition] = useState({ previous: false, next: false, first: 1, last: 1 });
  const itemsKey = items.map(([id, role]) => `${id}:${role}`).join('|');
  const updatePosition = () => {
    const element = track.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const visible = [...element.children].flatMap((child, index) => {
      const rect = child.getBoundingClientRect();
      return rect.left + rect.width / 2 >= bounds.left && rect.left + rect.width / 2 <= bounds.right ? [index + 1] : [];
    });
    const next = { previous: element.scrollLeft > 2, next: element.scrollWidth - element.clientWidth - element.scrollLeft > 2, first: visible[0] || 1, last: visible.at(-1) || 1 };
    setPosition(current => Object.keys(next).every(key => next[key] === current[key]) ? current : next);
  };
  useLayoutEffect(() => {
    const element = track.current, wrapper = strip.current;
    if (!element || !wrapper) return;
    const measure = () => {
      const children = [...element.children];
      const contentWidth = children.length ? children.at(-1).offsetLeft + children.at(-1).offsetWidth - children[0].offsetLeft : 0;
      // Compare against the whole strip, so the arrow slots cannot cause overflow by themselves.
      setOverflow(contentWidth > wrapper.clientWidth + 2);
      updatePosition();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    measure();
    return () => observer.disconnect();
  }, [itemsKey]);
  useLayoutEffect(updatePosition, [overflow]);
  if (!items.length) return null;
  const move = direction => {
    const element = track.current;
    if (!element) return;
    const width = element.children[0].offsetWidth + parseFloat(getComputedStyle(element).columnGap || '0');
    const left = direction === 'start' ? 0 : direction === 'end' ? element.scrollWidth : element.scrollLeft + direction * width;
    element.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div ref={strip} className={`pw-people-strip ${overflow ? 'is-scrollable' : ''}`}>
    {overflow && <button type="button" className="pw-people-arrow" aria-label="Предыдущие участники" aria-controls={trackId} disabled={!position.previous} onClick={() => move(-1)}><ChevronLeft20Filled /></button>}
    <div ref={track} id={trackId} className="pw-people-track" role="list" aria-label={post.type === 'audit' ? 'Участники обхода' : 'Участники проекта'} tabIndex={overflow ? 0 : undefined} onScroll={updatePosition} onKeyDown={event => {
      const direction = { ArrowLeft: -1, ArrowRight: 1, Home: 'start', End: 'end' }[event.key];
      if (direction === undefined) return;
      event.preventDefault(); event.stopPropagation(); move(direction);
    }}>
      {items.map(([id, role], index) => {
        const person = PEOPLE.find(item => item.value === id), name = person?.label || id;
        return <div className="pw-person" role="listitem" key={`${role}-${id}-${index}`}>
          {person?.avatar ? <img src={person.avatar} alt="" /> : <span className="pw-person-initials" aria-hidden="true">{person?.initials || name.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>}
          <div className="pw-person-copy"><span className="pw-person-role">{role}</span><strong className="pw-person-name" title={name}>{person?.shortLabel ? <><span aria-hidden="true">{person.shortLabel}</span><span className="pw-sr-only">{name}</span></> : name}</strong>{person?.job && <span className="pw-person-job" title={person.job}>{person.job}</span>}</div>
        </div>;
      })}
    </div>
    {overflow && <><button type="button" className="pw-people-arrow" aria-label="Следующие участники" aria-controls={trackId} disabled={!position.next} onClick={() => move(1)}><ChevronRight20Filled /></button><span className="pw-sr-only" aria-live="polite" aria-atomic="true">Участники {position.first}{position.last !== position.first ? `–${position.last}` : ''} из {items.length}</span></>}
  </div>;
}
