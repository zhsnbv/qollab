// Isolated QM-2557 demo. No calls to the production auth API or auth storage.
export const COOLDOWN_MS = 30_000;
export const SESSION_KEY = 'qollab.qm2557.review.v1';

export function remainingSeconds(resendAt, now = Date.now()) {
  return Math.max(0, Math.ceil((resendAt - now) / 1000));
}

export function createDelivery(channel = 'qollab', ready = false, now = Date.now()) {
  return { channel, sentAt: ready ? now - COOLDOWN_MS : now, resendAt: ready ? now : now + COOLDOWN_MS };
}

export function sendSms(delivery, now = Date.now()) {
  // A disabled button is insufficient protection: guard the action as well.
  if (remainingSeconds(delivery.resendAt, now) > 0) return delivery;
  return createDelivery('sms', false, now);
}

export function restoreDelivery(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (['qollab', 'sms'].includes(value?.channel)
      && Number.isFinite(value.sentAt) && Number.isFinite(value.resendAt)
      && value.resendAt - value.sentAt === COOLDOWN_MS
      && value.sentAt <= now) return value;
  } catch { /* Ignore invalid or unavailable demo storage. */ }
  return createDelivery('qollab', false, now);
}

export const copy = {
  ru: {
    auth: 'Авторизация', back: 'Назад', title: 'Введите код подтверждения',
    qollab: 'Код отправлен в Qollab. Откройте приложение или веб-версию, где вы уже вошли, и перейдите в «Уведомления».',
    sms: 'Придёт в SMS на номер',
    qollabWait: 'Нет доступа? Отправить SMS через', qollabReady: 'Нет доступа? Отправить SMS',
    smsWait: 'Запросить новый код можно через', smsReady: 'Запросить новый код',
    code: 'Код подтверждения', invalid: 'Неверный код. Попробуйте ещё раз.',
    success: 'Код подтверждён', successText: 'В приложении после этого шага вы войдёте в Qollab.',
    return: 'Вернуться к экрану',
  },
  kk: {
    auth: 'Авторизация', back: 'Артқа', title: 'Растау кодын енгізіңіз',
    qollab: 'Qollab-қа код жіберілді. Сіз бұрын кірген қолданбаны немесе веб-нұсқаны ашып, «Хабарландырулар» бөліміне өтіңіз.',
    sms: 'Нөмірге SMS арқылы келеді',
    qollabWait: 'Кіру мүмкін емес пе? SMS жіберуге дейін', qollabReady: 'Кіру мүмкін емес пе? SMS жіберу',
    smsWait: 'Жаңа кодты сұрауға дейін', smsReady: 'Жаңа код сұрау',
    code: 'Растау коды', invalid: 'Код қате. Қайтадан көріңіз.',
    success: 'Код расталды', successText: 'Қолданбада осы қадамнан кейін Qollab-қа кіресіз.',
    return: 'Экранға оралу',
  },
};
