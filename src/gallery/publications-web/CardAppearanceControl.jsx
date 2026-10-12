import { CheckmarkCircle20Filled } from '@fluentui/react-icons';
import { PublicationCard } from './PostViews';
import { cardAppearance, coverImage } from './cardAppearance';

export function CardAppearanceOptions({ value = 'standard', onChange, hasMedia }) {
  return <div className="pw-appearance-options" role="radiogroup" aria-label="Оформление карточки">
    {[
      ['standard', 'Обычная', 'Заголовок и краткий текст над медиа'],
      ['cover', 'Текст на обложке', 'Канал, заголовок и краткий текст на медиа'],
    ].map(([key, title, hint]) => <label key={key} className={`pw-appearance-option ${value === key ? 'is-selected' : ''} ${key === 'cover' && !hasMedia ? 'is-disabled' : ''}`}>
      <input type="radio" name="publication-card-appearance" value={key} checked={value === key} disabled={key === 'cover' && !hasMedia} onChange={() => onChange(key)} />
      <span className={`pw-appearance-diagram is-${key}`} aria-hidden="true"><span className="pw-diagram-picture" /><span className="pw-diagram-text"><i /><i /></span></span>
      <span className="pw-appearance-option-title">{title}{value === key && <CheckmarkCircle20Filled aria-hidden="true" />}</span>
      <span className="pw-appearance-option-hint">{hint}</span>
    </label>)}
  </div>;
}

export function CardCoverPicker({ post, onChange }) {
  const images = (post.images || []).filter(image => image.src);
  const selected = coverImage(post);
  return cardAppearance(post) === 'cover' && images.length > 1 && <fieldset className="pw-cover-picker"><legend>Изображение для обложки</legend><div>{images.map((image, index) => <button type="button" key={image.id} aria-label={`Обложка: изображение ${index + 1}`} aria-pressed={selected?.id === image.id} onClick={() => onChange(image.id)}><img src={image.src} alt="" />{selected?.id === image.id && <CheckmarkCircle20Filled />}</button>)}</div><p>Выбранное фото будет первым в карточке. Все медиа останутся в галерее.</p></fieldset>;
}

export function CardAppearancePreview({ post }) {
  return <details className="pw-appearance-preview" open><summary>Предпросмотр карточки в ленте</summary><div><PublicationCard preview post={{ ...post, title: post.title || 'Заголовок публикации', lead: post.lead || 'Здесь будет краткий текст публикации.' }} /></div></details>;
}
