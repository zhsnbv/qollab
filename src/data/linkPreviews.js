// «Бэкенд» карточек внутренних ссылок — то, что в проде отдадут
// GET /mini_apps/v1/auth/{id}/preview и POST /chat/v1/channels/invite/preview
// (раздел 7 плана). Контракт держим минимальным ровно как там: только то, что
// нужно нарисовать карточку, без launch-полей, без ID канала и участников.

// source: catalog — приложение уже есть в гидратированном каталоге и сеть не
// нужна; endpoint — придётся сходить за preview.
export const previewMiniApps = {
  'mail-2': {
    names: { ru: 'Почта 2.0', kk: 'Пошта 2.0', en: 'Mail 2.0' },
    descriptions: {
      ru: 'Корпоративная почта',
      kk: 'Корпоративтік пошта',
      en: 'Corporate mail',
    },
    logo: '/img/svc2/mail.png',
    available: true,
    source: 'catalog',
  },
  mytasks: {
    names: { ru: 'Мои задачи', kk: 'Менің тапсырмаларым', en: 'My tasks' },
    descriptions: {
      ru: 'Управление списком рабочих дел и задач',
      kk: 'Жұмыс тапсырмаларын басқару',
      en: 'Manage your work items',
    },
    logo: '/img/svc2/task.png',
    available: true,
    source: 'catalog',
  },
  ticket: {
    names: { ru: 'Тикет система', kk: 'Тикет жүйесі', en: 'Ticket system' },
    descriptions: {
      ru: 'Учёт и обработка обращений',
      kk: 'Өтініштерді есепке алу',
      en: 'Track and process requests',
    },
    logo: '/img/svc2/ticket.png',
    available: true,
    source: 'endpoint',
  },
  // Существует, но недоступно этой аудитории — по плану это 403, и карточки
  // быть не должно: остаётся обычная ссылка.
  'hr-admin': { available: false, source: 'endpoint' },
};

// Приглашения. membership решает, что написано на кнопке: «Вступить» или
// «Открыть». state=invalid — отозванное или несуществующее приглашение:
// ни названия, ни аватарки не показываем.
export const previewInvites = {
  inv_7f3ac2: {
    state: 'active',
    membership: 'not_member',
    channel: { name: 'Команда продукта', members: 128, avatar: '/img/chats/qollab-group.png' },
  },
  inv_bts91d: {
    state: 'active',
    membership: 'member',
    channel: { name: 'BTS Digital', members: 860, avatar: '/img/posts/ch-bts-news.png' },
  },
  inv_expired: { state: 'invalid' },
};
