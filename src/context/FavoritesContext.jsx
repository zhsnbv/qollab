import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { serviceCategories } from '../data/services';

// Избранное — это выборка из общего каталога сервисов (Figma node 24737-3477):
// на Главной пилюли, в настройке — два раздела «Избранное» / «Все сервисы».
// Поэтому храним только id, а имя и иконку берём из каталога: раньше избранное
// жило отдельным списком со своими подписями и разъезжалось с каталогом.
const STORAGE_KEY = 'qollab.favorites.v2';

const defaultFavorites = ['task', 'mail', 'it'];

// Плоский индекс каталога: id → сервис
export const servicesById = Object.fromEntries(
  serviceCategories.flatMap((c) => c.items).map((s) => [s.id, s]),
);

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Отсеиваем id, которых в каталоге уже нет (сервис переименовали/убрали)
    const ids = Array.isArray(parsed) ? parsed.filter((id) => servicesById[id]) : null;
    return ids && ids.length ? ids : defaultFavorites;
  } catch {
    return defaultFavorites;
  }
}

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds)); } catch { /* ignore */ }
  }, [favoriteIds]);

  const value = useMemo(() => ({
    favoriteIds,
    setFavoriteIds,
    // Развёрнутые сервисы в том порядке, в котором их разложил пользователь
    favorites: favoriteIds.map((id) => servicesById[id]).filter(Boolean),
    // Остальной каталог — правый раздел экрана настройки
    rest: serviceCategories
      .flatMap((c) => c.items)
      .filter((s) => !favoriteIds.includes(s.id)),
  }), [favoriteIds]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
