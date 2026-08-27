import ProfileHero from '../ProfileHero';
import StatusBubble from '../StatusBubble';
import { statusById, emptyStatus } from '../../data/statuses';
import { me } from '../../data/profile';
import { userProfiles } from '../../data/chatProfiles';
import '../../screens/Profile.css';
import '../../screens/PersonProfile.css';

export default {
  title: 'Организмы/Шапка профиля',
  component: ProfileHero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Общая шапка своего профиля и профиля коллеги: аватар, имя, должность, статус и слот для '
          + 'действий с вкладками. Статус приходит отдельным слотом, поэтому у себя это кнопка, '
          + 'а у коллеги — подпись.',
      },
    },
  },
};

const actions = (labels) => (
  <div className="pp-actions">
    {labels.map((l) => (
      <button className="quick-item" key={l}>
        <span className="quick-ico">●</span>
        <span className="quick-label">{l}</span>
      </button>
    ))}
  </div>
);

export const Свой = {
  render: () => (
    <ProfileHero me={me} onPhoto={() => {}} status={<StatusBubble status={emptyStatus} onClick={() => {}} />}>
      {actions(['ID-карта', 'QR-код', 'Визитка', 'Таб. номер'])}
    </ProfileHero>
  ),
};

export const Коллега = {
  render: () => {
    const p = userProfiles.ayazhan;
    return (
      <ProfileHero
        me={p}
        status={<>
          <StatusBubble status={statusById('busy')} />
          <div className="phero-presence">{p.status}</div>
        </>}
      >
        {actions(['Написать', 'Звонок', 'Рахмет', 'Поиск'])}
      </ProfileHero>
    );
  },
};

export const БезФото = {
  name: 'Без фото',
  render: () => (
    <ProfileHero
      me={{ name: 'Нурлан Бейсенов', role: 'Backend разработчик (Python)', initials: 'НБ', tint: 'green' }}
      status={<div className="phero-presence">был(-а) в сети 12 минут назад</div>}
    />
  ),
  parameters: { docs: { description: { story: 'Инициалы красятся тинтами из чатов — человек выглядит одинаково везде.' } } },
};
