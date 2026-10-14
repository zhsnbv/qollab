import { mountWebMessageMenu } from './mountWebMessageMenu';
import { normalizePortalReactions, portalReadEntries, portalReactionGroups, togglePortalReaction, seedPortalActivity, recordPortalRead, isPrivateChat } from './chatActivity';
/* eslint-disable no-unused-vars -- Preserve upstream shell helpers for parity. */
// Source: gazizomarkhanov-dev/qollab-portal-v2 @ f8148b6. Only integration/lifecycle adapters differ.
export function initializePortal(root, bridge) {
const realDocument = globalThis.document, realWindow = globalThis.window;
const abort = new AbortController(), timers = new Set(), frames = new Set();
const setTimeout = (fn, delay) => { const id = realWindow.setTimeout(() => { timers.delete(id); fn(); }, delay); timers.add(id); return id; };
const clearTimeout = id => { timers.delete(id); realWindow.clearTimeout(id); };
const requestAnimationFrame = fn => { const id = realWindow.requestAnimationFrame(time => { frames.delete(id); fn(time); }); frames.add(id); return id; };
const document = new Proxy(realDocument, { get(target, key) {
  if (key === 'body' || key === 'documentElement') return root;
  if (key === 'querySelector' || key === 'querySelectorAll') return root[key].bind(root);
  if (key === 'addEventListener') return (type, fn, options = {}) => target.addEventListener(type, fn, { ...(typeof options === 'boolean' ? { capture: options } : options), signal: abort.signal });
  const value = Reflect.get(target, key, target); return typeof value === 'function' ? value.bind(target) : value;
}});
const window = new Proxy(realWindow, { get(target, key) {
  if (key === 'setTimeout') return setTimeout;
  if (key === 'clearTimeout') return clearTimeout;
  if (key === 'addEventListener') return (type, fn, options = {}) => target.addEventListener(type, fn, { ...(typeof options === 'boolean' ? { capture: options } : options), signal: abort.signal });
  const value = Reflect.get(target, key, target); return typeof value === 'function' ? value.bind(target) : value;
}});
const asset = (name) => `/portal-v2/assets/${name}`;

const services = [
  ['calendar', 'service-calendar-design.png', 'Мой календарь обучения', false],
  ['safety', 'service-safety-design.png', 'ОТиПБ', false],
  ['queue', 'service-queue-design.png', 'Эл. очередь', false],
  ['sales', 'service-sales-design.png', 'Sales Market', false],
  ['partners', 'service-partners-design.png', 'ERG Partners', false],
  ['qdata', 'service-qdata-design.png', 'qData', false],
  ['qdocs', 'service-qdocs-design.png', 'qDocs', false],
  ['support', 'service-support-design.png', 'ПоддERGка персонала', false],
  ['task', 'service-task-design.png', 'Мои задачи', true],
  ['ergcu', 'service-ergcu-design.png', 'ERG CU', false],
  ['medicine', 'service-medicine-design.png', 'Медицина', true],
  ['marketplace', 'service-marketplace-design.png', 'Marketplace', false],
  ['transport', 'service-transport-design.png', 'Транспорт', true],
  ['it', 'service-it-design.png', 'IT услуги', true],
  ['personnel', 'service-personnel-design.png', 'Персонал', true],
  ['info', 'service-info-design.png', 'Информация', true],
  ['access', 'service-access-design.png', 'ERG Access', true]
];

const servicesDrawerGroups = [
  ['Корпоративные сервисы', [
    ['tasks', 'Мои задачи', 'tasks.png', 'lavender'],
    ['personnel', 'Персонал', 'personnel.png', 'teal'],
    ['hr', 'HR Сервисы', 'hr.png', 'sand'],
    ['ergcu', 'ERG CU', 'ergcu.png', 'blue'],
    ['marketplace', 'Marketplace', 'marketplace.png', 'sky'],
    ['medicine', 'Медицина', 'medicine.png', 'pink'],
    ['it', 'IT услуги', 'it.png', 'orange'],
    ['transport', 'Транспорт', 'transport.png', 'green'],
    ['info', 'Информация', 'info.png', 'cyan'],
    ['surveys', 'Опросы', 'surveys.png', 'green'],
    ['ergway', 'ERG Way', 'ergway.png', 'grayblue'],
    ['ergjl', 'ERG JL', 'ergjl.png', 'blue'],
    ['ideas', 'Фабрика идей', 'ideas.png', 'sand'],
    ['drp', 'ДРП', 'drp.png', 'sand'],
    ['questionnaire', 'Анкета СБ', 'questionnaire.png', 'blue'],
    ['calendar', 'Календарь обучения', 'calendar.png', 'sand'],
    ['otipb', 'ОТиПБ', 'otipb.png', 'orange'],
    ['leadership', 'Руководство', 'leadership.png', 'orange'],
    ['org', 'Орг структура', 'org.png', 'orange'],
    ['admin', 'Админ панель', 'admin.png', 'blue'],
    ['repairs', 'Остановочные ремонты', 'repairs.png', 'orange'],
    ['surveys360', 'Опросы 360', 'surveys360.png', 'orange'],
    ['sales', 'Sales Market', 'sales.png', 'orange'],
    ['compliance', 'Комплаенс', 'compliance.png', 'blue'],
    ['bulletin', 'Электронный вестник', 'bulletin.png', 'sand'],
    ['qdata', 'qData', 'qdata.png', 'sand'],
    ['qdocs', 'qDocs', 'qdocs.png', 'blue'],
    ['support', 'Поддержка персонала', 'support.png', 'blue'],
    ['career', 'Карьер', 'career.png', 'sand'],
    ['situation', 'Ситуационный центр', 'situation.png', 'grayblue']
  ]],
  ['Этика и комплаенс', [
    ['compliance-process', 'Процессы комплаенс', 'compliance-process.png', 'sand'],
    ['registry', 'Реестр справочников', 'registry.png', 'sand'],
    ['help', 'Помощь', 'help.png', 'cyan']
  ]],
  ['Оперативное планирование', [
    ['repairs', 'Остановочные ремонты', 'repairs.png', 'orange'],
    ['brigades', 'Формирование бригад', 'brigades.png', 'blue'],
    ['resources', 'Планирование ресурсов', 'resources.png', 'green'],
    ['orders-schedule', 'Графикование заказов', 'orders-schedule.png', 'pink'],
    ['orders-assign', 'Назначение заказов', 'orders-assign.png', 'sand'],
    ['journal', 'Электронный журнал', 'journal.png', 'grayblue']
  ]]
];

const taskSubservices = [
  ['esed', 'ЕСЭД', 'esed.svg'],
  ['asutp', 'АСУТП КИП', 'asutp.svg'],
  ['pass-photo', 'Фото на пропуск', 'pass-photo.svg'],
  ['it-requests', 'IT заявки', 'it-requests.svg'],
  ['mes-signing', 'Подписание MES', 'mes.svg'],
  ['request-unlock', 'Деблокирование заявки', 'unlock.svg'],
  ['sap-production', 'SAP Производство', 'sap.svg'],
  ['asutimt-execution', 'Исполнение АСУТиМТ', 'execution.svg'],
  ['manifest', 'Манифест', 'manifest.svg'],
  ['food-contractor', 'Кабинет Исполнителя ОС по питанию', 'food.svg'],
  ['job-erg', 'Job ERG', 'job.svg']
];

const personnelSubservices = [
  ['compliance', 'Compliance', 'compliance.svg'],
  ['corporate-discounts', 'Корпоративные скидки', 'discounts.svg'],
  ['food', 'Питание', 'food.svg'],
  ['adaptation', 'Адаптация персонала', 'adaptation.svg'],
  ['feedback', 'Обратная связь', 'feedback.svg'],
  ['sport', 'Спорт', 'sport.svg'],
  ['vacation-days', 'Отпускные дни', 'vacation-days.svg'],
  ['vacation-request', 'Заявка на отпуск', 'vacation-request.svg'],
  ['business-trip', 'Командировка', 'business-trip.svg'],
  ['timesheet', 'Табельный лист', 'timesheet.svg'],
  ['competency-assessment', 'Оценка компетенций', 'competency.svg'],
  ['payslip', 'Расчетный листок 2.0', 'payslip.svg']
];

const nestedServicesCatalog = {
  tasks: { title: 'Мои задачи', directory: 'task-services', items: taskSubservices },
  personnel: { title: 'Персонал', directory: 'personnel-services', items: personnelSubservices }
};

const servicesMenuExtras = [
  ['queue', 'Электронная очередь', 'service-queue-design.png', 'blue', 'root'],
  ['access', 'Access', 'service-access-design.png', 'blue', 'root'],
  ['mes', 'MES', 'mes.png', 'blue'],
  ['dispatch', 'Dispatch', 'dispatch.png', 'blue'],
  ['mtoro', 'МТОРО', 'mtoro.png', 'sand']
];

const servicesMenuCatalog = new Map();
servicesMenuExtras.forEach((service) => servicesMenuCatalog.set(service[0], service));
servicesDrawerGroups.flatMap(([, items]) => items).forEach((service) => {
  if (!servicesMenuCatalog.has(service[0])) servicesMenuCatalog.set(service[0], service);
});

const servicesMenuCatalogOrder = [
  'queue', 'personnel', 'ergcu', 'medicine', 'transport', 'access', 'drp', 'ergway',
  'ergjl', 'mes', 'dispatch', 'mtoro', 'otipb', 'sales', 'tasks', 'hr', 'marketplace',
  'it', 'info', 'surveys', 'ideas', 'questionnaire', 'calendar', 'leadership', 'org',
  'admin', 'repairs', 'surveys360', 'compliance', 'bulletin', 'qdata', 'qdocs',
  'support', 'career', 'situation', 'compliance-process', 'registry', 'help', 'brigades',
  'resources', 'orders-schedule', 'orders-assign', 'journal'
].filter((key, index, keys) => servicesMenuCatalog.has(key) && keys.indexOf(key) === index);

const servicesMenuStorageKey = 'qollab-v2-menu-services';
const defaultServicesMenu = ['it', 'tasks', 'calendar', 'mtoro'];

function loadServicesMenu() {
  try {
    const stored = JSON.parse(localStorage.getItem(servicesMenuStorageKey));
    if (Array.isArray(stored)) {
      const unique = stored.filter((key, index) => servicesMenuCatalog.has(key) && stored.indexOf(key) === index);
      if (unique.length || stored.length === 0) return unique;
    }
  } catch (error) {
    // Keep the design defaults if saved settings are unavailable.
  }
  return [...defaultServicesMenu];
}

let servicesMenuKeys = loadServicesMenu();

const pinnedStorageKey = 'qollab-pinned-services';
const serviceKeys = new Set(services.map(([key]) => key));

function loadPinnedServices() {
  try {
    const stored = JSON.parse(localStorage.getItem(pinnedStorageKey));
    if (Array.isArray(stored)) return new Set(stored.filter((key) => serviceKeys.has(key)));
  } catch (error) {
    // Use the design defaults when storage is unavailable or damaged.
  }
  return new Set(['it', 'task']);
}

let pinnedServices = loadPinnedServices();

function serviceRowMarkup(service, favorite = false) {
  const [key, icon, title, expandable] = service;
  const pinned = pinnedServices.has(key);
  const pinLabel = favorite || pinned ? `Открепить ${title}` : `Закрепить ${title}`;
  const pinIcon = favorite || pinned ? 'pin-filled.svg' : 'pin-regular.svg';
  return `
    <div class="service-row" data-service-key="${key}">
      <span class="service-logo service-${key}"><img src="${asset(icon)}" alt=""></span>
      <span class="service-title">${title}</span>
      <span class="row-tools">
        ${expandable ? `<img class="menu-chevron" src="${asset('chevron_down_filled.svg')}" alt="Развернуть">` : ''}
        <button class="pin-button" type="button" aria-label="${pinLabel}" aria-pressed="${pinned}"><img src="${asset(pinIcon)}" alt=""></button>
      </span>
    </div>`;
}

function renderServiceLists() {
  document.querySelector('#serviceList').innerHTML = services.map((service) => serviceRowMarkup(service)).join('');
  document.querySelector('#favoritesList').innerHTML = services
    .filter(([key]) => pinnedServices.has(key))
    .map((service) => serviceRowMarkup(service, true))
    .join('');
}

function togglePinnedService(key) {
  if (!serviceKeys.has(key)) return;
  if (pinnedServices.has(key)) pinnedServices.delete(key);
  else pinnedServices.add(key);
  try {
    localStorage.setItem(pinnedStorageKey, JSON.stringify([...pinnedServices]));
  } catch (error) {
    // The interaction still works for the current session without storage.
  }
  renderServiceLists();
}

document.querySelector('.sidebar').addEventListener('click', (event) => {
  const pinButton = event.target.closest('.pin-button');
  if (!pinButton) return;
  event.preventDefault();
  event.stopPropagation();
  togglePinnedService(pinButton.closest('[data-service-key]').dataset.serviceKey);
});

renderServiceLists();

const stories = [
  ['story-all-a.png', 'Все каналы'],
  ['story-erg.png', 'ERG News'],
  ['story-blog.png', 'Блог ERG'],
  ['story-sport.png', 'ERG Sport'],
  ['story-blog.png', 'BTS News'],
  ['story-cu.png', 'ERG CU'],
  ['story-erg.png', 'Блог ERG']
];

document.querySelector('#storyTrack').innerHTML = stories.map(([image, title]) => `
  <a class="story" href="#">
    <span class="story-visual"><img src="${asset(image)}" alt=""></span>
    <strong>${title}</strong>
  </a>`).join('');

const posts = [
  { date: '8 окт, 10:13', title: 'Что скрывается за словами «Цифровой цех»?', text: 'Разбираемся как цифровизация меняет производственные площадки', image: 'post-a.png', likes: 155, comments: 12 },
  { date: '8 окт, 10:13', title: 'Первый после майских событий массовый взрыв произведен на шахте «Болашақ»', text: 'Работы возобновлены после плановой паузы – рассказываем о мерах безопасности и объемах.', likes: 155, comments: 12 },
  { date: '5 сент, 11:05', title: 'И.О. Директора филиала АО “ЕЭК” разреза “Восточный” Калижан Исенов провел обход в прачечном помещен...', text: 'Работы возобновлены после плановой паузы – рассказываем о мерах безопасности и объемах.', image: 'post-b.png', audit: true, likes: 35, comments: 4 },
  { date: '8 окт, 10:13', title: 'Что скрывается за словами «Цифровой цех»?', text: 'Разбираемся как цифровизация меняет производственные площадки', image: 'post-a.png', likes: 155, comments: 12 },
  { date: '8 окт, 10:13', title: 'Первый после майских событий массовый взрыв произведен на шахте «Болашақ»', text: 'Работы возобновлены после плановой паузы – рассказываем о мерах безопасности и объемах.', likes: 155, comments: 12 },
  { date: '5 сент, 11:05', title: 'И.О. Директора филиала АО “ЕЭК” разреза “Восточный” Калижан Исенов провел обход в прачечном помещен...', text: 'Работы возобновлены после плановой паузы – рассказываем о мерах безопасности и объемах.', image: 'post-b.png', audit: true, likes: 35, comments: 4 },
  { date: '8 окт, 10:13', title: 'Что скрывается за словами «Цифровой цех»?', text: 'Разбираемся как цифровизация меняет производственные площадки', image: 'post-a.png', likes: 155, comments: 12 },
  { date: '8 окт, 10:13', title: 'Первый после майских событий массовый взрыв произведен на шахте «Болашақ»', text: 'Работы возобновлены после плановой паузы – рассказываем о мерах безопасности и объемах.', likes: 155, comments: 12 },
  { date: '5 сент, 11:05', title: 'И.О. Директора филиала АО “ЕЭК” разреза “Восточный” Калижан Исенов провел обход в прачечном помещен...', text: 'Работы возобновлены после плановой паузы – рассказываем о мерах безопасности и объемах.', image: 'post-b.png', audit: true, likes: 35, comments: 4 }
];

const pinnedPublicationsStorageKey = 'qollab-v2-pinned-publications';

function loadPinnedPublications() {
  try {
    const stored = JSON.parse(localStorage.getItem(pinnedPublicationsStorageKey));
    if (Array.isArray(stored)) {
      return new Set(stored.filter((index) => Number.isInteger(index) && posts[index]));
    }
  } catch (error) {
    // Keep the feed usable if browser storage is unavailable.
  }
  return new Set();
}

let pinnedPublications = loadPinnedPublications();
let openPublicationMenu = null;

const auditMarkup = () => `
  <div class="audit-row">
    <div class="audit-person"><img src="${asset('author.png')}" alt=""><div><span>Инициатор</span><b>Иванов Иван</b></div></div>
    <div class="audit-person"><img src="${asset('author.png')}" alt=""><div><span>Аудитор</span><b>Иванов Иван</b></div></div>
  </div>
  <div class="audit-details"><img src="${asset('location.svg')}" alt=""><span>АО “ЕЭК”</span><span>•</span><span>Оценка:</span><span class="stars">${Array.from({length: 4}, () => `<img src="${asset('star.svg')}" alt="">`).join('')}<img src="${asset('star-empty.svg')}" alt=""></span></div>`;

const postList = document.querySelector('#postList');

function publicationMenuMarkup(index, pinned) {
  return `
    <div class="post-more-wrap">
      <button class="post-more-button" type="button" aria-label="Действия с публикацией" aria-expanded="${openPublicationMenu === index}" aria-controls="publication-menu-${index}">
        <span class="post-more-glyph" aria-hidden="true"></span>
      </button>
      <div class="post-more-menu" id="publication-menu-${index}" role="menu" ${openPublicationMenu === index ? '' : 'hidden'}>
        <button class="post-menu-item" type="button" role="menuitem" data-post-action="toggle-pin">
          <span class="post-menu-icon ${pinned ? 'pin-off' : ''}"><img src="${asset('post-pin-regular.svg')}" alt=""></span>
          <span>${pinned ? 'Открепить в ленте' : 'Закрепить в ленте'}</span>
        </button>
        <button class="post-menu-item" type="button" role="menuitem" data-post-action="pin-channel">
          <span class="post-menu-icon"><img src="${asset('post-pin-regular.svg')}" alt=""></span>
          <span>Закрепить в канале</span>
        </button>
        <button class="post-menu-item" type="button" role="menuitem" data-post-action="edit">
          <span class="post-menu-icon"><img src="${asset('post-edit-regular.svg')}" alt=""></span>
          <span>Редактировать</span>
        </button>
        <span class="post-menu-divider" aria-hidden="true"></span>
        <button class="post-menu-item danger" type="button" role="menuitem" data-post-action="delete">
          <span class="post-menu-icon"><img src="${asset('post-delete-regular.svg')}" alt=""></span>
          <span>Удалить</span>
        </button>
      </div>
    </div>`;
}

function renderPosts() { /* Publication content is owned by React. */ }

function savePinnedPublications() {
  try {
    localStorage.setItem(pinnedPublicationsStorageKey, JSON.stringify([...pinnedPublications]));
  } catch (error) {
    // The pinned state still works for the current session.
  }
}

renderPosts();

function setOpenPublicationMenu(publicationId, focusButton = false) {
  postList.querySelectorAll('.post-card.menu-open').forEach((card) => card.classList.remove('menu-open'));
  postList.querySelectorAll('.post-more-button[aria-expanded="true"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
  postList.querySelectorAll('.post-more-menu:not([hidden])').forEach((menu) => { menu.hidden = true; });
  openPublicationMenu = publicationId;

  if (publicationId === null) return;
  const card = postList.querySelector(`[data-publication-id="${publicationId}"]`);
  const button = card?.querySelector('.post-more-button');
  const menu = card?.querySelector('.post-more-menu');
  if (!card || !button || !menu) return;
  card.classList.add('menu-open');
  button.setAttribute('aria-expanded', 'true');
  menu.hidden = false;
  if (focusButton) button.focus({ preventScroll: true });
}

const useful = [
  ['widgets-figma/link-support.svg', 'Заявка в Service Desk', 'Обратная связь'],
  ['widgets-figma/link-hotline.svg', 'Горячая линия ERG', 'Сообщить о проблеме, задать вопрос'],
  ['widgets-figma/link-drp.svg', 'ДРП в 1 клик!', 'Зарегистрируйте проблему онлайн'],
  ['widgets-figma/link-rules.svg', 'Жизненно важные правила', 'Обязательно к ознакомлению'],
  ['widgets-figma/link-trip.svg', 'Заявка на командировку', 'Подайте заявку на командировку']
];

document.querySelector('#usefulList').innerHTML = useful.map(([icon, title, caption]) => `
  <a class="useful-item" href="#"><img src="${asset(icon)}" alt=""><div><b>${title}</b><span>${caption}</span></div><img src="${asset('widgets-figma/task-arrow.svg')}" alt=""></a>`).join('');

const channels = Array.from({ length: 8 }, (_, index) => index % 2 === 0 ? {
  title: 'ERG News',
  count: '1500 публикаций',
  cover: ['channel-erg-cover.png'],
  avatar: 'channel-erg-avatar.png'
} : {
  title: 'BTS News',
  count: '1500 публикаций',
  cover: ['channel-bts-cover.png', 'channel-bts-overlay.png'],
  avatar: 'channel-bts-avatar.png'
});

document.querySelector('#channelsGrid').innerHTML = channels.map((channel) => `
  <article class="channel-card" tabindex="0">
    <div class="channel-cover">${channel.cover.map((image) => `<img src="${asset(image)}" alt="">`).join('')}</div>
    <div class="channel-info">
      <span class="channel-avatar"><img src="${asset(channel.avatar)}" alt=""></span>
      <div class="channel-copy"><strong>${channel.title}</strong><span>${channel.count}</span></div>
    </div>
  </article>`).join('');

const events = Array.from({ length: 6 }, (_, index) => index % 2 === 0 ? {
  type: 'running',
  image: 'event-running.png',
  avatar: 'event-running-avatar.png',
  date: 'Среда, 2 янв 19:30 – 30 янв 21:00',
  title: 'Беговые тренировки в манеже в декабре',
  organizers: 4
} : {
  type: 'standup',
  image: 'event-standup.png',
  avatar: 'event-standup-avatar.png',
  date: 'Четверг, 26 янв 15:30 – 18:00',
  title: 'Новогодний Stand-Up ERG',
  organizers: 2
});

function renderEventAvatars(event) {
  if (event.organizers === 2) {
    return `<span class="event-avatar"><img src="${asset(event.avatar)}" alt=""></span><span class="event-avatar green"><img src="${asset('user-avatar.svg')}" alt=""></span>`;
  }
  return `<span class="event-avatar"><img src="${asset(event.avatar)}" alt=""></span><span class="event-avatar">A</span><span class="event-avatar green"><img src="${asset('user-avatar.svg')}" alt=""></span><span class="event-avatar pale">A</span>`;
}

document.querySelector('#eventsGrid').innerHTML = events.map((event) => `
  <article class="event-card ${event.type}" tabindex="0">
    <div class="event-cover"><img src="${asset(event.image)}" alt=""></div>
    <div class="event-content">
      <span class="event-date">${event.date}</span>
      <strong class="event-title">${event.title}</strong>
      <div class="event-organizers">
        <span class="event-avatars">${renderEventAvatars(event)}</span>
        <span class="event-organizer-count">${event.organizers} организатора</span>
      </div>
    </div>
  </article>`).join('');

function switchFeedView(tabName) {
  const viewName = ['publications', 'channels', 'events'].includes(tabName) ? tabName : 'publications';
  document.querySelectorAll('[data-tab-content]').forEach((section) => {
    section.hidden = section.dataset.tabContent !== viewName;
  });
  document.querySelector('[data-tab="publications"] img').src = asset(viewName === 'publications' ? 'tab-news.svg' : 'tab-news-inactive.svg');
  document.querySelector('[data-tab="channels"] img').src = asset(viewName === 'channels' ? 'tab-channels-active.svg' : 'tab-channels.svg');
  document.querySelector('[data-tab="events"] img').src = asset(viewName === 'events' ? 'tab-events-active.svg' : 'tab-events.svg');
}

document.querySelectorAll('.feed-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.feed-tab').forEach((item) => {
      item.classList.toggle('active', item === tab);
      item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
    });
    bridge.onPage?.(tab.dataset.tab === 'publications' ? 'feed' : 'portal');
    root.classList.remove('pw-channel-mode');
    switchFeedView(tab.dataset.tab);
  });
});

const storyTrack = document.querySelector('#storyTrack');
document.querySelector('.circle-arrow.prev').addEventListener('click', () => storyTrack.scrollBy({ left: -260, behavior: 'smooth' }));
document.querySelector('.circle-arrow.next').addEventListener('click', () => storyTrack.scrollBy({ left: 260, behavior: 'smooth' }));

const burgerButton = document.querySelector('.burger-button');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const portalSidebar = document.querySelector('#portalSidebar');

function setSidebar(open) {
  document.body.classList.toggle('sidebar-open', open);
  burgerButton.setAttribute('aria-expanded', String(open));
  burgerButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  sidebarOverlay.tabIndex = open ? 0 : -1;
  portalSidebar.setAttribute('aria-hidden', window.innerWidth < 1200 && !open ? 'true' : 'false');
}

burgerButton.addEventListener('click', () => setSidebar(!document.body.classList.contains('sidebar-open')));
sidebarOverlay.addEventListener('click', () => setSidebar(false));
portalSidebar.addEventListener('click', (event) => {
  if (window.innerWidth < 1200 && event.target.closest('a')) setSidebar(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) setSidebar(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1200) setSidebar(false);
  else portalSidebar.setAttribute('aria-hidden', document.body.classList.contains('sidebar-open') ? 'false' : 'true');
});
setSidebar(false);

const portalSettingsTrigger = document.querySelector('#portalSettingsTrigger');
const portalSettingsPopover = document.querySelector('#portalSettingsPopover');
const portalThemeOptions = document.querySelectorAll('[data-theme-choice]');
const portalLanguageOptions = document.querySelectorAll('[data-language-choice]');
const portalSettingsThemeKey = 'qollab-v2-interface-theme';
const portalSettingsLanguageKey = 'qollab-v2-interface-language';

function selectPortalSetting(options, value, dataKey) {
  options.forEach((option) => {
    const active = option.dataset[dataKey] === value;
    option.classList.toggle('active', active);
    option.setAttribute('aria-pressed', String(active));
  });
}

function applyPortalTheme(theme) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = resolvedTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#1f1e1b' : '#ffffff');
}

function setPortalSettings(open) {
  if (open) {
    if (document.body.classList.contains('services-open')) setServicesDrawer(false);
    if (document.body.classList.contains('widgets-open')) setWidgetsDrawer(false);
  }
  document.body.classList.toggle('portal-settings-open', open);
  portalSettingsTrigger.setAttribute('aria-expanded', String(open));
  portalSettingsPopover.setAttribute('aria-hidden', String(!open));
}

function restorePortalSettings() {
  try {
    const theme = localStorage.getItem(portalSettingsThemeKey);
    const language = localStorage.getItem(portalSettingsLanguageKey);
    const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
    selectPortalSetting(portalThemeOptions, resolvedTheme, 'themeChoice');
    applyPortalTheme(resolvedTheme);
    if (language === 'kk' || language === 'ru' || language === 'en') selectPortalSetting(portalLanguageOptions, language, 'languageChoice');
  } catch (_) {
    // The default Figma states remain available when browser storage is disabled.
    applyPortalTheme('light');
  }
}

portalSettingsTrigger.addEventListener('click', () => {
  setPortalSettings(!document.body.classList.contains('portal-settings-open'));
});

portalThemeOptions.forEach((option) => {
  option.addEventListener('click', () => {
    selectPortalSetting(portalThemeOptions, option.dataset.themeChoice, 'themeChoice');
    applyPortalTheme(option.dataset.themeChoice);
    try { localStorage.setItem(portalSettingsThemeKey, option.dataset.themeChoice); } catch (_) {}
  });
});

portalLanguageOptions.forEach((option) => {
  option.addEventListener('click', () => {
    selectPortalSetting(portalLanguageOptions, option.dataset.languageChoice, 'languageChoice');
    try { localStorage.setItem(portalSettingsLanguageKey, option.dataset.languageChoice); } catch (_) {}
  });
});

document.addEventListener('click', (event) => {
  if (!document.body.classList.contains('portal-settings-open')) return;
  if (portalSettingsPopover.contains(event.target) || portalSettingsTrigger.contains(event.target)) return;
  setPortalSettings(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('portal-settings-open')) {
    setPortalSettings(false);
    portalSettingsTrigger.focus();
  }
});

restorePortalSettings();

const servicesTrigger = document.querySelector('#servicesTrigger');
const servicesDrawer = document.querySelector('#servicesDrawer');
const servicesOverlay = document.querySelector('#servicesOverlay');
const servicesSearch = document.querySelector('#servicesSearch');
const servicesDrawerContent = document.querySelector('#servicesDrawerContent');
const servicesViewButtons = document.querySelectorAll('[data-services-view]');
const servicesSettingsToggle = document.querySelector('#servicesSettingsToggle');
const servicesMenuRail = document.querySelector('#servicesMenuRail');
const servicesHomeIcon = document.querySelector('.primary-nav [data-page="home"] img');
const servicesNavIcon = servicesTrigger.querySelector('.rail-icon img');
const servicesDrawerTitle = document.querySelector('#servicesDrawerTitle');
const servicesSearchIcon = document.querySelector('#servicesSearchIcon');
const servicesSearchClear = document.querySelector('#servicesSearchClear');
const nestedServicesBack = document.querySelector('#nestedServicesBack');
const nestedServicesBackIcon = nestedServicesBack.querySelector('img');
const drawerCloseFallbackMs = 300;
let draggedMenuServiceKey = null;
let servicesSortGhost = null;
let activeNestedServiceKey = null;
let servicesCloseTimer = null;

function serviceImageSource(service) {
  const image = service[2];
  return asset(service[4] === 'root' ? image : `services-drawer/${image}`);
}

function serviceIconMarkup(service) {
  const [key, , , tone] = service;
  return `<span class="drawer-service-icon tone-${tone} ds-${key}"><img src="${serviceImageSource(service)}" alt=""></span>`;
}

function servicesDrawerItemMarkup(service) {
  const [key, title] = service;
  return `
    <a class="drawer-service" href="#" data-service-key="${key}" data-service-search="${title.toLocaleLowerCase('ru')}">
      <span class="drawer-service-icon-shell">${serviceIconMarkup(service)}</span>
      <span class="drawer-service-name">${title}</span>
    </a>`;
}

function nestedServiceItemMarkup([key, title, icon], directory) {
  return `
    <a class="nested-service-item" href="#" data-nested-service="${key}">
      <img src="${asset(`${directory}/${icon}`)}" alt="">
      <span>${title}</span>
    </a>`;
}

function railServiceMarkup(service) {
  const [key, title] = service;
  return `
    <a class="rail-shortcut rail-menu-service" href="#" data-menu-service="${key}" title="${title}">
      <span class="rail-service-icon rail-menu-icon-shell">${serviceIconMarkup(service)}</span>
      <b>${title}</b>
    </a>`;
}

function renderServicesMenuRail() {
  servicesMenuRail.innerHTML = servicesMenuKeys
    .map((key) => servicesMenuCatalog.get(key))
    .filter(Boolean)
    .map(railServiceMarkup)
    .join('');
  servicesMenuRail.hidden = servicesMenuKeys.length === 0;
}

function persistServicesMenu() {
  try {
    localStorage.setItem(servicesMenuStorageKey, JSON.stringify(servicesMenuKeys));
  } catch (error) {
    // The menu still updates for the current session when storage is unavailable.
  }
  renderServicesMenuRail();
}

function settingsServiceRowMarkup(service, selected) {
  const [key, title] = service;
  return `
    <div class="services-settings-row${selected ? ' selected' : ''}" data-menu-service="${key}" ${selected ? 'draggable="true"' : ''}>
      ${selected ? `<button class="services-reorder" type="button" aria-label="Изменить порядок: ${title}"><img src="${asset('services-drawer/reorder.svg')}" alt=""></button>` : ''}
      <span class="services-settings-icon">${serviceIconMarkup(service)}</span>
      <span class="services-settings-name">${title}</span>
      <button class="services-menu-action" type="button" data-services-action="${selected ? 'remove' : 'add'}" aria-label="${selected ? 'Убрать из меню' : 'Добавить в меню'}: ${title}">
        <img src="${asset(`services-drawer/${selected ? 'remove.svg' : 'add.svg'}`)}" alt="">
      </button>
    </div>`;
}

function renderServicesSettings() {
  const selected = servicesMenuKeys.map((key) => servicesMenuCatalog.get(key)).filter(Boolean);
  const selectedKeys = new Set(servicesMenuKeys);
  const available = servicesMenuCatalogOrder
    .filter((key) => !selectedKeys.has(key))
    .map((key) => servicesMenuCatalog.get(key))
    .filter(Boolean);
  servicesDrawerContent.innerHTML = `
    <section class="services-settings-section selected-services">
      <h3>Сервисы в меню</h3>
      <div class="services-settings-list" id="servicesMenuSelectedList">
        ${selected.length ? selected.map((service) => settingsServiceRowMarkup(service, true)).join('') : '<p class="services-settings-empty">Добавьте сервисы из списка ниже</p>'}
      </div>
    </section>
    <section class="services-settings-section all-services-settings">
      <h3>Все сервисы</h3>
      <div class="services-settings-list">
        ${available.length ? available.map((service) => settingsServiceRowMarkup(service, false)).join('') : '<p class="services-settings-empty">Все сервисы уже добавлены</p>'}
      </div>
    </section>`;
}

function servicesEmptyMarkup() {
  return `
    <div class="services-empty-state" role="status">
      <div class="services-empty-visual">
        <span class="services-empty-icon"><img src="${asset('header-search.svg')}" alt=""></span>
      </div>
      <p>Сервисы не найдены</p>
    </div>`;
}

function syncServicesSearchState() {
  servicesSearch.closest('.services-search').classList.toggle('has-value', Boolean(servicesSearch.value));
}

function renderServicesDrawer(query = servicesSearch.value) {
  if (servicesDrawer.classList.contains('nested-services-mode') && activeNestedServiceKey) {
    const nestedService = nestedServicesCatalog[activeNestedServiceKey];
    const value = query.trim().toLocaleLowerCase('ru');
    const visibleItems = nestedService.items.filter(([, title]) => !value || title.toLocaleLowerCase('ru').includes(value));
    servicesDrawerContent.innerHTML = visibleItems.length
      ? `<nav class="nested-services-list" aria-label="Подсервисы раздела ${nestedService.title}">${visibleItems.map((item) => nestedServiceItemMarkup(item, nestedService.directory)).join('')}</nav>`
      : servicesEmptyMarkup();
    return;
  }
  if (servicesDrawer.classList.contains('settings-mode')) {
    renderServicesSettings();
    return;
  }
  const value = query.trim().toLocaleLowerCase('ru');
  servicesDrawerContent.innerHTML = servicesDrawerGroups.map(([title, items]) => {
    const visibleItems = items.filter((item) => !value || item[1].toLocaleLowerCase('ru').includes(value));
    if (!visibleItems.length) return '';
    return `
      <section class="services-group">
        <h3>${title}</h3>
        <div class="drawer-services-grid">${visibleItems.map(servicesDrawerItemMarkup).join('')}</div>
      </section>`;
  }).join('') || servicesEmptyMarkup();
}

function setNestedServicesMode(key = null) {
  const nestedService = key ? nestedServicesCatalog[key] : null;
  activeNestedServiceKey = nestedService ? key : null;
  servicesDrawer.classList.toggle('nested-services-mode', Boolean(nestedService));
  servicesDrawer.dataset.nestedService = activeNestedServiceKey || '';
  if (nestedService && servicesDrawer.classList.contains('settings-mode')) {
    servicesDrawer.classList.remove('settings-mode');
    servicesSettingsToggle.classList.remove('active');
    servicesSettingsToggle.setAttribute('aria-pressed', 'false');
  }
  servicesDrawerTitle.textContent = nestedService ? nestedService.title : 'Все сервисы';
  servicesDrawer.setAttribute('aria-label', nestedService ? nestedService.title : 'Все сервисы');
  servicesSearch.setAttribute('aria-label', nestedService ? `Поиск по разделу ${nestedService.title}` : 'Поиск по сервисам');
  servicesSearchIcon.src = asset(nestedService ? `${nestedService.directory}/search.svg` : 'search.svg');
  nestedServicesBackIcon.src = asset(nestedService ? `${nestedService.directory}/back.svg` : 'task-services/back.svg');
  servicesSearch.value = '';
  syncServicesSearchState();
  renderServicesDrawer('');
  window.setTimeout(() => servicesSearch.focus(), 0);
}

function setServicesSettingsMode(enabled) {
  servicesDrawer.classList.toggle('settings-mode', enabled);
  servicesSettingsToggle.classList.toggle('active', enabled);
  servicesSettingsToggle.setAttribute('aria-pressed', String(enabled));
  renderServicesDrawer();
  if (!enabled) window.setTimeout(() => servicesSearch.focus(), 0);
}

function setServicesDrawer(open) {
  if (open && document.body.classList.contains('widgets-open')) setWidgetsDrawer(false);
  const wasOpen = document.body.classList.contains('services-open');
  if (open) {
    window.clearTimeout(servicesCloseTimer);
    servicesCloseTimer = null;
    document.body.classList.remove('services-closing');
  } else if (wasOpen) {
    document.body.classList.add('services-closing');
    window.clearTimeout(servicesCloseTimer);
    servicesCloseTimer = window.setTimeout(() => {
      document.body.classList.remove('services-closing');
      servicesCloseTimer = null;
    }, drawerCloseFallbackMs);
  }
  document.body.classList.toggle('services-open', open);
  servicesTrigger.setAttribute('aria-expanded', String(open));
  servicesDrawer.setAttribute('aria-hidden', String(!open));
  servicesOverlay.tabIndex = open ? 0 : -1;
  servicesNavIcon.src = asset(open ? 'services-drawer/grid.svg' : 'v2-services.svg');
  servicesHomeIcon.src = asset(open ? 'home-inactive.svg' : (document.querySelector('.primary-nav [data-page="home"]').classList.contains('active') ? 'home.svg' : 'home-inactive.svg'));
  if (open) {
    if (window.innerWidth < 1200) setSidebar(false);
    if (!servicesDrawer.classList.contains('settings-mode')) window.setTimeout(() => servicesSearch.focus(), 220);
  } else if (servicesDrawer.classList.contains('settings-mode')) {
    setServicesSettingsMode(false);
  }
}

servicesDrawer.addEventListener('transitionend', (event) => {
  if (event.target !== servicesDrawer || event.propertyName !== 'transform' || !document.body.classList.contains('services-closing')) return;
  window.clearTimeout(servicesCloseTimer);
  servicesCloseTimer = null;
  document.body.classList.remove('services-closing');
});

servicesTrigger.addEventListener('click', (event) => {
  event.preventDefault();
  const opening = !document.body.classList.contains('services-open');
  if (opening) setNestedServicesMode();
  setServicesDrawer(opening);
});
servicesOverlay.addEventListener('click', () => setServicesDrawer(false));
servicesSearch.addEventListener('input', () => {
  syncServicesSearchState();
  renderServicesDrawer(servicesSearch.value);
});
servicesSearchClear.addEventListener('click', () => {
  servicesSearch.value = '';
  syncServicesSearchState();
  renderServicesDrawer('');
  servicesSearch.focus();
});
nestedServicesBack.addEventListener('click', () => setNestedServicesMode());
servicesSettingsToggle.addEventListener('click', () => {
  setServicesSettingsMode(!servicesDrawer.classList.contains('settings-mode'));
});
servicesMenuRail.addEventListener('click', (event) => {
  const service = event.target.closest('[data-menu-service]');
  if (!service) return;
  event.preventDefault();
  const key = service.dataset.menuService;
  if (nestedServicesCatalog[key]) {
    setNestedServicesMode(key);
    setServicesDrawer(true);
  }
});
servicesDrawerContent.addEventListener('click', (event) => {
  const action = event.target.closest('[data-services-action]');
  if (action) {
    const row = action.closest('[data-menu-service]');
    const key = row?.dataset.menuService;
    if (!key || !servicesMenuCatalog.has(key)) return;
    if (action.dataset.servicesAction === 'add' && !servicesMenuKeys.includes(key)) servicesMenuKeys.push(key);
    if (action.dataset.servicesAction === 'remove') servicesMenuKeys = servicesMenuKeys.filter((item) => item !== key);
    persistServicesMenu();
    renderServicesSettings();
    return;
  }
  const service = event.target.closest('.drawer-service');
  if (!service) return;
  event.preventDefault();
  if (nestedServicesCatalog[service.dataset.serviceKey]) setNestedServicesMode(service.dataset.serviceKey);
});
servicesDrawerContent.addEventListener('click', (event) => {
  if (event.target.closest('[data-nested-service]')) event.preventDefault();
});
servicesDrawerContent.addEventListener('dragstart', (event) => {
  const row = event.target.closest('#servicesMenuSelectedList [data-menu-service][draggable="true"]');
  if (!row || !event.dataTransfer) return;
  draggedMenuServiceKey = row.dataset.menuService;
  row.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', draggedMenuServiceKey);
  servicesSortGhost = row.cloneNode(true);
  servicesSortGhost.classList.remove('dragging');
  servicesSortGhost.classList.add('services-sort-ghost');
  document.body.append(servicesSortGhost);
  event.dataTransfer.setDragImage(servicesSortGhost, 26, 26);
});
servicesDrawerContent.addEventListener('dragover', (event) => {
  const list = event.target.closest('#servicesMenuSelectedList');
  if (!list || !draggedMenuServiceKey) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const dragged = list.querySelector(`[data-menu-service="${draggedMenuServiceKey}"]`);
  const target = event.target.closest('[data-menu-service]');
  if (!dragged || !target || target === dragged) return;
  const rect = target.getBoundingClientRect();
  list.insertBefore(dragged, event.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
});
servicesDrawerContent.addEventListener('drop', (event) => {
  if (event.target.closest('#servicesMenuSelectedList')) event.preventDefault();
});
servicesDrawerContent.addEventListener('dragend', () => {
  const list = document.querySelector('#servicesMenuSelectedList');
  if (list && draggedMenuServiceKey) {
    servicesMenuKeys = [...list.querySelectorAll('[data-menu-service]')].map((row) => row.dataset.menuService);
    persistServicesMenu();
  }
  document.querySelectorAll('.services-settings-row.dragging').forEach((row) => row.classList.remove('dragging'));
  servicesSortGhost?.remove();
  servicesSortGhost = null;
  draggedMenuServiceKey = null;
});
servicesViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const listView = button.dataset.servicesView === 'list';
    servicesDrawer.classList.toggle('list-view', listView);
    servicesViewButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('services-open')) setServicesDrawer(false);
});
renderServicesMenuRail();
renderServicesDrawer();

const widgetList = document.querySelector('#widgetList');
const widgetStorageKey = 'qollab-widget-order-figma-66-3960';
const visibleWidgetsStorageKey = 'qollab-visible-widgets-figma-28-4071';
const widgetManagerGrid = document.querySelector('#widgetsManagerGrid');
const widgetsDrawerGrid = document.querySelector('#widgetsDrawerGrid');
const widgetsTrigger = document.querySelector('#widgetsTrigger');
const widgetsTriggers = document.querySelectorAll('.widgets-trigger');
const widgetsDrawer = document.querySelector('#widgetsDrawer');
const widgetsOverlay = document.querySelector('#widgetsOverlay');
let widgetsCloseTimer = null;
const widgetCatalog = [
  ['tasks', 'Мои задачи', 'Согласование и подписание', false],
  ['meetings', 'Мои встречи', 'Встречи на сегодня', false],
  ['mail', 'Почта', 'Входящая почта', false],
  ['important', 'Важное и полезное', 'Всегда на главной', true],
  ['mission', 'Миссия и Ценности', 'Всегда на главной', true],
  ['links', 'Полезные ссылки', 'Всегда на главной', true],
  ['safety', 'Экран безопасности', 'Всегда на главной', true],
  ['magazine', 'Корпоративный журнал', 'Всегда на главной', true],
  ['policy', 'Политика безопасности', 'Всегда на главной', true]
];
const widgetIds = new Set(widgetCatalog.map(([id]) => id));
const requiredWidgetIds = new Set(widgetCatalog.filter(([, , , required]) => required).map(([id]) => id));

function loadVisibleWidgets() {
  try {
    const stored = JSON.parse(localStorage.getItem(visibleWidgetsStorageKey));
    if (Array.isArray(stored)) {
      const visible = new Set(stored.filter((id) => widgetIds.has(id)));
      requiredWidgetIds.forEach((id) => visible.add(id));
      return visible;
    }
  } catch (error) {
    // Fall back to the initial Figma state.
  }
  return new Set([...requiredWidgetIds, 'meetings', 'mail']);
}

let visibleWidgetIds = loadVisibleWidgets();

function widgetPreviewMarkup(id) {
  const source = widgetList.querySelector(`[data-widget-id="${id}"]`);
  if (!source) return '';
  const clone = source.cloneNode(true);
  clone.hidden = false;
  clone.removeAttribute('hidden');
  clone.removeAttribute('draggable');
  clone.removeAttribute('data-widget-id');
  clone.classList.add('widget-preview-card');
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  clone.querySelectorAll('button, a, input').forEach((node) => { node.tabIndex = -1; });
  return clone.outerHTML;
}

function renderWidgetManager() {
  const renderMarkup = (prefix) => {
    const renderGroup = (required, title) => {
      const headingId = `${prefix}-${required ? 'required' : 'custom'}-widgets-title`;
      return `
        <section class="widget-manager-group" aria-labelledby="${headingId}">
          <h3 id="${headingId}">${title}</h3>
          <div class="widget-manager-list">
            ${widgetCatalog.filter(([, , , itemRequired]) => itemRequired === required).map(([id, itemTitle, caption]) => {
              const visible = visibleWidgetIds.has(id);
              return `
                <article class="widget-manager-item${required ? ' required' : ''}" data-manager-widget-id="${id}">
                  <div class="widget-preview">${widgetPreviewMarkup(id)}</div>
                  <div class="widget-manager-info">
                    <div class="widget-manager-copy"><strong>${itemTitle}</strong><span>${caption}</span></div>
                    <button class="widget-toggle${required ? ' locked' : (visible ? '' : ' add')}" type="button" aria-pressed="${visible}"${required ? ' disabled aria-disabled="true"' : ''}>
                      ${required ? '<img src="/portal-v2/assets/widgets-figma/lock.svg" alt="">' : ''}<span>${visible ? 'Скрыть' : 'Добавить'}</span>
                    </button>
                  </div>
                </article>`;
            }).join('')}
          </div>
        </section>`;
    };
    return renderGroup(false, 'Настраиваемые виджеты') + renderGroup(true, 'Обязательные виджеты');
  };
  widgetManagerGrid.innerHTML = renderMarkup('page');
  widgetsDrawerGrid.innerHTML = renderMarkup('drawer');
}

function applyWidgetVisibility() {
  widgetList.querySelectorAll('[data-widget-id]').forEach((card) => {
    card.hidden = !visibleWidgetIds.has(card.dataset.widgetId);
  });
  renderWidgetManager();
}

function toggleWidgetVisibility(id) {
  if (!widgetIds.has(id) || requiredWidgetIds.has(id)) return;
  if (visibleWidgetIds.has(id)) visibleWidgetIds.delete(id);
  else visibleWidgetIds.add(id);
  try {
    localStorage.setItem(visibleWidgetsStorageKey, JSON.stringify([...visibleWidgetIds]));
  } catch (error) {
    // The change still applies for the current session.
  }
  applyWidgetVisibility();
}

function handleWidgetManagerClick(event) {
  const button = event.target.closest('.widget-toggle');
  if (!button) return;
  toggleWidgetVisibility(button.closest('[data-manager-widget-id]').dataset.managerWidgetId);
}

widgetManagerGrid.addEventListener('click', handleWidgetManagerClick);
widgetsDrawerGrid.addEventListener('click', handleWidgetManagerClick);

function setWidgetsDrawer(open) {
  if (open) {
    if (document.body.classList.contains('services-open')) setServicesDrawer(false);
    showPortalPage('home');
    if (window.innerWidth < 1200) setSidebar(false);
  }
  const wasOpen = document.body.classList.contains('widgets-open');
  if (open) {
    window.clearTimeout(widgetsCloseTimer);
    widgetsCloseTimer = null;
    document.body.classList.remove('widgets-closing');
  } else if (wasOpen) {
    document.body.classList.add('widgets-closing');
    window.clearTimeout(widgetsCloseTimer);
    widgetsCloseTimer = window.setTimeout(() => {
      document.body.classList.remove('widgets-closing');
      widgetsCloseTimer = null;
    }, drawerCloseFallbackMs);
  }
  document.body.classList.toggle('widgets-open', open);
  widgetsTriggers.forEach((trigger) => {
    trigger.setAttribute('aria-expanded', String(open));
    const icon = trigger.querySelector('img');
    if (icon) icon.src = asset(open ? 'widgets-drawer/widgets-filled.svg' : 'nav-widgets.svg');
  });
  widgetsDrawer.setAttribute('aria-hidden', String(!open));
  widgetsOverlay.tabIndex = open ? 0 : -1;
  servicesHomeIcon.src = asset(open ? 'home-inactive.svg' : (document.querySelector('.primary-nav [data-page="home"]').classList.contains('active') ? 'home.svg' : 'home-inactive.svg'));
}

widgetsDrawer.addEventListener('transitionend', (event) => {
  if (event.target !== widgetsDrawer || event.propertyName !== 'transform' || !document.body.classList.contains('widgets-closing')) return;
  window.clearTimeout(widgetsCloseTimer);
  widgetsCloseTimer = null;
  document.body.classList.remove('widgets-closing');
});

widgetsTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    setWidgetsDrawer(!document.body.classList.contains('widgets-open'));
  });
});
widgetsOverlay.addEventListener('click', () => setWidgetsDrawer(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('widgets-open')) setWidgetsDrawer(false);
});

const chatContacts = [
  {
    id: 'notifications', name: 'Уведомления', avatar: 'chat-figma-bell.svg', kind: 'notifications', last: 'Новый вход в qollab: Устройство: iPhone', time: '09:12',
    messages: [
      { author: 'Qollab', text: 'Новый вход в qollab. Устройство: iPhone', time: '09:12' }
    ]
  },
  {
    id: 'ergiz', name: 'ERGiz – Искусственный интеллект', avatar: 'ergiz-avatar.png', kind: 'bot', last: 'Привет! хочу задать вам пару коротких вопросов', time: '13:44', online: true,
    messages: [
      { author: 'ERGiz', text: 'Привет! Я ERGiz — цифровой ассистент ERG. Чем я могу помочь?', time: 'сейчас' }
    ],
    history: [
      { title: 'Отпуск и кадровые справки', date: 'Сегодня, 10:24' },
      { title: 'Обучение и сертификаты', date: 'Вчера, 16:40' },
      { title: 'Корпоративные сервисы', date: '5 сентября' }
    ]
  },
  {
    id: 'ayazhan', name: 'Аяжан С.', avatar: 'chat-ayazhan.png', last: 'Салем, там задача', time: '13:21', online: true, unread: 1,
    messages: [
      { author: 'Аяжан С.', text: 'Салем! Посмотри, пожалуйста, задачу по презентации.', time: '13:18' },
      { own: true, text: 'Привет! Да, открою через пару минут.', time: '13:19' },
      { author: 'Аяжан С.', text: 'Спасибо, там задача уже с комментариями.', time: '13:21' }
    ]
  },
  {
    id: 'robots', name: 'PR01DEV + ROBOTS', avatar: 'chat-robots.png', last: 'Арман А.: не узнал', time: '11:34', muted: true, members: '73 участника',
    messages: [
      { author: 'Нурлан Бейсенов', text: 'Привет всем! Почти на финише.', time: 'Чт 10:16' },
      { author: 'Нурлан Бейсенов', attachment: 'chat-attachment.png', time: 'Чт 10:16' },
      { author: 'Нурлан Бейсенов', text: 'https://www.figma.com/design/FoyecFzqA3XFwIRZSwELxt/TaskAc...', link: true, time: 'Чт 10:16' },
      { own: true, author: '@Нурлан Бейсенов', text: 'Здорово! Спасибо.', time: 'Чт 10:16' },
      { author: 'Нурлан Бейсенов', reply: 'Алуа Мырзахметова\n@Нурлан Бейсенов Здорово! Спасибо.', text: 'Да не за что...', time: 'Чт 10:16' },
      { author: 'Динара Токтарова', reply: 'Нурлан Бейсенов\nhttps://www.figma.com/design/FoyecFzqA3XFwIRZS...', text: 'Посмотрела, всё отлично.', time: '11:34' }
    ]
  },
  {
    id: 'qollab', name: 'Групповой чат qollab', avatar: 'chat-qollab.png', last: 'Айдар С.: Вот скрин приложения', time: '10:01', muted: true, members: '11 участников',
    messages: [
      { author: 'Айдар С.', text: 'Коллеги, вот скрин приложения после обновления.', time: '09:56' },
      { author: 'Айдар С.', attachment: 'chat-attachment.png', time: '09:57' },
      { own: true, text: 'Выглядит хорошо. Проверю адаптив сегодня.', time: '10:01' }
    ]
  },
  {
    id: 'arai', name: 'Арай А.', avatar: 'chat-arai.png', last: 'Подпиши этот договор', time: '09:01',
    messages: [
      { author: 'Арай А.', text: 'Доброе утро! Отправила финальную версию документа.', time: '08:58' },
      { author: 'Арай А.', text: 'Подпиши этот договор, пожалуйста.', time: '09:01' },
      { own: true, text: 'Хорошо, посмотрю до обеда.', time: '09:03' }
    ]
  },
  {
    id: 'nurlan', name: 'Нурлан И.', avatar: 'chat-nurlan.png', last: 'Доброе утро. Да я получил ваш файл', time: '09:00', online: true,
    messages: [
      { own: true, text: 'Нурлан, файл дошёл?', time: '08:56' },
      { author: 'Нурлан И.', text: 'Доброе утро. Да, я получил ваш файл.', time: '09:00' },
      { author: 'Нурлан И.', text: 'Вернусь с комментариями после встречи.', time: '09:01' }
    ]
  },
  {
    id: 'daniyar', name: 'Данияр К.', avatar: 'chat-daniyar.png', last: 'Вот зал куда мы ходим', time: '10:51', online: true,
    messages: [
      { author: 'Данияр К.', text: 'Вот зал, куда мы ходим. Тренировка в четверг.', time: '10:51' },
      { own: true, text: 'Отлично, записал. Во сколько начинаем?', time: '10:54' },
      { author: 'Данияр К.', text: 'В 19:30, встречаемся у входа.', time: '10:55' }
    ]
  }
];

let chatMessageUid = 0;
chatContacts.forEach((contact) => {
  contact.messages.forEach((message) => {
    message.id ||= `${contact.id}-${++chatMessageUid}`;
    message.status ||= message.own ? 'read' : '';
    message.reactions ||= [];
    message.pinned ||= false;
  });
  seedPortalActivity(contact);
});

const chatContactList = document.querySelector('#chatContactList');
const chatSearch = document.querySelector('#chatSearch');
const chatMessages = document.querySelector('#chatMessages');
const chatHeadAvatar = document.querySelector('#chatHeadAvatar');
const chatHeadTitle = document.querySelector('#chatHeadTitle');
const chatHeadStatus = document.querySelector('#chatHeadStatus');
const chatComposer = document.querySelector('#chatComposer');
const chatMessageInput = document.querySelector('#chatMessageInput');
const chatsShell = document.querySelector('#chatsShell');
const chatConversation = document.querySelector('.chat-conversation');
let activeChatId = null;

function escapeChatText(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

const headerChatTrigger = document.querySelector('#headerChatTrigger');
const headerChatPopover = document.querySelector('#headerChatPopover');
const headerChatClose = document.querySelector('#headerChatClose');
const headerChatExpand = document.querySelector('#headerChatExpand');
const headerChatSearch = document.querySelector('#headerChatSearch');
const headerChatContactList = document.querySelector('#headerChatContactList');
const headerChatConversationView = document.querySelector('#headerChatConversationView');
const headerChatConversationAvatar = document.querySelector('#headerChatConversationAvatar');
const headerChatConversationTitle = document.querySelector('#headerChatConversationTitle');
const headerChatConversationStatus = document.querySelector('#headerChatConversationStatus');
const headerChatConversationMessages = document.querySelector('#headerChatConversationMessages');
const headerChatConversationComposer = document.querySelector('#headerChatConversationComposer');
const headerChatConversationInput = document.querySelector('#headerChatConversationInput');
const headerChatAttachment = document.querySelector('#headerChatAttachment');
const headerChatAttachmentMenu = document.querySelector('#headerChatAttachmentMenu');
const headerChatBack = document.querySelector('#headerChatBack');
const headerChatComposeContext = document.querySelector('#headerChatComposeContext');
const headerChatBotNew = document.querySelector('#headerChatBotNew');
const headerChatBotHistory = document.querySelector('#headerChatBotHistory');
const headerChatVoice = document.querySelector('#headerChatVoice');
const chatComposeContext = document.querySelector('#chatComposeContext');
const chatAttachment = document.querySelector('#chatAttachment');
const chatAttachmentMenu = document.querySelector('#chatAttachmentMenu');
const chatBotNew = document.querySelector('#chatBotNew');
const chatBotHistory = document.querySelector('#chatBotHistory');
const chatMore = document.querySelector('#chatMore');
const chatForwardModal = document.querySelector('#chatForwardModal');
const chatForwardList = document.querySelector('#chatForwardList');
const chatHistoryModal = document.querySelector('#chatHistoryModal');
const chatHistoryList = document.querySelector('#chatHistoryList');
const headerCreateGroup = document.querySelector('#headerCreateGroup');
const headerCreateMessage = document.querySelector('#headerCreateMessage');
const chatCreateMessage = document.querySelector('#chatCreateMessage');
const chatCreateGroup = document.querySelector('#chatCreateGroup');
const headerChatListTitle = document.querySelector('#headerChatListTitle');
const chatListTitle = document.querySelector('#chatListTitle');
const headerChatSelectionActions = document.querySelector('#headerChatSelectionActions');
const chatSelectionActions = document.querySelector('#chatSelectionActions');
const chatCreateModal = document.querySelector('#chatCreateModal');
const chatCreateTitle = document.querySelector('#chatCreateTitle');
const chatCreateForm = document.querySelector('#chatCreateForm');
const chatCreateName = document.querySelector('#chatCreateName');
const chatCreateSubmit = document.querySelector('#chatCreateSubmit');
const chatCreateBack = document.querySelector('#chatCreateBack');
const chatCreateSearchStep = document.querySelector('#chatCreateSearchStep');
const chatCreateSearch = document.querySelector('#chatCreateSearch');
const chatCreateResults = document.querySelector('#chatCreateResults');
const chatStartGroup = document.querySelector('#chatStartGroup');
const chatGroupMembersStep = document.querySelector('#chatGroupMembersStep');
const chatGroupSearch = document.querySelector('#chatGroupSearch');
const chatGroupSelected = document.querySelector('#chatGroupSelected');
const chatGroupResults = document.querySelector('#chatGroupResults');
const chatGroupCount = document.querySelector('#chatGroupCount');
const chatGroupNext = document.querySelector('#chatGroupNext');
const chatGroupSummary = document.querySelector('#chatGroupSummary');
const chatGroupFinalCount = document.querySelector('#chatGroupFinalCount');
const chatActionOverlay = document.querySelector('#chatActionOverlay');
const webMessageMenu = mountWebMessageMenu(chatActionOverlay);
const chatConfirmModal = document.querySelector('#chatConfirmModal');
const chatConfirmDelete = document.querySelector('#chatConfirmDelete');
const chatToast = document.querySelector('#chatToast');
let headerChatOrder = ['ergiz', 'ayazhan', 'robots', 'qollab', 'arai', 'nurlan', 'daniyar', 'arai', 'nurlan', 'nurlan', 'nurlan'];
const headerChatAvatars = {
  ergiz: ['ergiz-avatar.png'],
  ayazhan: ['chat-overlay-ayazhan.png'],
  robots: ['chat-overlay-robots.png'],
  qollab: ['chat-overlay-qollab.png'],
  arai: ['chat-overlay-arai-a.png', 'chat-overlay-arai-b.png'],
  nurlan: ['chat-overlay-nurlan.png'],
  daniyar: ['chat-overlay-arai-a.png']
};
const headerChatPreview = {
  ergiz: { author: 'ERGiz:', text: 'Чем я могу помочь?' },
  ayazhan: { text: 'Салем, там задача' },
  robots: { author: 'Арман А.:', text: 'не узнал' },
  qollab: { author: 'Айдар С.:', icon: 'chat-overlay-camera.svg', text: 'Вот скрин приложения с обновлением' },
  arai: { icon: 'chat-overlay-document.svg', text: 'Подпиши этот договор' },
  nurlan: { text: 'Доброе утро. Да я получил ваш файл' },
  daniyar: { icon: 'chat-overlay-video.svg', text: 'Вот зал куда мы ходим' }
};

const ergizPrompts = ['Как оформить отпуск?', 'Где найти расчётный лист?', 'Записаться на обучение'];
const ergizAnswers = {
  'Как оформить отпуск?': 'Оформить отпуск можно через сервис «Персонал». Откройте заявку, выберите даты и отправьте её руководителю.',
  'Где найти расчётный лист?': 'Расчётные листы находятся в профиле сотрудника, в разделе «Документы и начисления».',
  'Записаться на обучение': 'Откройте «Календарь обучения», выберите программу и нажмите «Записаться». Я могу подсказать подходящий курс.'
};
const chatReplies = ['Принято 👍', 'Хорошо, посмотрю и вернусь с ответом.', 'Договорились!', 'Спасибо за информацию.', 'Да, всё верно.'];
const chatDirectory = [
  { id: 'ayazhan', name: 'Аяжан Сериккызы', avatar: 'chat-ayazhan.png', company: 'Business & Technology Services', phone: '+7 701 730 01 12', role: 'Руководитель проекта' },
  { id: 'daniyar', name: 'Данияр Кенжебаев', avatar: 'chat-daniyar.png', company: 'ERG Service', phone: '+7 777 240 18 06', role: 'Эксперт' },
  { id: 'nurlan', name: 'Нурлан Бейсенов', avatar: 'chat-nurlan.png', company: 'Евроазиатская энергетическая корпорация', phone: '+7 705 118 42 77', role: 'Бизнес-аналитик' },
  { id: 'arai', name: 'Арай Абишева', avatar: 'chat-arai.png', company: 'ТрансКом', phone: '+7 701 350 70 31', role: 'Юрисконсульт' },
  { id: 'aliya', name: 'Алия Сеитова', avatar: 'chat-avatar-extra.png', company: 'Шубарколь Комир', phone: '+7 701 315 01 34', role: 'Бухгалтер' },
  { id: 'arman', name: 'Арман Ибраимов', avatar: 'chat-overlay-arai-a.png', company: 'Business & Technology Services', phone: '+7 707 173 00 26', role: 'UX-дизайнер' }
];
let chatComposerState = { mode: null, messageId: null };
let activeMessageMenu = { surface: null, messageId: null };
let pendingDelete = null;
let pendingForward = null;
let chatToastTimer = null;
let chatCreateStep = 'search';
let selectedGroupMembers = new Set();
let chatSelectionMode = false;
let selectedChatIds = new Set();
let chatLongPressTimer = null;
let actionOverlayMessage = null;
let chatCreateHost = null;

function headerChatAvatarMarkup(contact) {
  const images = headerChatAvatars[contact.id] || [contact.avatar];
  const online = Boolean(contact.online);
  return `<span class="header-chat-popover-avatar">${images.map((image) => `<img src="${asset(image)}" alt="">`).join('')}${online ? '<i class="header-chat-popover-online"></i>' : ''}</span>`;
}

function renderHeaderChatContacts(filter = '') {
  const query = filter.trim().toLocaleLowerCase('ru');
  headerChatContactList.innerHTML = headerChatOrder
    .map((id) => chatContacts.find((contact) => contact.id === id))
    .filter((contact) => contact && contact.name.toLocaleLowerCase('ru').includes(query))
    .map((contact) => {
      const selectable = contact.kind !== 'bot';
      const selected = selectedChatIds.has(contact.id);
      const preview = headerChatPreview[contact.id] || { text: contact.last };
      const muted = contact.muted ? `<img src="${asset('chat-overlay-muted.svg')}" alt="Без звука">` : '';
      const icon = preview.icon ? `<img src="${asset(preview.icon)}" alt="">` : '';
      const author = preview.author ? `<b>${escapeChatText(preview.author)}</b>` : '';
      const unread = contact.id === 'ayazhan' && contact.unread ? `<img class="header-chat-popover-unread" src="${asset('chat-overlay-unread.svg')}" alt="Непрочитано">` : '';
      return `
        <button class="header-chat-popover-contact${contact.id === activeChatId && !chatSelectionMode ? ' active' : ''}${chatSelectionMode ? ' selecting' : ''}${selected ? ' selected' : ''}${chatSelectionMode && !selectable ? ' selection-disabled' : ''}" type="button" data-header-chat-id="${contact.id}"${chatSelectionMode ? ` aria-pressed="${selected}"` : ''}>
          ${chatSelectionMode ? `<span class="chat-select-circle">${selected ? '✓' : ''}</span>` : ''}
          ${headerChatAvatarMarkup(contact)}
          <span class="header-chat-popover-copy">
            <span class="header-chat-popover-title"><strong>${escapeChatText(contact.name)}</strong>${muted}</span>
            <span class="header-chat-popover-preview">
              <span class="header-chat-popover-message">${author}${icon}<span>${escapeChatText(preview.text)}</span></span>
              <time>${contact.time}</time>${unread}
            </span>
          </span>
        </button>`;
    }).join('');
}

function syncChatSelectionUi() {
  const count = selectedChatIds.size;
  const title = chatSelectionMode ? `Выбрано: ${count}` : 'Чаты';
  chatListTitle.textContent = title;
  headerChatListTitle.textContent = title;
  chatCreateGroup.hidden = chatSelectionMode;
  headerCreateGroup.hidden = chatSelectionMode;
  headerChatExpand.hidden = chatSelectionMode;
  chatCreateMessage.classList.toggle('orange', chatSelectionMode);
  headerCreateMessage.classList.toggle('primary', chatSelectionMode);
  chatCreateMessage.innerHTML = chatSelectionMode ? '<span class="chat-selection-done">✓</span>' : `<img src="${asset('chat-figma-edit.svg')}" alt="">`;
  headerCreateMessage.innerHTML = chatSelectionMode ? '<span class="chat-selection-done">✓</span>' : `<img src="${asset('chat-list-edit.svg')}" alt="">`;
  chatCreateMessage.setAttribute('aria-label', chatSelectionMode ? 'Готово' : 'Выбрать чаты');
  headerCreateMessage.setAttribute('aria-label', chatSelectionMode ? 'Готово' : 'Выбрать чаты');
  chatSelectionActions.hidden = !chatSelectionMode;
  headerChatSelectionActions.hidden = !chatSelectionMode;
  document.querySelectorAll('[data-chat-delete-selected]').forEach((button) => { button.disabled = count === 0; });
}

function setChatSelectionMode(open) {
  chatSelectionMode = open;
  if (!open) selectedChatIds = new Set();
  syncChatSelectionUi();
  renderHeaderChatContacts(headerChatSearch.value);
  renderChatContacts(chatSearch.value);
}

function toggleSelectedChat(contact) {
  if (!contact || contact.kind === 'bot') return;
  if (selectedChatIds.has(contact.id)) selectedChatIds.delete(contact.id);
  else selectedChatIds.add(contact.id);
  syncChatSelectionUi();
  renderHeaderChatContacts(headerChatSearch.value);
  renderChatContacts(chatSearch.value);
}

function robotHeaderChatMessagesMarkup() {
  return `
    <div class="header-chat-internal-day">Вчера</div>
    <div class="header-chat-internal-block">
      <div class="header-chat-internal-row">
        <div class="header-chat-internal-message">
          <span class="header-chat-internal-avatar placeholder">НБ</span>
          <div class="header-chat-internal-bubble figma-first"><strong class="header-chat-internal-author">Нурлан Бейсенов</strong><p>Привет всем! Почти на финише.</p><time>Чт 10:16</time></div>
        </div>
      </div>
      <div class="header-chat-internal-row">
        <div class="header-chat-internal-message">
          <span class="header-chat-internal-avatar placeholder">НБ</span>
          <div class="header-chat-internal-bubble attachment"><img src="${asset('chat-internal-attachment.png')}" alt="Скрин приложения"><time>Чт 10:16</time></div>
        </div>
      </div>
      <div class="header-chat-internal-row">
        <div class="header-chat-internal-message">
          <span class="header-chat-internal-avatar">НБ</span>
          <div class="header-chat-internal-bubble wide figma-link"><a href="#">https://www.figma.com/design/FoyecFzqA3XFwIRZSwELxt/TaskAction-App?node-id=50-17362</a><time>Чт 10:16</time></div>
        </div>
      </div>
    </div>
    <div class="header-chat-internal-row own">
      <div class="header-chat-internal-bubble figma-own"><p><strong class="header-chat-internal-author">@Нурлан Бейсенов</strong> Здорово! Спасибо.</p><time>Чт 10:16<img src="${asset('chat-internal-read.svg')}" alt="Прочитано"></time></div>
    </div>
    <div class="header-chat-internal-row">
      <div class="header-chat-internal-message">
        <span class="header-chat-internal-avatar">НБ</span>
        <div class="header-chat-internal-bubble compact figma-reply"><strong class="header-chat-internal-author">Нурлан Бейсенов</strong><div class="header-chat-internal-quote"><strong>Алуа Мырзахметова</strong><span>@Нурлан Бейсенов Здорово! Спасибо.</span></div><p>Да не за что...</p><time>Чт 10:16</time></div>
      </div>
    </div>
    <div class="header-chat-internal-row">
      <div class="header-chat-internal-message">
        <span class="header-chat-internal-avatar"><img src="${asset('chat-internal-participant.png')}" alt="Динара Токтарова"></span>
        <div class="header-chat-internal-bubble figma-long"><strong class="header-chat-internal-author" style="color:#ff4d4f">Динара Токтарова</strong><div class="header-chat-internal-quote green"><strong>Нурлан Бейсенов</strong><span>https://www.figma.com/design/FoyecFzqA3XFwIRZS...</span></div><p>Хороший тайминг — как раз смотрела на эту таску :)</p><time>Чт 10:16</time></div>
      </div>
    </div>
    <div class="header-chat-internal-day">Сегодня</div>
    <div class="header-chat-internal-row own">
      <div class="header-chat-internal-bubble wide"><p><strong class="header-chat-internal-author">@Нурлан Бейсенов</strong> Я оставила несколько комментов в Figma для тебя. Думаю надо будет обсудить</p><time>Чт 11:41<img src="${asset('chat-internal-sent.svg')}" alt="Отправлено"></time></div>
    </div>`;
}

function genericHeaderChatMessagesMarkup(contact) {
  const pinned = contact.messages.filter((message) => message.pinned);
  const pinnedBar = pinned.length ? `<button class="chat-pinned-bar" type="button" data-chat-scroll-pin="${pinned[pinned.length - 1].id}"><span>📌</span><span><b>Закреплённое сообщение</b><small>${escapeChatText(pinned[pinned.length - 1].text || pinned[pinned.length - 1].attachmentLabel || 'Вложение')}</small></span><em>${pinned.length}</em></button>` : '';
  const prompts = contact.kind === 'bot' && contact.messages.filter((message) => message.own).length === 0
    ? `<div class="chat-ergiz-prompts">${ergizPrompts.map((prompt) => `<button type="button" data-ergiz-prompt="${escapeChatText(prompt)}">${escapeChatText(prompt)}</button>`).join('')}</div>`
    : '';
  const typing = contact.typing ? `<div class="header-chat-internal-row"><div class="header-chat-internal-message"><span class="header-chat-internal-avatar"><img src="${asset(contact.avatar)}" alt=""></span><div class="header-chat-internal-bubble chat-typing"><i></i><i></i><i></i></div></div></div>` : '';
  const empty = contact.messages.length === 0 ? `<div class="chat-empty-state"><span>💬</span><b>Начните общение</b><small>Напишите первое сообщение в этом чате</small></div>` : '';
  return `${pinnedBar}${contact.messages.length ? '<div class="header-chat-internal-day">Сегодня</div>' : ''}${empty}${contact.messages.map((message) => {
    const ownClass = message.own ? ' own' : '';
    const avatar = message.own ? '' : `<span class="header-chat-internal-avatar"><img src="${asset(contact.avatar)}" alt=""></span>`;
    const author = message.author ? `<strong class="header-chat-internal-author">${escapeChatText(message.author)}</strong>` : '';
    const text = message.text ? `<p>${escapeChatText(message.text)}</p>` : '';
    const reply = message.reply ? `<div class="header-chat-internal-quote"><strong>${message.own ? 'Ответ' : escapeChatText(message.author || contact.name)}</strong><span>${escapeChatText(typeof message.reply === 'string' ? message.reply : message.reply.text)}</span></div>` : '';
    const attachment = message.attachment ? `<img src="${asset(message.attachment)}" alt="Вложение" style="width:100%;border-radius:8px">` : (message.attachmentLabel ? `<div class="chat-file-card"><span>${message.attachmentKind === 'photo' ? '▧' : message.attachmentKind === 'poll' ? '☷' : '▤'}</span><b>${escapeChatText(message.attachmentLabel)}</b></div>` : '');
    const reactions = chatReactionsMarkup(message);
    const menu = `<button class="chat-message-menu-trigger" type="button" data-chat-menu="${message.id}" aria-label="Действия с сообщением">•••</button>`;
    const statusAsset = message.status === 'sent' ? 'chat-internal-sent.svg' : 'chat-internal-read.svg';
    return `<div class="header-chat-internal-row${ownClass}${message.selected ? ' pw-chat-selected' : ''}" data-chat-message-id="${message.id}" data-chat-surface="overlay"><div class="header-chat-internal-message">${avatar}<div class="header-chat-internal-bubble${message.pinned ? ' is-pinned' : ''}">${message.forwarded ? '<small class="chat-forwarded">Переслано</small>' : ''}${author}${reply}${attachment}${text}${message.edited ? '<small class="chat-edited">изменено</small>' : ''}<time>${message.time}${message.own ? `<img src="${asset(statusAsset)}" alt="${message.status === 'sent' ? 'Отправлено' : 'Прочитано'}">` : ''}</time>${reactions ? `<div class="chat-reactions">${reactions}</div>` : ''}${menu}</div></div></div>`;
  }).join('')}${typing}${prompts}`;
}

function headerChatSentMessageMarkup(message) {
  return `<div class="header-chat-internal-row own"><div class="header-chat-internal-bubble"><p>${escapeChatText(message.text)}</p><time>${message.time}<img src="${asset('chat-internal-read.svg')}" alt="Прочитано"></time></div></div>`;
}

function renderHeaderChatConversation() {
  const contact = chatContacts.find((item) => item.id === activeChatId) || chatContacts[0];
  headerChatConversationAvatar.src = asset(contact.id === 'robots' ? 'chat-internal-robots.png' : (headerChatAvatars[contact.id]?.[0] || contact.avatar));
  headerChatConversationTitle.textContent = contact.name;
  headerChatConversationStatus.textContent = contact.typing ? 'печатает…' : (contact.kind === 'bot' ? 'AI-помощник qollab' : (contact.members || (contact.online ? 'в сети' : 'был(а) недавно')));
  const isBot = contact.kind === 'bot';
  headerChatBotNew.hidden = !isBot;
  headerChatBotHistory.hidden = !isBot;
  headerChatVoice.hidden = isBot;
  headerChatConversationMessages.innerHTML = genericHeaderChatMessagesMarkup(contact);
  renderComposeContext('overlay');
}

function setHeaderChatConversation(open) {
  headerChatPopover.classList.toggle('conversation-view', open);
  headerChatConversationView.setAttribute('aria-hidden', String(!open));
  if (open) renderHeaderChatConversation();
}

function setHeaderChatPopover(open) {
  if (open) {
    if (document.body.classList.contains('services-open')) setServicesDrawer(false);
    if (document.body.classList.contains('widgets-open')) setWidgetsDrawer(false);
    if (document.body.classList.contains('sidebar-open')) setSidebar(false);
    renderHeaderChatContacts(headerChatSearch.value);
    setHeaderChatConversation(false);
  }
  document.body.classList.toggle('header-chat-open', open);
  headerChatTrigger.setAttribute('aria-expanded', String(open));
  headerChatPopover.setAttribute('aria-hidden', String(!open));
}

headerChatTrigger.addEventListener('click', () => {
  setHeaderChatPopover(!document.body.classList.contains('header-chat-open'));
});
headerChatClose.addEventListener('click', () => setHeaderChatPopover(false));
headerChatBack.addEventListener('click', () => setHeaderChatConversation(false));
headerChatExpand.addEventListener('click', () => {
  setHeaderChatPopover(false);
  showPortalPage('chats', { preserveChat: true });
});
function activeChatContact() {
  return chatContacts.find((item) => item.id === activeChatId) || chatContacts[0];
}

function chatTimeNow() {
  return new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

function showChatToast(text) {
  clearTimeout(chatToastTimer);
  chatToast.textContent = text;
  chatToast.hidden = false;
  chatToastTimer = setTimeout(() => { chatToast.hidden = true; }, 2200);
}

function closeChatModals() {
  chatForwardModal.hidden = true;
  chatHistoryModal.hidden = true;
  closeChatCreateModal();
  chatConfirmModal.hidden = true;
  closeChatActionOverlay();
}

function chatDirectoryMatches(employee, query) {
  const haystack = `${employee.name} ${employee.company} ${employee.phone} ${employee.role}`.toLocaleLowerCase('ru');
  return haystack.includes(query.trim().toLocaleLowerCase('ru'));
}

function directoryAvatar(employee) {
  return `<span class="chat-directory-avatar"><img src="${asset(employee.avatar)}" alt=""></span>`;
}

function renderDirectChatDirectory() {
  const query = chatCreateSearch.value.trim();
  if (!query) {
    chatCreateResults.innerHTML = `<div class="chat-create-empty"><span class="chat-create-empty-icons"><i><img src="${asset('chat-empty-chat.svg')}" alt=""></i><i><img src="${asset('chat-empty-person.svg')}" alt=""></i><i><img src="${asset('chat-empty-emoji.svg')}" alt=""></i></span><b>Поиск собеседника</b><small>Для поиска введите в поиск имя, должность, предприятие или номер телефона собеседника</small></div>`;
    return;
  }
  const matches = chatDirectory.filter((employee) => chatDirectoryMatches(employee, query));
  chatCreateResults.innerHTML = matches.length ? matches.map((employee) => `
    <button class="chat-directory-row" type="button" data-chat-directory-id="${employee.id}">
      ${directoryAvatar(employee)}
      <span><b>${escapeChatText(employee.name)} <em>• ${escapeChatText(employee.company)}</em></b><small>${escapeChatText(employee.phone)} · ${escapeChatText(employee.role)}</small></span>
      <i>ⓘ</i>
    </button>`).join('') : `<div class="chat-create-empty compact"><b>Ничего не найдено</b><small>Попробуйте изменить запрос</small></div>`;
}

function renderGroupDirectory() {
  const query = chatGroupSearch.value.trim();
  const matches = chatDirectory.filter((employee) => !query || chatDirectoryMatches(employee, query));
  chatGroupResults.innerHTML = matches.map((employee) => {
    const selected = selectedGroupMembers.has(employee.id);
    return `<button class="chat-directory-row selectable${selected ? ' selected' : ''}" type="button" data-chat-group-member="${employee.id}" aria-pressed="${selected}">
      <span class="chat-select-circle">${selected ? '✓' : ''}</span>${directoryAvatar(employee)}
      <span><b>${escapeChatText(employee.name)}</b><small>${escapeChatText(employee.company)} · ${escapeChatText(employee.role)}</small></span>
    </button>`;
  }).join('');
  const selected = chatDirectory.filter((employee) => selectedGroupMembers.has(employee.id));
  chatGroupSelected.innerHTML = selected.map((employee) => `<button type="button" data-chat-group-remove="${employee.id}"><img src="${asset(employee.avatar)}" alt=""><span>${escapeChatText(employee.name.split(' ')[0])}</span><i>×</i></button>`).join('');
  chatGroupCount.textContent = `Выбрано: ${selected.length}`;
  chatGroupNext.disabled = selected.length < 2;
}

function renderGroupSummary() {
  const selected = chatDirectory.filter((employee) => selectedGroupMembers.has(employee.id));
  chatGroupSummary.innerHTML = selected.map((employee) => `<span><img src="${asset(employee.avatar)}" alt=""><b>${escapeChatText(employee.name)}</b></span>`).join('');
  chatGroupFinalCount.textContent = `${selected.length + 1} участника`;
  chatCreateSubmit.disabled = !chatCreateName.value.trim();
}

function setChatCreateStep(step) {
  chatCreateStep = step;
  chatCreateSearchStep.hidden = step !== 'search';
  chatGroupMembersStep.hidden = step !== 'members';
  chatCreateForm.hidden = step !== 'details';
  chatCreateModal.querySelector('.chat-create-card').dataset.chatCreateStep = step;
  chatCreateTitle.textContent = step === 'search' ? 'Написать сообщение' : (step === 'members' ? 'Участники группы' : 'Новая группа');
  if (step === 'search') {
    renderDirectChatDirectory();
    requestAnimationFrame(() => chatCreateSearch.focus());
  }
  if (step === 'members') {
    renderGroupDirectory();
    requestAnimationFrame(() => chatGroupSearch.focus());
  }
  if (step === 'details') {
    renderGroupSummary();
    requestAnimationFrame(() => chatCreateName.focus());
  }
}

function openChatCreateModal(source) {
  const host = source === headerCreateGroup ? document.querySelector('#headerChatListView') : document.querySelector('.chat-sidebar');
  if (chatCreateHost && chatCreateHost !== host) chatCreateHost.classList.remove('chat-creating');
  chatCreateHost = host;
  chatCreateHost.append(chatCreateModal);
  chatCreateHost.classList.add('chat-creating');
  selectedGroupMembers = new Set();
  chatCreateSearch.value = '';
  chatGroupSearch.value = '';
  chatCreateForm.reset();
  chatCreateModal.hidden = false;
  setChatCreateStep('search');
}

function closeChatCreateModal() {
  chatCreateModal.hidden = true;
  chatCreateHost?.classList.remove('chat-creating');
  chatCreateForm.reset();
  selectedGroupMembers = new Set();
}

function openDirectChat(employeeId) {
  const employee = chatDirectory.find((item) => item.id === employeeId);
  if (!employee) return;
  let contact = chatContacts.find((item) => item.id === employee.id);
  if (!contact) {
    contact = { id: employee.id, name: employee.name, avatar: employee.avatar, company: employee.company, last: 'Нет сообщений', time: 'сейчас', online: true, messages: [] };
    chatContacts.unshift(contact);
    headerChatOrder = [contact.id, ...headerChatOrder];
    headerChatPreview[contact.id] = { text: contact.last };
  }
  activeChatId = contact.id;
  resetComposerState(true);
  closeChatCreateModal();
  updateChatViews({ scrollBottom: true });
  chatsShell.classList.add('conversation-open');
  if (document.body.classList.contains('header-chat-open')) setHeaderChatConversation(true);
}

function createGroupFromForm() {
  const name = chatCreateName.value.trim();
  if (!name || selectedGroupMembers.size < 2) return;
  const id = `group-${Date.now()}`;
  const contact = { id, name, avatar: 'chat-qollab.png', kind: 'group', last: 'Нет сообщений', time: 'сейчас', members: `${selectedGroupMembers.size + 1} участника`, messages: [] };
  chatContacts.unshift(contact);
  headerChatOrder = [id, ...headerChatOrder];
  headerChatPreview[id] = { text: contact.last };
  activeChatId = id;
  resetComposerState(true);
  closeChatCreateModal();
  updateChatViews({ scrollBottom: true });
  chatsShell.classList.add('conversation-open');
  if (document.body.classList.contains('header-chat-open')) setHeaderChatConversation(true);
  showChatToast('Группа создана');
}

function renderComposeContext(surface) {
  const container = surface === 'overlay' ? headerChatComposeContext : chatComposeContext;
  const contact = activeChatContact();
  const message = contact.messages.find((item) => item.id === chatComposerState.messageId);
  if (!chatComposerState.mode || !message) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }
  const label = chatComposerState.mode === 'edit' ? 'Редактирование' : (message.own ? 'Вы' : (message.author || contact.name));
  container.innerHTML = `<span>${chatComposerState.mode === 'edit' ? '✎' : '↩'}</span><span><b>${escapeChatText(label)}</b><small>${escapeChatText(message.text || message.attachmentLabel || 'Вложение')}</small></span><button type="button" data-compose-cancel aria-label="Отменить">×</button>`;
  container.hidden = false;
}

function resetComposerState(clearInputs = false) {
  chatComposerState = { mode: null, messageId: null };
  if (clearInputs) {
    headerChatConversationInput.value = '';
    chatMessageInput.value = '';
  }
  renderComposeContext('overlay');
  renderComposeContext('page');
}

function updateChatViews(options = {}) {
  renderHeaderChatContacts(headerChatSearch.value);
  renderChatContacts(chatSearch.value);
  renderHeaderChatConversation();
  renderActiveChat();
  if (options.scrollBottom) requestAnimationFrame(() => {
    headerChatConversationMessages.scrollTop = headerChatConversationMessages.scrollHeight;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function scheduleChatReply(contact, question) {
  contact.typing = true;
  updateChatViews({ scrollBottom: true });
  setTimeout(() => {
    contact.typing = false;
    contact.messages.forEach((message) => {
      recordPortalRead(message, contact);
    });
    const answer = contact.kind === 'bot'
      ? (ergizAnswers[question] || 'Я нашёл информацию по вашему вопросу. Откройте нужный сервис из меню — если потребуется, помогу выбрать раздел.')
      : chatReplies[Math.floor(Math.random() * chatReplies.length)];
    const author = contact.kind === 'bot' ? 'ERGiz' : (contact.members ? 'Арман А.' : contact.name);
    contact.messages.push({ id: `${contact.id}-${++chatMessageUid}`, author, text: answer, time: chatTimeNow(), reactions: [], pinned: false });
    contact.last = answer;
    contact.time = chatTimeNow();
    headerChatPreview[contact.id] = { author: contact.kind === 'bot' ? 'ERGiz:' : '', text: answer };
    updateChatViews({ scrollBottom: true });
  }, 1100);
}

function sendChatMessage(value) {
  const text = value.trim();
  if (!text) return;
  const contact = activeChatContact();
  if (chatComposerState.mode === 'edit') {
    const message = contact.messages.find((item) => item.id === chatComposerState.messageId);
    if (message?.own) {
      message.text = text;
      message.edited = true;
      message.time = chatTimeNow();
      contact.last = text;
      headerChatPreview[contact.id] = { text };
      showChatToast('Сообщение изменено');
    }
    resetComposerState(true);
    updateChatViews();
    return;
  }
  const repliedTo = contact.messages.find((item) => item.id === chatComposerState.messageId);
  const message = {
    id: `${contact.id}-${++chatMessageUid}`,
    own: true,
    text,
    time: chatTimeNow(),
    status: 'sent',
    reactions: [],
    pinned: false,
    reply: chatComposerState.mode === 'reply' && repliedTo ? (repliedTo.text || repliedTo.attachmentLabel || 'Вложение') : ''
  };
  contact.messages.push(message);
  contact.last = text;
  contact.time = message.time;
  headerChatPreview[contact.id] = { text };
  resetComposerState(true);
  updateChatViews({ scrollBottom: true });
  setTimeout(() => {
    message.status = 'delivered';
    updateChatViews({ scrollBottom: true });
  }, 450);
  scheduleChatReply(contact, text);
}

function createChatAttachment(kind) {
  const contact = activeChatContact();
  const labels = { photo: 'Фотография.jpg', document: 'Документ.pdf', poll: 'Новый опрос' };
  const message = {
    id: `${contact.id}-${++chatMessageUid}`,
    own: true,
    attachmentKind: kind,
    attachmentLabel: labels[kind] || 'Вложение',
    time: chatTimeNow(),
    status: 'sent', reactions: [], pinned: false
  };
  contact.messages.push(message);
  contact.last = message.attachmentLabel;
  contact.time = message.time;
  headerChatPreview[contact.id] = { text: message.attachmentLabel };
  headerChatAttachmentMenu.hidden = true;
  chatAttachmentMenu.hidden = true;
  updateChatViews({ scrollBottom: true });
  setTimeout(() => { message.status = 'delivered'; updateChatViews(); }, 450);
  showChatToast('Вложение добавлено');
}

function openForwardModal(message) {
  pendingForward = message;
  chatForwardList.innerHTML = chatContacts.filter((contact) => contact.id !== activeChatId).map((contact) => `<button type="button" data-forward-chat="${contact.id}"><img src="${asset(contact.avatar)}" alt=""><span><b>${escapeChatText(contact.name)}</b><small>${escapeChatText(contact.last)}</small></span></button>`).join('');
  chatForwardModal.hidden = false;
}

function openErgizHistory() {
  const ergiz = chatContacts.find((contact) => contact.kind === 'bot');
  chatHistoryList.innerHTML = ergiz.history.map((dialog, index) => `<button type="button" data-ergiz-history="${index}"><span><b>${escapeChatText(dialog.title)}</b><small>${escapeChatText(dialog.date)}</small></span><i>›</i></button>`).join('');
  chatHistoryModal.hidden = false;
}

function newErgizDialog() {
  const contact = chatContacts.find((item) => item.kind === 'bot');
  if (!contact) return;
  if (contact.messages.length > 1) contact.history.unshift({ title: contact.messages.find((message) => message.own)?.text || 'Новый диалог', date: `Сегодня, ${chatTimeNow()}` });
  contact.messages = [{ id: `${contact.id}-${++chatMessageUid}`, author: 'ERGiz', text: 'Привет! Я ERGiz — цифровой ассистент ERG. Чем я могу помочь?', time: 'сейчас', reactions: [], pinned: false }];
  contact.last = 'Чем я могу помочь?';
  contact.time = 'сейчас';
  contact.typing = false;
  resetComposerState(true);
  updateChatViews({ scrollBottom: true });
  showChatToast('Новый диалог с ERGiz');
}

function closeChatActionOverlay(restoreFocus = true) {
  clearTimeout(chatLongPressTimer);
  chatLongPressTimer = null;
  const target = actionOverlayMessage;
  actionOverlayMessage = null;
  chatActionOverlay.hidden = true;
  webMessageMenu.close();
  if (restoreFocus && target) requestAnimationFrame(() => {
    const container = target.surface === 'overlay' ? headerChatConversationMessages : chatMessages;
    container.querySelector(`[data-chat-menu="${CSS.escape(target.messageId)}"]`)?.focus({ preventScroll: true });
  });
}

function openChatActionOverlay(message, surface, anchor) {
  const contact = activeChatContact();
  if (!contact || !message) return;
  actionOverlayMessage = { contactId: contact.id, messageId: message.id, surface };
  const container = surface === 'overlay' ? headerChatConversationMessages : chatMessages;
  const row = container.querySelector(`[data-chat-message-id="${CSS.escape(message.id)}"]`);
  const rect = anchor || row?.querySelector('[data-chat-menu]')?.getBoundingClientRect();
  chatActionOverlay.hidden = false;
  const bounds = chatActionOverlay.getBoundingClientRect();
  webMessageMenu.open({
    message: { ...message, mine: Boolean(message.own) },
    reactions: normalizePortalReactions(message.reactions),
    readEntries: portalReadEntries(message, contact),
    personal: isPrivateChat(contact),
    position: { x: (rect?.right || bounds.left + 244) - bounds.left - 232, y: (rect?.bottom || bounds.top + 12) - bounds.top + 4 },
    allowDelete: true,
    onClose: () => closeChatActionOverlay(),
    onAction: performChatMessageAction,
    onReact: emoji => {
      togglePortalReaction(message, emoji);
      closeChatActionOverlay();
      updateChatViews();
    },
  });
}

function chatReactionsMarkup(message) {
  return Object.entries(portalReactionGroups(message)).map(([emoji, users]) => {
    const mine = users.some(user => user.id === 'me');
    return `<button class="chat-reaction-chip${mine ? ' is-mine' : ''}" type="button" data-chat-reaction="${escapeChatText(emoji)}" data-message-id="${message.id}" aria-pressed="${mine}" aria-label="${escapeChatText(emoji)}: ${users.length}${mine ? ', ваша реакция' : ''}">${escapeChatText(emoji)}<span>${users.length}</span></button>`;
  }).join('');
}

function performChatMessageAction(action) {
  if (!actionOverlayMessage) return;
  const target = { ...actionOverlayMessage };
  const contact = chatContacts.find((item) => item.id === target.contactId);
  const message = contact?.messages.find((item) => item.id === target.messageId);
  if (!contact || !message) {
    closeChatActionOverlay();
    return;
  }
  closeChatActionOverlay(!['reply', 'edit', 'forward', 'delete'].includes(action));
  if (action === 'reply') chatComposerState = { mode: 'reply', messageId: message.id };
  if (action === 'edit' && message.own && message.text) {
    chatComposerState = { mode: 'edit', messageId: message.id };
    headerChatConversationInput.value = message.text;
    chatMessageInput.value = message.text;
  }
  if (action === 'copy') {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message.text || message.attachmentLabel || '').then(() => showChatToast('Скопировано'), () => showChatToast('Копирование недоступно'));
    else showChatToast('Копирование недоступно');
  }
  if (action === 'pin') {
    message.pinned = !message.pinned;
    showChatToast(message.pinned ? 'Сообщение закреплено' : 'Сообщение откреплено');
  }
  if (action === 'forward') openForwardModal(message);
  if (action === 'delete') {
    pendingDelete = { contactId: contact.id, messageId: message.id };
    chatConfirmModal.hidden = false;
    requestAnimationFrame(() => chatConfirmDelete.focus());
  }
  if (action === 'select') { message.selected = !message.selected; showChatToast(message.selected ? 'Сообщение выбрано' : 'Выбор снят'); }
  updateChatViews();
  if (action === 'reply' || action === 'edit') {
    const input = target.surface === 'overlay' ? headerChatConversationInput : chatMessageInput;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function handleChatMessageClick(event, surface) {
  const prompt = event.target.closest('[data-ergiz-prompt]');
  if (prompt) { sendChatMessage(prompt.dataset.ergizPrompt); return; }
  const pinBar = event.target.closest('[data-chat-scroll-pin]');
  if (pinBar) {
    const selector = `[data-chat-message-id="${CSS.escape(pinBar.dataset.chatScrollPin)}"]`;
    const root = surface === 'overlay' ? headerChatConversationMessages : chatMessages;
    root.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const row = event.target.closest('[data-chat-message-id]');
  if (!row) return;
  const messageId = row.dataset.chatMessageId;
  const contact = activeChatContact();
  const message = contact.messages.find((item) => item.id === messageId);
  if (!message) return;
  const menuTrigger = event.target.closest('[data-chat-menu]');
  if (menuTrigger) {
    openChatActionOverlay(message, surface, menuTrigger.getBoundingClientRect());
    return;
  }
  const reaction = event.target.closest('[data-chat-reaction]');
  if (reaction) {
    togglePortalReaction(message, reaction.dataset.chatReaction);
    updateChatViews();
    return;
  }
}

function attachChatLongPress(root, surface) {
  const cancel = () => {
    clearTimeout(chatLongPressTimer);
    chatLongPressTimer = null;
  };
  root.addEventListener('contextmenu', (event) => {
    const row = event.target.closest('[data-chat-message-id]');
    if (!row) return;
    const message = activeChatContact().messages.find((item) => item.id === row.dataset.chatMessageId);
    if (!message) return;
    event.preventDefault();
    openChatActionOverlay(message, surface, { right: event.clientX + 232, bottom: event.clientY });
  });
  root.addEventListener('keydown', event => {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
    const row = event.target.closest('[data-chat-message-id]');
    const message = row && activeChatContact().messages.find(item => item.id === row.dataset.chatMessageId);
    if (!message) return;
    event.preventDefault();
    openChatActionOverlay(message, surface);
  });
  root.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, a, input')) return;
    const row = event.target.closest('[data-chat-message-id]');
    if (!row) return;
    const messageId = row.dataset.chatMessageId;
    cancel();
    chatLongPressTimer = setTimeout(() => {
      const message = activeChatContact().messages.find((item) => item.id === messageId);
      if (message) openChatActionOverlay(message, surface);
    }, 520);
  });
  ['pointerup', 'pointercancel', 'pointerleave', 'pointermove'].forEach((name) => root.addEventListener(name, cancel, { passive: true }));
  root.addEventListener('scroll', cancel, { passive: true });
}

headerChatSearch.addEventListener('input', () => renderHeaderChatContacts(headerChatSearch.value));
headerChatAttachment.addEventListener('click', () => { headerChatAttachmentMenu.hidden = !headerChatAttachmentMenu.hidden; });
chatAttachment.addEventListener('click', () => { chatAttachmentMenu.hidden = !chatAttachmentMenu.hidden; });
[headerChatAttachmentMenu, chatAttachmentMenu].forEach((menu) => menu.addEventListener('click', (event) => {
  const option = event.target.closest('[data-attachment-kind]');
  if (option) createChatAttachment(option.dataset.attachmentKind);
}));
headerChatConversationComposer.addEventListener('submit', (event) => {
  event.preventDefault();
  sendChatMessage(headerChatConversationInput.value);
  headerChatConversationInput.focus();
});
headerChatConversationMessages.addEventListener('click', (event) => handleChatMessageClick(event, 'overlay'));
chatMessages.addEventListener('click', (event) => handleChatMessageClick(event, 'page'));
attachChatLongPress(headerChatConversationMessages, 'overlay');
attachChatLongPress(chatMessages, 'page');
[headerChatComposeContext, chatComposeContext].forEach((container) => container.addEventListener('click', (event) => {
  if (event.target.closest('[data-compose-cancel]')) resetComposerState(true);
}));
headerChatBotNew.addEventListener('click', newErgizDialog);
chatBotNew.addEventListener('click', newErgizDialog);
headerChatBotHistory.addEventListener('click', openErgizHistory);
chatBotHistory.addEventListener('click', openErgizHistory);

headerChatContactList.addEventListener('click', (event) => {
  const contactButton = event.target.closest('[data-header-chat-id]');
  if (!contactButton) return;
  event.stopPropagation();
  if (chatSelectionMode) {
    toggleSelectedChat(chatContacts.find((item) => item.id === contactButton.dataset.headerChatId));
    return;
  }
  activeChatId = contactButton.dataset.headerChatId;
  const contact = chatContacts.find((item) => item.id === activeChatId);
  if (contact) contact.unread = 0;
  resetComposerState(true);
  activeMessageMenu = { surface: null, messageId: null };
  renderHeaderChatContacts(headerChatSearch.value);
  renderChatContacts(chatSearch.value);
  renderActiveChat();
  setHeaderChatConversation(true);
});
document.addEventListener('click', (event) => {
  if (!document.body.classList.contains('header-chat-open')) return;
  const path = event.composedPath();
  if (path.includes(headerChatPopover) || path.includes(headerChatTrigger) || path.includes(chatActionOverlay) || event.target.closest('.chat-modal')) return;
  setHeaderChatPopover(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!chatActionOverlay.hidden) {
    closeChatActionOverlay();
    return;
  }
  if (!chatCreateModal.hidden) {
    closeChatCreateModal();
    return;
  }
  if (document.body.classList.contains('header-chat-open')) setHeaderChatPopover(false);
});

function renderChatContacts(filter = '') {
  const query = filter.trim().toLocaleLowerCase('ru');
  chatContactList.innerHTML = chatContacts
    .filter((contact) => contact.name.toLocaleLowerCase('ru').includes(query))
    .map((contact) => {
      const selectable = contact.kind !== 'bot' && contact.kind !== 'notifications';
      const selected = selectedChatIds.has(contact.id);
      const avatar = contact.kind === 'notifications'
        ? `<span class="chat-contact-avatar notification"><img src="${asset('chat-figma-bell.svg')}" alt=""></span>`
        : `<span class="chat-contact-avatar"><img src="${asset(contact.avatar)}" alt="">${contact.online ? '<i class="chat-online"></i>' : ''}</span>`;
      return `
      <button class="chat-contact${contact.id === activeChatId && !chatSelectionMode ? ' active' : ''}${contact.kind === 'bot' ? ' bot' : ''}${chatSelectionMode ? ' selecting' : ''}${selected ? ' selected' : ''}${chatSelectionMode && !selectable ? ' selection-disabled' : ''}" type="button" data-chat-id="${contact.id}"${chatSelectionMode ? ` aria-pressed="${selected}"` : ''}>
        ${chatSelectionMode ? `<span class="chat-select-circle">${selected ? '✓' : ''}</span>` : ''}
        ${avatar}
        <span class="chat-contact-copy">
          <span class="chat-contact-title-row"><strong>${escapeChatText(contact.name)}</strong>${contact.kind === 'bot' ? '<em>AI</em>' : ''}${contact.muted ? `<img src="${asset('chat-muted.svg')}" alt="Без звука">` : ''}</span>
          <span class="chat-contact-preview"><span>${escapeChatText(contact.last)}</span><time>${contact.time}</time>${contact.unread ? '<b class="chat-unread" aria-label="Непрочитанное сообщение"></b>' : ''}</span>
        </span>
      </button>`;
    }).join('');
}

function renderChatMessage(message, contact) {
  const author = message.author ? `<strong class="chat-author">${escapeChatText(message.author)}</strong>` : '';
  const reply = message.reply ? `<div class="chat-reply">${escapeChatText(typeof message.reply === 'string' ? message.reply : message.reply.text)}</div>` : '';
  const attachment = message.attachment ? `<img class="chat-attachment" src="${asset(message.attachment)}" alt="Вложение в чате">` : '';
  const attachmentCard = message.attachmentLabel ? `<div class="chat-file-card"><span>${message.attachmentKind === 'photo' ? '▧' : message.attachmentKind === 'poll' ? '☷' : '▤'}</span><b>${escapeChatText(message.attachmentLabel)}</b></div>` : '';
  const text = message.text ? `<p class="${message.link ? 'chat-link' : ''}">${escapeChatText(message.text)}</p>` : '';
  const avatar = message.own ? '' : `<img class="chat-message-avatar" src="${asset(contact.avatar)}" alt="">`;
  const reactions = chatReactionsMarkup(message);
  const menu = `<button class="chat-message-menu-trigger" type="button" data-chat-menu="${message.id}" aria-label="Действия с сообщением">•••</button>`;
  const statusAsset = message.status === 'sent' ? 'chat-sent.svg' : 'chat-read.svg';
  return `<div class="chat-message${message.own ? ' own' : ''}${message.selected ? ' pw-chat-selected' : ''}" data-chat-message-id="${message.id}" data-chat-surface="page">${avatar}<div class="chat-bubble${message.pinned ? ' is-pinned' : ''}">${message.forwarded ? '<small class="chat-forwarded">Переслано</small>' : ''}${author}${reply}${attachment}${attachmentCard}${text}${message.edited ? '<small class="chat-edited">изменено</small>' : ''}<span class="chat-message-time">${message.time}${message.own ? `<img src="${asset(statusAsset)}" alt="${message.status === 'sent' ? 'Отправлено' : 'Прочитано'}">` : ''}</span>${reactions ? `<div class="chat-reactions">${reactions}</div>` : ''}${menu}</div></div>`;
}

function renderActiveChat() {
  const contact = chatContacts.find((item) => item.id === activeChatId);
  chatConversation.classList.toggle('has-active', Boolean(contact));
  if (!contact) {
    chatMessages.innerHTML = '';
    return;
  }
  chatHeadAvatar.src = asset(contact.avatar);
  chatHeadTitle.textContent = contact.name;
  chatHeadStatus.textContent = contact.typing ? 'печатает…' : (contact.kind === 'bot' ? 'AI-помощник qollab' : (contact.members || (contact.online ? 'в сети' : 'был(а) недавно')));
  const isBot = contact.kind === 'bot';
  chatBotNew.hidden = !isBot;
  chatBotHistory.hidden = !isBot;
  chatMore.hidden = isBot;
  const pinned = contact.messages.filter((message) => message.pinned);
  const pinnedBar = pinned.length ? `<button class="chat-pinned-bar" type="button" data-chat-scroll-pin="${pinned[pinned.length - 1].id}"><span>📌</span><span><b>Закреплённое сообщение</b><small>${escapeChatText(pinned[pinned.length - 1].text || pinned[pinned.length - 1].attachmentLabel || 'Вложение')}</small></span><em>${pinned.length}</em></button>` : '';
  const prompts = isBot && contact.messages.filter((message) => message.own).length === 0
    ? `<div class="chat-ergiz-prompts">${ergizPrompts.map((prompt) => `<button type="button" data-ergiz-prompt="${escapeChatText(prompt)}">${escapeChatText(prompt)}</button>`).join('')}</div>`
    : '';
  const typing = contact.typing ? `<div class="chat-message"><img class="chat-message-avatar" src="${asset(contact.avatar)}" alt=""><div class="chat-bubble chat-typing"><i></i><i></i><i></i></div></div>` : '';
  const empty = contact.messages.length === 0 ? `<div class="chat-empty-state"><span>💬</span><b>Начните общение</b><small>Напишите первое сообщение в этом чате</small></div>` : '';
  chatMessages.innerHTML = `${pinnedBar}${contact.messages.length ? '<div class="chat-day">Сегодня</div>' : ''}${empty}${contact.messages.map((message) => renderChatMessage(message, contact)).join('')}${typing}${prompts}`;
  renderComposeContext('page');
}

chatContactList.addEventListener('click', (event) => {
  const contactButton = event.target.closest('[data-chat-id]');
  if (!contactButton) return;
  if (chatSelectionMode) {
    toggleSelectedChat(chatContacts.find((item) => item.id === contactButton.dataset.chatId));
    return;
  }
  activeChatId = contactButton.dataset.chatId;
  const contact = chatContacts.find((item) => item.id === activeChatId);
  if (contact) contact.unread = 0;
  resetComposerState(true);
  activeMessageMenu = { surface: null, messageId: null };
  renderChatContacts(chatSearch.value);
  renderActiveChat();
  chatsShell.classList.add('conversation-open');
});

chatSearch.addEventListener('input', () => renderChatContacts(chatSearch.value));
document.querySelector('#chatBack').addEventListener('click', () => {
  chatsShell.classList.remove('conversation-open');
  activeChatId = null;
  renderChatContacts(chatSearch.value);
  renderActiveChat();
});

chatComposer.addEventListener('submit', (event) => {
  event.preventDefault();
  sendChatMessage(chatMessageInput.value);
  chatMessageInput.focus();
});

[headerCreateMessage, chatCreateMessage].forEach((button) => button.addEventListener('click', () => setChatSelectionMode(!chatSelectionMode)));
[headerCreateGroup, chatCreateGroup].forEach((button) => button.addEventListener('click', () => openChatCreateModal(button)));
document.querySelectorAll('[data-chat-create-close]').forEach((button) => button.addEventListener('click', closeChatCreateModal));
chatCreateBack.addEventListener('click', () => {
  if (chatCreateStep === 'details') setChatCreateStep('members');
  else if (chatCreateStep === 'members') setChatCreateStep('search');
  else closeChatCreateModal();
});
chatCreateSearch.addEventListener('input', renderDirectChatDirectory);
chatCreateResults.addEventListener('click', (event) => {
  const row = event.target.closest('[data-chat-directory-id]');
  if (row) openDirectChat(row.dataset.chatDirectoryId);
});
chatStartGroup.addEventListener('click', () => setChatCreateStep('members'));
chatGroupSearch.addEventListener('input', renderGroupDirectory);
chatGroupResults.addEventListener('click', (event) => {
  const row = event.target.closest('[data-chat-group-member]');
  if (!row) return;
  const id = row.dataset.chatGroupMember;
  if (selectedGroupMembers.has(id)) selectedGroupMembers.delete(id);
  else selectedGroupMembers.add(id);
  renderGroupDirectory();
});
chatGroupSelected.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chat-group-remove]');
  if (!button) return;
  selectedGroupMembers.delete(button.dataset.chatGroupRemove);
  renderGroupDirectory();
});
chatGroupNext.addEventListener('click', () => {
  if (selectedGroupMembers.size >= 2) setChatCreateStep('details');
});
chatCreateName.addEventListener('input', renderGroupSummary);
chatCreateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  createGroupFromForm();
});
document.querySelectorAll('[data-chat-mark-read]').forEach((button) => button.addEventListener('click', () => {
  chatContacts.forEach((contact) => { contact.unread = 0; });
  setChatSelectionMode(false);
  updateChatViews();
  showChatToast('Все сообщения прочитаны');
}));
document.querySelectorAll('[data-chat-delete-selected]').forEach((button) => button.addEventListener('click', () => {
  if (!selectedChatIds.size) return;
  const removedIds = new Set(selectedChatIds);
  for (let index = chatContacts.length - 1; index >= 0; index -= 1) {
    if (removedIds.has(chatContacts[index].id)) chatContacts.splice(index, 1);
  }
  headerChatOrder = headerChatOrder.filter((id) => !removedIds.has(id));
  if (!chatContacts.some((contact) => contact.id === activeChatId)) activeChatId = chatContacts[0]?.id || '';
  setChatSelectionMode(false);
  updateChatViews();
  showChatToast('Выбранные чаты удалены');
}));

chatForwardList.addEventListener('click', (event) => {
  const targetButton = event.target.closest('[data-forward-chat]');
  if (!targetButton || !pendingForward) return;
  const target = chatContacts.find((contact) => contact.id === targetButton.dataset.forwardChat);
  if (!target) return;
  const forwarded = {
    id: `${target.id}-${++chatMessageUid}`,
    own: true,
    text: pendingForward.text || '',
    attachment: pendingForward.attachment,
    attachmentKind: pendingForward.attachmentKind,
    attachmentLabel: pendingForward.attachmentLabel,
    forwarded: true,
    time: chatTimeNow(), status: 'sent', reactions: [], pinned: false
  };
  target.messages.push(forwarded);
  target.last = forwarded.text || forwarded.attachmentLabel || 'Пересланное сообщение';
  target.time = forwarded.time;
  headerChatPreview[target.id] = { text: target.last };
  pendingForward = null;
  closeChatModals();
  updateChatViews();
  showChatToast(`Переслано: ${target.name}`);
});

chatHistoryList.addEventListener('click', (event) => {
  const dialog = event.target.closest('[data-ergiz-history]');
  if (!dialog) return;
  const ergiz = chatContacts.find((contact) => contact.kind === 'bot');
  const item = ergiz?.history[Number(dialog.dataset.ergizHistory)];
  closeChatModals();
  if (item) showChatToast(`Диалог «${item.title}» открыт`);
});

chatConfirmDelete.addEventListener('click', () => {
  if (!pendingDelete) return;
  const contact = chatContacts.find((item) => item.id === pendingDelete.contactId);
  if (contact) {
    contact.messages = contact.messages.filter((message) => message.id !== pendingDelete.messageId);
    const lastMessage = contact.messages[contact.messages.length - 1];
    contact.last = lastMessage?.text || lastMessage?.attachmentLabel || 'Нет сообщений';
    contact.time = lastMessage?.time || '';
    headerChatPreview[contact.id] = { text: contact.last };
  }
  if (chatComposerState.messageId === pendingDelete.messageId) resetComposerState(true);
  pendingDelete = null;
  closeChatModals();
  updateChatViews();
  showChatToast('Сообщение удалено');
});

document.querySelectorAll('[data-chat-modal-close]').forEach((button) => button.addEventListener('click', closeChatModals));
document.querySelectorAll('[data-chat-confirm-cancel]').forEach((button) => button.addEventListener('click', () => {
  pendingDelete = null;
  closeChatModals();
}));

[headerChatConversationInput, chatMessageInput].forEach((input) => input.addEventListener('input', () => {
  const form = input.closest('form');
  const submit = form.querySelector('.chat-submit-action');
  submit.classList.toggle('has-text', Boolean(input.value.trim()));
  submit.innerHTML = input.value.trim() ? '<span aria-hidden="true">➤</span>' : `<img src="${asset('chat-control-mic.svg')}" alt="">`;
}));

renderChatContacts();
renderActiveChat();
renderHeaderChatContacts();

const feedPage = document.querySelector('.feed');
const widgetsPage = document.querySelector('#widgetsPage');
const chatsPage = document.querySelector('#chatsPage');
const publicationPage = document.querySelector('#publicationPage');
const widgetsColumn = document.querySelector('.widgets-column');

function showPortalPage(pageName, options = {}) {
  if (!options.integration) bridge.onPage?.(pageName === 'home' ? 'feed' : 'portal');
  const showWidgets = pageName === 'widgets';
  const showChats = pageName === 'chats';
  const showPublication = pageName === 'publication';
  const showHome = !showWidgets && !showChats && !showPublication;
  feedPage.hidden = !showHome;
  widgetsColumn.hidden = !showHome;
  widgetsPage.hidden = !showWidgets;
  chatsPage.hidden = !showChats;
  publicationPage.hidden = !showPublication;
  document.querySelectorAll('[data-page]').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === pageName);
  });
  const sidebarHomeIcon = document.querySelector('.primary-nav [data-page="home"] img');
  const sidebarWidgetsIcon = document.querySelector('#widgetsTrigger img');
  const sidebarChatsIcon = document.querySelector('.primary-nav [data-page="chats"] .nav-icon-wrap img');
  const mobileHomeIcon = document.querySelector('.mobile-nav [data-page="home"] img');
  const mobileWidgetsIcon = document.querySelector('.mobile-widgets-trigger img');
  const mobileChatsIcon = document.querySelector('.mobile-nav [data-page="chats"] img');
  sidebarHomeIcon.src = asset(showHome ? 'home.svg' : 'home-inactive.svg');
  if (document.body.classList.contains('concept-v2')) {
    sidebarWidgetsIcon.src = asset('nav-widgets.svg');
    sidebarWidgetsIcon.classList.remove('v2-active-glyph');
  } else {
    sidebarWidgetsIcon.src = asset(showWidgets ? 'nav-widgets-active.svg' : 'nav-widgets.svg');
  }
  sidebarChatsIcon.src = asset(showChats ? 'chat-active.svg' : 'chat.svg');
  mobileHomeIcon.src = asset(showHome ? 'home.svg' : 'home-inactive.svg');
  mobileWidgetsIcon.src = asset(showWidgets ? 'nav-widgets-active.svg' : 'nav-widgets.svg');
  mobileChatsIcon.src = asset(showChats ? 'chat-active.svg' : 'chat.svg');
  if (window.innerWidth < 1200) setSidebar(false);
  if (showChats) {
    if (!options.preserveChat) {
      activeChatId = null;
      chatsShell.classList.remove('conversation-open');
      renderChatContacts(chatSearch.value);
    }
    renderActiveChat();
  }
  if (!options.integration) window.scrollTo({ top: 0, behavior: 'instant' });
}

document.querySelectorAll('[data-page]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPortalPage(link.dataset.page);
  });
});

postList.addEventListener('click', (event) => {
  const action = event.target.closest('[data-post-action]');
  const moreButton = event.target.closest('.post-more-button');
  const card = event.target.closest('.post-card');

  if (action && card) {
    event.preventDefault();
    event.stopPropagation();
    const publicationId = Number(card.dataset.publicationId);
    if (action.dataset.postAction === 'toggle-pin') {
      if (pinnedPublications.has(publicationId)) pinnedPublications.delete(publicationId);
      else pinnedPublications.add(publicationId);
      savePinnedPublications();
    }
    openPublicationMenu = null;
    renderPosts();
    return;
  }

  if (moreButton && card) {
    event.preventDefault();
    event.stopPropagation();
    const publicationId = Number(card.dataset.publicationId);
    const nextPublicationId = openPublicationMenu === publicationId ? null : publicationId;
    setOpenPublicationMenu(nextPublicationId, nextPublicationId !== null);
    return;
  }

  if (event.target.closest('.post-more-menu')) return;
  if (card) showPortalPage('publication');
});

postList.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openPublicationMenu !== null) {
    event.preventDefault();
    const publicationId = openPublicationMenu;
    setOpenPublicationMenu(null);
    postList.querySelector(`[data-publication-id="${publicationId}"] .post-more-button`)?.focus({ preventScroll: true });
    return;
  }
  if (event.target.closest('.post-more-wrap')) return;
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.post-card')) {
    event.preventDefault();
    showPortalPage('publication');
  }
});

document.addEventListener('click', (event) => {
  if (openPublicationMenu === null || event.target.closest('.post-more-wrap')) return;
  setOpenPublicationMenu(null);
});

document.querySelectorAll('[data-publication-back]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    showPortalPage('home');
  });
});

function saveWidgetOrder() {
  const order = [...widgetList.children].map((node) => node.dataset.widgetId);
  localStorage.setItem(widgetStorageKey, JSON.stringify(order));
}

function restoreWidgetOrder() {
  try {
    const order = JSON.parse(localStorage.getItem(widgetStorageKey));
    if (!Array.isArray(order)) return;
    order.forEach((id) => {
      const node = widgetList.querySelector(`[data-widget-id="${id}"]`);
      if (node) widgetList.append(node);
    });
  } catch (_) {
    localStorage.removeItem(widgetStorageKey);
  }
}

restoreWidgetOrder();
applyWidgetVisibility();

widgetList.querySelectorAll('.widget-card').forEach((card) => { card.draggable = false; });
let pointerState = null;

function moveDragGhost(event) {
  const { ghost, offsetX, offsetY } = pointerState;
  ghost.style.left = `${event.clientX - offsetX}px`;
  ghost.style.top = `${event.clientY - offsetY}px`;
}

function findDropTarget(x, y, currentCard) {
  for (const element of document.elementsFromPoint(x, y)) {
    const card = element.closest?.('.widget-card');
    if (card && card !== currentCard && card.parentElement === widgetList) return card;
  }
  return null;
}

function finishPointerDrag(event) {
  if (!pointerState || (event.pointerId !== undefined && pointerState.pointerId !== event.pointerId)) return;
  pointerState.card.classList.remove('drag-placeholder');
  pointerState.ghost.remove();
  document.body.classList.remove('widget-drag-active');
  pointerState = null;
  saveWidgetOrder();
}

document.addEventListener('pointerup', finishPointerDrag, true);
document.addEventListener('pointercancel', finishPointerDrag, true);

widgetList.querySelectorAll('.widget-title > img').forEach((handle) => {
  handle.draggable = false;
  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const card = handle.closest('.widget-card');
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.removeAttribute('data-widget-id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.append(ghost);
    pointerState = {
      card,
      ghost,
      handle,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    card.classList.add('drag-placeholder');
    document.body.classList.add('widget-drag-active');
    handle.setPointerCapture(event.pointerId);
    moveDragGhost(event);
    event.preventDefault();
  });
  handle.addEventListener('pointermove', (event) => {
    if (!pointerState || pointerState.pointerId !== event.pointerId) return;
    moveDragGhost(event);
    const target = findDropTarget(event.clientX, event.clientY, pointerState.card);
    if (target) {
      const box = target.getBoundingClientRect();
      widgetList.insertBefore(pointerState.card, event.clientY > box.top + box.height / 2 ? target.nextSibling : target);
    }
    const edge = 90;
    if (event.clientY < edge) window.scrollBy(0, -12);
    else if (event.clientY > window.innerHeight - edge) window.scrollBy(0, 12);
  });
});

const publicationSearch = root.querySelector('.searchbox');
publicationSearch.tabIndex = 0;
publicationSearch.setAttribute('aria-label', 'Поиск публикаций');
const expandPublicationSearch = () => {
  if (window.innerWidth > 991) return;
  root.classList.add('pw-search-open');
  publicationSearch.querySelector('input').focus();
};
publicationSearch.addEventListener('click', expandPublicationSearch);
publicationSearch.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target === publicationSearch) expandPublicationSearch();
  if (event.key === 'Escape') { root.classList.remove('pw-search-open'); publicationSearch.focus(); }
});
document.addEventListener('click', event => { if (!publicationSearch.contains(event.target)) root.classList.remove('pw-search-open'); });
publicationSearch.querySelector('input').addEventListener('input', event => bridge.onSearch?.(event.target.value));
root.addEventListener('click', event => {
  const channel = event.target.closest('.story, .channel-card');
  if (channel && channel.textContent.includes('ERG News')) { event.preventDefault(); bridge.onPage?.('channel'); }
});
root.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target.matches('.channel-card') && event.target.textContent.includes('ERG News')) { event.preventDefault(); bridge.onPage?.('channel'); }
});
if (new URLSearchParams(window.location.search).get('section') === 'chats') showPortalPage('chats', { integration: true });
return {
  selectPage(page) {
    root.classList.toggle('pw-channel-mode', page === 'channel');
    root.classList.toggle('pw-reader-mode', page === 'reader');
    if (page === 'portal') return;
    showPortalPage(page === 'reader' ? 'publication' : 'home', { integration: true });
    if (page !== 'reader') {
      switchFeedView('publications');
      root.querySelectorAll('.feed-tab').forEach(tab => { const selected = tab.dataset.tab === 'publications'; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); });
    }
  },
  setSearch(value) { root.querySelector('.searchbox input').value = value; },
  destroy() { abort.abort(); timers.forEach(realWindow.clearTimeout); frames.forEach(realWindow.cancelAnimationFrame); webMessageMenu.destroy(); root.replaceChildren(); }
};
}
