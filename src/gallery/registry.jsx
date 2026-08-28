import Home from '../screens/Home';
import Posts from '../screens/Posts';
import Services from '../screens/Services';
import Chats from '../screens/Chats';
import Profile from '../screens/Profile';
import ChatRoom from '../screens/ChatRoom';
import DMChat from '../screens/DMChat';
import NewChat from '../screens/NewChat';
import ChatSearch from '../screens/ChatSearch';
import PersonProfile from '../screens/PersonProfile';
import GroupProfile from '../screens/GroupProfile';
import ProfilePhoto from '../screens/ProfilePhoto';
import ProfileQr from '../screens/ProfileQr';
import IdCard from '../screens/IdCard';
import ArticleView from '../screens/ArticleView';
import EventView from '../screens/EventView';
import ChannelView from '../screens/ChannelView';
import BannerDetail from '../screens/BannerDetail';
import MiniApp from '../screens/MiniApp';
import ServicesSheet from '../screens/ServicesSheet';
import Favorites from '../screens/Favorites';
import Auth from '../screens/Auth';
import Search from '../screens/Search';
import Notifications from '../screens/Notifications';
import NotificationGroup from '../screens/NotificationGroup';
import Settings from '../screens/Settings';
import {
  NotificationSettings, Permissions, Devices, Help, DeviceInfo, Privacy,
} from '../screens/SettingsPages';
import BottomNav from '../components/BottomNav';
import ScreenMenu from '../components/ScreenMenu';
import SideMenu from '../components/SideMenu';
import StatusSheet from '../components/StatusSheet';
import StatusActions from '../components/StatusActions';
import SosSheet from '../components/SosSheet';
import VCardSheet from '../components/VCardSheet';
import ActionSheet from '../components/ActionSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import AttachSheet from '../components/AttachSheet';
import ForwardSheet from '../components/ForwardSheet';
import { PinnedList } from '../components/PinnedBar';
import ErgizHistory from '../components/ErgizHistory';
import Toast from '../components/Toast';
import { MessageMenuDemo, ChatsSelecting } from './overlays';
import { Routes, Route } from 'react-router-dom';
import { Edit24Regular, Delete24Regular, Alert24Regular, AlertOff24Regular } from '@fluentui/react-icons';
import { sosContacts } from '../data/profile';
import { employees } from '../data/employees';
import { events } from '../data/feed';

const noop = () => {};

// Вкладку показываем с таб-баром: в приложении он живёт в App и на экране
// есть всегда, без него вкладка выглядит короче, чем на самом деле.
const tab = (Screen) => () => (<><Screen /><BottomNav /></>);

// Экраны, которым нужен параметр в адресе, оборачиваем в свой Routes:
// иначе useParams вернёт пустоту и экран покажет заглушку «не найдено».
const routed = (path, Screen) => () => (
  <Routes><Route path={path} element={<Screen />} /></Routes>
);

// Оверлей рисуем поверх настоящего экрана-родителя, а не на пустом месте:
// половина смысла листа — как он ложится на то, из чего вызван.
const over = (Screen, Overlay) => () => (<><Screen /><Overlay /></>);

const dmChat = {
  profileId: 'ayazhan', avatar: '/img/chats/ayazhan.png',
  title: 'Аяжан Сериккызы', preview: 'Салем, там задача', time: '13:21', online: true,
};
const botChat = {
  kind: 'bot', avatar: '/img/chats/ergiz-avatar.png',
  title: 'ERGiz – Искусственный интеллект',
  preview: 'Привет! хочу задать вам пару коротких вопросов', time: '13:44',
};
const dismissedChat = {
  id: 'ekaterina', profileId: 'ekaterina', dismissed: true,
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  title: 'Екатерина Сорокина', preview: 'спасибо!', time: '08.08',
  lastSeen: '19.06.2026 в 14:55',
};
// Пустая переписка выбирается по имени: hashStr(title) % 4 === 0
const emptyChat = { profileId: 'saltanat', title: 'Салтанат Ералиева', avatar: '/img/chats/aray.png', preview: '', time: '' };
const groupChat = {
  kind: 'group', avatar: '/img/chats/qollab-group.png', title: 'Групповой чат qollab',
  sender: 'Айдар С.:', preview: 'Вот скрин приложения', time: '10:01',
};

const at = (pathname, state) => ({ pathname, state });

export const SCREEN_GROUPS = [
  {
    id: 'tabs',
    title: 'Вкладки',
    hint: 'Пять корневых разделов. У всех общий каркас: шапка, прокрутка, потягивание для обновления.',
    items: [
      { id: 'home', title: 'Главная', route: '/', render: tab(Home) },
      { id: 'posts', title: 'Лента', route: '/posts', render: tab(Posts) },
      { id: 'services', title: 'Сервисы', route: '/services', render: tab(Services) },
      { id: 'chats', title: 'Чаты', route: '/chats', render: tab(Chats) },
      { id: 'profile', title: 'Профиль', route: '/profile', render: tab(Profile) },
      {
        id: 'chats-select', title: 'Чаты: режим выбора',
        note: 'Карандаш в шапке; таб-бар уступает место действиям',
        route: '/chats', render: () => <ChatsSelecting />,
      },
    ],
  },
  {
    id: 'chat',
    title: 'Переписка',
    hint: 'Групповой чат рисует ChatRoom, всё остальное — DMChat: личные, ассистент, архив уволенного.',
    items: [
      { id: 'room', title: 'Групповой чат', route: '/chats/prodev', render: () => <ChatRoom /> },
      { id: 'dm', title: 'Личный чат', route: at('/chats/dm', { chat: dmChat }), render: () => <DMChat /> },
      {
        id: 'dm-empty', title: 'Пустой чат', note: 'Переписки ещё нет: внизу плашка про шифрование',
        route: at('/chats/dm', { chat: emptyChat }), render: () => <DMChat />,
      },
      {
        id: 'dm-bot', title: 'Ассистент', note: 'Подсказки под приветствием, история диалогов в шапке',
        route: at('/chats/dm', { chat: botChat }), render: () => <DMChat />,
      },
      {
        id: 'dm-dismissed', title: 'Чат с уволенным', note: 'Писать нельзя: на месте поля — объяснение',
        route: at('/chats/dm', { chat: dismissedChat }), render: () => <DMChat />,
      },
      { id: 'dm-group', title: 'Группа из списка', route: at('/chats/dm', { chat: groupChat }), render: () => <DMChat /> },
      { id: 'new-chat', title: 'Новый чат', route: '/new-chat', render: () => <NewChat /> },
      { id: 'chat-search', title: 'Поиск в чате', route: '/chat-search', render: () => <ChatSearch /> },
    ],
  },
  {
    id: 'profiles',
    title: 'Профили',
    hint: 'Профиль коллеги один на всё приложение: и из оргструктуры, и из чата открывается он же.',
    items: [
      { id: 'person', title: 'Коллега', route: at('/person', { id: 'ayazhan', online: true }), render: () => <PersonProfile /> },
      {
        id: 'person-empty', title: 'Коллега без общей истории', note: 'Вкладки честно пустые, а не с нулями',
        route: at('/person', { id: 'aliya-seitova', employee: employees.find((e) => e.id === 'aliya-seitova') }),
        render: () => <PersonProfile />,
      },
      {
        id: 'person-dismissed', title: 'Профиль уволенного', note: 'Тот же шаблон, но урезанный',
        route: at('/person', { id: 'ekaterina' }), render: () => <PersonProfile />,
      },
      { id: 'group-profile', title: 'Профиль группы', route: at('/group', { id: 'prodev' }), render: () => <GroupProfile /> },
      { id: 'photo', title: 'Фото профиля', route: '/profile/photo', render: () => <ProfilePhoto /> },
      { id: 'id-card', title: 'Моя ID карта', route: '/profile/id', render: () => <IdCard /> },
      { id: 'pass', title: 'Пропуск по QR', note: 'Часы идут: по ним живой экран отличают от скриншота', route: '/profile/qr', render: () => <ProfileQr /> },
    ],
  },
  {
    id: 'content',
    title: 'Контент',
    hint: 'Всё, что открывается поверх вкладок. Под ними остаётся живой экран, поэтому прокрутка возвращается на место.',
    items: [
      { id: 'article', title: 'Публикация', route: '/article', render: () => <ArticleView /> },
      { id: 'event', title: 'Мероприятие', route: at('/event', { id: events[0].id }), render: () => <EventView /> },
      { id: 'channel', title: 'Канал', route: '/channel/erg-news', render: routed('/channel/:channelId', ChannelView) },
      { id: 'banner', title: 'Баннер', route: '/banner', render: () => <BannerDetail /> },
      { id: 'miniapp', title: 'Мини-приложение', route: '/app/esed', render: routed('/app/*', MiniApp) },
      { id: 'services-all', title: 'Каталог сервисов', route: '/services/sheet', render: () => <ServicesSheet /> },
      { id: 'favorites', title: 'Настройка избранного', route: '/favorites', render: () => <Favorites /> },
    ],
  },
  {
    id: 'system',
    title: 'Системные',
    hint: 'Вход, поиск и уведомления — то, что окружает основной сценарий.',
    items: [
      { id: 'auth', title: 'Вход', route: '/auth', render: () => <Auth /> },
      { id: 'search', title: 'Глобальный поиск', route: '/search', render: () => <Search /> },
      { id: 'notifications', title: 'Уведомления', route: '/notifications', render: () => <Notifications /> },
      {
        id: 'notif-group', title: 'Группа уведомлений', note: 'Дни — липкие пилюли, как в чате',
        route: '/notifications/esed', render: routed('/notifications/:groupId', NotificationGroup),
      },
    ],
  },
  {
    id: 'settings',
    title: 'Настройки',
    hint: 'Каркас у подэкранов общий: шапка с «назад», прокрутка и выезд справа.',
    items: [
      { id: 'settings', title: 'Настройки', route: '/settings', render: () => <Settings /> },
      { id: 'set-notif', title: 'Настройка уведомлений', route: '/settings/notifications', render: () => <NotificationSettings /> },
      { id: 'set-devices', title: 'Устройства', route: '/settings/devices', render: () => <Devices /> },
      { id: 'set-perms', title: 'Разрешения', route: '/settings/permissions', render: () => <Permissions /> },
      { id: 'set-help', title: 'Помощь', route: '/settings/help', render: () => <Help /> },
      { id: 'set-device-info', title: 'Данные об устройстве', route: '/settings/help/device', render: () => <DeviceInfo /> },
      { id: 'set-privacy', title: 'Конфиденциальность', route: '/settings/privacy', render: () => <Privacy /> },
    ],
  },
  {
    id: 'overlays',
    title: 'Листы и оверлеи',
    hint: 'Каждый показан поверх того экрана, откуда вызывается: половина смысла листа — как он ложится на то, из чего открыт.',
    items: [
      {
        id: 'screen-menu', title: 'Меню «трёх точек»', note: 'Поверх Главной; одно и то же на всех кор-экранах',
        route: '/', render: over(Home, () => <ScreenMenu open onClose={noop} onRefresh={noop} />),
      },
      {
        id: 'side-menu', title: 'Рабочие сервисы', note: 'Поверх Профиля',
        route: '/profile', render: over(Profile, () => <SideMenu open onClose={noop} />),
      },
      {
        id: 'status-sheet', title: 'Выбор статуса', note: 'Поверх Профиля',
        route: '/profile', render: over(Profile, () => <StatusSheet value={null} onClose={noop} onPick={noop} />),
      },
      {
        id: 'status-actions', title: 'Действия со статусом', note: 'Поверх Профиля, если статус уже стоит',
        route: '/profile', render: over(Profile, () => <StatusActions onClose={noop} onEdit={noop} onClear={noop} />),
      },
      {
        id: 'vcard', title: 'QR-визитка', note: 'Поверх Профиля, по «QR-коду» и «Визитке»',
        route: '/profile', render: over(Profile, () => <VCardSheet onClose={noop} />),
      },
      {
        id: 'sos-menu', title: 'Действия по SOS-контакту', note: 'Поверх Профиля, тапом по строке',
        route: '/profile',
        render: over(Profile, () => (
          <ActionSheet
            title={sosContacts[0].name}
            items={[
              { id: 'edit', label: 'Изменить', Icon: Edit24Regular },
              { id: 'delete', label: 'Удалить контакт', Icon: Delete24Regular, danger: true },
            ]}
            onClose={noop}
            onPick={noop}
          />
        )),
      },
      {
        id: 'sos-add', title: 'Добавить SOS-контакт', note: 'Поверх Профиля; та же форма и для изменения',
        route: '/profile', render: over(Profile, () => <SosSheet onClose={noop} onSave={noop} />),
      },
      {
        id: 'sos-edit', title: 'Изменить SOS-контакт', note: 'Та же форма, заполненная',
        route: '/profile', render: over(Profile, () => <SosSheet contact={sosContacts[0]} onClose={noop} onSave={noop} />),
      },
      {
        id: 'sos-delete', title: 'Удаление контакта', note: 'Необратимое действие спрашивает подтверждение',
        route: '/profile',
        render: over(Profile, () => (
          <ConfirmDialog
            title="Удалить контакт?"
            text={`${sosContacts[0].name} перестанет быть SOS-контактом. Контакт можно будет добавить заново.`}
            confirmLabel="Удалить" danger onConfirm={noop} onCancel={noop}
          />
        )),
      },
      {
        id: 'attach', title: 'Прикрепить', note: 'Поверх чата, по «плюсу» у поля ввода',
        route: '/chats/prodev', render: over(ChatRoom, () => <AttachSheet onClose={noop} onPick={noop} />),
      },
      {
        id: 'msg-menu', title: 'Меню сообщения', note: 'Долгое нажатие: бабл поднимается над размытым фоном',
        route: '/chats/prodev', render: () => <MessageMenuDemo />,
      },
      {
        id: 'msg-menu-mine', title: 'Меню своего сообщения', note: 'У своего добавляется «Изменить»',
        route: '/chats/prodev', render: () => <MessageMenuDemo mine />,
      },
      {
        id: 'forward', title: 'Переслать', note: 'Поверх чата; «Избранное» первым — туда пересылают чаще',
        route: '/chats/prodev', render: over(ChatRoom, () => <ForwardSheet onClose={noop} onPick={noop} />),
      },
      {
        id: 'pinned', title: 'Закреплённые', note: 'Поверх чата, из полосы под шапкой',
        route: '/chats/prodev',
        render: over(ChatRoom, () => (
          <PinnedList
            items={[
              { id: 1, author: 'Нурлан Б.', text: 'Релиз переносим на пятницу', time: '10:12' },
              { id: 2, author: 'Динара Т.', text: 'Ссылка на макеты в закрепе', time: '11:40' },
            ]}
            onClose={noop} onUnpin={noop} onUnpinAll={noop}
          />
        )),
      },
      {
        id: 'mute', title: 'Звук чата', note: 'Поверх профиля группы',
        route: at('/group', { id: 'prodev' }),
        render: over(GroupProfile, () => (
          <ActionSheet
            title="Звук"
            items={[
              { id: 'on', label: 'Включён', Icon: Alert24Regular },
              { id: 'hour', label: 'Отключить на час', Icon: AlertOff24Regular },
              { id: 'off', label: 'Отключить', Icon: AlertOff24Regular },
            ]}
            selected="on" onClose={noop} onPick={noop}
          />
        )),
      },
      {
        id: 'leave', title: 'Выход из группы', note: 'Поверх профиля группы',
        route: at('/group', { id: 'prodev' }),
        render: over(GroupProfile, () => (
          <ConfirmDialog
            title="Покинуть группу?"
            text="Переписка останется у остальных участников. Вернуться можно по приглашению."
            confirmLabel="Покинуть" danger onConfirm={noop} onCancel={noop}
          />
        )),
      },
      {
        id: 'ergiz-history', title: 'Диалоги ассистента', note: 'Поверх чата с Ергиз',
        route: at('/chats/dm', { chat: botChat }),
        render: over(DMChat, () => <ErgizHistory open onClose={noop} onPick={noop} />),
      },
      {
        id: 'lang', title: 'Выбор языка', note: 'Поверх Настроек',
        route: '/settings',
        render: over(Settings, () => (
          <ActionSheet
            title="Язык"
            items={[{ id: 'ru', label: '🇷🇺  Русский' }, { id: 'kk', label: '🇰🇿  Қазақ тілі' }]}
            selected="ru" onClose={noop} onPick={noop}
          />
        )),
      },
      {
        id: 'logout', title: 'Выход из аккаунта', note: 'Поверх Настроек',
        route: '/settings',
        render: over(Settings, () => (
          <ConfirmDialog
            title="Выйти из аккаунта?"
            text="Переписка останется на сервере, но войти придётся заново."
            confirmLabel="Выйти" danger onConfirm={noop} onCancel={noop}
          />
        )),
      },
      {
        id: 'toast', title: 'Тост', note: 'Поверх Профиля: живёт пару секунд и ничего не оставляет',
        route: '/profile', render: over(Profile, () => <Toast text="Рахмет отправлен" onDone={noop} duration={10 ** 7} />),
      },
    ],
  },
];

export const SCREEN_COUNT = SCREEN_GROUPS.reduce((n, g) => n + g.items.length, 0);
