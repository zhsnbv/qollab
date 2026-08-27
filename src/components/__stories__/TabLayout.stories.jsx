import TabLayout from '../TabLayout';
import TopBar from '../TopBar';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default {
  title: 'Организмы/Каркас вкладки',
  component: TabLayout,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Обёртка кор-вкладки: шапка, прокрутка и потягивание для обновления. Тянется весь контент '
          + 'вместе с шапкой, а сверху из-под него выезжает белая подложка со спиннером — так же, '
          + 'как в системных приложениях. Порог срабатывания 62px, дальше 92px контент не уходит.',
      },
    },
  },
};

export const Потягивание = {
  name: 'Потяните вниз',
  render: () => (
    <TabLayout topbar={<TopBar title="Сервисы" />} onRefresh={() => delay(600)}>
      <div style={{ display: 'grid', gap: 12, padding: '0 16px 24px' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="pcard" style={{ height: 72, display: 'flex', alignItems: 'center', paddingLeft: 16, color: 'var(--color-weak)' }}>
            Строка {i + 1}
          </div>
        ))}
      </div>
    </TabLayout>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Обновление занимает минимум 700 мс, даже если данные пришли мгновенно: мигнувший спиннер '
          + 'читается как сбой, а не как «обновилось».',
      },
    },
  },
};
