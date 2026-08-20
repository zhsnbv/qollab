import './ConfirmDialog.css';

// Диалог подтверждения — тот же вид, что в авторизации: заголовок, пояснение
// и кнопки в столбик. Вынесен отдельно, чтобы им пользовались все экраны.
export default function ConfirmDialog({ title, text, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="cdlg-wrap">
      <button className="cdlg-scrim" onClick={onCancel} aria-label="Отмена" />
      <div className="cdlg" role="dialog" aria-label={title}>
        <div className="cdlg-body">
          <h3 className="cdlg-title">{title}</h3>
          {text && <p className="cdlg-text">{text}</p>}
        </div>
        <div className="cdlg-actions">
          <button className={`cdlg-btn ${danger ? 'danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
          <button className="cdlg-btn" onClick={onCancel}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
