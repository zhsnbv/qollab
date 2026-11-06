export const ME = 'me';
export const GROUP = 'PR01DEV + ROBOTS';
export const PEOPLE = {
  me: { id: 'me', name: 'Руслан Ж.', avatar: '/img/chats/daniyar.png' },
  aidar: { id: 'aidar', name: 'Айдар Султабек', avatar: '/img/threads/aidar.png' },
  ayazhan: { id: 'ayazhan', name: 'Аяжан Даркеева', avatar: '/img/threads/replier-b.png' },
  arman: { id: 'arman', name: 'Арман А.', avatar: '/img/threads/replier-a.png' },
};

export const THREAD_STAGES = ['Вход и создание', 'Ответы и отправка', 'Возврат в группу', 'Мои ветки', 'Дополнительные состояния', 'Удаление сообщений'];
// Every state is a distinct frame in both the review board and /all.
export const THREAD_CASES = [
  ['chats', 'Чаты · непрочитанные ветки', 0, 'Закреплённая строка «Ветки», бейдж считает обсуждения, а не ответы.', '21267:70055'],
  ['group', 'Группа · корневое сообщение', 0, 'Долгое нажатие открывает меню сообщения и реакции.', '21294:80533'],
  ['create-menu', 'Ответить в ветке', 0, 'Пункт появляется только у сообщения без ответов.', '21294:80275'],
  ['thread-empty', 'Новая ветка', 0, 'Корень с реакциями, разделитель и свой композер.', '21294:79710'],
  ['compose-empty', 'Ввод · пустое поле', 1, 'Поле готово к вводу. Галочка отправки в группу выключена.', '21294:78501'],
  ['compose', 'Ответ только в ветку', 1, 'Текст введён, отправка доступна.', '21294:79545'],
  ['compose-group', 'Ответ в ветку и группу', 1, 'Отмечена галочка «Отправить в группу».', '21294:79973'],
  ['sending', 'Ответ отправляется', 1, 'Сообщение сразу в переписке, часы сменяются галочкой после отправки.'],
  ['sent-private', 'Отправлено только в ветку', 1, 'Ответ не появляется в общей ленте.'],
  ['sent-group', 'Отправлено также в группу', 1, 'На своём ответе появляется метка.', '21294:80119'],
  ['incoming', 'Новый ответ участника', 1, 'Чужой ответ в том же обсуждении, без вложенных веток.', '21315:67487'],
  ['thread', 'Ветка · полная история', 1, 'Полная история и композер закреплённый внизу.', '21315:72670'],
  ['group-replies', 'Ответы в общей ленте', 2, 'Свои и чужие дубли в хронологическом порядке, ссылка ведёт в ветку.', '21289:66293'],
  ['view-menu', 'Просмотр ветки', 2, 'Заменяет «Ответить в ветке», не добавляется рядом.', '21315:72261'],
  ['group-unread', 'Новые ответы в группе', 2, 'Строку ответов видят все. Число новых ответов — отдельный бейдж.'],
  ['group-read', 'Ответы прочитаны', 2, 'После открытия ветки бейдж исчезает, общее число ответов остаётся.'],
  ['threads', 'Ветки · все мои обсуждения', 3, 'Глобальный список из разных групп с последним ответом.', '21319:67410'],
  ['list-menu', 'Меню превью ветки', 3, 'Долгое нажатие: реакции, переход в группу, пересылка и выбор.', '21319:68035'],
  ['list-empty', 'Пока нет веток', 3, 'Объясняем три способа попадания в список.'],
  ['participant-author', 'Участие · автор корня', 3, 'Кто-то ответил на ваше сообщение — ветка в списке.'],
  ['participant-reply', 'Участие · мой ответ', 3, 'Первый ответ автоматически добавляет ветку.'],
  ['participant-mention', 'Участие · упоминание', 3, 'Упомянули в ответе — ветка добавляется без вашего сообщения.'],
  ['visitor', 'Чужая ветка · просмотр', 3, 'Можно открыть из группы. Просмотр не добавляет в личный список.'],
  ['list-read', 'Ветки · всё прочитано', 3, 'Бейджей нет, история обсуждений сохраняется.'],
  ['forward', 'Переслать ветку', 3, 'Общий экран «Выберите чат»: активные чаты и поиск получателя.'],
  ['select', 'Выбор обсуждений', 3, 'Выбор нескольких превью, затем пересылка.'],
  ['long-title', 'Длинный корень и название', 4, 'Заголовок сокращён; полный текст корня остаётся в истории.'],
  ['loading', 'Загрузка веток', 4, 'Скелетон сохраняет структуру списка.'],
  ['error', 'Не удалось загрузить', 4, 'Повторная попытка возвращает список.'],
  ['send-error', 'Не удалось отправить', 4, 'Сообщение остаётся в переписке; значок справа открывает действия.'],
  ['send-error-dialog', 'Ошибка · повторить или удалить', 4, 'Причина ошибки и действия с конкретным сообщением.'],
  ['direct-menu', 'Личный чат · без веток', 4, 'У direct-канала нет пункта ветки.'],
  ['bot-menu', 'Бот · без веток', 4, 'У bot-канала нет пункта ветки.'],
  ['private-group', 'Закрытая группа · ветки доступны', 4, 'Те же действия, что в открытой группе.'],
  ['delete-root', 'Удаление корневого сообщения', 5, 'Зажмите своё исходное сообщение с ответом и выберите «Удалить».'],
  ['deleted-root-group', 'Удалённый корень в группе', 5, 'На месте корня остаётся отметка «Сообщение удалено». Строка ответов открывает обсуждение.'],
  ['deleted-root-list', 'Ветка в списке после удаления корня', 5, 'В превью виден последний ответ. Цитата корня показывает отметку об удалении.'],
  ['deleted-root-thread', 'Удаление последнего ответа', 5, 'Зажмите последний ответ и подтвердите удаление. Ветка закроется.'],
  ['closed-thread', 'Группа после закрытия ветки', 5, 'В истории группы остаётся отметка об удалении. Обсуждение исчезает из списка веток.'],
  ['deleted-root-other-group', 'Чужой удалённый корень в группе', 5, 'Айдар удалил своё сообщение. Из серого бабла и из цитат в обоих ответах можно открыть ветку.'],
  ['deleted-root-other-thread', 'Ветка Айдара после удаления корня', 5, 'На месте корня видны имя Айдара и отметка об удалении. Свой ответ и ответ Аяжан остаются в обсуждении.'],
].map(([id, title, stage, note, figmaNode]) => ({ id, title, stage, note, figmaNode }));

export const DELETED_MESSAGE = 'Сообщение удалено';
export function rootLabel(thread) { return thread.rootDeleted ? DELETED_MESSAGE : thread.title; }
export function canThread(type) { return type === 'open_group' || type === 'private_group'; }
export function confirmedReplies(thread) {
  return thread.status === 'closed' ? [] : thread.replies.filter(r => r.status !== 'sending' && r.status !== 'failed');
}
export function participates(thread, userId = ME) {
  const replies = confirmedReplies(thread);
  return replies.length > 0 && (thread.author === userId || thread.pastParticipants?.includes(userId) || replies.some(r => r.author === userId || r.mentions?.includes(userId)));
}
export function myThreads(threads) { return threads.filter(t => participates(t)).sort((a, b) => b.updated - a.updated); }
export function unreadThreads(threads) { return myThreads(threads).filter(t => t.unread > 0).length; }
export function channelReplies(thread) { return confirmedReplies(thread).filter(r => r.showInChannel); }
export function markRead(thread) { return { ...thread, unread: 0 }; }
export function addReply(thread, { id, text, showInChannel = false, author = ME, mentions = [], time = '12:49', updated = Date.now(), status = 'sent' }) {
  if (thread.status === 'closed' || !canThread(thread.channelType) || !text.trim() || thread.replies.some(r => r.id === id)) return thread;
  const confirmed = status !== 'sending' && status !== 'failed';
  return { ...thread, updated: confirmed ? Math.max(thread.updated + 1, updated) : thread.updated, unread: confirmed ? (author === ME ? 0 : thread.unread + 1) : thread.unread,
    replies: [...thread.replies, { id, text: text.trim(), author, mentions, showInChannel, time, status }] };
}

// Delivery changes the existing local message; retries never append a copy.
export function setReplyStatus(thread, id, status, updated = Date.now()) {
  const reply = thread.replies.find(r => r.id === id);
  const allowed = { sending: ['sent', 'failed'], failed: ['sending'] };
  if (thread.status === 'closed' || !reply || !allowed[reply.status]?.includes(status)) return thread;
  return { ...thread, updated: status === 'sent' ? Math.max(thread.updated + 1, updated) : thread.updated,
    unread: status === 'sent' && reply.author === ME ? 0 : thread.unread,
    replies: thread.replies.map(r => r.id === id ? { ...r, status } : r) };
}
export function deleteFailedReply(thread, id) {
  return { ...thread, replies: thread.replies.filter(r => r.id !== id || r.status !== 'failed') };
}

function closeIfEmpty(thread) {
  if (thread.rootDeleted && confirmedReplies(thread).length === 0) {
    return { ...thread, status: 'closed', replies: [], unread: 0 };
  }
  return thread;
}

export function deleteThreadMessage(thread, messageId) {
  if (thread.status === 'closed') return thread;
  if (messageId === thread.id) {
    if (thread.rootDeleted) return thread;
    return closeIfEmpty({ ...thread, rootDeleted: true, title: '' });
  }
  const reply = thread.replies.find(item => item.id === messageId);
  if (!reply) return thread;
  const confirmed = confirmedReplies(thread);
  const index = confirmed.findIndex(item => item.id === messageId);
  const wasUnread = index >= 0 && index >= confirmed.length - thread.unread;
  const pastParticipants = new Set(thread.pastParticipants);
  if (index >= 0) {
    pastParticipants.add(reply.author);
    for (const user of reply.mentions || []) pastParticipants.add(user);
  }
  return closeIfEmpty({
    ...thread,
    replies: thread.replies.filter(item => item.id !== messageId),
    unread: thread.unread - Number(wasUnread),
    pastParticipants: [...pastParticipants],
  });
}

export function initialThreads(caseId) {
  const empty = ['group', 'create-menu', 'thread-empty', 'compose-empty', 'compose', 'compose-group', 'private-group'].includes(caseId);
  const t = { id: 'memes', title: '🤪 Мемы и оффтоп', author: 'aidar', group: GROUP, channelType: 'open_group', unread: 2, updated: 30,
    replies: [
      { id: 'r1', author: ME, text: 'Да ты чё! Базару нет!', showInChannel: true, time: '10:15' },
      { id: 'r2', author: 'ayazhan', text: 'Прикольно! А как свою ветку создать?', showInChannel: true, time: '10:16' },
      { id: 'r3', author: 'arman', text: 'Зажми сообщение и выбери «Ответить в ветке» 👌', showInChannel: false, time: '10:18' },
    ] };
  if (empty) { t.replies = []; t.unread = 0; }
  if (caseId === 'sent-private') t.replies = [{ ...t.replies[0], showInChannel: false }];
  if (caseId === 'sent-group') t.replies = [t.replies[0]];
  if (caseId === 'incoming') t.replies = t.replies.slice(0, 2);
  if (caseId === 'sending') t.replies = [{ ...t.replies[0], id: 'demo-pending', status: 'sending' }];
  if (caseId === 'send-error' || caseId === 'send-error-dialog') t.replies.push({ id: 'demo-failed', author: ME, text: 'Да, проверю макеты сегодня.', showInChannel: false, time: '12:49', status: 'failed' });
  if (caseId === 'sent-private' || caseId === 'sent-group') t.replies[0].status = 'sent';
  if (caseId === 'visitor') t.replies = t.replies.filter(r => r.author !== ME);
  if (caseId === 'participant-author') { t.author = ME; t.replies = t.replies.filter(r => r.author !== ME); }
  if (caseId === 'participant-mention') t.replies = [{ ...t.replies[1], text: '@Руслан Ж. посмотри, пожалуйста, эту ветку.', mentions: [ME] }];
  if (caseId === 'long-title') { t.title = '📅 Подготовка квартального отчёта: сроки, ответственные и согласование материалов для презентации'; t.group = 'Рабочая группа по развитию корпоративных сервисов'; }
  if (caseId === 'direct-menu') t.channelType = 'direct';
  if (caseId === 'bot-menu') t.channelType = 'bot';
  if (caseId === 'private-group') t.channelType = 'private_group';
  if (['thread-empty', 'compose-empty', 'compose', 'compose-group', 'sending', 'sent-private', 'sent-group', 'incoming', 'thread', 'visitor', 'long-title', 'send-error', 'send-error-dialog'].includes(caseId)) t.unread = 0;
  if (!canThread(t.channelType)) { t.replies = []; t.unread = 0; }
  t.unread = Math.min(t.unread, t.replies.length);
  const other = { id: 'design', title: '🎨 Макеты нового релиза', author: ME, group: 'Дизайн-команда', channelType: 'private_group', unread: 1, updated: 20, replies: [{ id: 'd1', author: 'ayazhan', text: 'Посмотрела, можно передавать в разработку', showInChannel: false, time: '09:42' }] };
  const third = { id: 'release', title: '🚀 План релиза на пятницу', author: 'arman', group: 'Qollab · Продукт', channelType: 'open_group', unread: 0, updated: 10, replies: [{ id: 'p1', author: 'ayazhan', text: '@Руслан Ж. нужен финальный макет', mentions: [ME], showInChannel: false, time: 'Вчера' }] };
  const all = [t, other, third];
  if (THREAD_CASES.some(item => item.id === caseId && item.stage === 5)) {
    const otherAuthor = ['deleted-root-other-group', 'deleted-root-other-thread'].includes(caseId);
    const original = { ...t, author: otherAuthor ? t.author : ME, unread: 0, replies: t.replies.slice(0, otherAuthor ? 2 : 1) };
    let example = caseId === 'delete-root' ? original : deleteThreadMessage(original, original.id);
    if (caseId === 'closed-thread') example = deleteThreadMessage(example, 'r1');
    return [example, other, third];
  }
  if (['group-read', 'list-read'].includes(caseId)) return all.map(markRead);
  if (caseId.startsWith('participant-')) return [t];
  if (caseId === 'list-empty') return [{ ...t, author: 'aidar', replies: t.replies.filter(r => r.author !== ME).map(r => ({ ...r, mentions: [] })) }];
  return all;
}
