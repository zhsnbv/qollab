import Settings from '../Settings';
import WidgetSettings from '../WidgetSettings';
import {
  NotificationSettings, Permissions, Devices, Help, DeviceInfo, Privacy,
} from '../SettingsPages';

export default {
  title: 'Экраны/Настройки',
  parameters: {
    layout: 'fullscreen',
    device: 'full',
    docs: {
      description: {
        component:
          'Настройки и их подэкраны. Каркас у всех общий — SettingsPage: шапка с «назад», '
          + 'заголовок, прокрутка и выезд справа. Шесть копий этой обвязки разошлись бы на первой '
          + 'же правке высоты шапки.',
      },
    },
  },
};

export const Список = {
  render: () => <Settings />,
  parameters: {
    route: '/settings',
    docs: {
      description: {
        story:
          'Каждая строка знает, что делает: подэкран открывается оверлеем, выбор языка '
          + 'и оформления — листом снизу, выход и очистка кэша — подтверждением.',
      },
    },
  },
};

export const Виджеты = {
  name: 'Панель «Виджеты»',
  render: () => <WidgetSettings />,
  parameters: {
    route: '/widgets/settings',
    docs: {
      description: {
        story:
          'Карточки в два столбца, в каждой уменьшенный вид самого виджета — человек добавляет '
          + 'то, что видит. Кнопки «Сохранить» нет, изменения применяются сразу. У постоянных '
          + 'виджетов кнопки нет вовсе: нажимать нечего, и причина сказана прямо — «Всегда '
          + 'на главной». Скрыть оба настраиваемых можно: лента не опустеет, постоянные останутся.',
      },
    },
  },
};

export const Уведомления = {
  render: () => <NotificationSettings />,
  parameters: {
    route: '/settings/notifications',
    docs: {
      description: {
        story:
          'Push приходят от сервисов, а не «вообще»: выключается каждый по отдельности. '
          + 'Общего рубильника нет намеренно — человек глушит шумный сервис, а не связь '
          + 'с компанией.',
      },
    },
  },
};

export const Устройства = {
  render: () => <Devices />,
  parameters: {
    route: '/settings/devices',
    docs: {
      description: {
        story:
          'Привязка веб-версии по QR и список сессий. Завершение чужих сессий — разрушающее '
          + 'действие: красным и с подтверждением, в котором сказано, что это устройство '
          + 'останется в сети. Иллюстрация нарисована вектором, поэтому перекрашивается '
          + 'под тему и пространство.',
      },
    },
  },
};

export const Разрешения = {
  render: () => <Permissions />,
  parameters: {
    route: '/settings/permissions',
    docs: { description: { story: 'Прототип держит своё состояние: настоящие разрешения выдаёт система, и подменять её диалоги приложение не должно.' } },
  },
};

export const Помощь = {
  render: () => <Help />,
  parameters: { route: '/settings/help' },
};

export const ДанныеОбУстройстве = {
  name: 'Данные об устройстве',
  render: () => <DeviceInfo />,
  parameters: {
    route: '/settings/help/device',
    docs: { description: { story: 'Карточку копируют целиком и присылают в обращении, поэтому кнопка кладёт в буфер весь список, а не отдельные поля.' } },
  },
};

export const Конфиденциальность = {
  render: () => <Privacy />,
  parameters: {
    route: '/settings/privacy',
    docs: { description: { story: 'Текст с qollab.kz/privacy. Он лежит в данных, а экран только рисует заголовки, абзацы и списки.' } },
  },
};
