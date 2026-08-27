import { ProfileSkeleton, HomeSkeleton, ChatsSkeleton, PostsSkeleton } from '../Skeleton';

export default {
  title: 'Организмы/Скелетоны',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Скелетон повторяет композицию будущего экрана, а не абстрактные полосы. Показывается один '
          + 'раз на маршрут, 700 мс. Меняете экран — обновите скелетон, иначе он врёт.',
      },
    },
  },
};

export const Профиль = { render: () => <ProfileSkeleton /> };
export const Главная = { render: () => <HomeSkeleton /> };
export const Чаты = { render: () => <ChatsSkeleton /> };
export const Лента = { render: () => <PostsSkeleton /> };
