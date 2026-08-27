import { Document24Filled, Image24Filled, People24Filled } from '@fluentui/react-icons';
import EmptyTab from '../EmptyTab';
import '../../screens/PersonProfile.css';

export default {
  title: 'Атомы/Пустое состояние',
  component: EmptyTab,
  parameters: {
    docs: {
      description: {
        component: 'Объясняет, что здесь появится. Иконка нейтральная, не красная: это нормальное состояние, а не ошибка.',
      },
    },
  },
};

export const Файлы = {
  args: { Icon: Document24Filled, title: 'Файлов пока нет', text: 'Документы из переписки появятся здесь' },
};

export const Медиа = {
  args: { Icon: Image24Filled, title: 'Общих фото и видео нет', text: 'Вы ещё не отправляли друг другу медиа' },
};

export const Группы = {
  args: { Icon: People24Filled, title: 'Общих групп нет', text: 'Вы пока не состоите в одних и тех же группах' },
};
