import { createContext, useContext, useEffect, useState } from 'react';
import { Scroll, Mailbox, CalendarDots } from '@phosphor-icons/react';

// Иконка избранного хранится ключом (см. STORAGE_KEY ниже) — компонент достаём
// здесь же, чтобы Home и Favorites не дублировали один и тот же словарь.
export const FAV_ICONS = { scroll: Scroll, mailbox: Mailbox, calendar: CalendarDots };

// Избранное с Главной — общее состояние между Home (отображение) и Favorites
// (экран настройки: удаление/сортировка). Иконки храним ключом (не компонентом
// React), чтобы список можно было сериализовать в localStorage.
const STORAGE_KEY = 'qollab.favorites.v1';

const defaultFavorites = [
  { id: 'payslip', label: 'Персонал', value: 'Расчетный листок 2.0', icon: 'scroll' },
  { id: 'mail', label: 'IT услуги', value: 'Почта', icon: 'mailbox' },
  { id: 'meetings', label: 'IT услуги', value: 'Мои встречи', icon: 'calendar' },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : defaultFavorites;
  } catch {
    return defaultFavorites;
  }
}

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); } catch { /* ignore */ }
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
