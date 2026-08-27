import ErgizAvatar from '../ErgizAvatar';
import OnboardingArt from '../OnboardingArt';
import Splash from '../Splash';

export default {
  title: 'Основы/Фирменное',
  parameters: {
    docs: {
      description: {
        component: 'Ассистент, заставка и иллюстрация онбординга — то, что делает приложение узнаваемым.',
      },
    },
  },
};

export const Ассистент = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      <ErgizAvatar size={28} />
      <ErgizAvatar size={40} />
      <ErgizAvatar size={56} />
      <ErgizAvatar size={80} />
    </div>
  ),
  parameters: { docs: { description: { story: 'Ергиз — ассистент компании. Аватарка масштабируется одним параметром size.' } } },
};

export const Заставка = {
  render: () => <Splash />,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: { description: { story: 'Показывается на старте и уезжает прозрачностью через проп exiting.' } },
  },
};

export const Онбординг = {
  render: () => <OnboardingArt />,
  parameters: { docs: { description: { story: 'Иллюстрация экрана входа — собрана на CSS, без растровых картинок.' } } },
};
