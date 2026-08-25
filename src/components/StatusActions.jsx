import { Edit24Regular, DismissCircle24Regular } from '@fluentui/react-icons';
import ActionSheet from './ActionSheet';

// Тап по уже поставленному статусу: сменить его или снять совсем.
const ITEMS = [
  { id: 'edit', label: 'Изменить статус', Icon: Edit24Regular },
  { id: 'clear', label: 'Сбросить статус', Icon: DismissCircle24Regular, danger: true },
];

export default function StatusActions({ onClose, onEdit, onClear }) {
  return (
    <ActionSheet
      items={ITEMS}
      onClose={onClose}
      onPick={(id) => (id === 'edit' ? onEdit() : onClear())}
    />
  );
}
