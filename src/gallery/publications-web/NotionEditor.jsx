import { useRef, useState } from 'react';
import { BlockNoteSchema, createStyleSpec, defaultStyleSpecs } from '@blocknote/core';
import { ru } from '@blocknote/core/locales';
import { filterSuggestionItems, SuggestionMenu } from '@blocknote/core/extensions';
import { BlockNoteView } from '@blocknote/ariakit';
import { createReactBlockSpec, getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote, FormattingToolbar, FormattingToolbarController, getFormattingToolbarItems } from '@blocknote/react';
import { Add20Regular, TextDescription20Regular, TextHeader120Regular, TextHeader220Regular, TextHeader320Regular, TextBulletList20Regular, TextNumberListLtr20Regular, CheckboxChecked20Regular, TextQuote20Regular, Table20Regular, Code20Regular, LineHorizontal120Regular, ChevronDown20Regular } from '@fluentui/react-icons';
import { App, Button } from 'antd';
import { documentText, legacyDeltaToBlocks } from './blockDocument';
import { videoEmbed } from './data';
import '@blocknote/ariakit/style.css';
import './NotionEditor.css';

const Embed = createReactBlockSpec({ type: 'embed', propSchema: { url: { default: '' } }, content: 'none' }, {
  render: ({ block }) => {
    const src = videoEmbed({ url: block.props.url, provider: 'youtube' }) || videoEmbed({ url: block.props.url, provider: 'vimeo' });
    return <div className="pw-inline-embed" contentEditable={false}>{src ? <iframe src={src} title="Видео в публикации" allowFullScreen loading="lazy" /> : <a href={/^https?:\/\//i.test(block.props.url) ? block.props.url : undefined} target="_blank" rel="noreferrer">{block.props.url}</a>}</div>;
  },
})();
const fontSize = createStyleSpec({ type: 'fontSize', propSchema: 'string' }, {
  render: value => { const dom = document.createElement('span'); dom.style.fontSize = { small: '.75em', large: '1.5em', huge: '2.5em' }[value] || value; return { dom, contentDOM: dom }; },
});
const schema = BlockNoteSchema.create({ styleSpecs: { ...defaultStyleSpecs, fontSize } }).extend({ blockSpecs: { embed: Embed } });
const dictionary = { ...ru, placeholders: { ...ru.placeholders, default: 'Начните писать или введите / для выбора блока', emptyDocument: 'Начните писать или введите / для выбора блока' } };
const slashIcons = { paragraph: TextDescription20Regular, heading: TextHeader120Regular, heading_2: TextHeader220Regular, heading_3: TextHeader320Regular, bullet_list: TextBulletList20Regular, numbered_list: TextNumberListLtr20Regular, check_list: CheckboxChecked20Regular, quote: TextQuote20Regular, table: Table20Regular, code_block: Code20Regular, divider: LineHorizontal120Regular, toggle_list: ChevronDown20Regular };
const hiddenCommands = new Set(['image', 'video', 'audio', 'file', 'emoji']);
function TextFormattingToolbar() {
  return <FormattingToolbar>{getFormattingToolbarItems().filter(item => item.key !== 'replaceFileButton')}</FormattingToolbar>;
}

export default function NotionEditor({ value, onChange, id, readOnly = false, kind }) {
  const initialContent = useRef(legacyDeltaToBlocks(value, kind));
  const [count, setCount] = useState(documentText(value).trim().length);
  const { message } = App.useApp();
  const mediaHint = () => message.info({ key: 'pw-editor-media', content: 'Добавляйте вложения ниже — в разделах «Медиафайлы» и «Файлы».' });
  // Keep the schema for legacy documents, but route all new media to the form.
  const editor = useCreateBlockNote({ schema, dictionary, initialContent: initialContent.current,
    pasteHandler: ({ event, editor: target, defaultPasteHandler }) => {
      if (!event.clipboardData?.files.length) return defaultPasteHandler();
      mediaHint();
      const html = event.clipboardData.getData('text/html'), text = event.clipboardData.getData('text/plain');
      if (html) target.pasteHTML(html);
      else if (text) target.pasteText(text);
      return true;
    },
    _tiptapOptions: { editorProps: {
      transformPastedHTML: html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const media = doc.querySelectorAll('img, video, audio, iframe, source, object, embed, [data-content-type="image"], [data-content-type="video"], [data-content-type="audio"], [data-content-type="file"], [data-content-type="embed"]');
        if (!media.length) return html;
        media.forEach(element => element.remove());
        mediaHint();
        return doc.body.innerHTML;
      },
      handleDOMEvents: { drop: (_view, event) => {
        if (!event.dataTransfer?.files.length) return false;
        event.preventDefault(); mediaHint(); return true;
      } },
    } },
    domAttributes: { editor: { id, role: readOnly ? 'document' : 'textbox', 'aria-label': readOnly ? 'Текст публикации' : 'Основной текст', 'aria-multiline': 'true' } },
  });
  const changed = () => {
    const document = { format: 'blocknote', version: 1, blocks: editor.document };
    setCount(documentText(document).trim().length);
    onChange?.(document);
  };
  const addBlock = () => {
    const { block } = editor.getTextCursorPosition();
    const target = block.type === 'paragraph' && !block.content?.length
      ? block
      : editor.insertBlocks([{ type: 'paragraph' }], block, 'after')[0];
    editor.setTextCursorPosition(target, 'start');
    editor.focus();
    editor.getExtension(SuggestionMenu).openSuggestionMenu('/');
  };
  return <div className={readOnly ? 'pw-notion-read' : 'pw-notion-edit'}>
    {!readOnly && <div className="pw-notion-tools"><div><Button type="text" shape="round" icon={<Add20Regular />} onClick={addBlock}>Добавить блок</Button></div><span>Быстрые команды <kbd>/</kbd></span></div>}
    <BlockNoteView editor={editor} theme="light" editable={!readOnly} onChange={readOnly ? undefined : changed} slashMenu={false} formattingToolbar={false} sideMenu={!readOnly} linkToolbar={!readOnly} filePanel={false} tableHandles={!readOnly} emojiPicker={false} comments={false}>
      {!readOnly && <FormattingToolbarController formattingToolbar={TextFormattingToolbar} />}
      {!readOnly && <SuggestionMenuController triggerCharacter="/" getItems={async query => filterSuggestionItems(getDefaultReactSlashMenuItems(editor).filter(item => !hiddenCommands.has(item.key)).map(item => { const Icon = slashIcons[item.key] || TextDescription20Regular; return { ...item, icon: <Icon /> }; }), query)} />}
    </BlockNoteView>
    {!readOnly && <div className="pw-notion-footer"><span>Выделите текст для форматирования · Перетаскивайте блоки за ⋮⋮</span><span>{count.toLocaleString('ru-RU')} символов</span></div>}
  </div>;
}
