import { createPortal } from 'react-dom';

// Модальные слои монтируем в корень «устройства», а не по месту вызова: иначе
// абсолютное позиционирование считается от ближайшего позиционированного
// предка — например от области прокрутки таба — и лист уезжает под таб-бар.
export default function Portal({ children }) {
  const host = document.querySelector('.device');
  return host ? createPortal(children, host) : children;
}
