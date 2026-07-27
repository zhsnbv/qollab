import { Storefront, Lightbulb, Truck } from '@phosphor-icons/react';

// Каталог сервисов — из Figma (боттом-шит «Все сервисы», node 23762-7978).
// Единый источник для сетки на Главной и для шита: id совпадает у иконок,
// которые встречаются в обоих местах (иначе у каждой свой export из Figma).
//
// salesmarket/ideas/transport — без img: соответствующие ассеты из Figma
// пришли пустыми (заливки от стороннего плагина, API их не экспортирует),
// GradientTile рисует вместо них Phosphor-иконку (см. icon ниже).
export const serviceCategories = [
  {
    title: 'Работа',
    items: [
      { id: 'task', name: 'Мои задачи', sub: 'Управление списком рабочих дел и задач', bg: '#eff3ff, #d4d7e8', img: '/img/svc/task.png' },
      { id: 'mail', name: 'Почта 2.0', sub: 'Обновлённая версия корпоративной почты', bg: '#eff7ff, #a7c3e4', img: '/img/svc/mail.png' },
      { id: 'it', name: 'IT услуги', sub: 'Цифровые услуги для сотрудников', bg: '#ffeede, #fec694', img: '/img/svc/it.png' },
      { id: 'ticket', name: 'Тикет система', sub: 'Учёт и обработка обращений', bg: '#eff7ff, #a7c3e4', img: '/img/svc/ticket.png' },
      { id: 'info', name: 'Информация', sub: 'Корпоративные инструкции и документы', bg: '#cbf7ff, #8ae0f8', img: '/img/svc/info.png' },
      { id: 'qr', name: 'Поиск по QR', sub: 'Сканирование QR-кодов для доступа к сервисам', bg: '#eff7ff, #a7c3e4', img: '/img/svc/qr.png' },
      { id: 'queue', name: 'Электронная очередь', sub: 'Электронная очередь на отгрузку материалов', bg: '#eff7ff, #a7c3e4', img: '/img/svc/queue.png' },
    ],
  },
  {
    title: 'Сотруднику',
    items: [
      { id: 'support', name: 'ПоддERGка персонала', sub: 'Поддержка персонала по всем вопросам', bg: '#eff7ff, #a7c3e4', img: '/img/svc/support.png' },
      { id: 'staff', name: 'Персонал', sub: 'Информация для персонала и сотрудников', bg: '#e3fffc, #cedddc', img: '/img/svc/staff.png' },
      { id: 'ergcu', name: 'ERG CU', sub: 'Обучение и развитие персонала онлайн', bg: '#eff7ff, #a7c3e4', img: '/img/svc/ergcu.png' },
      { id: 'medicine', name: 'Медицина', sub: 'Услуги корпоративной медицины и здоровья', bg: '#fff6f6, #ffbbba', img: '/img/svc/medicine.png' },
      { id: 'transport', name: 'Транспорт', sub: 'Заказы служебного транспорта', bg: '#faffee, #c7d9a0', icon: Truck },
      { id: 'access', name: 'Access', sub: 'Доступ к предприятиям компании', bg: '#eff7ff, #a7c3e4', img: '/img/svc/access.png' },
      { id: 'drp', name: 'ДРП', sub: 'Добровольное решение проблем', bg: '#fef0d1, #dab77a', img: '/img/svc/drp.png' },
      { id: 'ergway', name: 'ERG Way +', sub: 'Успешная трансформация ERG', bg: '#f5f5f5, #dce9fb', img: '/img/svc/ergway.png' },
      { id: 'ergjl', name: 'ERG JL', sub: 'ERG Jastar Ligasy', bg: '#eff7ff, #a7c3e4', img: '/img/svc/ergjl.png' },
    ],
  },
  {
    title: 'Производство и безопасность',
    items: [
      { id: 'mes', name: 'MES', sub: 'Управление производственными процессами', bg: '#eff7ff, #a7c3e4', img: '/img/svc/mes.png' },
      { id: 'dispatch', name: 'Dispatch', sub: 'Управление производственными заданиями', bg: '#eff7ff, #a7c3e4', img: '/img/svc/dispatch.png' },
      { id: 'mtoro', name: 'МТОРО', sub: 'Заказ и учёт оборудования и материалов', bg: '#fef0d1, #dab77a', img: '/img/svc/mtoro.png' },
      { id: 'otipb', name: 'ОТиПБ', sub: 'Охрана труда и пром. безопасности', bg: '#ffeede, #fec694', img: '/img/svc/otipb.png' },
    ],
  },
  {
    title: 'Партнёрства и инициативы',
    items: [
      { id: 'salesmarket', name: 'Sales Market', sub: 'Площадка для продажи товаров и услуг', bg: '#ffeede, #fec694', icon: Storefront },
      { id: 'marketplace', name: 'Marketplace', sub: 'Корпоративный маркетплейс', bg: '#f5fdff, #c7e6ff', img: '/img/svc/marketplace.png' },
      { id: 'partners', name: 'ERG Partners', sub: 'Взаимодействие с партнерами компании', bg: '#eff7ff, #a7c3e4', img: '/img/svc/partners.png' },
      { id: 'ideas', name: 'Фабрика идей', sub: 'Платформа предложений и обсуждения', bg: '#fef0d1, #dab77a', icon: Lightbulb },
    ],
  },
];

// Плоский список — для поиска и для быстрого поиска по id.
export const allServices = serviceCategories.flatMap((c) => c.items);

// Сетка «Сервисы» на Главной (node 23759-6118) — свой набор экспортов иконок
// (те же сервисы, но заново вырезаны под тайл 60×60, поэтому свой img).
export const homeServices = [
  { id: 'salesmarket', name: 'Sales Market', bg: '#ffeede, #fec694', icon: Storefront },
  { id: 'support', name: 'ПоддERGка персонала', bg: '#eff7ff, #a7c3e4', img: '/img/home2/support.png' },
  { id: 'task', name: 'Мои задачи', bg: '#eff3ff, #d4d7e8', img: '/img/home2/tasks.png' },
  { id: 'mtoro', name: 'МТОРО', bg: '#fef0d1, #dab77a', img: '/img/home2/mtoro.png' },
  { id: 'ergcu', name: 'ERG CU', bg: '#eff7ff, #a7c3e4', img: '/img/home2/ergcu.png' },
  { id: 'qr', name: 'Поиск по QR', bg: '#eff7ff, #a7c3e4', img: '/img/home2/qr.png' },
  { id: 'drp', name: 'ДРП', bg: '#fef0d1, #dab77a', img: '/img/home2/drp.png' },
];
