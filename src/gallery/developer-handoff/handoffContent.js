export const REPOSITORY = 'https://github.com/zhsnbv/qollab';
export const sourceUrl = path => `${REPOSITORY}/blob/main/${path}`;
export const storyUrl = id => `/storybook/?path=/story/${encodeURIComponent(`экраны-настройки--${id}`)}`;
export const GROUPS = [
  ['all', 'Все темы'], ['standard', 'Стандартная'], ['gradient', 'Градиенты'],
  ['pattern', 'Паттерны'], ['art', 'Иллюстрации'], ['photo', 'Фотографии'], ['live', 'Live'],
];
export const SECTIONS = [
  ['overview', 'Обзор'], ['catalog', 'Темы и медиа'], ['implementation', 'Устройство проекта'],
  ['contracts', 'Правила и состояния'], ['verification', 'Проверка и выпуск'], ['resources', 'Документация'],
];
export const SOURCE_MAP = [
  ['Модель и сохранение', [
    ['src/utils/chatThemeCatalog.js', '33 пресета, пары цветов, read-цвета и миграция старого выбора.'],
    ['src/utils/chatAppearance.js', 'Связь темы с текущим рабочим пространством.'],
    ['src/utils/settingsPreferences.js', 'Локальные настройки qollab.settings.v2 и подписка на изменения.'],
    ['src/context/CompanyContext.jsx', 'ERG / Integra; workspace в sessionStorage.'],
  ]],
  ['Чаты и визуальное оформление', [
    ['src/components/ChatWallpaper.jsx', 'Общий фон для чата, превью и миниатюр.'],
    ['src/screens/ChatAppearance.css', 'Фоны, зерно, паттерны, цвета баблов и контрастные края.'],
    ['src/components/Message.jsx', 'Настоящие сообщения; время и статус внутри бабла.'],
    ['src/components/MessageDeliveryStatus.jsx', 'sending / sent / delivered / read / failed; chat и app scope.'],
    ['src/components/MessageDeliveryStatus.css', 'Нейтральные статусы и стандартный брендовый read-цвет.'],
    ['src/styles/tokens.css', 'Базовые поверхности и цвета ERG в светлом и тёмном режиме.'],
    ['src/styles/companies.css', 'Переопределения поверхностей и цветов рабочего пространства.'],
    ['src/components/MobileMessageMenu.jsx', 'Long press и поднятая копия исходного сообщения.'],
    ['src/components/MessageReactions.jsx', 'Реакции на сообщении.'],
  ]],
  ['Настройки, переходы и очистка', [
    ['src/screens/Settings.jsx', 'Корневое меню настроек.'],
    ['src/screens/SettingsExperience.jsx', 'Оформление, быстрая реакция, память и устройство.'],
    ['src/screens/SettingsChatThemes.jsx', 'Каталог пресетов, выбор темы и предпросмотр.'],
    ['src/screens/SettingsChatThemes.css', 'Закреплённый предпросмотр и прокручиваемая сетка каталога.'],
    ['src/components/SettingsRouteStack.jsx', 'Общий стек push/pop, фокус, inert и сохранение родительского экрана.'],
    ['src/utils/settingsNavigation.js', 'Маршруты, глубина и направление перехода.'],
    ['src/components/SettingsStorageVisuals.jsx', 'Donut, шкала устройства и полноэкранная очистка.'],
    ['src/components/Portal.jsx', 'Слои внутри DeviceHost; оверлеи не вырываются из телефона.'],
  ]],
  ['Видео и публикация', [
    ['src/utils/chatWallpaperPlayback.js', 'Пауза вне экрана, при hidden/inert, reduced motion и saveData.'],
    ['worker/video-assets.js', 'Byte ranges для MP4: 206, HEAD, If-Range и 416.'],
    ['scripts/chat-wallpapers-v11/README.txt', 'Переносимый renderer и происхождение 12 абстрактных лупов.'],
    ['scripts/chat-wallpapers-v11/supplied/README.md', 'Обработка 3 пользовательских роликов без изменения оригиналов.'],
    ['package.json', 'Полная сборка приложения и Storybook одной командой.'],
    ['wrangler.jsonc', 'Маршрутизация Worker и static assets.'],
  ]],
];
export const RULES = [
  ['Один выбор — один пресет', 'Фон, входящий и исходящий бабл, текст и read-цвет образуют единый набор. Сохраняйте только { preset: id }; свободный выбор цвета не возвращаем.'],
  ['Пространства независимы', 'chatAppearance.erg и chatAppearance.integra сохраняются отдельно. Стандартная тема берёт токены бренда. Пользовательская тема меняет только чат.'],
  ['Один источник визуала', 'Используйте ChatWallpaper, Message, MessageReactions и MobileMessageMenu. Превью и поднятое сообщение должны совпадать с настоящим чатом.'],
  ['Read-цвет ограничен баблом', 'palette.read.light / dark применяется только к read в сообщении и его поднятой копии. sending / sent / delivered остаются нейтральными. У standard palette=null: read берётся из MessageDeliveryStatus.css и брендовых токенов. Меню, список читателей и список чатов используют scope="app".'],
  ['Время всегда внутри', 'Время и receipt находятся внутри всех видов баблов: текст, фото, видео, голосовое, документ, цитата, профиль и ссылка.'],
  ['Честный Live', 'LIVE есть только у пресета с настоящим video. Ночная степь (live-lake) и Планета остаются статичными, несмотря на исторический ID.'],
];
export const ACCEPTANCE = [
  ['Палитры', 'ERG и Integra × светлый и тёмный режим. Текст, края и read-цвет сохраняют контраст на каждой теме.'],
  ['Сообщения', 'Пять статусов и все типы вложений. Время внутри; long press сохраняет фон, ширину, край и цвет текста.'],
  ['Каталог', 'Ширины 320 и 393 px; 33 плитки 9:16; одно выделение; шапка и превью закреплены; скролл только у сетки.'],
  ['Выбор и сохранение', 'Поменять тему в двух пространствах, перезагрузить страницу и вернуться. Выбор каждого пространства восстановлен.'],
  ['Видео', 'Poster до playing; пауза за экраном и под скрытым маршрутом; fallback при ошибке, reduced motion и saveData. Range запрос возвращает 206.'],
  ['Очистка и навигация', 'Запуск → процесс → готово → закрытие. Экран под blur, фон inert, фокус возвращается; push/pop без скачка скролла.'],
  ['Реальные устройства', 'Отдельно: iPhone / Android / WebView, VoiceOver, Low Power Mode, переключение приложения, энергия и память. Браузерный QA этого не заменяет.'],
  ['Публикация', 'Последний deployment обслуживает и приложение, и Storybook, и MP4. Перепроверить после завершения всех последующих сборок.'],
];
export const DOCS = [
  ['AGENTS.md', 'Правила для AI', 'Инварианты и порядок работы перед изменениями.'],
  ['docs/chat-themes-guide.md', 'Руководство по темам', 'Схема пресета, миграции, компоненты и медиа pipeline.'],
  ['docs/chat-themes-handoff.md', 'Технический handoff', 'Карта поведения, интеграция, проверки и известные ограничения.'],
  ['scripts/chat-wallpapers-v11/README.txt', 'Происхождение медиа', 'Воспроизводимые исходники абстрактных видео и атрибуция.'],
  ['scripts/chat-wallpapers-v11/supplied/README.md', 'Пользовательские видео', 'Повторная подготовка coast / prism / poppies из исходных MP4.'],
  ['docs/chat-live-wallpaper-prompts.txt', 'Промпты для сцен', 'Исходные промпты изображений и анимации; актуальные видео имеют длину 9 / 24 с.'],
];
