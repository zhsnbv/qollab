// Каталог сервисов — из Figma (боттом-шит «Все сервисы», node 23762-7978).
// Иконки — плоские PNG-экспорты плиток 48×48 из ноды 23899-10438 (@4x): градиент
// и иллюстрация уже запечены в картинку, поэтому выглядят 1:1 как в макете и не
// требуют подбора смещения/масштаба под каждую из 24 иконок.
const I = (n) => `/img/svc2/${n}.png`;

export const serviceCategories = [
  {
    title: 'Работа',
    items: [
      { id: 'task', name: 'Мои задачи', sub: 'Управление списком рабочих дел и задач', img: I('task') },
      { id: 'mail', name: 'Почта 2.0', sub: 'Обновлённая версия корпоративной почты', img: I('mail') },
      { id: 'it', name: 'IT услуги', sub: 'Цифровые услуги для сотрудников', img: I('it') },
      { id: 'ticket', name: 'Тикет система', sub: 'Учёт и обработка обращений', img: I('ticket') },
      { id: 'info', name: 'Информация', sub: 'Корпоративные инструкции и документы', img: I('info') },
      { id: 'qr', name: 'Поиск по QR', sub: 'Сканирование QR-кодов для доступа к сервисам', img: I('qr') },
      { id: 'queue', name: 'Электронная очередь', sub: 'Электронная очередь на отгрузку материалов', img: I('queue') },
    ],
  },
  {
    title: 'Сотруднику',
    items: [
      { id: 'support', name: 'ПоддERGка персонала', sub: 'Поддержка персонала по всем вопросам', img: I('support') },
      { id: 'staff', name: 'Персонал', sub: 'Информация для персонала и сотрудников', img: I('staff') },
      { id: 'ergcu', name: 'ERG CU', sub: 'Обучение и развитие персонала онлайн', img: I('ergcu') },
      { id: 'medicine', name: 'Медицина', sub: 'Услуги корпоративной медицины и здоровья', img: I('medicine') },
      { id: 'transport', name: 'Транспорт', sub: 'Заказы служебного транспорта', img: I('transport') },
      { id: 'access', name: 'Access', sub: 'Доступ к предприятиям компании', img: I('access') },
      { id: 'drp', name: 'ДРП', sub: 'Добровольное решение проблем', img: I('drp') },
      { id: 'ergway', name: 'ERG Way +', sub: 'Успешная трансформация ERG', img: I('ergway') },
      { id: 'ergjl', name: 'ERG JL', sub: 'ERG Jastar Ligasy', img: I('ergjl') },
    ],
  },
  {
    title: 'Производство и безопасность',
    items: [
      { id: 'mes', name: 'MES', sub: 'Управление производственными процессами', img: I('mes') },
      { id: 'dispatch', name: 'Dispatch', sub: 'Управление производственными заданиями', img: I('dispatch') },
      { id: 'mtoro', name: 'МТОРО', sub: 'Заказ и учёт оборудования и материалов', img: I('mtoro') },
      { id: 'otipb', name: 'ОТиПБ', sub: 'Охрана труда и пром. безопасности', img: I('otipb') },
    ],
  },
  {
    title: 'Партнёрства и инициативы',
    items: [
      { id: 'salesmarket', name: 'Sales Market', sub: 'Площадка для продажи товаров и услуг', img: I('salesmarket') },
      { id: 'marketplace', name: 'Marketplace', sub: 'Корпоративный маркетплейс', img: I('marketplace') },
      { id: 'partners', name: 'ERG Partners', sub: 'Взаимодействие с партнерами компании', img: I('partners') },
      { id: 'ideas', name: 'Фабрика идей', sub: 'Платформа предложений и обсуждения', img: I('ideas') },
    ],
  },
];

// Плоский список — для поиска и для выборки по id.
export const allServices = serviceCategories.flatMap((c) => c.items);

const byId = Object.fromEntries(allServices.map((s) => [s.id, s]));

// Сетка «Сервисы» на Главной (node 23899-9739) — те же сервисы каталога,
// поэтому берём их по id, а не дублируем описания и пути к иконкам.
// wrap: подпись переносится на две строки (в макете так только у «ПоддERGка
// персонала», остальные — одной строкой с многоточием при нехватке места).
export const homeServices = [
  { ...byId.salesmarket },
  { ...byId.support, wrap: true },
  { ...byId.task },
  { ...byId.mtoro },
  { ...byId.ergcu },
  { ...byId.qr },
  { ...byId.drp },
];

// Плитка «Все сервисы» — тоже готовая картинка из макета (серая, с сеткой).
export const allServicesTile = I('all');
