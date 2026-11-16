import { ChevronRight20Regular } from '@fluentui/react-icons';
import './ProfileShareCard.css';

export default function ProfileShareCard({ person, onOpen, compact = false }) {
  const content = <><span className="share-person-avatar">{person.avatar ? <img src={person.avatar} alt="" /> : person.initials || person.name.split(' ').slice(0, 2).map(word => word[0]).join('')}</span><span className="share-person-info"><small>Профиль сотрудника</small><strong>{person.name}</strong>{!compact && person.role && <span>{person.role}</span>}</span>{!compact && <ChevronRight20Regular className="share-person-chevron" />}</>;
  return onOpen ? <button className={`share-person-card ${compact ? 'is-compact' : ''}`} onClick={onOpen} aria-label={`Открыть профиль: ${person.name}`}>{content}</button> : <div className={`share-person-card ${compact ? 'is-compact' : ''}`}>{content}</div>;
}
