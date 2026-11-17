# Настройки и темы чатов — передача разработчикам

Версия документа: v9, 17 ноября 2026. Долговечный контракт изменения тем — в [руководстве](chat-themes-guide.md); краткие правила для AI — в [AGENTS.md](../AGENTS.md). Этот документ описывает реализуемое поведение, исходники, границы прототипа и доказательства выпуска.

## Статус выпуска v9

**v9: 21 тест, перечисленные ниже браузерные проверки и итоговая сборка app+Storybook пройдены.** Targeted lint изменённых JS/JSX без замечаний, diff check чистый. Выявлена замена полного ручного deployment другим выпуском без Storybook; исправленная default build успешно собрала app+Storybook, выпуск после этого изменения и окончательная публичная проверка ещё ожидаются. Публичные адреса прежние, но сама ссылка не доказывает, что на ней уже v9.

Подтверждённые проверки v9:

- Финальный аналитический аудит: 14 616 проверок цвета и 504 проверки края, 0 ошибок. [Аудит v9](../artifacts/settings-redesign-2026-11-17/v9/color-audit.txt). Это аналитика исходного CSS, отдельно от браузерных измерений ниже.

- 336 комбинаций: 21 тема × ERG/Integra × light/dark × ширина 320/393 × statuses/rich. Проверены 4368 строк времени/статуса: все целиком внутри `.msg-bubble`, 0 нарушений. [Отчёт границ](../artifacts/settings-redesign-2026-11-17/v9/message-bounds.json).
- Миниатюры темы приложения имеют 9:16; межколоночный интервал равен боковому полю: 18 px на ширине 393 и 12 px на 320. [Геометрия карточек](../artifacts/settings-redesign-2026-11-17/v9/app-card-geometry.json).
- Каталог на 320/393: 21 плитка 9:16, пять «LIVE · фото», без горизонтального overflow. [Геометрия каталога](../artifacts/settings-redesign-2026-11-17/v9/catalog-geometry.json).
- Long tap проверен на «Мяте» Integra/light и «Ночной степи» ERG/light. Поднятая копия сохраняет палитру бабла; summary/list прочитавших используют app-цвета. [Integra/Мята](../artifacts/settings-redesign-2026-11-17/v9/menu-integra-mint.png), [ERG/Ночная степь](../artifacts/settings-redesign-2026-11-17/v9/menu-erg-steppe.png).
- Полноэкранная очистка проверена в ERG/light и Integra/dark: размеры overlay и DeviceHost совпали — 393×852; blur 26 px, saturate 0.65; акценты #ef7f1a и #8f8ad6 соответственно. После завершения autofocus на «Отлично», фон inert во время открытия и 0 inert-соседей после закрытия. [ERG running](../artifacts/settings-redesign-2026-11-17/v9/cache-erg-running.png), [Integra dark running](../artifacts/settings-redesign-2026-11-17/v9/cache-integra-dark-running.png), [ERG done](../artifacts/settings-redesign-2026-11-17/v9/cache-erg-done.png).

- Быстрая реакция: раскрытый набор содержит 40 эмодзи, свёрнутый — 8; поисковых input нет. После выбора 🤭 и сворачивания он остаётся видимым. Chevron при раскрытии поворачивается на 180°; aria-expanded согласован с состоянием. В консоли локального прохода 0 ошибок и предупреждений.

Это браузерные проверки веб-прототипа. Физический iPhone и браузерный проход с включённым reduced motion данным отчётом не подтверждены. Наличие правил reduced motion в исходнике отдельно от факта ручного/браузерного тестирования.

## Обнаруженная замена публикации

Ручной полный выпуск v9 с префиксом ID 3858a1e0 от 07:18:49 UTC был заменён через 73 секунды выпуском 2477928c… от 07:20:02 UTC. Новые app-ассеты продолжали работать, но /storybook/ отдавал корневой HTML приложения. Такая замена полного пакета на app-only наблюдалась и после проверки v8. Точный инициатор/источник второго релиза и его CI пока не установлен.

Исправлен контракт package.json: `build` теперь по умолчанию собирает приложение и Storybook в общий dist; `build:app` — отдельный vite build; `build:all` — alias npm run build. Исправленная default-команда успешно выполнена локально. Явный HTML handling сохранён, но не объявлен решением этой гонки. После fix commit нужно дождаться завершения запущенных публикаций, проверить последний активный deployment и повторно подтвердить app, Storybook и iframe истории. До этого v9 остаётся release-pending.

## Предыдущий подтверждённый выпуск v8

v8 опубликована 17 ноября 2026: UI-код `c4cf135` в main, проверенный на тот момент Cloudflare deployment `ebdf868d-cfac-4734-af30-87a0e2f50f6e`, Worker qollab. App и Storybook были собраны и проверены публично; история «ТемыЧатов» показывала 21 плитку. Позже полный пакет был заменён deployment с префиксом ecc9bfbe в 06:55 UTC, и Storybook снова отсутствовал. Поэтому прежний успешный smoke после явного assets.html_handling=auto-trailing-slash не является доказательством, что эта настройка устранила причину проблемы.

Исторические результаты v8: 19/19 модельных тестов, targeted lint без замечаний, build:all; 84 конфигурации/420 статусов; 84 long tap и 64 rich-message проверки; аналитические 12 768 цветовых и 504 edge-проверки без ошибок. Были пройдены локальные copy/reply/edit/pin/reaction/forward, отмена удаления, язык и демоочистка. Эти результаты не подтверждают новые границы баблов, app-scope меню, макеты, ассеты или очистку v9.

Архивные свидетельства: [published smoke v8](../artifacts/settings-redesign-2026-11-17/v8/published-smoke.json), [сетка v8](../artifacts/settings-redesign-2026-11-17/v8/published-theme-grid.png), [status summary](../artifacts/settings-redesign-2026-11-17/v8/rendered-status-summary.json), [long tap](../artifacts/settings-redesign-2026-11-17/v8/longtap-matrix.json), [rich summary](../artifacts/settings-redesign-2026-11-17/v8/longtap-rich-summary.json), [аналитический аудит](../artifacts/settings-redesign-2026-11-17/v8/color-audit.txt), [действия](../artifacts/settings-redesign-2026-11-17/v8/real-actions.json). Старые утверждения о переносе тематического read-цвета в панели меню/прочитавших и допустимости внешнего времени отменены контрактом v9 и не являются инструкцией для реализации.

## Что передаётся

Настройки сохраняют существующий top bar и фон, без повторения информации профиля. В корне цветные квадратные иконки с белыми залитыми символами. «Данные устройства» доступны сразу; «Данные и память» объединяют состав кэша, выбор очистки и параметры хранения. Язык выбирается в нижней панели, Қазақша первым. Залитые основные действия имеют полную pill-форму.

«Оформление» содержит три равные миниатюры приложения 9:16 (light/dark/system), предпросмотр чата, каталог и быструю реакцию. В каталоге единая белая секция объединяет preview и непрерывную вертикальную сетку 21 пресета; все плитки 9:16. Горизонтальных лент и отдельных групповых карточек нет. ERG/Integra сохраняют выбор независимо, старые адреса цветов/обоев ведут в каталог.

Время и receipt находятся внутри **всех** баблов, включая медиа, документ и профиль. Пресет задаёт read-цвет только внутри сообщения и его точной поднятой копии. Панели меню, activity/readers и список чатов остаются в app-scope и используют брендовые значения. Широкого переноса read-переменных на меню нет.

Быстрая реакция: 40 курируемых эмодзи, без поиска; свёрнуто 8, включая текущий выбор. Toggle содержит aria-expanded/controls и шеврон вниз/вверх. [Unicode Emoji Frequency](https://www.unicode.org/emoji/frequency.html) использована как открытый ориентир агрегированной частотности; рабочие дополнения и порядок отобраны вручную. Это не статистика ERG/Integra и не рейтинг 2026 года.

Пять градиентов получили разные grain SVG. «Ночная степь» с новым PNG/WebP заменила озеро, сохранив ID live-lake. Пять live-тем по-прежнему имеют video=null и честный бейдж «LIVE · фото»; реальное видео ещё не получено.

Очистка — полноэкранный Portal в DeviceHost: blur 26 px, сильное затемнение, без центральной карточки. Все эффекты/итоговая галочка используют --color-primary выбранного пространства; диаграмма категорий сохраняет свою палитру. Есть inert-фон, ограничение/восстановление фокуса, доступный прогресс и reduced motion. Работа job остаётся локальной демонстрацией.

## Публичные точки входа

| Ссылка | Назначение |
|---|---|
| [Настройки](https://qollab.admirably08.workers.dev/handoff/settings?view=prototype&screen=main) | Интерактивный пользовательский путь, переключатель ERG/Integra |
| [Каталог тем](https://qollab.admirably08.workers.dev/handoff/settings?view=prototype&screen=chat-theme) | Сетка и предпросмотр; состояние сохраняется в браузере |
| [Чистый фрейм каталога](https://qollab.admirably08.workers.dev/handoff/settings?view=frame&screen=chat-theme) | Компактная визуальная проверка без внешней обвязки |
| [Состояния сообщений и тем](https://qollab.admirably08.workers.dev/handoff/chat-theme-states) | Визуальная матрица с настоящими Message и MobileMessageMenu; не замена workflow |
| [Действия в группе](https://qollab.admirably08.workers.dev/handoff/chat-interactions?chat=group&theme=light) | Реальные AppRoutes и локальные сценарии действий |
| [Действия в личном чате](https://qollab.admirably08.workers.dev/handoff/chat-interactions?chat=personal&theme=dark) | То же для личного чата в тёмной теме |
| [Storybook](https://qollab.admirably08.workers.dev/storybook/) | Компоненты и отдельные экраны из того же dist |

Параметр theme стенда действий принимает light/dark; chat — group/personal; view=frame убирает внешнее описание. Обычная оболочка стенда действий — 402×820; `view=frame` адаптируется к ширине контейнера до 402 px и высоте 100dvh. Это не подменяет отдельную проверку фреймов настроек и матрицы сообщений.

## Карта реализации

| Поведение/состояние | Владелец | Что важно при переносе |
|---|---|---|
| Корневые настройки, язык | `src/screens/Settings.jsx`, `src/components/LanguageSheet.jsx`, `src/data/settings.js` | Сохранить порядок и bottom sheet, не добавлять профиль |
| Общая шапка подэкранов | `src/components/SettingsPage.jsx`, `src/screens/SettingsExperience.css` | Фон/отступы/закрытие соответствуют прототипу |
| Тема приложения и миниатюра System | `src/screens/SettingsExperience.jsx`, `src/components/SettingsChatPreview.jsx`, `src/utils/theme.js` | auto следует matchMedia; три миниатюры 9:16 с одинаковыми полями/интервалами |
| Каталог и выбор | `src/screens/SettingsChatThemes.jsx`, `.css` | Одна белая секция preview+grid; плитки 9:16; одна обводка; selected по ID |
| Пресет и миграция | `src/utils/chatThemeCatalog.js`, `chatAppearance.js` | Сохранять ID, а не произвольный объект палитры |
| Persistence | `src/utils/settingsPreferences.js`, `src/context/CompanyContext.jsx` | Различать localStorage настроек и sessionStorage пространства |
| Фон везде | `src/components/ChatWallpaper.jsx`, `src/screens/ChatAppearance.css` | Один renderer для tile/preview/реального чата |
| Бабл/доставка/время | `src/components/Message.jsx`, `src/screens/ChatRoom.css`, `ChatAppearance.css` | 5 статусов; время/receipt внутри любого бабла, непрозрачная поверхность |
| Семантика доставки | `src/utils/messageDelivery.js`, `src/components/MessageDeliveryStatus.jsx`, `.css` | Общие neutral/error; read темы только в chat-scope, фирменный read в app-scope |
| Доступность действий | `src/components/messageMenuActions.js` | Edit только для своих текста/ссылки; Copy для текста, подписи или профиля |
| Контекст long tap | `src/components/messageMenuClone.js` | Вычисленная тема только внутри клона бабла, точная дробная ширина; меню её не наследует |
| Быстрая реакция | `QuickReactionSettings` в `src/screens/SettingsExperience.jsx` | 40/8 эмодзи, выбранная всегда видна, без поиска, aria-expanded/controls |
| Реакции | `src/components/MessageReactions.jsx`, `.css` | Настоящая геометрия, состояние своей/чужой реакции |
| Long tap и полный picker | `src/components/MobileMessageMenu.jsx`, `src/gallery/reaction-picker/ReviewMessageMenu.jsx`, `EmojiPicker.jsx` | Поднятый бабл сохраняет тему; панели/прочитавшие/список чатов используют scope="app" |
| Настоящие чаты | `src/screens/ChatRoom.jsx`, `DMChat.jsx` | Reply/edit/delete/forward и локальные состояния сообщений |
| Кэш и параметры | `src/screens/SettingsExperience.jsx`, `src/utils/settingsPreferences.js` | Демоданные; после очистки изменяется только localStorage |
| Чарт/диск/процесс | `src/components/SettingsStorageVisuals.jsx`, `.css` | Чарт с коротким reveal; очистка — полноэкранный брендовый Portal, inert/focus/reduced motion |
| Данные устройства | `DeviceDetailsSettings` в `src/screens/SettingsExperience.jsx` | Значения макетные; clipboard реальный и может отказать |
| Обзор настроек | `src/gallery/settings-redesign/SettingsReview.jsx`, `.css` | MemoryRouter, DeviceHost, reset демокэша |
| Матрица rich-message | `src/gallery/settings-redesign/ChatThemeStates.jsx`, `.css` | Визуальные fixtures и общий long tap; без фиктивного backend |
| Реальный action-стенд | `ChatInteractionFlow` в `src/App.jsx` | Использует AppRoutes; действия локальные/сценарные |
| Истории | `src/screens/__stories__/Settings.stories.jsx` | Default npm run build собирает Storybook вместе с приложением; build:all — alias |

## Каталог и исходные материалы

| Семейство | ID | Материал |
|---|---|---|
| Стандарт | standard | Нативные токены текущего пространства |
| Градиенты | grad-horizon, grad-sunset, grad-sage, grad-mint, grad-coast | CSS и отдельные grain-horizon/sunset/sage/mint/coast.svg |
| Паттерны | pattern-day, pattern-orbit, pattern-garden, pattern-travel, pattern-play | Пять seamless SVG с тонкими Phosphor-мотивами |
| Иллюстрации | art-coast, art-alpine, art-cabin, art-lighthouse, art-fields | Пять оригинальных PNG → WebP |
| Будущие live | live-coast, live-lake, live-earth, live-prism, live-poppies | Постеры: Прибой, Ночная степь (live-lake), Планета, Призма, Маки; video=null |

Runtime-ассеты лежат в `public/img/chat-themes/`. Путь читается из канонического poster: ID live-lake намеренно указывает на live-steppe.webp. Сохранённый выбор не сбрасывается. Новый оригинал — artifacts/live-wallpapers-v9-2026-11-17/originals/live-steppe.png, manifest — рядом; старое озеро хранится только для истории/совместимости.

[Предыдущий developer handoff ZIP v8](../artifacts/chat-themes-v8-developer-handoff.zip) объединяет исходный проект, 10 оригинальных PNG (5 иллюстраций + 5 live-источников), документацию и отчёты QA v8. Это исторический пакет v8, не обновлённая поставка v9. Ссылка сохраняется до отдельного решения о пересборке. Backend и готовые live-видео в пакет не входят.

- [Ночная степь v9: новый исходник и 10-секундный animation prompt](chat-live-steppe-prompts.txt).
- [Manifest Ночной степи](../artifacts/live-wallpapers-v9-2026-11-17/manifest.json).
- [Актуальные 10 промптов для пяти сцен](chat-live-wallpaper-prompts.txt): общий документ уже обновлён, второй раздел — Ночная степь.
- [Пакет PNG и промптов, ZIP](../artifacts/live-wallpapers-v7-2026-11-17/chat-live-wallpaper-sources-and-prompts.zip).
- [Manifest исходников live](../artifacts/live-wallpapers-v7-2026-11-17/manifest.json); PNG — рядом в originals.
- [Происхождение иллюстраций](../artifacts/settings-redesign-2026-11-17/v7/art-generation/generation.json); оригиналы — рядом в originals.
- [Генератор seamless-паттернов](../scripts/assets/create-chat-patterns.mjs).

Изображения созданы встроенной генерацией как новые композиции по визуальному направлению референсов. Оригиналы не заменять сжатыми WebP. Иконки и мотивы — Phosphor, MIT; при переносе файлов сохранить copyright и permission notice из лицензии зависимости. Дополнительные ограничения происхождения и pipeline клипов описаны в руководстве.

## Состояния и действия: матрица приёмки

Во всех строках проверить ERG/Integra и light/dark. Для цвета дополнительно пройти все 21 пресет (84 комбинации), включая стандартную тему обоих брендов.

| Область | Сценарий | Ожидаемое состояние |
|---|---|---|
| Тема | Выбор → смена экрана → reload | Один selected ID, тот же preview/реальный чат |
| Изоляция | Выбрать разные темы ERG/Integra и вернуться | Каждое пространство хранит свою тему |
| Миграция | Старый wallpaper/custom/неизвестный ID | Детерминированный ближайший пресет или standard |
| Каталог | Узкий/основной экран, длинные названия | Одна белая секция preview+grid, плитки 9:16, все доступны вертикально, без overflow |
| Тема приложения | Light/dark/system | Три равные миниатюры 9:16, одинаковые padding/gap, system без белых полос |
| Ассеты | Пять градиентов и ID live-lake | Пять разных grain SVG; Ночная степь и новый poster, сохранённый ID не сброшен |
| Статус | sending, sent, delivered, read, failed | Нейтральные промежуточные; read в цвете темы; ошибка не имитирует успешную доставку |
| Rich content | Фото/видео с подписью и без, voice, document, quote, profile, link | Время и receipt геометрически внутри бабла, без внешней строки; текст/иконки/подписи читаемы |
| Read-scope | Смена пресета → bubble / menu / readers / Chats | В бабле read меняется с темой; вне бабла остаётся брендовый app-read, в обоих режимах |
| Быстрая реакция | Раскрыть → выбрать эмодзи вне первых 8 → свернуть | 40 в expanded / 8 в collapsed, выбранная видна; нет поиска; chevron и aria-expanded согласованы |
| Реакции | Поставить/снять; своя/чужая; много реакций | Геометрия настоящего MessageReactions, доступный счётчик |
| Long tap | Touch hold, мышь contextmenu, Shift+F10 | Выбранный бабл не теряет заливку, текст, outline и read-цвет |
| Reply | Ответить → composer → отправить → отменить | Цитата соответствует сообщению; отмена очищает draft reply |
| Edit | Своё текстовое сообщение → изменить → сохранить/отмена | Edit доступен тексту/ссылке; не предлагается вложениям/профилю |
| Copy | Текст/подпись/ссылка профиля → clipboard; отказ доступа | Корректный toast; нет пустого Copy у voice/document без текста |
| Forward | Выбрать получателя → локальная пересылка/отмена | Общий ForwardSheet, корректное превью; это демо без доставки сервером |
| Pin/Delete | Закрепить/открепить, подтверждение удаления/отмена | Локальное состояние и меню согласованы |
| Select | «Выбрать» в настоящих чатах | **Известный gap:** toast «Режим выбора появится позже»; множественный выбор не реализован |
| Закрытие | Back/Escape/наружное нажатие/close | Меню и picker закрываются; тема и исходный экран сохранены |
| Язык | Открыть sheet, Қазақша первым, выбрать/отмена | Текущий язык отмечен, панель закрывается, строки обновляются |
| Кэш | Снять всё, выбрать часть, подтвердить/отменить | Нулевой выбор disabled; очищается выбранный демообъём |
| Очистка | ERG/Integra × light/dark; running → done → Отлично | Overlay совпадает с DeviceHost и закрывает шапку; blur/dark; брендовые эффекты, прогресс и нулевые категории после demo job |
| Доступность очистки | Tab/Shift+Tab, Escape, закрытие, reduced motion | Фон inert, фокус в диалоге; Escape только done; фокус восстановлен; без орбит/частиц/переходов при reduced motion |
| Данные устройства | Копирование → успех/ошибка | Копируется отображаемый список; toast отражает фактический результат |
| Motion | Reduced motion, hidden tab, video load error | Читаемый неподвижный UI/постер; чат доступен |
| Keyboard | Focus/Enter/Space, labels/pressed/checked | Выбор доступен без мыши; focus видим; цвет не единственный сигнал |

Матрица — обязательные сценарии приёмки, а не утверждение, что каждый из них уже проверен. Фактически выполненные проверки перечисляются в release-блоке. Визуальный `/handoff/chat-theme-states` демонстрирует состояния и меню; действия reply/edit/forward/delete проверяются через `/handoff/chat-interactions`.

## Граница прототипа и production

| Сейчас | Требование к production |
|---|---|
| Выбор темы в localStorage `qollab.settings.v2` | Предпочтения пользователя на сервере, ключ user + workspace; auth/права, валидация известных ID, синхронизация устройств, версия каталога и конфликтов |
| Клиентская миграция по сохранённым полям | Поддержать миграцию серверных предпочтений и неизвестный ID при разной версии клиента; безопасный fallback standard |
| Список 21 пресета в коде, локальные URL | Версионирование каталога/медиа, CDN/cache policy, ограничения загрузки, неизменные ID; не сохранять недоверенный CSS/URL в preference |
| Три секунды таймера очистки, `clearedCache` | Настоящий файловый cache manager: сканирование, прогресс, частичный успех/ошибка, повтор, отмена при поддержке, удаление только локальных копий |
| 128 ГБ, другие данные 107020 МБ, кэш 2400 МБ — макет | Реальные нативные метрики диска; отдельно app cache, другие данные, свободное место; не обещать браузеру доступ ко всему диску |
| Retention/limit только сохранены | Фоновая политика удаления по возрасту/лимиту, офлайн-ограничения, состояние занятости и защита нужных файлов |
| iPhone 15 Pro, iOS 27.0, версия 3.1.7.2 — макет | Системный bridge с проверенными значениями и явным поведением отсутствующих полей |
| Сообщения/статусы/пересылка в состоянии демо | Реальный message API, серверные idempotency/receipts, права, pending/error/retry; нельзя считать демо таймер подтверждением доставки |
| Смена языка клиентского прототипа | Согласованный набор переводов и серверных текстов; проверить строковые длины и полноценную локаль |
| Видео пока отсутствуют | Получить клипы, проверить стык 10-секундного loop, декодирование, autoplay/fallback, энергопотребление и память |

Копирование в clipboard действительно использует браузерный API. Очистка не освобождает место на устройстве. Приложение не считывает указанные модель/версию ОС/размер диска. Данные и диагностику реального устройства не следует собирать или отправлять из этого макета без отдельного продуктового решения.

## Проверки, сборка и публикация

Команды полностью перечислены в [руководстве](chat-themes-guide.md#9-проверки-и-выпуск). Ключевые шаги: Node model tests → аналитический CSS audit с хешами → targeted oxlint → браузерные сценарии → `npm run build` → авторизованный deploy существующего Worker `qollab` → публичная проверка.

Проверка контраста вычисляет CSS-цвета непрозрачных поверхностей; она не оценивает реальный видеокадр, браузерный layout или reader semantics. Storybook и приложение собираются в одном dist командой npm run build. Не публикуйте результат build:app как полный пакет; повторно проверяйте последний deployment после завершения очередных публикаций. v7/v8-артефакты исторические. Текущие отчёты v9 сохраняются отдельно в artifacts/settings-redesign-2026-11-17/v9; проверка должна соответствовать хешам текущих исходников.

Приёмка v9 (отмечены только подтверждённые проверки):

- [x] 21 тест текущего кода пройден.
- [x] 336 браузерных комбинаций / 4368 внутренних timestamp/receipt — 0 нарушений границ бабла.
- [x] Catalog 21×9:16, пять LIVE · фото, миниатюры приложения 9:16 и равные поля/интервалы подтверждены на 320/393.
- [x] Long tap сохраняет бабл, app-read вне бабла подтверждён на двух комбинациях, перечисленных выше.
- [x] Fullscreen cache ERG/light и Integra/dark: размер, брендовый акцент, завершение, autofocus/inert и восстановление фона проверены.
- [x] Быстрая реакция: 40/8, отсутствие поиска, поворот шеврона и видимость выбранного 🤭 после сворачивания проверены.
- [x] Финальный аналитический аудит: 14 616 цветовых и 504 edge-проверки, 0 ошибок; отчёт соответствует текущим исходникам.
- [x] Исправленная default npm run build app+Storybook пройдена; targeted lint без замечаний, diff check чистый. Long tap проверен в комбинациях выше; другие v8 action-сценарии этим проходом повторно не заявляются.
- [ ] Точная ревизия в main, deployment подтверждён; публичные app и Storybook проверены.
- [ ] В release-блок v9 внесены commit, deployment и окончательные ограничения.

Reduced motion реализован в стилях/компонентах, но браузерная проверка этого режима отдельно не заявляется.

Физический iPhone/WebView, VoiceOver, аппаратная клавиатура, low-power mode, реальная сеть/диск и декодирование будущих видео требуют отдельного device QA. Браузерная проверка и screen mirror референса не являются подтверждением этой матрицы.
