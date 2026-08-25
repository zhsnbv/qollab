import {
  Camera24Regular, Video24Regular, ImageMultiple24Regular, Document24Regular,
} from '@fluentui/react-icons';
import ActionSheet from './ActionSheet';

// Вложения из чата: тот же лист, что у остальных меню приложения — иконка
// справа, «Отмена» внизу.
const ITEMS = [
  { id: 'photo', label: 'Снять фото', Icon: Camera24Regular },
  { id: 'video', label: 'Снять видео', Icon: Video24Regular },
  { id: 'gallery', label: 'Галерея', Icon: ImageMultiple24Regular },
  { id: 'file', label: 'Файл', Icon: Document24Regular },
];

const TOASTS = {
  photo: 'Открыли бы камеру',
  video: 'Открыли бы съёмку видео',
  gallery: 'Открыли бы галерею',
  file: 'Открыли бы выбор файла',
};

export default function AttachSheet({ onClose, onPick }) {
  return (
    <ActionSheet
      title="Вложение"
      iconsLeft
      items={ITEMS}
      onClose={onClose}
      onPick={(id) => onPick(TOASTS[id])}
    />
  );
}
