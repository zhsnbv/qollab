import test from 'node:test';
import assert from 'node:assert/strict';
import { createDelivery, remainingSeconds, restoreDelivery, sendSms } from './model.js';

test('countdown uses the sending deadline after suspension, without counting ticks', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  assert.equal(remainingSeconds(delivery.resendAt, 100_000), 30);
  assert.equal(remainingSeconds(delivery.resendAt, 118_200), 12);
  assert.equal(remainingSeconds(delivery.resendAt, 150_000), 0);
});
test('SMS fallback is blocked before the original deadline', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  assert.equal(sendSms(delivery, 129_999), delivery);
});
test('SMS fallback at the deadline changes channel and starts its own cooldown', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  const sms = sendSms(delivery, 130_000);
  assert.equal(sms.channel, 'sms');
  assert.equal(sms.sentAt, 130_000);
  assert.equal(remainingSeconds(sms.resendAt, 130_000), 30);
  assert.equal(sendSms(sms, 135_000), sms);
  assert.equal(sendSms(sms, 160_000).sentAt, 160_000);
});
test('reopening restores the original deadline, including an expired one', () => {
  const delivery = createDelivery('qollab', false, 100_000);
  const restored = restoreDelivery(JSON.stringify(delivery), 150_000);
  assert.deepEqual(restored, delivery);
  assert.equal(remainingSeconds(restored.resendAt, 150_000), 0);
});
test('invalid demo storage cannot create a false channel or extended cooldown', () => {
  for (const raw of [null, 'invalid', '{"channel":"email"}', '{"channel":"sms","sentAt":100000,"resendAt":999999}']) {
    assert.deepEqual(restoreDelivery(raw, 150_000), createDelivery('qollab', false, 150_000));
  }
});
