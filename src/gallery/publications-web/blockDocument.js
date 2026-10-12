export const isBlockDocument = value => value?.format === 'blocknote' && Array.isArray(value.blocks);

const inlineText = content => typeof content === 'string' ? content : Array.isArray(content)
  ? content.map(item => item.type === 'link' ? inlineText(item.content) : item.text || '').join('') : '';

export function documentText(value) {
  if (!isBlockDocument(value)) return value?.ops?.map(op => typeof op.insert === 'string' ? op.insert : '').join('') || '';
  const text = blocks => blocks.map(block => [
    block.type === 'table' ? block.content.rows.map(row => row.cells.map(cell => inlineText(Array.isArray(cell) ? cell : cell.content)).join('\t')).join('\n') : inlineText(block.content),
    block.props?.caption || '',
    text(block.children || []),
  ].filter(Boolean).join('\n')).join('\n');
  return text(value.blocks);
}

export function documentHasContent(value) {
  if (documentText(value).trim()) return true;
  if (!isBlockDocument(value)) return !!value?.ops?.some(op => typeof op.insert === 'object' && op.insert);
  const hasMedia = blocks => blocks.some(block => !!block.props?.url || block.type === 'divider' || hasMedia(block.children || []));
  return hasMedia(value.blocks);
}

const auditHeadings = new Set(['Охрана труда', 'Производственная система', 'Из диалога с сотрудником', 'Положительные моменты', 'Зоны улучшений', 'Зоны для улучшений', 'Обратная связь лидера']);

// Preserve Quill's inline formatting, line attributes, media and list nesting.
// Existing stored Deltas remain untouched until the user actually edits text.
export function legacyDeltaToBlocks(value, kind) {
  if (isBlockDocument(value)) return structuredClone(value.blocks);
  const blocks = [];
  let content = [];
  const append = (block, indent = 0) => {
    let siblings = blocks;
    for (let depth = 0; depth < Math.min(indent, 8) && siblings.length; depth++) {
      const parent = siblings.at(-1);
      siblings = parent.children ||= [];
    }
    siblings.push(block);
  };
  const line = (attrs = {}) => {
    let type = 'paragraph';
    const props = {};
    if (attrs.header) { type = 'heading'; props.level = Number(attrs.header); }
    else if (attrs.list) { type = attrs.list === 'ordered' ? 'numberedListItem' : ['checked', 'unchecked'].includes(attrs.list) ? 'checkListItem' : 'bulletListItem'; if (type === 'checkListItem') props.checked = attrs.list === 'checked'; }
    else if (attrs.blockquote) type = 'quote';
    else if (attrs['code-block']) type = 'codeBlock';
    else if (kind === 'audit' && auditHeadings.has(inlineText(content).trim().replace(/:$/, ''))) { type = 'heading'; props.level = 2; }
    if (attrs.align) props.textAlignment = attrs.align;
    append({ type, props, content }, Number(attrs.indent) || 0);
    content = [];
  };
  for (const op of value?.ops || []) {
    const attrs = op.attributes || {};
    if (typeof op.insert !== 'string') {
      if (content.length) line();
      if (op.insert?.image) append({ type: 'image', props: { url: op.insert.image } });
      if (op.insert?.video) append({ type: 'embed', props: { url: op.insert.video } });
      continue;
    }
    const styles = {};
    for (const key of ['bold', 'italic', 'underline', 'strike', 'code']) if (attrs[key]) styles[key] = true;
    if (attrs.color) styles.textColor = attrs.color;
    if (attrs.background) styles.backgroundColor = attrs.background;
    if (attrs.size) styles.fontSize = attrs.size;
    const parts = op.insert.split('\n');
    parts.forEach((part, i) => {
      if (part) {
        const text = { type: 'text', text: part, styles: { ...styles } };
        content.push(attrs.link ? { type: 'link', href: attrs.link, content: [text] } : text);
      }
      if (i < parts.length - 1) line(attrs);
    });
  }
  if (content.length) line();
  return blocks.length ? blocks : [{ type: 'paragraph', content: [] }];
}
