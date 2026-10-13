import { usePublicationScenario } from '../publication-screens/ScenarioContext';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Collapse, Divider, Form, Input, InputNumber, Modal, Radio, Rate, Select, Tooltip, message } from 'antd';
import { ArrowLeft20Regular, ArrowDownload20Regular, Eye20Regular, Image20Regular, Video20Regular, Delete20Regular, Edit20Regular } from '@fluentui/react-icons';
import RichEditor from './RichEditor';
const PublicationAssistant = lazy(() => import('./PublicationAssistant'));
import { CardAppearanceOptions, CardAppearancePreview, CardCoverPicker } from './CardAppearanceControl';
import { ENABLE_STANDARD_CARD_APPEARANCE, cardAppearance, coverImage, hasCoverMedia } from './cardAppearance';
import { PUBLICATION_RUBRICS, rubricValue } from './publicationRubrics';
import { RubricLabel } from './PublicationRubric';
import { COMPANIES, PEOPLE, PHOTO_STATUSES, PROJECT_FIELDS, TYPES, videoEmbed } from './data';

const readFile = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
const required = label => [{ required: true, whitespace: true, message: `Заполните поле «${label}»` }];
export default function PublicationEditor({ initial, onCancel, onSave, onPreview }) {
  const scenario = usePublicationScenario();
  const [form] = Form.useForm();
  const [draft, setDraft] = useState(() => ({ ...initial, assistantId: initial.assistantId || (initial.id ? `post:${initial.id}` : crypto.randomUUID()), cardAppearance: initial.cardAppearance ?? cardAppearance(initial), rubric: rubricValue(initial) }));
  const [dirty, setDirty] = useState(false);
  const [editorRevision, setEditorRevision] = useState(0);
  const [footerVisible, setFooterVisible] = useState(false);
  const footerRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);
  const [videoModal, setVideoModal] = useState(scenario?.videoModal || null), [videoUrl, setVideoUrl] = useState(''), [videoError, setVideoError] = useState('');
  const [photoModal, setPhotoModal] = useState(scenario?.photoModal ? initial.images?.[1] || initial.images?.[0] : null), [photoError, setPhotoError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false), [loading, setLoading] = useState(false);
  const imageInput = useRef(null), fileInput = useRef(null);
  const isProject = draft.type === 'project', isAudit = draft.type === 'audit';
  const [messageApi, messageContext] = message.useMessage();
  const patch = changes => { setDraft(v => ({ ...v, ...changes })); setDirty(true); };
  const removeMedia = (field, id) => {
    const remaining = draft[field].filter(media => media.id !== id);
    const next = { ...draft, [field]: remaining };
    const appearance = ENABLE_STANDARD_CARD_APPEARANCE ? cardAppearance(next) : draft.cardAppearance;
    form.setFieldValue('cardAppearance', appearance);
    patch({ [field]: remaining, cardAppearance: appearance, coverImageId: coverImage(next)?.id });
  };
  const cancel = () => dirty ? setCancelOpen(true) : onCancel();
  useEffect(() => {
    const guard = e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  const validate = async action => {
    try {
      const values = await form.validateFields();
      const next = { ...draft, ...values };
      if (isAudit && next.images.some(p => !p.caption?.trim())) { messageApi.error('Добавьте описание к каждой фотографии обхода'); setPhotoModal(next.images.find(p => !p.caption?.trim())); return; }
      action(next);
    } catch (error) { if (error.errorFields?.[0]) form.scrollToField(error.errorFields[0].name, { block: 'center', behavior: 'smooth' }); }
  };
  const addFiles = async (event, images) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setLoading(true);
    try {
      const valid = files.filter(file => images ? /\.(png|jpe?g|jpe|heic|heif)$/i.test(file.name) : /\.(pdf|xlsx)$/i.test(file.name));
      if (valid.length !== files.length) messageApi.warning(images ? 'Поддерживаются PNG, JPG, JPEG, HEIC и HEIF' : 'Поддерживаются PDF и XLSX');
      const added = await Promise.all(valid.map(async file => ({ id: crypto.randomUUID(), name: file.name, [images ? 'src' : 'url']: await readFile(file), caption: '', status: PHOTO_STATUSES[0], size: `${file.name.split('.').pop().toUpperCase()} · ${(file.size / 1024 / 1024).toFixed(1)} МБ` })));
      patch({ [images ? 'images' : 'files']: [...draft[images ? 'images' : 'files'], ...added] });
      if (images && isAudit && added[0]) { setPhotoModal(added[0]); setPhotoError(''); }
    } catch { messageApi.error('Не удалось прочитать файл. Попробуйте ещё раз.'); }
    finally { setLoading(false); }
  };
  const openVideo = provider => { setVideoModal(provider); setVideoUrl(''); setVideoError(''); };
  const saveVideo = () => { const video = { id: crypto.randomUUID(), provider: videoModal, url: videoUrl.trim() }; if (!videoEmbed(video)) { setVideoError(`Введите корректную ссылку ${videoModal === 'youtube' ? 'YouTube' : 'Vimeo'}`); return; } patch({ videos: [...draft.videos, video] }); setVideoModal(null); };
  const savePhoto = () => { if (isAudit && !photoModal.caption.trim()) { setPhotoError('Добавьте описание фотографии'); return; } patch({ images: draft.images.map(p => p.id === photoModal.id ? photoModal : p) }); setPhotoModal(null); };
  const media = <>
    <div className="pw-media-heading">Медиафайлы</div>
    <p className="pw-media-hint">Фото или видео станет обложкой карточки. Несколько медиафайлов объединятся в слайдер. {isAudit && 'На обложке будут заголовок и краткий текст, на следующих фотографиях — тип замечания и описание.'}</p>
    <div className="pw-media-buttons">
      <Button icon={<Image20Regular />} onClick={() => imageInput.current.click()} loading={loading}>Добавить изображения</Button>
      <Button icon={<Video20Regular />} onClick={() => openVideo('youtube')}>Добавить ссылку youtube</Button>
      {!isAudit && <Button icon={<Video20Regular />} onClick={() => openVideo('vimeo')}>Добавить ссылку vimeo</Button>}
      <input ref={imageInput} type="file" accept="image/png,image/jpg,image/jpeg,image/jpe,.heic,.heif" multiple hidden onChange={e => addFiles(e, true)} />
    </div>
    {!!draft.images.length && <div className="pw-uploaded-images">{draft.images.map((p, i) => <div className="pw-uploaded-image" key={p.id}>
      <button type="button" className="pw-image-edit" aria-label={`Редактировать изображение ${i + 1}`} onClick={() => { setPhotoModal(p); setPhotoError(''); }}><img src={p.src} alt={p.caption || p.name} /><span><Edit20Regular /></span></button>
      <Tooltip title="Удалить изображение"><Button className="pw-image-remove" shape="circle" size="small" aria-label={`Удалить изображение ${i + 1}`} icon={<Delete20Regular />} onClick={() => removeMedia('images', p.id)} /></Tooltip>
      {isAudit && p.status && <span className={`pw-photo-status status-${PHOTO_STATUSES.indexOf(p.status)}`}>{p.status}</span>}
      {p.caption && <p>{p.caption}</p>}
    </div>)}</div>}
    {!!draft.videos.length && <div className="pw-video-list">{draft.videos.map(v => <div key={v.id}><Video20Regular /><span>{v.provider === 'youtube' ? 'YouTube' : 'Vimeo'}</span><a href={v.url} target="_blank" rel="noreferrer">{v.url}</a><Button type="text" aria-label="Удалить видео" icon={<Delete20Regular />} onClick={() => removeMedia('videos', v.id)} /></div>)}</div>}
    <div className="pw-files-heading">Файлы</div>
    <Button icon={<ArrowDownload20Regular />} onClick={() => fileInput.current.click()}>Прикрепить файл</Button>
    <input ref={fileInput} type="file" accept=".pdf,.xlsx" multiple hidden onChange={e => addFiles(e, false)} />
    {!!draft.files.length && <div className="pw-uploaded-files">{draft.files.map(f => <div key={f.id}><a href={f.url} download={f.name}>{f.name}</a><span>{f.size}</span><Button type="text" aria-label={`Удалить файл ${f.name}`} icon={<Delete20Regular />} onClick={() => patch({ files: draft.files.filter(x => x.id !== f.id) })} /></div>)}</div>}
  </>;
  return <div className="pw-editor">
    {messageContext}
    <header className="pw-prod-page-header"><button type="button" aria-label="Назад в канал" onClick={cancel}><ArrowLeft20Regular /></button><h1>{initial.id ? 'Редактировать ' + (isAudit ? 'обход' : isProject ? 'проект-улучшение' : 'пост') : isAudit ? 'Создать новый обход' : isProject ? 'Создать проект-улучшение' : 'Создать новый пост'}</h1></header>
    <div className="pw-prod-content"><section className="pw-prod-form-card">
      <h2>Основные сведения</h2>
      <Form form={form} layout="vertical" initialValues={{ ...initial, cardAppearance: initial.cardAppearance ?? cardAppearance(initial), rubric: rubricValue(initial) }} onValuesChange={(changed) => patch(changed)} className={`pw-prod-form ${isProject ? 'is-project' : ''}`} scrollToFirstError>
        <Form.Item label="Заголовок" name="title" extra="Рекомендуем до двух строк в карточке. Это ориентир, а не ограничение — проверьте предпросмотр ниже." rules={[...required('Заголовок'), { min: 3, message: 'Минимум 3 символа' }]}>
          <Input placeholder="Напишите заголовок" maxLength={200} showCount prefix={isProject ? <span className="pw-input-prefix">Проект-улучшение:</span> : undefined} />
        </Form.Item>
        {isAudit && <>
          <Form.Item label="Оценка" name="rating"><Rate /></Form.Item>
          <div className="pw-form-two"><Form.Item name="responsible" label="Ответственный"><Select allowClear showSearch optionFilterProp="label" options={PEOPLE} placeholder="Выберите из списка" /></Form.Item><Form.Item name="auditor" label="Аудитор"><Select allowClear showSearch optionFilterProp="label" options={PEOPLE} placeholder="Выберите из списка" /></Form.Item></div>
          <Form.Item name="company" label="Предприятие" rules={required('Предприятие')}><Select showSearch optionFilterProp="label" options={COMPANIES} placeholder="Выберите из списка" /></Form.Item>
        </>}
        {isProject ? <>
          <div className="pw-form-two"><Form.Item label="Автор" name="author"><Select showSearch optionFilterProp="label" options={PEOPLE} /></Form.Item><Form.Item label="Предприятие" name="company" rules={required('Предприятие')}><Select showSearch optionFilterProp="label" options={COMPANIES} placeholder="Выберите из списка" /></Form.Item></div>
          <Form.Item label="Эффект (млн. тг.)" name="effect" extra="Укажите сумму в миллионах: например, 12 будет показано как 12 млн ₸." rules={[{ required: true, message: 'Укажите эффект проекта' }]}><InputNumber min={0} placeholder="Например, 12" style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Авторы проекта" name="authors"><Select mode="multiple" showSearch optionFilterProp="label" options={PEOPLE} placeholder="Выберите из списка" /></Form.Item>
          {draft.authors?.map(id => <div className="pw-author-dossier" key={id}><h3>{PEOPLE.find(p => p.value === id)?.label}</h3><Form.Item label="Справка-досье" name={['dossiers', id]} rules={required('Справка-досье')}><Input.TextArea autoSize={{ minRows: 3 }} placeholder="Напишите справку-досье автора" /></Form.Item><Collapse size="small" items={[{ key: id, label: 'Основная информация', children: <dl className="pw-profile-info">{['Таб№', 'Логин', 'Телефон', 'Дата рождения', 'Организация', 'Должность'].map((label, i) => <div key={label}><dt>{label}</dt><dd>{i === 5 ? PEOPLE.find(p => p.value === id)?.job : i === 4 ? draft.company || '—' : '—'}</dd></div>)}</dl> }]} /></div>)}
          <Divider /><h2 className="pw-section-title">Структура статьи</h2>
          {PROJECT_FIELDS.map(([name, label, placeholder, multiline]) => <Form.Item key={name} label={name === 'lead' ? 'Краткий текст' : label} name={name} extra={name === 'lead' ? 'Рекомендуем до двух строк в карточке. Более длинный текст тоже можно опубликовать.' : undefined} rules={name === 'contacts' ? [] : required(name === 'lead' ? 'Краткий текст' : label)}>{name === 'lead' ? <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Коротко расскажите, о чём публикация" /> : multiline ? <Input.TextArea rows={4} placeholder={placeholder} /> : <Input placeholder={placeholder} />}</Form.Item>)}
          <Divider /><h2 className="pw-section-title">Медиа</h2>{media}
        </> : <>
          <Form.Item name="lead" label="Краткий текст" extra="Рекомендуем до двух строк в карточке. Более длинный текст тоже можно опубликовать." rules={required('Краткий текст')}><Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Коротко расскажите, о чём публикация" /></Form.Item>
          <Form.Item key={`description-${editorRevision}`} label={isAudit ? 'Описание' : 'Основной текст'} name="description"><RichEditor key={editorRevision} id="pw-description" kind={draft.type} /></Form.Item>
          {media}
        </>}
        <Divider />
        <section className="pw-card-appearance-section" aria-label="Оформление карточки">
          <h2 className="pw-section-title">Оформление карточки</h2>
          <p className="pw-appearance-help">{ENABLE_STANDARD_CARD_APPEARANCE ? 'Выберите, как публикация будет выглядеть в ленте. Содержание статьи останется прежним.' : 'Фото или видео занимает всю верхнюю часть карточки. Канал, заголовок и краткий текст отображаются на обложке.'}</p>
          <Form.Item label="Рубрика" name="rubric" extra={isAudit || isProject ? `В шапке будет тип «${isAudit ? 'Обход' : 'Проект-улучшение'}». Рубрика меняет цветовой акцент карточки.` : 'Рубрика отображается под названием канала рядом с датой, добавляет значок на аватарке и цветовой акцент.'}><Select aria-label="Рубрика" options={[{ value: 'none', label: 'Без рубрики' }, ...PUBLICATION_RUBRICS.map(rubric => ({ value: rubric.value, label: rubric.label, rubric }))]} optionRender={option => option.data.rubric ? <span className="pw-rubric-option" style={{ color: option.data.rubric.ink }}><RubricLabel rubric={option.data.rubric} /></span> : option.label} /></Form.Item>
          {/* Alternative layout temporarily disabled; its component and saved choice are retained. */}
          {ENABLE_STANDARD_CARD_APPEARANCE && <Form.Item name="cardAppearance"><CardAppearanceOptions hasMedia={hasCoverMedia(draft)} /></Form.Item>}
          {!hasCoverMedia(draft) && <p className="pw-appearance-empty">Добавьте фото или видео, чтобы публикация появилась в общей ленте. Без медиа она останется доступна в канале.</p>}
          <CardCoverPicker post={draft} onChange={id => patch({ coverImageId: id })} />
          <CardAppearancePreview post={draft} />
        </section>
        <Divider /><h2 className="pw-section-title">Параметры публикации</h2>
        <div className="pw-checks"><Form.Item name="comments" valuePropName="checked"><Checkbox>Разрешить комментарии</Checkbox></Form.Item><Form.Item name="anonymous" valuePropName="checked"><Checkbox>Создать анонимно</Checkbox></Form.Item></div>
        <Divider />
        <div className="pw-form-footer" ref={footerRef}><Button onClick={cancel}>Отмена</Button><Button icon={<Eye20Regular />} onClick={() => validate(onPreview)}>Просмотр</Button><Button type="primary" onClick={() => validate(next => { setDirty(false); onSave(next); })}>{initial.id ? 'Сохранить изменения' : isAudit ? 'Создать обход' : 'Создать пост'}</Button></div>
      </Form>
    </section></div>
    <Modal title="Выйти без сохранения?" open={cancelOpen} onCancel={() => setCancelOpen(false)} onOk={onCancel} okText="Выйти без сохранения" cancelText="Продолжить редактирование"><p>Изменения в публикации не будут сохранены.</p></Modal>
    <Modal title={`Добавить ссылку ${videoModal === 'youtube' ? 'youtube' : 'vimeo'}`} open={!!videoModal} onCancel={() => setVideoModal(null)} onOk={saveVideo} okText="Добавить" cancelText="Отмена" destroyOnHidden><Form layout="vertical"><Form.Item label="Ссылка на видео" required validateStatus={videoError ? 'error' : ''} help={videoError}><Input autoFocus value={videoUrl} onChange={e => { setVideoUrl(e.target.value); setVideoError(''); }} placeholder={`https://${videoModal === 'youtube' ? 'www.youtube.com/watch?v=...' : 'vimeo.com/...'}`} onPressEnter={saveVideo} /></Form.Item></Form></Modal>
    <Modal title="Редактировать изображение" open={!!photoModal} onCancel={() => setPhotoModal(null)} onOk={savePhoto} okText="Сохранить" cancelText="Отмена" width={640} destroyOnHidden>{photoModal && <><img className="pw-photo-modal-image" src={photoModal.src} alt={photoModal.name} /><Form layout="vertical"><Form.Item label="Описание" required={isAudit} validateStatus={photoError ? 'error' : ''} help={photoError}><Input.TextArea maxLength={320} showCount value={photoModal.caption} rows={3} onChange={e => { setPhotoModal({ ...photoModal, caption: e.target.value }); setPhotoError(''); }} /></Form.Item>{isAudit && <Form.Item label="Тип замечания"><Radio.Group value={photoModal.status} onChange={e => setPhotoModal({ ...photoModal, status: e.target.value })}><div className="pw-status-radios">{PHOTO_STATUSES.map(s => <Radio key={s} value={s}>{s}</Radio>)}</div></Radio.Group></Form.Item>}</Form></>}</Modal>
    <Suspense fallback={null}><PublicationAssistant dockRaised={footerVisible} draft={draft} onApply={changes => { Object.entries(changes).forEach(([name, value]) => form.setFieldValue(name, value)); patch(changes); setEditorRevision(v => v + 1); }} /></Suspense>
    <span className="pw-sr-only">{TYPES[draft.type]}</span>
  </div>;
}
