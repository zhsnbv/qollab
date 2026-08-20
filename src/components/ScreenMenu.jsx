import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActionSheet from './ActionSheet';
import Toast from './Toast';
import {
  ArrowSync24Regular, Share24Regular, Broom24Regular, Settings24Regular,
} from '@fluentui/react-icons';

// Контекстное меню «трёх точек» — одно на все кор-экраны: раньше лист был
// только в Ленте и мини-приложениях, а на Главной и в Профиле кнопка молчала.
export const SCREEN_MENU_ITEMS = [
  { id: 'refresh', label: 'Обновить страницу', Icon: ArrowSync24Regular },
  { id: 'share', label: 'Поделиться ссылкой', Icon: Share24Regular },
  { id: 'cache', label: 'Очистить кэш мини-приложения', Icon: Broom24Regular },
  { id: 'settings', label: 'Настройки', Icon: Settings24Regular },
];

export default function ScreenMenu({ open, onClose, onRefresh }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState('');

  const pick = (id) => {
    onClose();
    if (id === 'refresh') { onRefresh?.(); setToast('Страница обновлена'); }
    if (id === 'share') setToast('Ссылка скопирована');
    if (id === 'cache') setToast('Кэш мини-приложений очищен');
    // Настройки открываем поверх текущего экрана — как из профиля
    if (id === 'settings') navigate('/settings', { state: { background: location } });
  };

  return (
    <>
      {open && <ActionSheet items={SCREEN_MENU_ITEMS} onClose={onClose} onPick={pick} />}
      <Toast text={toast} onDone={() => setToast('')} />
    </>
  );
}
