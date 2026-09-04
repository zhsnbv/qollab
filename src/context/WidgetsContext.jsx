import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { widgetList } from '../data/widgets';

// Настройки виджетов у сотрудника. Храним не список карточек, а отличия от
// общего набора — как требует ТЗ: когда администратор добавит новый виджет,
// он появится и у тех, кто уже настраивал главную под себя.
const STORAGE_KEY = 'qollab.widgets.v1';

const DEFAULT_ORDER = widgetList.map((w) => w.id);
const byId = Object.fromEntries(widgetList.map((w) => [w.id, w]));

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') {
      return {
        // Постоянный виджет спрятать нельзя, даже если он попал в сохранённое
        hidden: (saved.hidden || []).filter((id) => byId[id]?.user),
        order: (saved.order || []).filter((id) => byId[id]),
      };
    }
  } catch { /* ignore */ }
  return { hidden: [], order: [] };
}

const WidgetsContext = createContext(null);

export function WidgetsProvider({ children }) {
  const [prefs, setPrefs] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs]);

  const value = useMemo(() => {
    // Свой порядок сначала, следом всё, чего в нём нет: новые виджеты
    // администратора встают на своё место сами, а не теряются.
    const known = prefs.order.filter((id) => byId[id]);
    const rest = DEFAULT_ORDER.filter((id) => !known.includes(id));
    const visible = [...known, ...rest].filter((id) => !prefs.hidden.includes(id));

    return {
      widgets: visible.map((id) => byId[id]),
      isHidden: (id) => prefs.hidden.includes(id),
      // Постоянные не трогаем: у них в панели нет кнопки, но проверяем и здесь
      toggle: (id) => setPrefs((p) => {
        if (!byId[id]?.user) return p;
        return p.hidden.includes(id)
          ? { ...p, hidden: p.hidden.filter((x) => x !== id) }
          : { ...p, hidden: [...p.hidden, id] };
      }),
      reset: () => setPrefs({ hidden: [], order: [] }),
      setOrder: (order) => setPrefs((p) => ({ ...p, order })),
      isDefault: !prefs.hidden.length && !prefs.order.length,
    };
  }, [prefs]);

  return <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>;
}

export function useWidgets() {
  const ctx = useContext(WidgetsContext);
  if (!ctx) throw new Error('useWidgets must be used within WidgetsProvider');
  return ctx;
}
