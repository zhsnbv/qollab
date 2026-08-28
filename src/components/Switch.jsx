import './Switch.css';

// Переключатель в стиле iOS. Живёт отдельным компонентом, потому что нужен и
// в мини-приложении, и на трёх экранах настроек: копия разъехалась бы на
// первой же правке размеров. Внутри настоящий чекбокс — с клавиатуры и
// скринридером ведёт себя как положено, а видимую часть рисует span.
export default function Switch({ checked, onChange, label }) {
  return (
    <input
      type="checkbox"
      className="switch"
      role="switch"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
    />
  );
}
