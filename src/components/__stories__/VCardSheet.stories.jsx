import VCardSheet from '../VCardSheet';

export default {
  title: 'Молекулы/QR-визитка',
  component: VCardSheet,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Открывается и по «QR-коду», и по «Визитке»: это одна и та же визитка, просто названная '
          + 'двумя привычными словами. В коде лежит настоящий vCard, поэтому камера телефона '
          + 'предлагает сохранить контакт сразу — приложение собеседнику не нужно.',
      },
    },
  },
};

export const Лист = {
  render: () => <VCardSheet onClose={() => {}} />,
};
