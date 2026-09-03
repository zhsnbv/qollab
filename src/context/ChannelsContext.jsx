import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { channelList } from '../data/channels';

// Подписки на каналы. Живут в контексте, а не в экране настройки: их читают
// и лента публикаций, и вкладка «Каналы», и сам экран настройки — держать
// такое состояние в одном из них значило бы, что остальные о нём не знают.
const STORAGE_KEY = 'qollab.channels.v1';

const defaults = channelList.filter((c) => c.subscribed).map((c) => c.id);
// На эти каналы подписывает компания — отписаться нельзя, и в списке они
// есть всегда, даже если в сохранённом наборе их не оказалось.
const required = channelList.filter((c) => c.required).map((c) => c.id);
const withRequired = (list) => [...new Set([...required, ...list])];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Отсеиваем id, которых в каталоге уже нет (канал закрыли/переименовали)
    if (Array.isArray(saved)) {
      return withRequired(saved.filter((id) => channelList.some((c) => c.id === id)));
    }
  } catch { /* ignore */ }
  return defaults;
}

const ChannelsContext = createContext(null);

export function ChannelsProvider({ children }) {
  const [subscribedIds, setSubscribedIds] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribedIds)); } catch { /* ignore */ }
  }, [subscribedIds]);

  const value = useMemo(() => ({
    subscribedIds,
    isSubscribed: (id) => subscribedIds.includes(id),
    isRequired: (id) => required.includes(id),
    toggle: (id) => setSubscribedIds((list) => {
      if (required.includes(id)) return list;
      return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    }),
    // Каналы с актуальным флагом: экраны читают его вместо поля из данных
    channels: channelList.map((c) => ({
      ...c,
      subscribed: c.required || subscribedIds.includes(c.id),
    })),
  }), [subscribedIds]);

  return <ChannelsContext.Provider value={value}>{children}</ChannelsContext.Provider>;
}

export function useChannels() {
  const ctx = useContext(ChannelsContext);
  if (!ctx) throw new Error('useChannels must be used within ChannelsProvider');
  return ctx;
}
