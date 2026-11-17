import { Check, Checks, Clock, WarningCircle } from '@phosphor-icons/react';
import { messageDeliveryState } from '../utils/messageDelivery';
import './MessageDeliveryStatus.css';

const ICONS = { clock: Clock, 'single-check': Check, 'double-check': Checks, warning: WarningCircle };

export default function MessageDeliveryStatus({ status, size, className = '', decorative = false }) {
  const state = messageDeliveryState(status);
  const Icon = ICONS[state.icon];
  return <span className={`message-delivery-status ${className}`.trim()} data-delivery-state={state.id} data-delivery-tone={state.tone} role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : state.label} aria-hidden={decorative || undefined}>
    <Icon size={size || state.size} aria-hidden="true" focusable="false" />
  </span>;
}
