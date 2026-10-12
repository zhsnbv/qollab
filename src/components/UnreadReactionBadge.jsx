import { Heart } from '@phosphor-icons/react';
import './UnreadReactionBadge.css';

export default function UnreadReactionBadge({ active, className = '' }) {
  if (!active) return null;
  return <span className={`chat-badge chat-reaction-badge ${className}`.trim()} role="img" aria-label="Непрочитанные реакции">
    <Heart size={12} weight="fill" aria-hidden="true" />
  </span>;
}
