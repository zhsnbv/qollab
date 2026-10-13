import { usePublicationScenario } from '../publication-screens/ScenarioContext';
import { useEffect, useId, useRef, useState } from 'react';
import { Popover } from 'antd';
import { BotAvatar } from 'bot-avatars';
import { ArrowUp20Filled, ArrowUndo20Regular, Attach20Regular, Checkmark20Regular, ChevronDown20Regular, Dismiss20Regular, Document20Regular, History20Regular, Info20Regular, Subtract20Regular } from '@fluentui/react-icons';
import { articleSnapshot, ARTICLE_FIELDS, createArticlePrompt, normalizeArticleResult, PROJECT_KEYS } from './assistantArticle';
import { ASSISTANT_ACCEPT, MAX_FILES, readAssistantFile } from './assistantFiles';
import { generateArticleWithAiHorde } from './aiHorde';
import { documentText } from './blockDocument';
import { loadReview, saveReview } from './storage';
import { COMPANIES, PEOPLE, PHOTO_STATUSES, PROJECT_FIELDS, TYPES } from './data';
import './PublicationAssistant.css';

const emptyChat = () => ({ messages: [], files: [], input: '' });
const labels = Object.fromEntries(PROJECT_FIELDS.map(([key, label]) => [key, label]));
const fingerprint = draft => JSON.stringify({ ...articleSnapshot(draft), description: documentText(draft.description), images: draft.images?.map(({ id, caption, status }) => ({ id, caption, status })) });
const writeQueues = new Map();
function persist(key, value) {
  const next = (writeQueues.get(key) || Promise.resolve()).catch(() => {}).then(() => saveReview(value, key));
  writeQueues.set(key, next);
  next.finally(() => { if (writeQueues.get(key) === next) writeQueues.delete(key); }).catch(() => {});
  return next;
}
function Avatar({ state = 'default', size = 48 }) {
  return <span className="pw-assistant-avatar" style={{ width: size, height: size }}><BotAvatar type="hexagon" color="#ff8128" shading="plastic" face="mouth" state={state} size={size} speed={0.8} jumpEvery={14} theme="light" aria-label={state === 'working' ? 'Квилли работает' : state === 'sleeping' ? 'Квилли отдыхает' : 'Квилли готов помочь'} /></span>;
}
function ResultBody({ document }) {
  let number = 0;
  return document.blocks.map((block, index) => {
    const content = block.content.map((part, i) => part.styles?.bold ? <strong key={i}>{part.text}</strong> : part.text);
    if (block.type === 'numberedListItem') return <ol key={index} start={++number}><li>{content}</li></ol>;
    number = 0;
    if (block.type === 'bulletListItem') return <ul key={index}><li>{content}</li></ul>;
    const Tag = block.type === 'heading' ? 'h4' : block.type === 'quote' ? 'blockquote' : 'p';
    return <Tag key={index}>{content}</Tag>;
  });
}
function Result({ item, index, onApply, busy }) {
  const { patch, warnings } = item.result;
  return <article className="pw-assistant-result">
    <div className="pw-assistant-result-label"><Document20Regular /><span>Вариант {index}</span>{item.applied && <span className="pw-assistant-applied"><Checkmark20Regular />В форме</span>}</div>
    <h3>{patch.title}</h3><p>{patch.lead}</p>
    <details><summary>Вся статья <ChevronDown20Regular /></summary><div className="pw-assistant-result-body">{patch.description ? <ResultBody document={patch.description} /> : PROJECT_KEYS.map(key => patch[key] && <section key={key}><b>{labels[key] || key}</b><p>{patch[key]}</p></section>)}
      {(patch.company || patch.effect !== undefined || patch.rating !== undefined) && <div className="pw-assistant-properties">{patch.company && <p>{patch.company}</p>}{patch.effect !== undefined && <p>Эффект: {patch.effect} млн ₸</p>}{patch.rating !== undefined && <p>Оценка: {patch.rating} из 5</p>}</div>}
      {['responsible', 'auditor', 'author'].map(key => patch[key] && <p key={key}><b>{({ responsible: 'Ответственный', auditor: 'Аудитор', author: 'Автор' })[key]}:</b> {PEOPLE.find(person => person.value === patch[key])?.label}</p>)}
      {patch.authors?.map(id => <section key={id}><b>{PEOPLE.find(person => person.value === id)?.label}</b><p>{patch.dossiers?.[id] || 'Справка-досье не указана'}</p></section>)}
    </div></details>
    {!!warnings.length && <div className="pw-assistant-warnings"><b>Нужно уточнить</b><ul>{warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></div>}
    {!!item.images?.length && <div className="pw-assistant-result-images">{item.images.map(file => <img key={file.id} src={file.src} alt={file.name} />)}<span>Добавлю в медиа статьи</span></div>}
    <button type="button" className="pw-assistant-primary" disabled={busy || item.applied} onClick={() => onApply(item)}>{item.applied ? <><Checkmark20Regular />Применено</> : 'Применить к статье'}</button>
  </article>;
}
export default function PublicationAssistant({ draft, onApply, dockRaised }) {
  const scenario = usePublicationScenario();
  const historyKey = `assistant:${draft.assistantId}`;
  const infoId = useId(), infoTrigger = useRef(null);
  const [infoOpen, setInfoOpen] = useState(scenario?.assistant === 'info');
  const [chat, setChat] = useState(() => scenario ? { ...scenario.assistantChat, messages: scenario.assistantChat.messages.map(item => ({ ...item, base: fingerprint(draft) })) } : emptyChat()), [loaded, setLoaded] = useState(!!scenario);
  const [open, setOpen] = useState(!!scenario?.assistant), [hovered, setHovered] = useState(false), [unread, setUnread] = useState(false);
  const [busy, setBusy] = useState(scenario?.assistant === 'working'), [reading, setReading] = useState(false), [progress, setProgress] = useState(scenario?.assistant === 'working' ? 'Собираю статью и редактирую текст…' : '');
  const [error, setError] = useState(scenario?.assistant === 'error' ? 'Не удалось обработать материалы. Попробуйте отправить запрос ещё раз.' : ''), [storageError, setStorageError] = useState(''), [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(false), [history, setHistory] = useState(scenario?.assistant === 'history'), [confirm, setConfirm] = useState(null), [undo, setUndo] = useState(null);
  const input = useRef(null), fileInput = useRef(null), log = useRef(null), launcher = useRef(null), controller = useRef(null);
  const mounted = useRef(true), currentDraft = useRef(draft), currentOpen = useRef(open), readingLock = useRef(false);
  currentDraft.current = draft; currentOpen.current = open;
  useEffect(() => {
    if (scenario) return;
    mounted.current = true;
    let active = true;
    (writeQueues.get(historyKey) || Promise.resolve()).catch(() => {}).then(() => loadReview(historyKey)).then(saved => { if (active) { if (saved) setChat(saved); setLoaded(true); } }).catch(() => { if (active) { setStorageError('Не удалось прочитать историю. Обновите страницу, чтобы не перезаписать её.'); } });
    return () => { active = false; mounted.current = false; controller.current?.abort(); };
  }, [historyKey, scenario]);
  useEffect(() => {
    if (!loaded || scenario) return;
    const save = () => persist(historyKey, chat).then(() => { if (mounted.current) setStorageError(''); }).catch(() => { if (mounted.current) setStorageError('Не удалось сохранить историю. Проверьте свободное место на устройстве.'); });
    const timer = setTimeout(save, 300);
    return () => { clearTimeout(timer); save(); };
  }, [chat, loaded, historyKey, scenario]);
  useEffect(() => { if (open) { setUnread(false); if (!scenario) input.current?.focus(); } }, [open, scenario]);
  useEffect(() => { if (open) log.current?.scrollTo({ top: history ? 0 : log.current.scrollHeight, behavior: 'instant' }); }, [chat.messages.length, busy, open, history]);
  const close = () => { setInfoOpen(false); setOpen(false); launcher.current?.focus(); };
  const changeInput = value => { setChat(old => ({ ...old, input: value })); setNotice(''); };
  const attach = async incoming => {
    if (!loaded || busy || readingLock.current) return;
    if (chat.files.length + incoming.length > MAX_FILES) { setError('Можно добавить до пяти файлов. Уберите лишние и повторите.'); return; }
    readingLock.current = true; setReading(true); setError('');
    const added = [], errors = [];
    for (const file of incoming) { try { added.push(await readAssistantFile(file)); } catch (e) { errors.push(e.message); } }
    if (mounted.current) { setChat(old => ({ ...old, files: [...old.files, ...added] })); setError(errors.join(' ')); setReading(false); }
    readingLock.current = false;
  };
  const send = async () => {
    if (scenario) return;
    if (controller.current || busy || readingLock.current || !loaded || !chat.input.trim()) return;
    setError(''); setNotice(''); setHistory(false); setConfirm(null);
    let prompt;
    const base = fingerprint(currentDraft.current);
    try { prompt = createArticlePrompt({ draft: currentDraft.current, prompt: chat.input, files: chat.files, messages: chat.messages, people: PEOPLE, companies: COMPANIES }); }
    catch (e) { setError(e.message); return; }
    const newMessage = { id: crypto.randomUUID(), role: 'user', text: chat.input.trim(), time: Date.now(), files: chat.files.map(f => ({ name: f.name, kind: f.kind })) };
    const images = chat.files.filter(f => f.kind === 'image');
    setChat(old => ({ ...old, input: '', messages: [...old.messages, newMessage] }));
    const abort = new AbortController(); controller.current = abort; setBusy(true); setProgress('Готовлюсь к работе…');
    try {
      const answer = await generateArticleWithAiHorde(prompt, { signal: abort.signal, onProgress: state => {
        if (!mounted.current) return;
        setProgress(({ connecting: 'Готовлюсь к работе…', sending: 'Изучаю задачу…', writing: 'Собираю статью и редактирую текст…', continuing: 'Дописываю статью и завершаю структуру…', queued: state.position > 0 ? `Запрос в очереди · позиция ${state.position}` : 'Скоро начну…' })[state.phase]);
      } });
      abort.signal.throwIfAborted();
      const result = normalizeArticleResult(answer.text, { type: draft.type, companies: COMPANIES.map(c => c.value), people: PEOPLE.map(p => p.value) });
      if (!mounted.current) return;
      setChat(old => ({ ...old, messages: [...old.messages, { id: crypto.randomUUID(), role: 'assistant', text: result.message, result, images, base, time: Date.now(), model: answer.model }] }));
      if (!currentOpen.current) setUnread(true);
    } catch (e) {
      if (mounted.current) {
        const stopped = e.name === 'AbortError';
        const text = stopped ? 'Подготовка остановлена. Можно уточнить запрос и продолжить.' : e.message;
        setChat(old => ({ ...old, input: old.input || newMessage.text, messages: [...old.messages, { id: crypto.randomUUID(), role: 'assistant', text, error: !stopped, time: Date.now() }] }));
      }
    } finally { if (mounted.current) { setBusy(false); setProgress(''); } controller.current = null; }
  };
  const apply = (item, force = false) => {
    if (!force && fingerprint(currentDraft.current) !== item.base) { setConfirm({ item }); return; }
    const before = { ...Object.fromEntries(ARTICLE_FIELDS.map(key => [key, undefined])), ...articleSnapshot(currentDraft.current), images: currentDraft.current.images };
    const images = [...currentDraft.current.images];
    for (const file of item.images || []) if (!images.some(image => image.id === file.id)) images.push({ id: file.id, name: file.name, src: file.src, caption: '', status: PHOTO_STATUSES[0] });
    const patch = { ...item.result.patch, images };
    onApply(patch);
    setUndo({ before, after: fingerprint({ ...currentDraft.current, ...patch }), id: item.id });
    setChat(old => ({ ...old, messages: old.messages.map(m => ({ ...m, applied: m.id === item.id, appliedFingerprint: m.id === item.id ? fingerprint({ ...currentDraft.current, ...patch }) : undefined })) }));
    setConfirm(null); setNotice('Статья заполнена. Проверьте её в форме и предпросмотре.');
  };
  const undoApply = (force = false) => {
    if (!undo) return;
    if (!force && fingerprint(currentDraft.current) !== undo.after) { setConfirm({ undo: true }); return; }
    onApply(undo.before); setUndo(null); setConfirm(null);
    setChat(old => ({ ...old, messages: old.messages.map(m => ({ ...m, applied: false })) }));
    setNotice('Вернул поля к состоянию до применения. Вариант остался в истории.');
  };
  const versions = chat.messages.filter(item => item.result);
  const avatarState = busy || reading ? 'working' : open || hovered || unread ? 'default' : 'sleeping';
  return <aside className={`pw-assistant ${open ? 'is-open' : ''} ${dockRaised ? 'avoids-footer' : ''}`} aria-label="Квилли — помощник публикаций">
    {open && <section className="pw-assistant-panel" role="dialog" aria-modal="false" aria-label="Чат с Квилли" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); if (infoOpen) { setInfoOpen(false); infoTrigger.current?.focus(); } else close(); } }} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); attach(Array.from(event.dataTransfer.files)); }}>
      <header className="pw-assistant-header"><Avatar state={avatarState} /><div><h2>Квилли</h2><span>{busy ? 'Готовлю статью' : reading ? 'Читаю материалы' : 'Ваш редактор в Qollab'}</span></div><Popover trigger="click" placement="bottomRight" open={infoOpen} onOpenChange={setInfoOpen} getPopupContainer={trigger => trigger.closest('.pw-assistant-panel')} classNames={{ root: 'pw-assistant-info-popover' }} title="Как используются материалы" content={<div id={infoId} className="pw-assistant-info-content"><p>Запрос, текст статьи и документов отправляются в AI Horde — публичный AI-сервис. Используйте только материалы, разрешённые для внешней обработки.</p><p>Фото добавляются в медиа статьи, но не отправляются на анализ.</p><p>Переписка и варианты статьи сохраняются на этом устройстве.</p></div>}><button type="button" ref={infoTrigger} className={`pw-assistant-icon ${infoOpen ? 'is-active' : ''}`} aria-label="Информация о Квилли" title="Информация о Квилли" aria-expanded={infoOpen} aria-controls={infoOpen ? infoId : undefined}><Info20Regular /></button></Popover><button type="button" className={`pw-assistant-icon ${history ? 'is-active' : ''}`} aria-label="История вариантов статьи" title="История вариантов" aria-pressed={history} onClick={() => setHistory(v => !v)}><History20Regular /></button><button type="button" className="pw-assistant-icon" aria-label="Свернуть Квилли" title="Свернуть" onClick={close}><Subtract20Regular /></button></header>
      <div className="pw-assistant-context"><span>{TYPES[draft.type]}</span><span>{draft.title || 'Новая публикация'}</span></div>
      <div className="pw-assistant-log" ref={log} role="log" aria-label={history ? 'История вариантов' : 'Переписка'} aria-live="polite" aria-relevant="additions">
        {!loaded && !storageError && <p className="pw-assistant-muted">Загружаю историю…</p>}
        {loaded && !chat.messages.length && !history && <div className="pw-assistant-welcome"><Avatar size={82} /><h3>Привет, я Квилли!</h3><p>Прикрепите материалы и расскажите, что хотите получить. Я напишу заголовок, лид и весь текст — понятно и по-человечески.</p><div className="pw-assistant-suggestions">{['Собери статью из материалов', 'Отредактируй текущий черновик', 'Сделай текст короче и живее'].map(text => <button type="button" key={text} onClick={() => { changeInput(text); input.current?.focus(); }}>{text}<span>↗</span></button>)}</div></div>}
        {history && <div className="pw-assistant-history-title"><h3>Варианты этой статьи <span>{versions.length}</span></h3><p>Здесь собраны варианты этой статьи. Любой из них можно применить.</p>{!versions.length && <p>Здесь появится первый готовый вариант.</p>}</div>}
        {(history ? [...versions].reverse() : chat.messages).map(item => <div key={item.id} className={`pw-assistant-message is-${item.role} ${item.error ? 'is-error' : ''}`}><div className="pw-assistant-message-text">{item.text}</div>{!!item.files?.length && <div className="pw-assistant-message-files">{item.files.map((file, i) => <span key={i}><Document20Regular />{file.name}</span>)}</div>}{item.result && <Result item={{ ...item, applied: item.applied && item.appliedFingerprint === fingerprint(draft) }} index={versions.indexOf(item) + 1} onApply={apply} busy={busy} />}<time>{new Date(item.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time></div>)}
        {busy && <div className="pw-assistant-progress" role="status"><span className="pw-assistant-dots"><i /><i /><i /></span>{progress}</div>}
      </div>
      {(error || storageError) && <div className="pw-assistant-error" role="alert">{error || storageError}<button type="button" className="pw-assistant-icon" aria-label="Закрыть сообщение об ошибке" onClick={() => { setError(''); }}><Dismiss20Regular /></button></div>}
      {confirm && <div className="pw-assistant-confirm" role="alert"><b>В форме есть новые правки</b><p>{confirm.undo ? 'Откат вернёт текст к состоянию до применения и заменит новые правки.' : 'Этот вариант заменит заголовок и текст в форме. Настройки публикации сохранятся.'}</p><div><button type="button" onClick={() => confirm.undo ? undoApply(true) : apply(confirm.item, true)}>Заменить текущий текст</button><button type="button" onClick={() => setConfirm(null)}>Отмена</button></div></div>}
      {notice && <div className="pw-assistant-notice" role="status"><Checkmark20Regular /><span>{notice}</span></div>}
      {undo && <button className="pw-assistant-undo" type="button" onClick={() => undoApply()}><ArrowUndo20Regular />Отменить применение</button>}
      <footer className="pw-assistant-composer">
        {!!chat.files.length && <div className="pw-assistant-files">{chat.files.map(file => <div className="pw-assistant-file" key={file.id}>{file.kind === 'image' ? <img src={file.src} alt="" /> : <Document20Regular />}<span title={file.name}>{file.name}<small>{file.kind === 'image' ? 'Для медиа статьи' : `${file.text.length.toLocaleString('ru-RU')} симв. · текст прочитан`}</small></span><button type="button" disabled={busy || reading} aria-label={`Убрать ${file.name}`} onClick={() => setChat(old => ({ ...old, files: old.files.filter(f => f.id !== file.id) }))}><Dismiss20Regular /></button></div>)}</div>}
        <div className="pw-assistant-input"><textarea ref={input} aria-label="Задача Квилли" placeholder={chat.messages.length ? 'Что ещё поправить в статье?' : 'О чём пишем? Добавьте детали…'} value={chat.input} disabled={!loaded} rows={2} onChange={e => changeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} /><div className="pw-assistant-input-actions"><button type="button" className="pw-assistant-icon" aria-label="Прикрепить материалы" title="Прикрепить документы или фото" disabled={!loaded || busy || reading} onClick={() => fileInput.current.click()}><Attach20Regular /></button><span>{reading ? 'Читаю файлы…' : 'PDF, DOCX, текст, фото'}</span>{busy ? <button type="button" className="pw-assistant-stop" aria-label="Остановить подготовку" onClick={() => { if (scenario) { setBusy(false); setProgress(''); } else controller.current?.abort(); }}><span /></button> : <button type="button" className="pw-assistant-send" aria-label="Отправить задачу" disabled={!loaded || reading || !chat.input.trim()} onClick={send}><ArrowUp20Filled /></button>}</div></div>
        <input ref={fileInput} type="file" accept={ASSISTANT_ACCEPT} multiple hidden onChange={e => { attach(Array.from(e.target.files || [])); e.target.value = ''; }} />
      </footer>
      {dragging && <div className="pw-assistant-drop"><Attach20Regular /><b>Отпустите файлы здесь</b><span>До 5 файлов · до 10 МБ каждый</span></div>}
    </section>}
    <button type="button" ref={launcher} className="pw-assistant-launcher" aria-label={open ? 'Свернуть чат с Квилли' : 'Открыть Квилли — помощника публикаций'} aria-expanded={open} onClick={() => open ? close() : setOpen(true)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}><Avatar state={avatarState} size={54} />{!open && <span>{busy ? 'Готовлю статью…' : unread ? 'Статья готова' : 'Квилли · редактор статей'}</span>}{open && <ChevronDown20Regular />}{unread && !open && <i />}</button>
  </aside>;
}
