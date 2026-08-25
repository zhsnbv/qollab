import {
  Camera24Regular, Video24Regular, ImageMultiple24Regular, Document24Regular,
} from '@fluentui/react-icons';
import ActionSheet from './ActionSheet';

// Вложения из чата. Все пункты — глаголы в одной форме: человек читает не
// «что это», а «что произойдёт». Первые два создают новое, вторые два берут
// готовое — разница видна по глаголу, поясняющие подписи не нужны.
const ITEMS = [
  { id: 'photo', label: 'Сделать фото', Icon: Camera24Regular },
  { id: 'video', label: 'Записать видео', Icon: Video24Regular },
  { id: 'gallery', label: 'Выбрать из галереи', Icon: ImageMultiple24Regular },
  { id: 'file', label: 'Выбрать файл', Icon: Document24Regular },
];

// В прототипе пикеров нет — честно говорим, что откроется в приложении
const TOASTS = {
  photo: 'Откроется камера',
  video: 'Откроется запись видео',
  gallery: 'Откроется галерея',
  file: 'Откроется выбор файла',
};

export default function AttachSheet({ onClose, onPick }) {
  return (
    <ActionSheet
      title="Прикрепить"
      iconsLeft
      items={ITEMS}
      onClose={onClose}
      onPick={(id) => onPick(TOASTS[id])}
    />
  );
}
