// Keep menu actions aligned with what the chat handlers can actually perform.
export function messageMenuCapabilities(message, mine) {
  const text = typeof message.text === 'string' ? message.text.trim() : '';
  const textKind = !message.kind || message.kind === 'text' || message.kind === 'link';
  return {
    edit: mine === true && textKind && !message.profile,
    copy: Boolean(message.profile || text),
  };
}
