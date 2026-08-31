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
import Splash from '../components/Splash';
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

// Экраны идут по сценарию, а не по типу: вход, потом каждая вкладка со своими
// ветками, и оверлей стоит сразу за тем экраном, откуда вызывается. Так видно
// путь целиком, а не отдельно «все экраны» и отдельно «все листы».
// kind: 'overlay' — только пометка в подписи, на рендер не влияет.
const sheet = (item) => ({ ...item, kind: 'overlay' });

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
    id: 'entry',
    title: 'Вход',
    hint: 'С чего начинается сессия: заставка и авторизация по номеру. Пространство выбирают здесь — от него зависят цвета всего приложения.',
    items: [
      { id: 'splash', title: 'Заставка', route: '/', render: () => <Splash /> },
      {
        id: 'auth', title: 'Вход', note: 'Онбординг → пространство → номер → код',
        route: '/auth', render: () => <Auth />,
      },
    ],
  },
  {
    id: 'home',
    title: 'Главная',
    hint: 'Точка входа в рабочий день: избранные сервисы, задачи, публикации. Отсюда уходят в уведомления и глобальный поиск.',
    items: [
      { id: 'home', title: 'Главная', route: '/', render: tab(Home) },
      sheet({
        id: 'screen-menu', title: 'Меню «трёх точек»', note: 'Одно и то же на всех кор-экранах',
        route: '/', render: over(Home, () => <ScreenMenu open onClose={noop} onRefresh={noop} />),
      }),
      { id: 'search', title: 'Глобальный поиск', route: '/search', render: () => <Search /> },
      { id: 'banner', title: 'Баннер', route: '/banner', render: () => <BannerDetail /> },
      { id: 'notifications', title: 'Уведомления', note: 'По колокольчику в шапке', route: '/notifications', render: () => <Notifications /> },
      {
        id: 'notif-group', title: 'Группа уведомлений', note: 'Дни — липкие пилюли, как в чате',
        route: '/notifications/esed', render: routed('/notifications/:groupId', NotificationGroup),
      },
      {
        id: 'set-notif', title: 'Настройка уведомлений', note: 'Шестерёнка в шапке уведомлений',
        route: '/settings/notifications', render: () => <NotificationSettings />,
      },
    ],
  },
  {
    id: 'feed',
    title: 'Лента',
    hint: 'Публикации и мероприятия компании. Из карточки — на саму публикацию, оттуда в канал.',
    items: [
      { id: 'posts', title: 'Лента', route: '/posts', render: tab(Posts) },
      { id: 'article', title: 'Публикация', route: '/article', render: () => <ArticleView /> },
      { id: 'channel', title: 'Канал', route: '/channel/erg-news', render: routed('/channel/:channelId', ChannelView) },
      { id: 'event', title: 'Мероприятие', route: at('/event', { id: events[0].id }), render: () => <EventView /> },
    ],
  },
  {
    id: 'services',
    title: 'Сервисы',
    hint: 'Каталог рабочих сервисов. Сервис открывается мини-приложением внутри qollab, избранное настраивается шестерёнкой.',
    items: [
      { id: 'services', title: 'Сервисы', route: '/services', render: tab(Services) },
      { id: 'services-all', title: 'Каталог сервисов', route: '/services/sheet', render: () => <ServicesSheet /> },
      { id: 'miniapp', title: 'Мини-приложение', route: '/app/esed', render: routed('/app/*', MiniApp) },
      { id: 'favorites', title: 'Настройка избранного', route: '/favorites', render: () => <Favorites /> },
    ],
  },
  {
    id: 'chats',
    title: 'Чаты',
    hint: 'От списка к переписке. Групповой чат рисует ChatRoom, всё остальное — DMChat: личные, ассистент, архив уволенного.',
    items: [
      { id: 'chats', title: 'Список чатов', route: '/chats', render: tab(Chats) },
      {
        id: 'chats-select', title: 'Режим выбора', note: 'Карандаш в шапке; таб-бар уступает место действиям',
        route: '/chats', render: () => <ChatsSelecting />,
      },
      { id: 'new-chat', title: 'Новый чат', route: '/new-chat', render: () => <NewChat /> },
      { id: 'dm', title: 'Личный чат', route: at('/chats/dm', { chat: dmChat }), render: () => <DMChat /> },
      { id: 'room', title: 'Групповой чат', route: '/chats/prodev', render: () => <ChatRoom /> },
      { id: 'dm-group', title: 'Группа из списка', route: at('/chats/dm', { chat: groupChat }), render: () => <DMChat /> },
      {
        id: 'dm-empty', title: 'Пустой чат', note: 'Переписки ещё нет: внизу плашка про шифрование',
        route: at('/chats/dm', { chat: emptyChat }), render: () => <DMChat />,
      },
      {
        id: 'dm-dismissed', title: 'Чат с уволенным', note: 'Писать нельзя: на месте поля — объяснение',
        route: at('/chats/dm', { chat: dismissedChat }), render: () => <DMChat />,
      },
      sheet({
        id: 'attach', title: 'Прикрепить', note: 'По «плюсу» у поля ввода',
        route: '/chats/prodev', render: over(ChatRoom, () => <AttachSheet onClose={noop} onPick={noop} />),
      }),
      sheet({
        id: 'msg-menu', title: 'Меню сообщения', note: 'Долгое нажатие: бабл поднимается над размытым фоном',
        route: '/chats/prodev', render: () => <MessageMenuDemo />,
      }),
      sheet({
        id: 'msg-menu-mine', title: 'Меню своего сообщения', note: 'У своего добавляется «Изменить»',
        route: '/chats/prodev', render: () => <MessageMenuDemo mine />,
      }),
      sheet({
        id: 'forward', title: 'Переслать', note: '«Избранное» первым — туда пересылают чаще',
        route: '/chats/prodev', render: over(ChatRoom, () => <ForwardSheet onClose={noop} onPick={noop} />),
      }),
      sheet({
        id: 'pinned', title: 'Закреплённые', note: 'Из полосы под шапкой чата',
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
      }),
      { id: 'chat-search', title: 'Поиск в чате', route: '/chat-search', render: () => <ChatSearch /> },
    ],
  },
  {
    id: 'assistant',
    title: 'Ассистент',
    hint: 'Ергиз — отдельная ветка чатов: подсказки вместо пустого поля, разговоры хранятся историей.',
    items: [
      {
        id: 'dm-bot', title: 'Чат с ассистентом', note: 'Подсказки под приветствием',
        route: at('/chats/dm', { chat: botChat }), render: () => <DMChat />,
      },
      sheet({
        id: 'ergiz-history', title: 'Диалоги ассистента', note: 'Поиск, архив и прошлые разговоры',
        route: at('/chats/dm', { chat: botChat }),
        render: over(DMChat, () => <ErgizHistory open onClose={noop} onPick={noop} />),
      }),
    ],
  },
  {
    id: 'people',
    title: 'Собеседник',
    hint: 'Открывается из шапки чата и из оргструктуры — экран один и тот же. Отличается только то, что о человеке известно.',
    items: [
      { id: 'person', title: 'Профиль коллеги', route: at('/person', { id: 'ayazhan', online: true }), render: () => <PersonProfile /> },
      {
        id: 'person-empty', title: 'Без общей истории', note: 'Вкладки честно пустые, а не с нулями',
        route: at('/person', { id: 'aliya-seitova', employee: employees.find((e) => e.id === 'aliya-seitova') }),
        render: () => <PersonProfile />,
      },
      {
        id: 'person-dismissed', title: 'Профиль уволенного', note: 'Тот же шаблон, но урезанный',
        route: at('/person', { id: 'ekaterina' }), render: () => <PersonProfile />,
      },
      { id: 'group-profile', title: 'Профиль группы', route: at('/group', { id: 'prodev' }), render: () => <GroupProfile /> },
      sheet({
        id: 'mute', title: 'Звук чата', note: 'Три режима вместо переключателя',
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
      }),
      sheet({
        id: 'leave', title: 'Выход из группы', note: 'Необратимое действие спрашивает подтверждение',
        route: at('/group', { id: 'prodev' }),
        render: over(GroupProfile, () => (
          <ConfirmDialog
            title="Покинуть группу?"
            text="Переписка останется у остальных участников. Вернуться можно по приглашению."
            confirmLabel="Покинуть" danger onConfirm={noop} onCancel={noop}
          />
        )),
      }),
    ],
  },
  {
    id: 'me',
    title: 'Свой профиль',
    hint: 'Статус, визитка и пропуск, корпоративные данные и SOS-контакты. Отсюда же — рабочие сервисы и настройки.',
    items: [
      { id: 'profile', title: 'Профиль', route: '/profile', render: tab(Profile) },
      sheet({
        id: 'status-sheet', title: 'Выбор статуса', note: 'Пункт можно примерить, не применяя сразу',
        route: '/profile', render: over(Profile, () => <StatusSheet value={null} onClose={noop} onPick={noop} />),
      }),
      sheet({
        id: 'status-actions', title: 'Действия со статусом', note: 'Если статус уже стоит',
        route: '/profile', render: over(Profile, () => <StatusActions onClose={noop} onEdit={noop} onClear={noop} />),
      }),
      sheet({
        id: 'vcard', title: 'QR-визитка', note: 'По «QR-коду» и «Визитке» — лист один',
        route: '/profile', render: over(Profile, () => <VCardSheet onClose={noop} />),
      }),
      { id: 'pass', title: 'Пропуск по QR', note: 'По «Таб. номеру». Часы идут: так живой экран отличают от скриншота', route: '/profile/qr', render: () => <ProfileQr /> },
      { id: 'id-card', title: 'Моя ID карта', route: '/profile/id', render: () => <IdCard /> },
      { id: 'photo', title: 'Фото профиля', route: '/profile/photo', render: () => <ProfilePhoto /> },
      sheet({
        id: 'sos-menu', title: 'Действия по SOS-контакту', note: 'Тапом по строке целиком',
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
      }),
      sheet({
        id: 'sos-add', title: 'Добавить SOS-контакт', note: 'Та же форма и для изменения',
        route: '/profile', render: over(Profile, () => <SosSheet onClose={noop} onSave={noop} />),
      }),
      sheet({
        id: 'sos-edit', title: 'Изменить SOS-контакт', note: 'Форма заполнена',
        route: '/profile', render: over(Profile, () => <SosSheet contact={sosContacts[0]} onClose={noop} onSave={noop} />),
      }),
      sheet({
        id: 'sos-delete', title: 'Удаление контакта',
        route: '/profile',
        render: over(Profile, () => (
          <ConfirmDialog
            title="Удалить контакт?"
            text={`${sosContacts[0].name} перестанет быть SOS-контактом. Контакт можно будет добавить заново.`}
            confirmLabel="Удалить" danger onConfirm={noop} onCancel={noop}
          />
        )),
      }),
      sheet({
        id: 'side-menu', title: 'Рабочие сервисы', note: 'Иконка в шапке профиля',
        route: '/profile', render: over(Profile, () => <SideMenu open onClose={noop} />),
      }),
      sheet({
        id: 'toast', title: 'Тост', note: 'Живёт пару секунд и ничего не оставляет',
        route: '/profile', render: over(Profile, () => <Toast text="Рахмет отправлен" onDone={noop} duration={10 ** 7} />),
      }),
    ],
  },
  {
    id: 'settings',
    title: 'Настройки',
    hint: 'Открываются шестерёнкой в профиле. Каркас у подэкранов общий: шапка с «назад», прокрутка и выезд справа.',
    items: [
      { id: 'settings', title: 'Настройки', route: '/settings', render: () => <Settings /> },
      sheet({
        id: 'lang', title: 'Выбор языка',
        route: '/settings',
        render: over(Settings, () => (
          <ActionSheet
            title="Язык"
            items={[{ id: 'ru', label: '🇷🇺  Русский' }, { id: 'kk', label: '🇰🇿  Қазақ тілі' }]}
            selected="ru" onClose={noop} onPick={noop}
          />
        )),
      }),
      { id: 'set-devices', title: 'Устройства', route: '/settings/devices', render: () => <Devices /> },
      { id: 'set-perms', title: 'Разрешения', route: '/settings/permissions', render: () => <Permissions /> },
      { id: 'set-help', title: 'Помощь', route: '/settings/help', render: () => <Help /> },
      { id: 'set-device-info', title: 'Данные об устройстве', route: '/settings/help/device', render: () => <DeviceInfo /> },
      { id: 'set-privacy', title: 'Конфиденциальность', route: '/settings/privacy', render: () => <Privacy /> },
      sheet({
        id: 'logout', title: 'Выход из аккаунта',
        route: '/settings',
        render: over(Settings, () => (
          <ConfirmDialog
            title="Выйти из аккаунта?"
            text="Переписка останется на сервере, но войти придётся заново."
            confirmLabel="Выйти" danger onConfirm={noop} onCancel={noop}
          />
        )),
      }),
    ],
  },
];

export const SCREEN_COUNT = SCREEN_GROUPS.reduce((n, g) => n + g.items.length, 0);
