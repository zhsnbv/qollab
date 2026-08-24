// Карточка человека для объединённого профиля: переписка приходит из
// chatProfiles, рабочие данные — из справочника сотрудников. Собираем в одном
// месте, чтобы экран не знал, из какого источника взялось конкретное поле.
import { userProfiles } from './chatProfiles';
import { employees } from './employees';
import { structure } from './profile';

// Рабочие статусы: приходили бы из HR и настроек уведомлений. В прототипе
// проставлены двум людям, чтобы видеть оба варианта.
const WORK_STATUS = {
  arman: { kind: 'vacation', text: 'В отпуске до 3 сентября', note: 'Замещает', deputy: 'Кульманов Данияр' },
  madina: { kind: 'dnd', text: 'Не беспокоить', note: 'Ответит после 18:00' },
};

// Корпоративные данные в прототипе общие: на макете это блок из HR-системы,
// а не то, что человек заполняет сам.
const CORP = {
  tabNumber: '16002874',
  company: 'ТОО «BTS»',
  unit: 'Управление продуктовой разработки',
  chief: structure.supervisor.name,
};

// Собеседник приходит либо как id известного профиля, либо строкой справочника
// (тогда переписки с ним ещё нет и счётчики нулевые).
export function getPerson(id, employee) {
  const base = userProfiles[id] || (employee && {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    phone: employee.phone,
    avatar: employee.avatar,
    initials: employee.initials,
    tint: employee.tint,
    status: employee.dismissed ? 'Сотрудник уволен' : 'был(-а) в сети недавно',
    groups: [], media: [], files: [], links: [],
  }) || userProfiles.ayazhan;

  const fromDirectory = employees.find((e) => e.id === base.id || e.name === base.name);

  return {
    ...CORP,
    ...base,
    company: fromDirectory?.company || CORP.company,
    thanks: 21,
    interests: ['Баскетбол', 'Кино', 'Музыка', 'Путешествия'],
    work: WORK_STATUS[base.id] || null,
    dismissed: !!employee?.dismissed,
    team: structure.team,
    supervisor: structure.supervisor,
  };
}
