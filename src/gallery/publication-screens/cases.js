// Explicit, reviewable state inventory; each frame uses the real application components.
export const WEB_CASES = [
  {
    "id": "feed",
    "title": "Лента · все каналы",
    "group": "Лента"
  },
  {
    "id": "feed-filter",
    "title": "Лента · выбранный канал",
    "group": "Лента",
    "filter": "erg-production"
  },
  {
    "id": "card-news",
    "title": "Обычная статья · карточка",
    "group": "Карточки",
    "post": "news",
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "expanded-news",
    "title": "Обычная статья · текст раскрыт",
    "group": "Карточки",
    "post": "news",
    "only": true,
    "expanded": true,
    "scroll": ".pw-card-inner"
  },
  {
    "id": "card-audit",
    "title": "Обход · карточка",
    "group": "Карточки",
    "post": "audit",
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "expanded-audit",
    "title": "Обход · текст раскрыт",
    "group": "Карточки",
    "post": "audit",
    "only": true,
    "expanded": true,
    "scroll": ".pw-card-inner"
  },
  {
    "id": "card-prod-project-aglo",
    "title": "Проект-улучшение · карточка",
    "group": "Карточки",
    "post": "prod-project-aglo",
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "expanded-prod-project-aglo",
    "title": "Проект-улучшение · текст раскрыт",
    "group": "Карточки",
    "post": "prod-project-aglo",
    "only": true,
    "expanded": true,
    "scroll": ".pw-card-inner"
  },
  {
    "id": "audit-note",
    "title": "Обход · положительный момент на фото",
    "group": "Медиа",
    "post": "audit",
    "only": true,
    "mediaIndex": 1,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "audit-negative",
    "title": "Обход · зона развития на фото",
    "group": "Медиа",
    "post": "audit",
    "only": true,
    "mediaIndex": 1,
    "negative": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "gallery-next",
    "title": "Галерея · второй слайд",
    "group": "Медиа",
    "post": "news",
    "only": true,
    "mediaIndex": 1,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "video",
    "title": "Видео · обложка",
    "group": "Медиа",
    "video": true,
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "lightbox",
    "title": "Медиа · полноэкранный просмотр",
    "group": "Медиа",
    "post": "news",
    "only": true,
    "lightbox": true
  },
  {
    "id": "lightbox-audit",
    "title": "Обход · фото с замечанием во весь экран",
    "group": "Медиа",
    "post": "audit",
    "only": true,
    "mediaIndex": 1,
    "lightbox": true
  },
  {
    "id": "article-news",
    "title": "Обычная статья · просмотр",
    "group": "Статья",
    "page": "reader",
    "post": "news"
  },
  {
    "id": "article-audit",
    "title": "Обход · просмотр",
    "group": "Статья",
    "page": "reader",
    "post": "audit"
  },
  {
    "id": "article-prod-project-aglo",
    "title": "Проект-улучшение · просмотр",
    "group": "Статья",
    "page": "reader",
    "post": "prod-project-aglo"
  },
  {
    "id": "article-scrolled",
    "title": "Статья · прокрутка и кнопка наверх",
    "group": "Статья",
    "page": "reader",
    "post": "news",
    "scrollY": 1000
  },
  {
    "id": "article-liked",
    "title": "Статья · лайк",
    "group": "Статья",
    "page": "reader",
    "post": "news",
    "liked": true
  },
  {
    "id": "article-missing",
    "title": "Статья недоступна",
    "group": "Статья",
    "page": "reader",
    "post": "missing"
  },
  {
    "id": "comments-threads",
    "title": "Ветки и подветки",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "threads",
    "sheet": "comments"
  },
  {
    "id": "comments-collapsed",
    "title": "Длинная ветка свёрнута",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "collapsed",
    "sheet": "comments"
  },
  {
    "id": "comments-expanded",
    "title": "Длинная ветка раскрыта",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "expanded",
    "sheet": "comments"
  },
  {
    "id": "comments-reply",
    "title": "Ответ на комментарий",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "reply",
    "sheet": "comments"
  },
  {
    "id": "comments-draft",
    "title": "Написание комментария",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "draft",
    "sheet": "comments"
  },
  {
    "id": "comments-empty",
    "title": "Нет комментариев",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "empty",
    "sheet": "comments"
  },
  {
    "id": "comments-disabled",
    "title": "Комментарии отключены",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "disabled",
    "sheet": "comments"
  },
  {
    "id": "post-menu",
    "title": "Меню публикации",
    "group": "Действия",
    "post": "news",
    "only": true,
    "menu": true
  },
  {
    "id": "stats",
    "title": "Статистика показов",
    "group": "Действия",
    "page": "reader",
    "post": "news",
    "sheet": "stats"
  },
  {
    "id": "share",
    "title": "Поделиться публикацией",
    "group": "Действия",
    "page": "reader",
    "post": "news",
    "sheet": "share"
  },
  {
    "id": "channel",
    "title": "Канал · подписка включена",
    "group": "Канал",
    "page": "channel",
    "channel": "erg-news"
  },
  {
    "id": "channel-unsubscribed",
    "title": "Канал · без подписки",
    "group": "Канал",
    "page": "channel",
    "channel": "bts-news",
    "unsubscribed": true
  },
  {
    "id": "channel-empty",
    "title": "Канал · нет публикаций",
    "group": "Канал",
    "page": "channel",
    "channel": "bts-news",
    "empty": true
  },
  {
    "id": "feed-empty",
    "title": "Поиск · ничего не найдено",
    "group": "Лента",
    "query": "Несуществующая публикация"
  },
  {
    "id": "channel-settings",
    "title": "Настройки подписок",
    "group": "Канал",
    "steps": [
      {
        "click": "[aria-label=\"Настройка каналов\"]"
      }
    ]
  },
  {
    "id": "create-menu",
    "title": "Выбор типа публикации",
    "group": "Редактор",
    "page": "channel",
    "steps": [
      {
        "click": ".pw-feed-heading .qpub-btn"
      }
    ]
  },
  {
    "id": "create-news",
    "title": "Статья · создание",
    "group": "Редактор",
    "page": "editor",
    "type": "news",
    "blank": true
  },
  {
    "id": "edit-news",
    "title": "Статья · редактирование",
    "group": "Редактор",
    "page": "editor",
    "type": "news"
  },
  {
    "id": "preview-news",
    "title": "Статья · предпросмотр",
    "group": "Редактор",
    "page": "editor",
    "type": "news",
    "preview": true
  },
  {
    "id": "create-audit",
    "title": "Обход · создание",
    "group": "Редактор",
    "page": "editor",
    "type": "audit",
    "blank": true
  },
  {
    "id": "edit-audit",
    "title": "Обход · редактирование",
    "group": "Редактор",
    "page": "editor",
    "type": "audit"
  },
  {
    "id": "preview-audit",
    "title": "Обход · предпросмотр",
    "group": "Редактор",
    "page": "editor",
    "type": "audit",
    "preview": true
  },
  {
    "id": "create-project",
    "title": "Проект-улучшение · создание",
    "group": "Редактор",
    "page": "editor",
    "type": "project",
    "blank": true
  },
  {
    "id": "edit-project",
    "title": "Проект-улучшение · редактирование",
    "group": "Редактор",
    "page": "editor",
    "type": "project"
  },
  {
    "id": "preview-project",
    "title": "Проект-улучшение · предпросмотр",
    "group": "Редактор",
    "page": "editor",
    "type": "project",
    "preview": true
  },
  {
    "id": "editor-media",
    "title": "Медиа отдельно от текста",
    "group": "Редактор",
    "page": "editor",
    "type": "audit",
    "scroll": ".pw-uploaded-images"
  },
  {
    "id": "photo-description",
    "title": "Описание фото и тип замечания",
    "group": "Редактор",
    "page": "editor",
    "type": "audit",
    "photoModal": true
  },
  {
    "id": "video-url",
    "title": "Добавление видео",
    "group": "Редактор",
    "page": "editor",
    "type": "news",
    "videoModal": "youtube"
  },
  {
    "id": "editor-validation",
    "title": "Обязательные поля · ошибки",
    "group": "Редактор",
    "page": "editor",
    "type": "news",
    "blank": true,
    "steps": [
      {
        "click": ".pw-form-footer .qpub-btn-primary"
      }
    ]
  },
  {
    "id": "editor-settings",
    "title": "Рубрика и настройки публикации",
    "group": "Редактор",
    "page": "editor",
    "type": "news",
    "scroll": ".pw-form-footer"
  },
  {
    "id": "quilly-welcome",
    "title": "Квилли · приветствие",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "welcome"
  },
  {
    "id": "quilly-materials",
    "title": "Квилли · материалы и задача",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "materials"
  },
  {
    "id": "quilly-working",
    "title": "Квилли · подготовка статьи",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "working"
  },
  {
    "id": "quilly-result",
    "title": "Квилли · готовый вариант",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "result"
  },
  {
    "id": "quilly-history",
    "title": "Квилли · история статьи",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "history"
  },
  {
    "id": "quilly-error",
    "title": "Квилли · ошибка обработки",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "error"
  },
  {
    "id": "quilly-info",
    "title": "Квилли · информация об обработке",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "info"
  },
  {
    "id": "quilly-applied",
    "title": "Квилли · вариант применён",
    "group": "Квилли",
    "page": "editor",
    "type": "news",
    "assistant": "applied"
  }
];
export const MOBILE_CASES = [
  {
    "id": "feed",
    "title": "Лента · все каналы",
    "group": "Лента"
  },
  {
    "id": "feed-filter",
    "title": "Лента · выбранный канал",
    "group": "Лента",
    "filter": "erg-production"
  },
  {
    "id": "card-news",
    "title": "Обычная статья · карточка",
    "group": "Карточки",
    "post": "news",
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "expanded-news",
    "title": "Обычная статья · текст раскрыт",
    "group": "Карточки",
    "post": "news",
    "only": true,
    "expanded": true,
    "scroll": ".pm-card-content"
  },
  {
    "id": "card-audit",
    "title": "Обход · карточка",
    "group": "Карточки",
    "post": "audit",
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "expanded-audit",
    "title": "Обход · текст раскрыт",
    "group": "Карточки",
    "post": "audit",
    "only": true,
    "expanded": true,
    "scroll": ".pm-card-content"
  },
  {
    "id": "card-prod-project-aglo",
    "title": "Проект-улучшение · карточка",
    "group": "Карточки",
    "post": "prod-project-aglo",
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "expanded-prod-project-aglo",
    "title": "Проект-улучшение · текст раскрыт",
    "group": "Карточки",
    "post": "prod-project-aglo",
    "only": true,
    "expanded": true,
    "scroll": ".pm-card-content"
  },
  {
    "id": "audit-note",
    "title": "Обход · положительный момент на фото",
    "group": "Медиа",
    "post": "audit",
    "only": true,
    "mediaIndex": 1,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "audit-negative",
    "title": "Обход · зона развития на фото",
    "group": "Медиа",
    "post": "audit",
    "only": true,
    "mediaIndex": 1,
    "negative": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "gallery-next",
    "title": "Галерея · второй слайд",
    "group": "Медиа",
    "post": "news",
    "only": true,
    "mediaIndex": 1,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "video",
    "title": "Видео · обложка",
    "group": "Медиа",
    "video": true,
    "only": true,
    "scroll": ".pw-card-cover"
  },
  {
    "id": "lightbox",
    "title": "Медиа · полноэкранный просмотр",
    "group": "Медиа",
    "post": "news",
    "only": true,
    "lightbox": true
  },
  {
    "id": "lightbox-audit",
    "title": "Обход · фото с замечанием во весь экран",
    "group": "Медиа",
    "post": "audit",
    "only": true,
    "mediaIndex": 1,
    "lightbox": true
  },
  {
    "id": "article-news",
    "title": "Обычная статья · просмотр",
    "group": "Статья",
    "page": "reader",
    "post": "news"
  },
  {
    "id": "article-audit",
    "title": "Обход · просмотр",
    "group": "Статья",
    "page": "reader",
    "post": "audit"
  },
  {
    "id": "article-prod-project-aglo",
    "title": "Проект-улучшение · просмотр",
    "group": "Статья",
    "page": "reader",
    "post": "prod-project-aglo"
  },
  {
    "id": "article-scrolled",
    "title": "Статья · прокрутка и кнопка наверх",
    "group": "Статья",
    "page": "reader",
    "post": "news",
    "scrollY": 1000
  },
  {
    "id": "article-liked",
    "title": "Статья · лайк и сохранение",
    "group": "Статья",
    "page": "reader",
    "post": "news",
    "liked": true
  },
  {
    "id": "article-missing",
    "title": "Статья недоступна",
    "group": "Статья",
    "page": "reader",
    "post": "missing"
  },
  {
    "id": "comments-threads",
    "title": "Ветки и подветки",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "threads",
    "sheet": "comments"
  },
  {
    "id": "comments-collapsed",
    "title": "Длинная ветка свёрнута",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "collapsed",
    "sheet": "comments"
  },
  {
    "id": "comments-expanded",
    "title": "Длинная ветка раскрыта",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "expanded",
    "sheet": "comments"
  },
  {
    "id": "comments-reply",
    "title": "Ответ на комментарий",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "reply",
    "sheet": "comments"
  },
  {
    "id": "comments-draft",
    "title": "Написание комментария",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "draft",
    "sheet": "comments"
  },
  {
    "id": "comments-empty",
    "title": "Нет комментариев",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "empty",
    "sheet": "comments"
  },
  {
    "id": "comments-disabled",
    "title": "Комментарии отключены",
    "group": "Комментарии",
    "page": "reader",
    "post": "news",
    "comments": "disabled",
    "sheet": "comments"
  },
  {
    "id": "post-menu",
    "title": "Меню публикации",
    "group": "Действия",
    "post": "news",
    "only": true,
    "menu": true
  },
  {
    "id": "stats",
    "title": "Статистика показов",
    "group": "Действия",
    "page": "reader",
    "post": "news",
    "sheet": "stats"
  },
  {
    "id": "share",
    "title": "Поделиться публикацией",
    "group": "Действия",
    "page": "reader",
    "post": "news",
    "sheet": "share"
  },
  {
    "id": "channel",
    "title": "Канал · подписка включена",
    "group": "Канал",
    "page": "channel",
    "channel": "erg-news"
  },
  {
    "id": "channel-unsubscribed",
    "title": "Канал · без подписки",
    "group": "Канал",
    "page": "channel",
    "channel": "bts-news",
    "unsubscribed": true
  },
  {
    "id": "channel-empty",
    "title": "Канал · нет публикаций",
    "group": "Канал",
    "page": "channel",
    "channel": "bts-news",
    "empty": true
  },
  {
    "id": "channels",
    "title": "Вкладка «Каналы»",
    "group": "Канал",
    "tab": "channels"
  },
  {
    "id": "events",
    "title": "Вкладка «Мероприятия»",
    "group": "Лента",
    "tab": "events"
  },
  {
    "id": "channel-settings",
    "title": "Настройки подписок",
    "group": "Канал",
    "page": "settings"
  },
  {
    "id": "feed-empty",
    "title": "Нет публикаций в ленте",
    "group": "Лента",
    "empty": true
  },
  {
    "id": "feed-loading",
    "title": "Загрузка ленты",
    "group": "Лента",
    "loading": true
  }
];
export const frameUrl = (platform, id) => `/handoff/publication-state?platform=${platform}&case=${encodeURIComponent(id)}`;

// The same editorial examples exercise web and mobile at fixed frame sizes.
for (const cases of [WEB_CASES, MOBILE_CASES]) {
  cases.push(...[
    ['sport', 'Спорт · квадратное фото целиком'],
    ['safety', 'Безопасность · оранжевый акцент'],
    ['production', 'Про предприятие · серо-жёлтая полоса'],
    ['ecology', 'Экология · зелёный акцент'],
  ].map(([rubric, title]) => ({ id: `rubric-${rubric}`, title, group: 'Рубрики', post: rubric === 'safety' ? 'prod-fire-drill' : 'news', rubric, only: true, scroll: '.pw-carousel-stage' })));
}
