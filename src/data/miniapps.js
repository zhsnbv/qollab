// Дерево навигации внутри мини-аппов. Верстается шаблоном из Figma
// (node 24014-12302): строка = иконка + заголовок + опциональный сабтайтл +
// шеврон, есть состояние disabled и вариант без иконки.
//
// Контент «Моих задач» расшит по скринам живого приложения. Уровни, которых на
// скринах не было, достроены осмысленно — прототип должен листаться вглубь
// целиком, а не упираться в тупик на втором шаге.
//
// Типы экранов:
//   list    — список переходов (items)
//   records — список записей «заголовок + номер: статус»
// Оба — уровни навигации по шаблону: строка + опциональный сабтайтл + шеврон.
// Флаг favorite — показывать внизу тумблер «Добавить в избранное» (как в
// живом приложении на конечных экранах).

export const miniApps = {
  mytasks: {
    title: 'Мои задачи',
    type: 'list',
    items: [
      {
        id: 'esed',
        title: 'ЕСЭД',
        icon: 'UserFocus',
        screen: {
          title: 'ЕСЭД',
          type: 'list',
          // В макете у всех трёх строк одна и та же иконка документа —
          // развёл по смыслу: памятка, видео, подписание.
          items: [
            { id: 'memo', title: 'Памятка пользователю', icon: 'BookOpenText', screen: { title: 'Памятка пользователю', type: 'records', favorite: true, records: [
              { title: 'Что такое ЕСЭД', meta: 'Раздел 1' },
              { title: 'Как получить ОЭЦП', meta: 'Раздел 2' },
              { title: 'Подписание документов', meta: 'Раздел 3' },
              { title: 'Частые вопросы', meta: 'Раздел 4' },
            ] } },
            { id: 'video', title: 'Видео-инструкция', sub: 'Как ознакомиться с кадровым приказом', icon: 'VideoCamera', screen: { title: 'Видео-инструкция', type: 'records', favorite: true, records: [
              { title: 'Ознакомление с кадровым приказом', meta: '4:12' },
              { title: 'Подписание заявления на отпуск', meta: '2:48' },
              { title: 'Установка ОЭЦП на телефон', meta: '6:05' },
            ] } },
            { id: 'sign', title: 'ЕСЭД', sub: 'Подписать с ОЭЦП документы', icon: 'Signature', screen: { title: 'Подписание', type: 'records', favorite: true, records: [
              { title: 'Приказ о переводе', meta: '№ 4417-к: Ожидает подписи' },
              { title: 'Заявление на отпуск', meta: '№ 4402-к: Ожидает подписи' },
              { title: 'Дополнительное соглашение', meta: '№ 4388-к: Подписано' },
            ] } },
          ],
        },
      },
      // АСУТП КИП и Исполнение АСУТиМТ в живом приложении открывают дашборд со
      // счётчиками заявок — не уровень навигации, поэтому в прототипе они
      // конечные пункты: строка есть, экран за ней не рисуем.
      {
        id: 'asutp',
        title: 'АСУТП КИП',
        icon: 'Files',
      },
      {
        id: 'it',
        title: 'IT заявки',
        sub: 'SMAX',
        icon: 'Headset',
        screen: {
          title: 'IT заявки',
          type: 'list',
          // Тут в макете тоже сплошь одинаковые иконки документа — развёл.
          items: [
            { id: 'new', title: 'Подать IT заявку', icon: 'PaperPlaneTilt', screen: {
              title: 'Подать заявку', type: 'list', favorite: true,
              items: [{ id: 'send', title: 'Отправить заявку', sub: 'Например: Прошу предоставить доступ к VPN', icon: 'NotePencil' }],
            } },
            { id: 'assigned', title: 'Заявки на мне/на моей группе', icon: 'Tray', screen: { title: 'Заявки на мне', type: 'records', favorite: true, records: [
              { title: 'Не работает принтер на 3 этаже', meta: '318204411: В работе' },
              { title: 'Доступ к сетевой папке отдела', meta: '317998120: Новая' },
            ] } },
            { id: 'open', title: 'Мои открытые заявки', icon: 'FolderOpen', screen: { title: 'Открытые заявки', type: 'records', favorite: true, records: [
              { title: 'Замена ноутбука', meta: '319447201: В работе' },
              { title: 'Доступ к Confluence', meta: '319120388: Согласование' },
              { title: 'Установка Figma', meta: '318877145: Новая' },
            ] } },
            { id: 'closed', title: 'Мои закрытые заявки', icon: 'CheckCircle', screen: { title: 'Закрытые заявки', type: 'records', favorite: true, records: [
              { title: 'Прошу помочь с восстановлением пароля', meta: '295214427: Завершено' },
              { title: 'Почта', meta: '228846131: Завершено' },
              { title: '\\\\БТС_VPN', meta: '194040294: Завершено' },
              { title: 'Доступ к qollab для стажера', meta: '184637459: Завершено' },
              { title: 'Не пускает в впн, почту и т.д.', meta: '135715098: Завершено' },
              { title: 'Прошу помочь с подключением корпоративной почты', meta: '125090276: Завершено' },
              { title: 'есэд', meta: '119247475: Завершено' },
              { title: 'сброс пароля', meta: '102727547: Завершено' },
              { title: 'смена пароля', meta: '98441203: Завершено' },
            ] } },
            { id: 'approvals', title: 'Мои согласования', icon: 'SealCheck', screen: { title: 'Мои согласования', type: 'records', favorite: true, records: [
              { title: 'Закупка лицензий Adobe', meta: '320114577: Ожидает вас' },
              { title: 'Доступ к производственному контуру', meta: '319884302: Ожидает вас' },
            ] } },
            { id: 'quality', title: 'Оценка качества исполнения заявок', icon: 'Star', screen: { title: 'Оценка качества', type: 'records', favorite: true, records: [
              { title: 'Прошу помочь с восстановлением пароля', meta: '295214427: Оценить' },
              { title: 'Почта', meta: '228846131: Оценено' },
            ] } },
            { id: 'asmo', title: 'Создание заявки АСМО', icon: 'FilePlus', disabled: true },
          ],
        },
      },
      {
        id: 'photo',
        title: 'Фото на пропуск',
        icon: 'Camera',
        screen: {
          title: 'Фото на пропуск',
          type: 'list',
          items: [
            { id: 'shoot', title: 'Сделать фото', sub: 'Требования: анфас, светлый фон', icon: 'Camera' },
            { id: 'my', title: 'Мои заявки на пропуск', icon: 'IdentificationCard', screen: { title: 'Заявки на пропуск', type: 'records', favorite: true, records: [
              { title: 'Постоянный пропуск', meta: '412008: На проверке' },
              { title: 'Временный пропуск', meta: '411774: Одобрено' },
            ] } },
          ],
        },
      },
      {
        id: 'asutimt',
        title: 'Исполнение АСУТиМТ',
        icon: 'GearSix',
      },
      {
        id: 'food',
        title: 'Кабинет Исполнителя ОС по питанию',
        sub: 'Исполнение заявок',
        icon: 'ForkKnife',
        screen: {
          title: 'ОС по питанию',
          type: 'list',
          items: [
            { id: 'new', title: 'Новые заявки', icon: 'Tray', screen: { title: 'Новые заявки', type: 'records', favorite: true, records: [
              { title: 'Столовая №2, обеды на смену', meta: '77412: Новая' },
              { title: 'Буфет АБК, доукомплектация', meta: '77398: Новая' },
            ] } },
            { id: 'work', title: 'В работе', icon: 'ClockCounterClockwise', screen: { title: 'В работе', type: 'records', favorite: true, records: [
              { title: 'Столовая №1, замена меню', meta: '77201: В работе' },
            ] } },
            { id: 'done', title: 'Выполненные', icon: 'CheckCircle', screen: { title: 'Выполненные', type: 'records', favorite: true, records: [
              { title: 'Столовая №3, поставка воды', meta: '76840: Завершено' },
              { title: 'Буфет ЦЗЛ, инвентарь', meta: '76712: Завершено' },
            ] } },
          ],
        },
      },
      {
        id: 'budget',
        title: 'Смета затрат цеха',
        icon: 'Receipt',
        screen: {
          title: 'Смета затрат цеха',
          type: 'list',
          items: [
            { id: 'current', title: 'Текущая смета', sub: 'IV квартал', icon: 'Receipt', screen: { title: 'Текущая смета', type: 'records', favorite: true, records: [
              { title: 'Материалы и запчасти', meta: '12 480 000 ₸: Утверждено' },
              { title: 'Услуги подрядчиков', meta: '8 150 000 ₸: На согласовании' },
              { title: 'Энергоресурсы', meta: '21 300 000 ₸: Утверждено' },
            ] } },
            { id: 'history', title: 'История смет', icon: 'ClockCounterClockwise', screen: { title: 'История смет', type: 'records', favorite: true, records: [
              { title: 'III квартал', meta: '39 820 000 ₸: Закрыт' },
              { title: 'II квартал', meta: '41 105 000 ₸: Закрыт' },
            ] } },
            { id: 'approve', title: 'Согласование', icon: 'SealCheck', screen: { title: 'Согласование', type: 'records', favorite: true, records: [
              { title: 'Услуги подрядчиков', meta: '8 150 000 ₸: Ожидает вас' },
            ] } },
          ],
        },
      },
      {
        id: 'job',
        title: 'Job ERG',
        icon: 'ClipboardText',
        screen: {
          title: 'Job ERG',
          type: 'list',
          items: [
            { id: 'vacancies', title: 'Вакансии Группы', icon: 'Briefcase', screen: { title: 'Вакансии', type: 'records', favorite: true, records: [
              { title: 'Инженер-технолог', meta: 'АО «АЗФ»: Открыта' },
              { title: 'Аналитик данных', meta: 'ТОО «BTS»: Открыта' },
              { title: 'Мастер участка', meta: 'АО «АЭК»: Открыта' },
            ] } },
            { id: 'responses', title: 'Мои отклики', icon: 'PaperPlaneTilt', screen: { title: 'Мои отклики', type: 'records', favorite: true, records: [
              { title: 'Аналитик данных', meta: '2210: На рассмотрении' },
            ] } },
            { id: 'reserve', title: 'Кадровый резерв', icon: 'UsersThree' },
          ],
        },
      },
      {
        id: 'unblock',
        title: 'Деблокирование заявки',
        icon: 'LockKeyOpen',
        screen: {
          title: 'Деблокирование',
          type: 'records',
          favorite: true,
          records: [
            { title: 'Заявка на материалы №44120', meta: 'Заблокирована: превышен лимит' },
            { title: 'Заявка на услуги №43877', meta: 'Заблокирована: нет бюджета' },
          ],
        },
      },
      {
        id: 'mes',
        title: 'Подписание MES',
        icon: 'NotePencil',
        screen: {
          title: 'Подписание MES',
          type: 'records',
          favorite: true,
          records: [
            { title: 'Сменный рапорт, участок 4', meta: '08 окт: Ожидает подписи' },
            { title: 'Сменный рапорт, участок 2', meta: '08 окт: Ожидает подписи' },
            { title: 'Сменный рапорт, участок 1', meta: '07 окт: Подписано' },
          ],
        },
      },
      {
        id: 'sap',
        title: 'SAP Производство',
        sub: 'Подтверждение и Сторнирование',
        icon: 'ArrowsClockwise',
        screen: {
          title: 'SAP Производство',
          type: 'list',
          items: [
            { id: 'confirm', title: 'Подтверждение', icon: 'CheckCircle', screen: { title: 'Подтверждение', type: 'records', favorite: true, records: [
              { title: 'Заказ 000104428821', meta: 'Операция 0020: Готово к подтверждению' },
              { title: 'Заказ 000104428755', meta: 'Операция 0010: Готово к подтверждению' },
            ] } },
            { id: 'reverse', title: 'Сторнирование', icon: 'ArrowUUpLeft', screen: { title: 'Сторнирование', type: 'records', favorite: true, records: [
              { title: 'Заказ 000104427310', meta: 'Подтверждено 07 окт' },
            ] } },
          ],
        },
      },
      {
        id: 'survey360',
        title: 'Опрос 360',
        sub: 'Доступно для ERG Service',
        icon: 'UsersThree',
        disabled: true,
      },
    ],
  },
};
