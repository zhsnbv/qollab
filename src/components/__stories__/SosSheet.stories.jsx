import { useState } from 'react';
import SosSheet from '../SosSheet';
import ActionSheet from '../ActionSheet';
import { Edit24Regular, Delete24Regular } from '@fluentui/react-icons';
import { sosContacts } from '../../data/profile';
import '../../screens/Profile.css';

export default {
  title: 'Молекулы/SOS-контакт',
  component: SosSheet,
  parameters: {
    device: 'full',
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Форма одна на добавление и на изменение: поля, проверки и вид совпадают, меняются '
          + 'только заголовок и то, с чем форма открылась. Разводить их на два компонента значило '
          + 'бы править каждое поле дважды. Степень родства выбирается не через <select>, '
          + 'а тем же листом действий, что и остальные списки в приложении.',
      },
    },
  },
};

export const Добавление = {
  render: () => <SosSheet onClose={() => {}} onSave={() => {}} />,
  parameters: {
    docs: {
      description: {
        story:
          '«Сохранить» ждёт имя, степень родства и полный номер: контакт без цифр бесполезен '
          + 'ровно в тот момент, когда он нужен.',
      },
    },
  },
};

export const Изменение = {
  render: () => <SosSheet contact={sosContacts[0]} onClose={() => {}} onSave={() => {}} />,
};

export const ДействияПоКонтакту = {
  name: 'Действия по контакту',
  render: () => (
    <ActionSheet
      title={sosContacts[0].name}
      items={[
        { id: 'edit', label: 'Изменить', Icon: Edit24Regular },
        { id: 'delete', label: 'Удалить контакт', Icon: Delete24Regular, danger: true },
      ]}
      onClose={() => {}}
      onPick={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Открывается тапом по строке контакта целиком. Раньше в углу строки стояли «три точки» — '
          + 'мишень 16px там, где вся строка и так ведёт ровно к этим двум действиям.',
      },
    },
  },
};

export const Строка = {
  render: () => {
    const [picked, setPicked] = useState(null);
    return (
      <div className="pcard" style={{ margin: 16 }}>
        <div className="sos-list">
          {sosContacts.map((c) => (
            <button className="sos-row" key={c.id} onClick={() => setPicked(c.id)}>
              <span className="sos-line">
                <span className="sos-name">{c.name}</span>
                <span className="sos-tag">{c.tag}</span>
              </span>
              <span className="sos-phone">{c.phone}</span>
              {c.note && <span className="sos-note">{c.note}</span>}
            </button>
          ))}
        </div>
        <p className="sos-hint">
          {picked ? 'Тап открывает действия по контакту' : 'SOS-контакты не видны другим сотрудникам — только вам, руководителю, HR и СБ.'}
        </p>
      </div>
    );
  },
  parameters: { docs: { description: { story: 'Строка списка: имя, степень родства, телефон акцентом и необязательный комментарий.' } } },
};
