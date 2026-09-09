import { useEffect, useMemo } from 'react';
import { WidgetCard } from '../components/Widgets';
import { widgetList } from '../data/widgets';
import './WidgetFigma.css';

// Чистая витрина для browser-to-Figma плагина. Размер каждой карточки
// совпадает с виджетом внутри главной на экране 402 px: 342 × 341 px.
export default function WidgetFigma() {
  const now = useMemo(() => {
    const fixed = new Date();
    fixed.setHours(15, 20, 0, 0);
    return fixed;
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('widget-figma-page');
    return () => document.documentElement.classList.remove('widget-figma-page');
  }, []);

  return (
    <main className="widget-figma" aria-label="Виджеты для переноса в Figma">
      {widgetList.map((widget) => (
        <div className="widget-figma-item wgs" data-widget={widget.id} key={widget.id}>
          <WidgetCard w={widget} now={now} />
        </div>
      ))}
    </main>
  );
}
