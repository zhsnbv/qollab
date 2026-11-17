# Настройки и темы чатов — передача разработчикам

Версия документа: v12, 17 ноября 2026. Долговечный контракт изменения тем — в [руководстве](chat-themes-guide.md); краткие правила для AI — в [AGENTS.md](../AGENTS.md). Этот документ описывает реализуемое поведение, исходники, границы прототипа и доказательства выпуска.

## Текущий статус v12 — очистка кэша и единая передача

**Локальная проверка v12 пройдена; публикация проверяется отдельно.** Исторические проверки и deployment v11 ниже не подменяют результаты этой редакции.

- Очистка: центральный минималистичный декоративный космический вихрь поглощает иконки файлов. Кругового прогресса нет; снизу один индикатор с процентами и линейной полосой, без повторения объёма.
- Завершение: простая приглушённо-зелёная галочка без круга, плитки и конфетти; кнопка «Отлично» — точный `var(--color-primary)` пространства и белый текст.
- Сохраняются полноэкранный Portal/DeviceHost, blur настоящего экрана, focus trap/restore, прежние inert-состояния, scrim cleanup, доступный progressbar и reduced motion. Визуальный эффект не управляет таймером demo job. Каталог/видеофоны v11 и палитра диаграммы не входят в эту правку.
- Основная точка передачи — [страница разработчиков](https://qollab.admirably08.workers.dev/handoff/developers). Каталог подключён к каноническим 33 пресетам; 15 видео запускаются вручную. Здесь собраны интерактивные экраны, палитры, отдельные медиа, исходники, правила и приёмочная матрица. Прежние ZIP сохранены только как исторические поставки и не являются основным способом передачи.

Подтверждённая локальная проверка v12:

- 8 визуальных конфигураций очистки: ERG/Integra × light/dark × running/done. В процессе 4 иконки файлов, один нижний progressbar, без кругового индикатора; завершение без круга. Точные primary: ERG `#ef7f1a` / `#f08a2c`, Integra `#0a214f` / `#8f8ad6`; текст белый, check `#9bd8b8`.
- Настоящий сценарий на 320×568: выбранные категории очищаются, остальные сохраняются; overlay и scrollWidth 320 px. Фактический экран имеет `blur(18px) saturate(.7)` и inert. Tab/Shift+Tab остаются внутри; Escape не прерывает работу и закрывает done. После «Отлично» фокус возвращается к «Назад», blur и overlay удаляются.
- Hub проверен на 320 px и desktop: поиск по ID, переключение пространства/режима, палитра, ручное воспроизведение и закрытие MP4, ссылки-разделы. До запуска 0 video, при запуске 1: muted/loop, readyState=4; после закрытия снова 0. Горизонтального overflow на 320 px нет.
- 18/18 Node-тестов: 15 навигации/SSR и 3 для handoff metadata/source paths/Storybook IDs. Targeted lint чистый; полная сборка app + Storybook выполнена.
- Reduced motion предусмотрен в CSS (вихрь/иконки/галочка без анимации, нижняя полоса без transition); переключение системной настройки на физическом устройстве в этой итерации не проверялось. Физические iPhone/Android и screen reader остаются задачами приёмки.

Публичную проверку и идентификатор выпуска фиксируем после завершения Workers Builds. Локальные доказательства v12: `artifacts/settings-redesign-2026-11-17/v12/`; публично доступный краткий отчёт — [QA v12](https://qollab.admirably08.workers.dev/handoff-evidence/v12/qa.json).

## История v11 — видеофоны и более чистые градиенты

Каталог расширен до **33 неделимых пресетов**: standard + 5 gradient + 5 pattern + 5 art + 2 photo + 15 live. «Ночная степь» (`live-lake`) и «Планета» (`live-earth`) по прямому решению пользователя остаются статичными, без LIVE. Стабильные ID и независимые настройки ERG/Integra сохранены.

- Три пользовательских ролика: Прибой, Призма, Маки. Отдельные немые H.264-копии 720×1280, 24 fps, 9 секунд; 10-секундный исходник замкнут через секундное перекрытие без обратного движения. Оригиналы не изменены. Это визуально оптимизированное сжатие с потерями, а не математически lossless.
- Двенадцать новых роликов: по 3 Skyflow, Mesh, Aurora и Prism, 720×1280, 24 fps, 24 секунды. Цвета спокойные; движение периодическое. Воспроизводимый renderer и происхождение — `scripts/chat-wallpapers-v11/`.
- Только выбранный фон воспроизводит видео. Миниатюры используют постеры. Скрытая вкладка, невидимый/inert экран, выход из viewport, reduced motion и saveData останавливают playback. Отказ autoplay/ошибка декодирования оставляют постер. Баблы и read-цвета задаются каноническим каталогом.
- Пять статичных градиентов сохраняют разные зернистые текстуры, но крупный контрастный шум и осветляющая пелена удалены. Зерно нейтральное sRGB, opacity 0.12–0.14; в миниатюрах ещё слабее.

Подтверждённая локальная проверка v11:

- **85/85 тестов**: 52 каталога, assets, SSR, playback policy, delivery, меню и навигации + 33 Response-теста video worker; targeted lint и diff check чистые. Полный `npm run build` собрал app + Storybook.
- **22 968 проверок цвета и 792 проверки края, 0 ошибок**: [аналитический отчёт](../artifacts/settings-redesign-2026-11-17/v11/color-audit.txt).
- **264 браузерные конфигурации / 3432 строки времени и статуса**, 0 выходов за бабл. 33 темы × ERG/Integra × light/dark × statuses/rich; реальный Message в стенде шириной 402 px: [границы](../artifacts/settings-redesign-2026-11-17/v11/message-bounds.json).
- **15/15 видео декодируются и воспроизводятся** в предпросмотре: 720×1280, readyState=4, muted/loop, currentTime > 0; миниатюры не создают video. [Playback](../artifacts/settings-redesign-2026-11-17/v11/video-playback.json).
- Каталог проверен на фактических viewport **393×852 и 320×568**: 33 плитки 9:16, нет горизонтального overflow, последняя плитка полностью доступна. Прокрутка списка 0→2008.5 / 0→1910.5; preview Y=80 и заголовок Y=289/295 остаются на месте, outer scroll=0. [Геометрия](../artifacts/settings-redesign-2026-11-17/v11/catalog-geometry.json), [320 px](../artifacts/settings-redesign-2026-11-17/v11/catalog-320.png).
- В настоящем групповом чате фон «Прибой» воспроизводится; открытие профиля переводит retained chat в data-active=false и pause, Back возобновляет его с прежнего времени. Настройки обоих пространств независимы: ERG=live-mesh-blue, Integra=live-aurora-mint. [Состояния пространств](../artifacts/settings-redesign-2026-11-17/v11/workspace-isolation.json).
- Все 15 MP4 без звуковой дорожки, с faststart. Три исходных ролика уменьшены с **23 556 592 до 5 636 074 байт (−76%)**. Новые 12 роликов — **13 343 859 байт**; все 15 — **18 979 933 байт**. Сжатые файлы не заявляются lossless. Проверки исходных и декодированных стыков разделены в manifests.

Первая публикация UI v11 из `8874616`: Workers Builds `cac4b199-e5e2-4b35-a5f8-743b5c734dc8` success, deployment `4ea8110e-fb9c-4e4b-b750-1bccf132081d` от 2026-11-17T08:41:15.241Z. В публичном каталоге 33 темы / 15 LIVE / 2 photo без LIVE; видео Небесного шёлка декодируется и играет, выбранное сохраняется после reload. В настоящем Storybook iframe видео Северного сияния также играет. [Public smoke](../artifacts/settings-redesign-2026-11-17/v11/published-smoke.json), [скриншот](../artifacts/settings-redesign-2026-11-17/v11/published-video.png).

На первой публикации Static Assets отвечал полным 200 на Range. **Исправление опубликовано и проверено публично** из commit `91dd64f06527f6862bcbf6ec8a574e84ec407e83`: Workers build `64ad8502-8588-479e-b4e2-acdd64925d89` завершён успешно; подтверждённый активный deployment — `88710b23-93d5-4bb7-a7e8-d60e3d585055`, созданный `2026-11-17T08:56:45.295Z`. Обработчик `worker/video-assets.js` ограничен video-prefix; остальные маршруты приложения и Storybook обслуживаются прежним способом.

Публичный HTTP-проход от `2026-11-17T08:59:21.290810Z`: **15/15 файлов** возвращают корректный HEAD и `206` с точными `Content-Range` и байтами. Отдельно пройдены suffix/middle ranges, `416` для выхода за размер, полный `200` при несовпадающем If-Range и `404` для отсутствующего MP4 без SPA-подмены. [Публичный HTTP-отчёт](../artifacts/settings-redesign-2026-11-17/v11/published-media-http.json). Локальный `wrangler dev` и **33/33 Response-теста** покрыли тот же контракт: [локальный HTTP-отчёт](../artifacts/settings-redesign-2026-11-17/v11/local-media-http.json).

История v10 ниже не подменяет результаты v11. Reduced motion/saveData/hidden-tab/autoplay-error проверены модельными тестами, а не настройками физического устройства. Физический iPhone/WebView, Low Power Mode и энергопотребление требуют отдельной приёмки командой разработки.

## История v10 — опубликовано, публичная проверка пройдена

**v10 опубликована из UI-коммита `3035bb2` в main.** GitHub Workers Builds для `qollab`, build `54ce3aec-6edb-4869-a5ab-bcb52bf72da7`, завершён успешно. Подтверждён deployment `3b2205c0-c31e-46ae-ac24-930446a577cf`, созданный `2026-11-17T07:56:46.156Z`, с 100% трафика на момент проверки. Публичный smoke записан `2026-11-17T07:59:08.821Z`. Локальные тесты, полная сборка app+Storybook и перечисленные ниже проверки пройдены; дальнейшая публикация требует повторной сверки активной версии.

Новые требования v10:

- Предпросмотр чата и заголовок закреплены; прокручивается только список тем внутри общей белой секции.
- Короткая подсказка быстрой реакции — 12 px над preview. Emoji уменьшены до 26 px, сетка — 6 колонок; свёрнуто 12 элементов (два ряда), раскрыто 40. Выбранный emoji в списке — бледно-оранжевый круг `color-mix(in srgb, #ef7f1a 14%, var(--color-white))` без обводки в ERG и Integra; это локальное исключение для списка по прямому запросу пользователя. Reaction pill внутри бабла не меняется.
- Очистка размывает реальный экран под Portal. Числовой прогресс — только проценты; текст кнопки белый на затемнённой брендовой заливке. Пустое состояние «Всё чисто» должно отчётливо читаться на прежнем фоне без новой карточки. Брендовые эффекты, inert/focus и reduced motion сохраняются.
- Переходы настроек используют общий стек push/pop с согласованным направлением и возвратом к сохранённому экрану.

Подтверждённая локальная проверка v10:

- 33 теста каталога, статусов, меню и модели навигации + 3 SSR-теста `src/components/SettingsRouteStack.test.mjs`: **36/36 пройдены**. Навигационная модель проверяется в `src/utils/settingsNavigation.test.js`. Targeted lint чистый. Полный `npm run build` собрал приложение и Storybook с exit 0.
- Аналитический аудит текущих исходников: **14 616 проверок контраста и 504 проверки края, 0 ошибок**. [Отчёт v10](../artifacts/settings-redesign-2026-11-17/v10/color-audit.txt). Это анализ CSS, не подмена браузерного layout-теста.
- Каталог в review проверен на 393×852 и 320×568: прокручивается список, preview и заголовок остаются на месте. В измеренном проходе scrollTop изменился с 0 до 1080.5, preview Y=80 и header Y=289 не изменились. Нижняя плитка «Маки» доступна; выбор сохраняется. [Прокрученный каталог](../artifacts/settings-redesign-2026-11-17/v10/catalog-scrolled.png).
- Реакции на ширинах 320/393: 6 колонок, 12/40 при сворачивании/раскрытии, выбранный emoji остаётся видимым. Фон выбранного круга соответствует 14% оранжевого; border-width=0. [320 px](../artifacts/settings-redesign-2026-11-17/v10/reaction-320.png), [light](../artifacts/settings-redesign-2026-11-17/v10/reaction-light.png), [dark](../artifacts/settings-redesign-2026-11-17/v10/reaction-dark.png).
- В локальном review наблюдались парные `push-in`/`push-under` и `pop-out`/`pop-under`, завершение переходов, фокус заголовка и hidden/inert неактивных слоёв. В основном приложении после локального demo login подтверждены push CSS, прокрутка каталога, browser Back → «Оформление» и Forward → каталог. В локальной production-сборке Storybook (порт 5181) пройдено «ТемыЧатов» → Назад → «Оформление» → «Быстрая реакция»: 12 emoji в 6 колонок, переходы работают. [Storybook: реакции](../artifacts/settings-redesign-2026-11-17/v10/storybook-reaction.png). Быстрые последовательные переходы, полная клавиатурная приёмка и reduced motion остаются отдельными сценариями.
- Очистка проверена в ERG/dark и Integra/light: overlay 393×852, фактический filter blur 18 px на соседних экранных слоях, фон inert. В процессе видны только «Очищаем кэш» и процент (наблюдалось 3%), без текста объёма. После завершения текст кнопки вычисляется как rgb(255, 255, 255). После закрытия добавленный blur снят, активный экран не inert; неактивные слои навигационного стека сохраняют своё исходное состояние. [ERG running](../artifacts/settings-redesign-2026-11-17/v10/cleaning-running-dark.png), [Integra running](../artifacts/settings-redesign-2026-11-17/v10/cleaning-running-integra.png), [done](../artifacts/settings-redesign-2026-11-17/v10/cleaning-done-dark.png).
- Пустое состояние «Всё чисто» проверено в light/dark: контрастные кольцо, знак и заголовок; вторичная подпись удалена. [Light](../artifacts/settings-redesign-2026-11-17/v10/storage-empty-light.png), [dark](../artifacts/settings-redesign-2026-11-17/v10/storage-empty-dark.png).

**Reduced motion не проверен в браузере.** Его обработка присутствует в исходном контракте/реализации, но ручная приёмка переключения предпочтения и переходов без движения остаётся отдельным открытым пунктом. Физический iPhone/WebView также этим проходом не подтверждён.

Подтверждённая публичная проверка v10 на 393×852:

- Каталог: 21 плитка, список прокручен с 0 до 1081; preview Y=80 и заголовок Y=289 остаются на месте, outer scroll=0. Нижняя тема «Маки» выбирается. [Каталог](../artifacts/settings-redesign-2026-11-17/v10/published-catalog.png).
- Реакции: 6 колонок, свёрнуто 12 / раскрыто 40; бледно-оранжевый выбранный круг без обводки. [Реакции](../artifacts/settings-redesign-2026-11-17/v10/published-reaction.png).
- Очистка: фактический blur 18 px, во время проверки только «Очищаем кэш» и 8%; текст кнопки после завершения rgb(255, 255, 255). Процесс завершён, overlay закрыт, пустое состояние отображается. [Процесс](../artifacts/settings-redesign-2026-11-17/v10/published-cleaning.png), [пустое состояние](../artifacts/settings-redesign-2026-11-17/v10/published-storage-empty.png).
- Настоящий опубликованный Storybook iframe: каталог → Back к «Оформлению» → push к быстрой реакции; 12 emoji в 6 колонок. [Storybook](../artifacts/settings-redesign-2026-11-17/v10/published-storybook.png).

Машиночитаемое свидетельство — [public smoke v10](../artifacts/settings-redesign-2026-11-17/v10/published-smoke.json). Физический iPhone и переключение reduced motion в браузере остаются непроверенными.

[Developer handoff ZIP v10](../artifacts/chat-themes-v10-developer-handoff.zip) сохранён как историческая поставка из `ef6df8076c3f9139b450416e96a8ac039d738df1`: **168 923 182 байта**. Внутренний HANDOFF-MANIFEST.json описывает 22 runtime-ассета и 11 оригинальных PNG. Размер и SHA-256 архива повторно сверены с sidecar manifest; CRC и SHA-256 всех вложений были проверены при его создании. Это отдельный исторический архив, не поставка новых видео v11.

## История: подтверждённый выпуск v9

**v9 опубликована и проверена на последующем автоматическом deployment.** В main находятся UI-коммит `f82f8fe` и исправление default build `348ec11`. Активный на момент проверки deployment `5f9285ad-8f5e-40a2-8230-9991ccf907d0` от `2026-11-17T07:27:38Z`, 100% трафика. Это автоматический выпуск после исправления сборки, а не кратковременно проверенный manual deploy. 21 тест и итоговая сборка app+Storybook пройдены; targeted lint без замечаний, diff check чистый.

Публичная проверка после автоматической публикации:

- Storybook, index.json, iframe и текущий JS отвечают HTTP 200 с корректными типами содержимого. Через браузер открыта настоящая история «ТемыЧатов»: 21 плитка, live-lake называется «Ночная степь».
- В приложении 21 плитка 9:16; новый постер загружен с шириной 768 px. Выбор live-lake сохраняется после reload.
- Реакции: 40 эмодзи, поисковых input нет. Rich-message: все 16 проверенных строк времени находятся внутри баблов.

Отчёт: [public smoke v9](../artifacts/settings-redesign-2026-11-17/v9/published-smoke.json). Эти проверки относятся к указанному deployment; дальнейшие публикации также требуют контроля последней активной версии.

Подтверждённые проверки v9:

- Финальный аналитический аудит: 14 616 проверок цвета и 504 проверки края, 0 ошибок. [Аудит v9](../artifacts/settings-redesign-2026-11-17/v9/color-audit.txt). Это аналитика исходного CSS, отдельно от браузерных измерений ниже.

- 336 комбинаций: 21 тема × ERG/Integra × light/dark × ширина 320/393 × statuses/rich. Проверены 4368 строк времени/статуса: все целиком внутри `.msg-bubble`, 0 нарушений. [Отчёт границ](../artifacts/settings-redesign-2026-11-17/v9/message-bounds.json).
- Миниатюры темы приложения имеют 9:16; межколоночный интервал равен боковому полю: 18 px на ширине 393 и 12 px на 320. [Геометрия карточек](../artifacts/settings-redesign-2026-11-17/v9/app-card-geometry.json).
- Каталог на 320/393: 21 плитка 9:16, пять «LIVE · фото», без горизонтального overflow. [Геометрия каталога](../artifacts/settings-redesign-2026-11-17/v9/catalog-geometry.json).
- Long tap проверен на «Мяте» Integra/light и «Ночной степи» ERG/light. Поднятая копия сохраняет палитру бабла; summary/list прочитавших используют app-цвета. [Integra/Мята](../artifacts/settings-redesign-2026-11-17/v9/menu-integra-mint.png), [ERG/Ночная степь](../artifacts/settings-redesign-2026-11-17/v9/menu-erg-steppe.png).
- Полноэкранная очистка проверена в ERG/light и Integra/dark: размеры overlay и DeviceHost совпали — 393×852; blur 26 px, saturate 0.65; акценты #ef7f1a и #8f8ad6 соответственно. После завершения autofocus на «Отлично», фон inert во время открытия и 0 inert-соседей после закрытия. [ERG running](../artifacts/settings-redesign-2026-11-17/v9/cache-erg-running.png), [Integra dark running](../artifacts/settings-redesign-2026-11-17/v9/cache-integra-dark-running.png), [ERG done](../artifacts/settings-redesign-2026-11-17/v9/cache-erg-done.png).

- Быстрая реакция: раскрытый набор содержит 40 эмодзи, свёрнутый — 8; поисковых input нет. После выбора 🤭 и сворачивания он остаётся видимым. Chevron при раскрытии поворачивается на 180°; aria-expanded согласован с состоянием. В консоли локального прохода 0 ошибок и предупреждений.

Это браузерные проверки веб-прототипа. Физический iPhone и браузерный проход с включённым reduced motion данным отчётом не подтверждены. Наличие правил reduced motion в исходнике отдельно от факта ручного/браузерного тестирования.

## История публикации v9: обнаруженная замена выпуска

Ручной полный выпуск v9 с префиксом ID 3858a1e0 от 07:18:49 UTC был заменён через 73 секунды выпуском 2477928c… от 07:20:02 UTC. Новые app-ассеты продолжали работать, но /storybook/ отдавал корневой HTML приложения. Такая замена полного пакета на app-only наблюдалась и после проверки v8. Точный инициатор/источник второго релиза и его CI пока не установлен.

Исправлен контракт package.json: `build` теперь по умолчанию собирает приложение и Storybook в общий dist; `build:app` — отдельный vite build; `build:all` — alias npm run build. Исправленная default-команда успешно выполнена локально. Явный HTML handling сохранён, но не объявлен решением этой гонки. После fix commit 348ec11 завершился автоматический deployment 5f9285ad-8f5e-40a2-8230-9991ccf907d0. На нём повторно подтверждены app, Storybook, его index/iframe и история тем. Это проверка результата полного build-контракта в последующем выпуске; точный сервис/CI, инициировавший прежнюю замену, по-прежнему не установлен.

## Предыдущий подтверждённый выпуск v8

v8 опубликована 17 ноября 2026: UI-код `c4cf135` в main, проверенный на тот момент Cloudflare deployment `ebdf868d-cfac-4734-af30-87a0e2f50f6e`, Worker qollab. App и Storybook были собраны и проверены публично; история «ТемыЧатов» показывала 21 плитку. Позже полный пакет был заменён deployment с префиксом ecc9bfbe в 06:55 UTC, и Storybook снова отсутствовал. Поэтому прежний успешный smoke после явного assets.html_handling=auto-trailing-slash не является доказательством, что эта настройка устранила причину проблемы.

Исторические результаты v8: 19/19 модельных тестов, targeted lint без замечаний, build:all; 84 конфигурации/420 статусов; 84 long tap и 64 rich-message проверки; аналитические 12 768 цветовых и 504 edge-проверки без ошибок. Были пройдены локальные copy/reply/edit/pin/reaction/forward, отмена удаления, язык и демоочистка. Эти результаты не подтверждают новые границы баблов, app-scope меню, макеты, ассеты или очистку v9.

Архивные свидетельства: [published smoke v8](../artifacts/settings-redesign-2026-11-17/v8/published-smoke.json), [сетка v8](../artifacts/settings-redesign-2026-11-17/v8/published-theme-grid.png), [status summary](../artifacts/settings-redesign-2026-11-17/v8/rendered-status-summary.json), [long tap](../artifacts/settings-redesign-2026-11-17/v8/longtap-matrix.json), [rich summary](../artifacts/settings-redesign-2026-11-17/v8/longtap-rich-summary.json), [аналитический аудит](../artifacts/settings-redesign-2026-11-17/v8/color-audit.txt), [действия](../artifacts/settings-redesign-2026-11-17/v8/real-actions.json). Старые утверждения о переносе тематического read-цвета в панели меню/прочитавших и допустимости внешнего времени отменены контрактом v9 и не являются инструкцией для реализации.

## Поведение и целевой контракт v12

Ниже актуальный контракт v12 с сохранёнными требованиями v10/v11. Факты проверки определяются release-блоками, а не формулировками спецификации.

Настройки сохраняют существующий top bar и фон, без повторения информации профиля. В корне цветные квадратные иконки с белыми залитыми символами. «Данные устройства» доступны сразу; «Данные и память» объединяют состав кэша, выбор очистки и параметры хранения. Язык выбирается в нижней панели, Қазақша первым. Залитые основные действия имеют полную pill-форму.

«Оформление» содержит три равные миниатюры приложения 9:16 (light/dark/system), предпросмотр чата, каталог и быструю реакцию. В каталоге единая белая секция объединяет preview и непрерывную вертикальную сетку 33 пресетов; все плитки 9:16. По контракту v10 preview и заголовок остаются неподвижными, прокручивается только список тем. Горизонтальных лент и отдельных групповых карточек нет. ERG/Integra сохраняют выбор независимо, старые адреса цветов/обоев ведут в каталог.

Время и receipt находятся внутри **всех** баблов, включая медиа, документ и профиль. Пресет задаёт read-цвет только внутри сообщения и его точной поднятой копии. Панели меню, activity/readers и список чатов остаются в app-scope и используют брендовые значения. Широкого переноса read-переменных на меню нет.

Быстрая реакция: 40 курируемых эмодзи, без поиска; свёрнуто 12 в два ряда по 6, включая текущий выбор; emoji 26 px и круг до 44 px. Toggle содержит aria-expanded/controls и шеврон вниз/вверх. В v10 короткий hint 12 px находится над preview, выбранный emoji в списке выделен бледно-оранжевым кругом (14% #ef7f1a + фон приложения) без обводки в обоих брендах; клавиатурный focus-visible сохраняется. [Unicode Emoji Frequency](https://www.unicode.org/emoji/frequency.html) использована как открытый ориентир агрегированной частотности; рабочие дополнения и порядок отобраны вручную. Это не статистика ERG/Integra и не рейтинг 2026 года.

Пять градиентов используют разные мелкие нейтральные grain SVG. «Ночная степь» сохраняет ID live-lake и poster live-steppe.webp; вместе с «Планетой» это статичные photo-темы без LIVE. У 15 live-тем есть настоящие немые MP4 и соответствующие постеры первого кадра. Ограничений выбора длительностью 10 секунд больше нет: поставка v11 использует 9 и 24 секунды.

Очистка v12 — полноэкранный Portal в DeviceHost без центральной карточки, с видимым реальным экраном под blur. Декоративный космический вихрь поглощает иконки файлов; кругового прогресса нет. Снизу один progressbar: проценты и линейная полоса, без объёма. Done — простая приглушённо-зелёная галочка без круга, плитки и конфетти. Кнопка использует точный --color-primary пространства и белый текст, без затемнения; диаграмма категорий сохраняет свою палитру. Сохраняются inert-фон, ограничение/восстановление фокуса, scrim cleanup, доступный прогресс и reduced motion всех новых анимаций. Работа job остаётся локальной демонстрацией, независимой от декоративного движения.

Навигация v10: общий стек push/pop для переходов настроек, согласованное открытие/возврат, сохранение состояния предыдущего экрана. Самостоятельные mount-анимации отдельных страниц не должны наслаиваться на общий переход. Локально подтверждены парные push/pop, завершение, фокус и неактивные слои; полный browser-проход всех оболочек и reduced motion отдельно не заявляются.

## Основная ссылка и вспомогательные маршруты

Единая точка передачи — [страница разработчиков](https://qollab.admirably08.workers.dev/handoff/developers); она объединяет прототип, каталог и всю текущую документацию. Остальные адреса ниже служат прямыми маршрутами для диагностики и приёмки, а не отдельными поставками.

| Ссылка | Назначение |
|---|---|
| [Страница разработчиков](https://qollab.admirably08.workers.dev/handoff/developers) | Основная точка входа: прототип, каталог, исходники и материалы |
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
| Навигация настроек v10 | `src/components/SettingsRouteStack.jsx`, `src/utils/settingsNavigation.js`, `src/components/SettingsFlow.jsx`; интеграции `App.jsx`, `SettingsReview.jsx`, scoped decorator `src/screens/__stories__/Settings.stories.jsx`; CSS `Settings.css` | Router владеет историей; сохранённые слои push/pop 300 ms, POP ждёт Animation.finished; inert/aria-hidden, reduced motion без движения |
| Каталог и выбор | `src/screens/SettingsChatThemes.jsx`, `.css` | Одна белая секция; v10: preview+заголовок фиксированы, scroll только grid; плитки 9:16; одна обводка; selected по ID |
| Пресет и миграция | `src/utils/chatThemeCatalog.js`, `chatAppearance.js` | Сохранять ID, а не произвольный объект палитры |
| Persistence | `src/utils/settingsPreferences.js`, `src/context/CompanyContext.jsx` | Различать localStorage настроек и sessionStorage пространства |
| Доставка MP4 | `worker/video-assets.js`, `worker/video-assets.test.js`, `wrangler.jsonc` | Только video-prefix, реальные byte ranges, ограниченная буферизация 8 MiB; не менять SPA/Storybook routing |
| Фон везде | `src/components/ChatWallpaper.jsx`, `src/utils/chatWallpaperPlayback.js`, `src/screens/ChatAppearance.css` | Общие poster/video для preview/реального чата; tile без video; политика видимости, pause и fallback |
| Бабл/доставка/время | `src/components/Message.jsx`, `src/screens/ChatRoom.css`, `ChatAppearance.css` | 5 статусов; время/receipt внутри любого бабла, непрозрачная поверхность |
| Семантика доставки | `src/utils/messageDelivery.js`, `src/components/MessageDeliveryStatus.jsx`, `.css` | Общие neutral/error; read темы только в chat-scope, фирменный read в app-scope |
| Доступность действий | `src/components/messageMenuActions.js` | Edit только для своих текста/ссылки; Copy для текста, подписи или профиля |
| Контекст long tap | `src/components/messageMenuClone.js` | Вычисленная тема только внутри клона бабла, точная дробная ширина; меню её не наследует |
| Быстрая реакция | `QuickReactionSettings` в `src/screens/SettingsExperience.jsx` | 40/12, 6 колонок, без поиска; v10: hint 12 px над preview, выбранный круг в списке — бледно-оранжевый (14% #ef7f1a + фон приложения), без обводки; aria-expanded/controls |
| Реакции | `src/components/MessageReactions.jsx`, `.css` | Настоящая геометрия, состояние своей/чужой реакции |
| Long tap и полный picker | `src/components/MobileMessageMenu.jsx`, `src/gallery/reaction-picker/ReviewMessageMenu.jsx`, `EmojiPicker.jsx` | Поднятый бабл сохраняет тему; панели/прочитавшие/список чатов используют scope="app" |
| Настоящие чаты | `src/screens/ChatRoom.jsx`, `DMChat.jsx` | Reply/edit/delete/forward и локальные состояния сообщений |
| Кэш и параметры | `src/screens/SettingsExperience.jsx`, `src/utils/settingsPreferences.js` | Демоданные; после очистки изменяется только localStorage |
| Чарт/диск/процесс | `src/components/SettingsStorageVisuals.jsx`, `.css` | Чарт с коротким reveal; v12: декоративный вихрь без кругового прогресса, одна нижняя полоса с %, plain muted-green check, точный primary + белый текст кнопки; фактический blur/inert/focus/reduced motion |
| Данные устройства | `DeviceDetailsSettings` в `src/screens/SettingsExperience.jsx` | Значения макетные; clipboard реальный и может отказать |
| Обзор настроек | `src/gallery/settings-redesign/SettingsReview.jsx`, `.css`, `src/components/SettingsFlow.jsx` | MemoryRouter/DeviceHost; общий route-набор настроек со scoped Settings stories; reset демокэша |
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
| Статичные фото | live-lake, live-earth | Ночная степь, Планета; video=null, group=photo, без LIVE |
| Пользовательские видео | live-coast, live-prism, live-poppies | Немой loop 9 s; poster *-v11.webp |
| Skyflow | live-sky-blue, live-sky-mint, live-sky-lilac | Небесный шёлк, Мятное облако, Сиреневый туман; 24 s |
| Mesh | live-mesh-blue, live-mesh-peach, live-mesh-lilac | Голубой, Персиковый, Лавандовый поток; 24 s |
| Aurora | live-aurora-mint, live-aurora-violet, live-aurora-ice | Северное, Лиловое, Ледяное сияние; 24 s |
| Prism | live-prism-blue, live-prism-mint, live-prism-peach | Ледяная, Мятная, Рассветная призма; 24 s |

Постеры и SVG лежат в `public/img/chat-themes/`, 15 MP4 — в `public/video/chat-themes/`. Путь читается из канонического poster: ID live-lake намеренно указывает на live-steppe.webp. Сохранённый выбор не сбрасывается. Новый оригинал — artifacts/live-wallpapers-v9-2026-11-17/originals/live-steppe.png, manifest — рядом; старое озеро хранится только для истории/совместимости.

Текущая передача идёт через [страницу разработчиков](https://qollab.admirably08.workers.dev/handoff/developers), без обязательного скачивания архива. Следующие пакеты — сохранённая история v7–v11, не основная поставка v12.

[Пакет v10](../artifacts/chat-themes-v10-developer-handoff.zip) сохранён как предыдущая поставка. Исторический [Developer handoff ZIP v9](../artifacts/chat-themes-v9-developer-handoff.zip) содержит исходный проект, документацию, QA v9, 22 runtime-ассета и 11 оригинальных PNG — пять исходников сцен v9, пять иллюстраций и архивное озеро. Именно архив v9 не содержит backend и готовых live-видео; состав v11 приведён отдельно ниже.

- [Исторический медиапакет v11](../artifacts/chat-live-videos-v11.zip): компактная поставка v11 **15 MP4 + 15 poster WebP**, без оригиналов и тяжёлых master/candidate файлов. Размер — **19 476 409 байт**; SHA-256 — `f66a6d31a7d44c138516a8ac2ef4945a7edbc310643ff73a78b82845b54160ee`. CRC, SHA-256 всех вложений и соответствие runtime-файлам проверены; размер и SHA-256 всего ZIP сверены повторно.
- [Исторический Developer handoff v11](../artifacts/chat-themes-v11-developer-handoff.zip): полный проект из точного согласованного commit, включая video worker, его тесты и wrangler.jsonc; 37 runtime image/SVG-ассетов, 15 MP4, 11 исходных PNG, 3 неизменённых пользовательских MP4, переносимый renderer, документы и QA. Относительные пути сохранены; node_modules, dist, секреты и вложенные исторические ZIP исключены. Точный source commit, состав и SHA-256 файлов фиксирует HANDOFF-MANIFEST.json; результат проверки архива — в sidecar manifest.
- [Supplied media manifest](../artifacts/live-wallpapers-v11-2026-11-17/supplied-manifest.json), [rendered media manifest](../artifacts/live-wallpapers-v11-2026-11-17/runtime-manifest.json).
- [Переносимый renderer и происхождение](../scripts/chat-wallpapers-v11/README.txt), [повторное сжатие пользовательских клипов](../scripts/chat-wallpapers-v11/supplied/README.md).

- [Ночная степь v9: исторический исходник и animation prompt](chat-live-steppe-prompts.txt); тема v11 остаётся статичной.
- [Manifest Ночной степи](../artifacts/live-wallpapers-v9-2026-11-17/manifest.json).
- [Исторические 10 промптов для пяти сцен v7–v9](chat-live-wallpaper-prompts.txt); второй раздел — Ночная степь. Их прежнее условие 10 секунд не ограничивает лупы v11 длительностью 9/24 секунды.
- [Пакет PNG и промптов, ZIP](../artifacts/live-wallpapers-v7-2026-11-17/chat-live-wallpaper-sources-and-prompts.zip).
- [Manifest исходников live](../artifacts/live-wallpapers-v7-2026-11-17/manifest.json); PNG — рядом в originals.
- [Происхождение иллюстраций](../artifacts/settings-redesign-2026-11-17/v7/art-generation/generation.json); оригиналы — рядом в originals.
- [Генератор seamless-паттернов](../scripts/assets/create-chat-patterns.mjs).

Иллюстрации и исторические PNG v7–v9 созданы генерацией как новые композиции по визуальному направлению референсов. Постеры 15 live-тем извлечены из финальных MP4; происхождение пользовательских клипов и процедурных 12 лупов отдельно описано в manifests и переносимом renderer. Оригиналы не заменять сжатыми WebP. Иконки и мотивы — Phosphor, MIT; при переносе файлов сохранить copyright и permission notice из лицензии зависимости. Дополнительные ограничения происхождения и pipeline клипов описаны в руководстве.

## Состояния и действия: матрица приёмки

Во всех строках проверить ERG/Integra и light/dark. Для цвета дополнительно пройти все 33 пресета (132 комбинации), включая стандартную тему обоих брендов.

| Область | Сценарий | Ожидаемое состояние |
|---|---|---|
| Тема | Выбор → смена экрана → reload | Один selected ID, тот же preview/реальный чат |
| Изоляция | Выбрать разные темы ERG/Integra и вернуться | Каждое пространство хранит свою тему |
| Миграция | Старый wallpaper/custom/неизвестный ID | Детерминированный ближайший пресет или standard |
| Каталог | Узкий/основной экран, длинные названия | Preview и заголовок неподвижны; прокручивается только grid; все 33 плитки 9:16 доступны на 320/393, без overflow |
| Тема приложения | Light/dark/system | Три равные миниатюры 9:16, одинаковые padding/gap, system без белых полос |
| Ассеты | Пять градиентов и ID live-lake | Пять разных grain SVG; Ночная степь и новый poster, сохранённый ID не сброшен |
| Статус | sending, sent, delivered, read, failed | Нейтральные промежуточные; read в цвете темы; ошибка не имитирует успешную доставку |
| Rich content | Фото/видео с подписью и без, voice, document, quote, profile, link | Время и receipt геометрически внутри бабла, без внешней строки; текст/иконки/подписи читаемы |
| Read-scope | Смена пресета → bubble / menu / readers / Chats | В бабле read меняется с темой; вне бабла остаётся брендовый app-read, в обоих режимах |
| Быстрая реакция | Раскрыть → выбрать эмодзи вне первых 12 → свернуть | 40/12, 6 колонок, выбранная видна, без поиска; hint 12 px над preview; выбранный круг в списке — бледно-оранжевый (14% #ef7f1a + фон приложения), без обводки в обоих брендах; chevron/aria-expanded согласованы |
| Реакции | Поставить/снять; своя/чужая; много реакций | Геометрия настоящего MessageReactions, доступный счётчик |
| Long tap | Touch hold, мышь contextmenu, Shift+F10 | Выбранный бабл не теряет заливку, текст, outline и read-цвет |
| Reply | Ответить → composer → отправить → отменить | Цитата соответствует сообщению; отмена очищает draft reply |
| Edit | Своё текстовое сообщение → изменить → сохранить/отмена | Edit доступен тексту/ссылке; не предлагается вложениям/профилю |
| Copy | Текст/подпись/ссылка профиля → clipboard; отказ доступа | Корректный toast; нет пустого Copy у voice/document без текста |
| Forward | Выбрать получателя → локальная пересылка/отмена | Общий ForwardSheet, корректное превью; это демо без доставки сервером |
| Pin/Delete | Закрепить/открепить, подтверждение удаления/отмена | Локальное состояние и меню согласованы |
| Select | «Выбрать» в настоящих чатах | **Известный gap:** toast «Режим выбора появится позже»; множественный выбор не реализован |
| Стек v10 | Открытие → ещё подэкран → Back → повторный вход | Согласованный push/pop, состояние/scroll восстановлены; app/review/Storybook; быстрые переходы и reduced motion |
| Закрытие | Back/Escape/наружное нажатие/close | Меню и picker закрываются; тема и исходный экран сохранены |
| Язык | Открыть sheet, Қазақша первым, выбрать/отмена | Текущий язык отмечен, панель закрывается, строки обновляются |
| Кэш | Снять всё, выбрать часть, подтвердить/отменить | Нулевой выбор disabled; очищается выбранный демообъём |
| Очистка v12 | ERG/Integra × light/dark; running → done → Отлично | Overlay совпадает с DeviceHost; под blur виден фактический экран; вихрь поглощает иконки, кругового прогресса нет; одна нижняя полоса с %; done — приглушённо-зелёная галочка без обрамления/конфетти; кнопка exact primary + белый текст; итог demo job |
| Пустой кэш v10 | Завершить очистку → закрыть overlay | «Всё чисто» и знак читаемы на прежнем фоне; нет вторичной подписи и новой карточки; локальные light/dark подтверждены |
| Доступность очистки | Tab/Shift+Tab, Escape, закрытие, reduced motion | Фон inert, фокус в диалоге; Escape только done; фокус и прежние inert/blur-состояния восстановлены; без движения вихря/файлов/переходов при reduced motion |
| Данные устройства | Копирование → успех/ошибка | Копируется отображаемый список; toast отражает фактический результат |
| Motion | Reduced motion, hidden tab, video load error | Читаемый неподвижный UI/постер; чат доступен |
| Keyboard | Focus/Enter/Space, labels/pressed/checked | Выбор доступен без мыши; focus видим; цвет не единственный сигнал |

Матрица — обязательные сценарии приёмки, а не утверждение, что каждый из них уже проверен. Фактически выполненные проверки перечисляются в release-блоке. Визуальный `/handoff/chat-theme-states` демонстрирует состояния и меню; действия reply/edit/forward/delete проверяются через `/handoff/chat-interactions`.

## Граница прототипа и production

| Сейчас | Требование к production |
|---|---|
| Выбор темы в localStorage `qollab.settings.v2` | Предпочтения пользователя на сервере, ключ user + workspace; auth/права, валидация известных ID, синхронизация устройств, версия каталога и конфликтов |
| Клиентская миграция по сохранённым полям | Поддержать миграцию серверных предпочтений и неизвестный ID при разной версии клиента; безопасный fallback standard |
| Список 33 пресетов в коде, локальные URL | Версионирование каталога/медиа, CDN/cache policy, ограничения загрузки, неизменные ID; не сохранять недоверенный CSS/URL в preference |
| Три секунды таймера очистки, `clearedCache` | Настоящий файловый cache manager: сканирование, прогресс, частичный успех/ошибка, повтор, отмена при поддержке, удаление только локальных копий |
| 128 ГБ, другие данные 107020 МБ, кэш 2400 МБ — макет | Реальные нативные метрики диска; отдельно app cache, другие данные, свободное место; не обещать браузеру доступ ко всему диску |
| Retention/limit только сохранены | Фоновая политика удаления по возрасту/лимиту, офлайн-ограничения, состояние занятости и защита нужных файлов |
| iPhone 15 Pro, iOS 27.0, версия 3.1.7.2 — макет | Системный bridge с проверенными значениями и явным поведением отсутствующих полей |
| Сообщения/статусы/пересылка в состоянии демо | Реальный message API, серверные idempotency/receipts, права, pending/error/retry; нельзя считать демо таймер подтверждением доставки |
| Смена языка клиентского прототипа | Согласованный набор переводов и серверных текстов; проверить строковые длины и полноценную локаль |
| 15 MP4 и poster fallback подключены; loops 9/24 s | Проверить целевые iPhone/Android/WebView, Low Power Mode, память, энергопотребление, смену приложения, autoplay и CDN Range/cache policy |

Известные ограничения существующей оболочки: direct entry основного приложения может выводить предупреждение `No routes matched location` из нижележащих tabRoutes; нулевое число предупреждений консоли не заявляется. У общего `ActionSheet` остаётся прежний пробел в управлении фокусом/inert — для production его нужно закрыть отдельно. Это не дефект новой полноэкранной очистки и не блокер выпуска v10; её собственные blur/inert cleanup проверены в указанных выше сценариях.

Копирование в clipboard действительно использует браузерный API. Очистка не освобождает место на устройстве. Приложение не считывает указанные модель/версию ОС/размер диска. Данные и диагностику реального устройства не следует собирать или отправлять из этого макета без отдельного продуктового решения.

## Проверки, сборка и публикация

Команды полностью перечислены в [руководстве](chat-themes-guide.md#9-проверки-и-выпуск). Ключевые шаги: Node model tests → аналитический CSS audit с хешами → targeted oxlint → браузерные сценарии → `npm run build` → авторизованный deploy существующего Worker `qollab` → публичная проверка.

Проверка контраста вычисляет CSS-цвета непрозрачных поверхностей; она не оценивает реальный видеокадр, браузерный layout или reader semantics. Storybook и приложение собираются в одном dist командой npm run build. Не публикуйте результат build:app как полный пакет; повторно проверяйте последний deployment после завершения очередных публикаций. v7/v8/v9-артефакты исторические. Отчёты v11 сохраняются как история. Новые отчёты v12 сохраняются отдельно в artifacts/settings-redesign-2026-11-17/v12 и должны соответствовать финальным исходникам v12; старые хеши и результаты не переносить на новую ревизию. Локальные результаты v12 и ограничения перечислены в начале документа; публичная проверка отмечается отдельно.

Историческая приёмка v10 — подтверждённая часть и оставшиеся пункты:

- [x] 36 тестов: 33 catalog/status/menu/navigation и 3 SettingsRouteStack SSR; targeted lint чистый.
- [x] Аналитический аудит: 14 616 contrast + 504 edge, 0 ошибок.
- [x] Фиксированные preview/заголовок, реальная прокрутка списка и доступность нижней плитки на 393×852/320×568.
- [x] Реакции: 6 колонок на 320/393, 12/40, сохранение выбранного, бледный круг 14% с border=0.
- [x] Очистка ERG/dark и Integra/light: реальный blur, только %, белый текст кнопки, running/done и очистка добавленного blur/inert у активного экрана.
- [x] Контрастное «Всё чисто» в light/dark, вторичная подпись удалена.
- [x] Review: парные push/pop, завершение, heading focus и hidden/inert. App после demo login: push, catalog scroll, browser Back/Forward. Локальный production Storybook: «ТемыЧатов» → «Оформление» → «Быстрая реакция», 12 emoji в 6 колонок.
- [x] Полный npm run build: app + Storybook, exit 0.
- [ ] Browser reduced motion: навигация и очистка; наличие кода не считать ручной приёмкой.
- [ ] Быстрые повторные переходы и клавиатурные сценарии вне перечисленных локальных проходов app/review/Storybook.
- [x] UI commit 3035bb2 в main; Workers Builds 54ce3aec-6edb-4869-a5ab-bcb52bf72da7 success; deployment 3b2205c0-c31e-46ae-ac24-930446a577cf и публичный smoke app+Storybook подтверждены.
- [x] ZIP v10 существует: source `ef6df8076c3f9139b450416e96a8ac039d738df1`, **168 923 182 байта**, внутренний manifest и sidecar с результатами CRC/SHA-256. Размер и SHA-256 повторно совпали с sidecar. Старые архивы сохранены; это исторический результат v10.

Архив приёмки v9 (ниже — только подтверждённая история, не проверки v10):

- [x] 21 тест кода v9 пройден.
- [x] 336 браузерных комбинаций / 4368 внутренних timestamp/receipt — 0 нарушений границ бабла.
- [x] Catalog 21×9:16, пять LIVE · фото, миниатюры приложения 9:16 и равные поля/интервалы подтверждены на 320/393.
- [x] Long tap сохраняет бабл, app-read вне бабла подтверждён на двух комбинациях, перечисленных выше.
- [x] Fullscreen cache ERG/light и Integra/dark: размер, брендовый акцент, завершение, autofocus/inert и восстановление фона проверены.
- [x] Быстрая реакция: 40/8, отсутствие поиска, поворот шеврона и видимость выбранного 🤭 после сворачивания проверены.
- [x] Финальный аналитический аудит: 14 616 цветовых и 504 edge-проверки, 0 ошибок; отчёт соответствует исходникам v9.
- [x] Исправленная default npm run build app+Storybook пройдена; targeted lint без замечаний, diff check чистый. Long tap проверен в комбинациях выше; другие v8 action-сценарии этим проходом повторно не заявляются.
- [x] UI f82f8fe и buildfix 348ec11 находятся в main; последующий автоматический deployment 5f9285ad-8f5e-40a2-8230-9991ccf907d0 подтверждён, публичные app и Storybook проверены.
- [x] В release-блок v9 внесены commit, deployment, публичные результаты и окончательные ограничения.

В v9 reduced motion присутствовал в стилях/компонентах, но отдельная браузерная проверка не заявлялась. Для изменённых переходов и очистки v10 проверка этого режима ожидается.

Физический iPhone/WebView, VoiceOver, аппаратная клавиатура, low-power mode, реальная сеть/диск и декодирование видео на целевых устройствах требуют отдельного device QA. Браузерная проверка и screen mirror референса не являются подтверждением этой матрицы.
