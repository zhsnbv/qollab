import SheetTop from '../SheetTop';
import useSheetSwipe from '../../utils/useSheetSwipe';
import '../ActionSheet.css';

function Demo({ children }) {
  const swipe = useSheetSwipe(() => {});
  return (
    <div
      className={`asheet ${swipe.className}`}
      style={{ ...swipe.style, position: 'static', transform: 'none', maxHeight: 'none' }}
    >
      <SheetTop onClose={() => {}} swipe={swipe}>{children}</SheetTop>
      <div style={{ padding: '0 16px 20px', color: 'var(--color-weak)' }}>Содержимое листа</div>
    </div>
  );
}

export default {
  title: 'Молекулы/Шапка листа',
  component: SheetTop,
  parameters: {
    docs: {
      description: {
        component:
          'Единственный способ озаглавить лист снизу. Даёт три вещи разом: полоску-хват, заголовок '
          + 'и крестик — и раздаёт наружу обработчики свайпа, полученные из useSheetSwipe. Крестик '
          + 'и заголовок стоят на одной линии (общий flex, не absolute), поля 16px слева и справа, '
          + 'снизу воздуха меньше — так заголовок не отрывается от содержимого.',
      },
    },
  },
};

export const СЗаголовком = {
  name: 'С заголовком',
  render: () => <Demo><h3 className="asheet-title">Вложение</h3></Demo>,
};

export const БезЗаголовка = {
  name: 'Без заголовка',
  render: () => <Demo />,
  parameters: { docs: { description: { story: 'У контекстных меню заголовка нет — остаются хват и крестик.' } } },
};

export const Свайп = {
  render: () => <Demo><h3 className="asheet-title">Потяните вниз</h3></Demo>,
  parameters: {
    docs: {
      description: {
        story:
          'Лист закрывается двумя способами: крестиком и потягиванием за шапку. Порог — 96px пути '
          + 'или скорость 0.5px/мс: короткий резкий свайп закрывает так же, как долгий.',
      },
    },
  },
};
