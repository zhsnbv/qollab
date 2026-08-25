import { FolderOpen24Filled } from '@fluentui/react-icons';

// Пустая вкладка профиля: с человеком ещё нечем поделиться. Вид тот же, что
// у «Ничего не найдено» в поиске, только иконка нейтральная.
export default function EmptyTab({ title, text, Icon = FolderOpen24Filled }) {
  return (
    <div className="pp-empty">
      <span className="pp-empty-ico"><Icon /></span>
      <p className="pp-empty-title">{title}</p>
      <p className="pp-empty-sub">{text}</p>
    </div>
  );
}
