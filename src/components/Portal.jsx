import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// Куда монтировать модальные слои. По умолчанию — единственный «телефон»
// приложения; витрина всех экранов подставляет сюда свою рамку, иначе все
// листы со всех карточек слетелись бы в первую.
export const DeviceHost = createContext(null);

// Модальные слои монтируем в корень «устройства», а не по месту вызова: иначе
// абсолютное позиционирование считается от ближайшего позиционированного
// предка — например от области прокрутки таба — и лист уезжает под таб-бар.
export default function Portal({ children }) {
  const provided = useContext(DeviceHost);
  const host = provided || document.querySelector('.device');
  return host ? createPortal(children, host) : children;
}
