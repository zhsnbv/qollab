import { useEffect, useState } from 'react';
import { ChevronDown20Regular } from '@fluentui/react-icons';
import Portal from './Portal';
import SheetTop from './SheetTop';
import ActionSheet from './ActionSheet';
import useSheetSwipe from '../utils/useSheetSwipe';
import { pushScrim, popScrim } from '../utils/scrim';
import { formatPhone, normalizePhone, isPhoneFull } from '../utils/phone';
import { sosRelations } from '../data/profile';
import './SosSheet.css';

const NOTE_MAX = 255;

// Форма SOS-контакта — одна на добавление и на изменение: поля, проверки и
// вид совпадают, меняются только заголовок, кнопка и то, с чем форма открылась.
// Разводить их на два компонента значило бы править каждое поле дважды.
export default function SosSheet({ contact, onClose, onSave }) {
  const editing = !!contact;
  const [name, setName] = useState(contact?.name || '');
  const [tag, setTag] = useState(contact?.tag || '');
  const [phone, setPhone] = useState(normalizePhone(contact?.phone || ''));
  const [note, setNote] = useState(contact?.note || '');
  const [relOpen, setRelOpen] = useState(false);
  const swipe = useSheetSwipe(onClose);

  useEffect(() => { pushScrim(); return popScrim; }, []);

  // Кнопка ждёт полный номер, а не просто непустое поле: контакт без цифр
  // бесполезен ровно в тот момент, когда он нужен.
  const ready = name.trim() && tag && isPhoneFull(phone);

  const save = () => {
    if (!ready) return;
    onSave({
      id: contact?.id,
      name: name.trim(),
      tag,
      phone: formatPhone(phone),
      note: note.trim() || undefined,
    });
  };

  return (
    <Portal>
      <div className="sossheet-wrap">
        <button className="sossheet-scrim" onClick={onClose} aria-label="Закрыть" />
        <div
          className={`sossheet ${swipe.className}`}
          style={swipe.style}
          role="dialog"
          aria-label={editing ? 'Изменить SOS-контакт' : 'Добавить SOS-контакт'}
        >
          <SheetTop onClose={onClose} swipe={swipe}>
            <h3 className="sossheet-title">{editing ? 'Изменить SOS-контакт' : 'Добавить SOS-контакт'}</h3>
          </SheetTop>

          <div className="sossheet-body">
            <label className="sos-field">
              <span className="sos-field-label">ФИО контактного лица</span>
              <input
                className="sos-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                autoComplete="off"
              />
            </label>

            <div className="sos-field">
              <span className="sos-field-label">Степень родства</span>
              <button
                type="button"
                className={`sos-input sos-select ${tag ? '' : 'is-empty'}`}
                onClick={() => setRelOpen(true)}
              >
                {tag || 'Выберите степень родства'}
                <ChevronDown20Regular />
              </button>
            </div>

            <label className="sos-field">
              <span className="sos-field-label">Номер телефона</span>
              <input
                className="sos-input"
                inputMode="tel"
                value={phone ? formatPhone(phone) : '+7'}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
              />
            </label>

            <label className="sos-field">
              <span className="sos-field-label">Комментарий</span>
              <textarea
                className="sos-input sos-textarea"
                rows={2}
                maxLength={NOTE_MAX}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Например: основной контакт"
              />
              <span className="sos-counter">{note.length} / {NOTE_MAX}</span>
            </label>
          </div>

          <div className="sossheet-actions">
            <button type="button" className="sos-btn" onClick={onClose}>Закрыть</button>
            <button type="button" className="sos-btn sos-btn--primary" disabled={!ready} onClick={save}>
              Сохранить
            </button>
          </div>
        </div>
      </div>

      {relOpen && (
        <ActionSheet
          title="Степень родства"
          items={sosRelations.map((r) => ({ id: r, label: r }))}
          selected={tag}
          onClose={() => setRelOpen(false)}
          onPick={(id) => { setTag(id); setRelOpen(false); }}
        />
      )}
    </Portal>
  );
}
