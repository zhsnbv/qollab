import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { isBlockDocument } from './blockDocument';

const NotionEditor = lazy(() => import('./NotionEditor'));

// Same Quill version and toolbar groups as the production publication form.
const toolbar = [[{ size: ['small', false, 'large', 'huge'] }, { header: 1 }, { header: 2 }, 'bold', 'italic', 'underline', 'strike', 'blockquote', { list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }, 'link', 'image', 'video', 'clean']];
function LegacyRichEditor({ value, onChange, id, readOnly = false }) {
  const host = useRef(null), editor = useRef(null), change = useRef(onChange);
  const initial = useRef(value);
  const [count, setCount] = useState(0);
  change.current = onChange;
  useEffect(() => {
    const container = host.current;
    const el = document.createElement('div');
    container.appendChild(el);
    const q = new Quill(el, { theme: 'snow', readOnly, placeholder: 'Напишите описание', modules: { toolbar: readOnly ? false : toolbar } });
    q.root.id = id;
    q.root.setAttribute('role', readOnly ? 'document' : 'textbox');
    q.root.setAttribute('aria-label', readOnly ? 'Текст публикации' : 'Основной текст');
    q.root.setAttribute('aria-multiline', 'true');
    if (!readOnly) {
      const labels = { header: 'Заголовок', bold: 'Полужирный', italic: 'Курсив', underline: 'Подчёркнутый', strike: 'Зачёркнутый', blockquote: 'Цитата', list: 'Список', indent: 'Отступ', link: 'Ссылка', image: 'Изображение', video: 'Видео', clean: 'Очистить форматирование' };
      container.querySelectorAll('.ql-toolbar button').forEach(button => {
        const type = button.className.replace('ql-', '');
        button.setAttribute('aria-label', (labels[type] || type) + (button.value ? ' ' + button.value : ''));
        button.title = button.getAttribute('aria-label');
      });
    }
    q.setContents(initial.current || { ops: [{ insert: '\n' }] });
    setCount(q.getText().trim().length);
    const onText = (_delta, _old, source) => { setCount(q.getText().trim().length); if (source === 'user') change.current?.(q.getContents()); };
    q.on('text-change', onText);
    editor.current = q;
    return () => { q.off('text-change', onText); editor.current = null; container.replaceChildren(); };
  }, [id, readOnly]);
  return <div className={readOnly ? 'pw-rich-read' : 'pw-rich-edit'}><div ref={host} />{!readOnly && <div className="pw-rich-count">{count} символов</div>}</div>;
}

export default function RichEditor(props) {
  if (props.readOnly && !isBlockDocument(props.value)) return <LegacyRichEditor {...props} />;
  return <div className="pw-block-editor"><Suspense fallback={<div className="pw-editor-loading">{props.readOnly ? 'Загрузка текста…' : 'Загрузка редактора…'}</div>}><NotionEditor {...props} /></Suspense></div>;
}
