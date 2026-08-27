import { useState } from 'react';
import Message from '../Message';
import MessageMenu from '../MessageMenu';
import '../../screens/ChatRoom.css';

const msgs = [
  { id: 1, text: 'Привет! Как продвигается задача?', time: '13:21' },
  { id: 2, text: 'Сегодня доделаю и скину на ревью', time: '13:24', mine: true, status: 'read' },
];

// Меню привязано к настоящему узлу сообщения: копия снимается с него, а панели
// считаются от его рамки. Поэтому и в истории нажимаем по живому баблу, а не
// подставляем меню в пустоту — так видно ровно то, что увидит человек.
function Demo() {
  const [menu, setMenu] = useState(null);
  return (
    <div className="cr-list" style={{ padding: '16px 12px' }}>
      {msgs.map((m) => (
        <Message
          key={m.id}
          msg={m}
          mine={!!m.mine}
          firstOfGroup
          lastOfGroup
          withAvatarSlot={false}
          onLongPress={(msg, rect, node) => setMenu({ msg, mine: !!m.mine, rect, node })}
        />
      ))}
      {menu && (
        <MessageMenu
          msg={menu.msg}
          mine={menu.mine}
          rect={menu.rect}
          node={menu.node}
          onClose={() => setMenu(null)}
          onAction={() => setMenu(null)}
          onReact={() => setMenu(null)}
        />
      )}
    </div>
  );
}

export default {
  title: 'Организмы/Меню сообщения',
  component: MessageMenu,
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Долгое нажатие по баблу. Само сообщение остаётся на своём месте и поднимается над '
          + 'размытым фоном — сразу видно, на что нажали. Реакции встают над ним, действия под ним, '
          + 'и обе панели держатся за его рамку. Пока сцена не измерена, содержимое скрыто: иначе '
          + 'первый кадр рисуется в углу и панели дёргаются на место.',
      },
    },
  },
};

export const ДолгоеНажатие = {
  name: 'Долгое нажатие',
  render: () => <Demo />,
  parameters: { docs: { description: { story: 'Нажмите и удержите бабл. У своего сообщения появляется «Изменить», у чужого — нет.' } } },
};
