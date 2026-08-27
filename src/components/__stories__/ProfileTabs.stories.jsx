import { useState } from 'react';
import { PersonInfo16Regular, Image16Regular, Document16Regular, Link16Regular, People16Regular } from '@fluentui/react-icons';
import ProfileTabs from '../ProfileTabs';
import '../../screens/PersonProfile.css';
import '../../screens/ChatProfile.css';

export default {
  title: 'Молекулы/Пилюли-вкладки',
  component: ProfileTabs,
  parameters: {
    docs: {
      description: {
        component:
          'Ряд стоит между блоками, на сером фоне: внутри белой карточки пилюли сливаются с ней. '
          + 'Активная подтягивается к центру — иначе крайние вкладки остаются за краем.',
      },
    },
  },
};

const TABS = [
  { id: 'info', label: 'Сведения', Icon: PersonInfo16Regular },
  { id: 'media', label: 'Медиа', Icon: Image16Regular, count: (d) => d.media },
  { id: 'files', label: 'Файлы', Icon: Document16Regular, count: (d) => d.files },
  { id: 'links', label: 'Ссылки', Icon: Link16Regular, count: (d) => d.links },
  { id: 'groups', label: 'Общие группы', Icon: People16Regular, count: (d) => d.groups },
];

export const Ряд = {
  render: () => {
    const [tab, setTab] = useState('info');
    return <ProfileTabs tabs={TABS} value={tab} onChange={setTab} data={{ media: 6, files: 2, links: 34, groups: 4 }} />;
  },
};

export const БезИстории = {
  name: 'Без общей истории',
  render: () => {
    const [tab, setTab] = useState('info');
    return <ProfileTabs tabs={TABS} value={tab} onChange={setTab} data={{ media: 0, files: 0, links: 0, groups: 0 }} />;
  },
  parameters: { docs: { description: { story: 'Ноль — тоже информация: счётчик остаётся на месте.' } } },
};
