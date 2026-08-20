import { useEffect, useRef } from 'react';

// Поле ввода сообщения — редактируемый блок, а не <input>. iOS вешает над
// клавиатурой системную панель со стрелками и «галочкой» только на элементы
// формы; на contenteditable её нет, а поведение поля для нас то же самое.
export default function ComposeInput({ value, onChange, onKeyDown, placeholder }) {
  const ref = useRef(null);

  // Переписываем содержимое, только когда текст реально разошёлся с внешним
  // значением: перезапись на каждый ввод сбрасывала бы каретку в начало.
  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <div
      ref={ref}
      className={`cr-field ${value ? '' : 'is-empty'}`}
      contentEditable
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      enterKeyHint="send"
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.textContent)}
      onKeyDown={onKeyDown}
      onPaste={(e) => {
        // Только текст: иначе в поле попадёт разметка из буфера обмена
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
    />
  );
}
