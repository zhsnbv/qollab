import test from 'node:test';
import assert from 'node:assert/strict';
import { createDelivery, remainingSeconds, restoreDelivery, sendSms, formatCountdown } from './model.js';

test('countdown uses the sending deadline after suspension, without counting ticks', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  assert.equal(remainingSeconds(delivery.resendAt, 100_000), 60);
  assert.equal(remainingSeconds(delivery.resendAt, 118_200), 42);
  assert.equal(remainingSeconds(delivery.resendAt, 170_000), 0);
});
test('SMS fallback is blocked before the original deadline', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  assert.equal(sendSms(delivery, 159_999), delivery);
});
test('SMS fallback at the deadline changes channel and starts its own cooldown', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  const sms = sendSms(delivery, 160_000);
  assert.equal(sms.channel, 'sms');
  assert.equal(sms.sentAt, 160_000);
  assert.equal(remainingSeconds(sms.resendAt, 160_000), 60);
  assert.equal(sendSms(sms, 165_000), sms);
  assert.equal(sendSms(sms, 220_000).sentAt, 220_000);
});
test('reopening restores the original deadline, including an expired one', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  const restored = restoreDelivery(JSON.stringify(delivery), 170_000);
  assert.deepEqual(restored, delivery);
  assert.equal(remainingSeconds(restored.resendAt, 170_000), 0);
});
test('minute boundary renders 01:00 and then 00:59, never 00:60', () => {
  assert.equal(formatCountdown(60), '01:00');
  assert.equal(formatCountdown(59), '00:59');
  assert.equal(formatCountdown(0), '00:00');
  assert.equal(formatCountdown(-2), '00:00');
});
test('a stored old 30-second cooldown cannot override the minute-long revision', () => {
  const old = {channel: 'qollab', sentAt: 100_000, resendAt: 130_000};
  assert.deepEqual(restoreDelivery(JSON.stringify(old), 110_000), createDelivery('qollab', false, 110_000));
});
test('invalid demo storage cannot create a false channel or extended cooldown', () => {
  for (const raw of [null, 'invalid', '{"channel":"email"}', '{"channel":"sms","sentAt":100000,"resendAt":999999}']) {
    assert.deepEqual(restoreDelivery(raw, 150_000), createDelivery('qollab', false, 150_000));
  }
});
