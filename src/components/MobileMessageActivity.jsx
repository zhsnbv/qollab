import { useEffect, useRef } from 'react';
import { CaretLeft, CaretRight, Checks, HeartStraight } from '@phosphor-icons/react';
import { compactActivityTime } from './messageActivityModel';

const formatTime = (value, activity) => compactActivityTime(value, activity.now, activity.timeZone);

export function MobileActivitySummary({ activity, onOpen }) {
  return <>
    {activity.personalReadAt && <div className="mma-summary mma-summary--static" aria-label={'Прочитано: ' + formatTime(activity.personalReadAt, activity)}><Checks size={18} aria-hidden="true" /><span>{formatTime(activity.personalReadAt, activity)}</span></div>}
    {activity.label && <button className="mma-summary" onClick={onOpen} aria-label={activity.label}>
      {activity.reactionCount ? <HeartStraight size={18} aria-hidden="true" /> : <Checks size={18} aria-hidden="true" />}
      <span>{activity.label}</span><CaretRight size={14} aria-hidden="true" />
    </button>}
  </>;
}

export function MobileActivityScreen({ activity, onBack, capture = false }) {
  const back = useRef(null);
  useEffect(() => { if (!capture) back.current?.focus({preventScroll:true}); }, [capture]);
  const combined = activity.reactionCount > 0 && !activity.personal && activity.readCount > 0;
  return <section className="mma-screen" aria-label={activity.title}>
    <header className="mma-header"><button ref={back} onClick={onBack} aria-label="Назад в чат"><CaretLeft size={24} /></button><h1>{activity.title}</h1><span aria-hidden="true" /></header>
    <div className="mma-scroll" tabIndex={0} aria-label="Участники">
      <h2>{activity.reactionCount ? 'Участники' : 'Прочитали'} <span>{activity.people.length}</span></h2>
      <ul>{activity.people.map(person => <li key={person.userId}>
        <span className="mma-avatar">{person.avatar ? <img src={person.avatar} alt="" /> : person.initials || person.name.split(' ').slice(0,2).map(word => word[0]).join('')}</span>
        <div className="mma-person"><strong>{person.name}</strong>
          {person.readAt && <time dateTime={person.readAt}>{combined ? 'Прочитано · ' : ''}{formatTime(person.readAt, activity)}</time>}
          {person.reactedAt && <time dateTime={person.reactedAt}>{combined ? 'Реакция · ' : ''}{formatTime(person.reactedAt, activity)}</time>}
        </div>
        {person.emoji ? <span className="mma-emoji" aria-label={'Реакция ' + person.emoji}>{person.emoji}</span> : <Checks size={18} className="mma-read-icon" aria-label="Прочитано" />}
      </li>)}</ul>
    </div>
  </section>;
}
