const state = (id, label, icon, size, tone = 'neutral') => Object.freeze({ id, label, icon, size, tone });

export const MESSAGE_DELIVERY_STATES = Object.freeze({
  sending: state('sending', 'Отправляется', 'clock', 12),
  sent: state('sent', 'Отправлено', 'single-check', 13),
  delivered: state('delivered', 'Доставлено', 'double-check', 15),
  read: state('read', 'Прочитано', 'double-check', 15, 'read'),
  failed: state('failed', 'Не отправлено', 'warning', 14, 'failed'),
});

// Historic messages omit status after successful delivery. An unknown value
// must never imply read or turn a failure into a read receipt.
export function messageDeliveryState(status) {
  return Object.hasOwn(MESSAGE_DELIVERY_STATES, status) ? MESSAGE_DELIVERY_STATES[status] : MESSAGE_DELIVERY_STATES.delivered;
}
