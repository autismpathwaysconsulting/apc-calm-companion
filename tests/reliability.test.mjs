import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { hasDeviceConsent, remainingSeconds, restoreViewFocus } from '../src/reliability.mjs';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
function section(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a);
  return source.slice(a, b);
}

test('storage consent safely handles absent and denied storage', () => {
  assert.equal(hasDeviceConsent(undefined), false);
  assert.equal(hasDeviceConsent({get localStorage() {throw new Error('denied');}}), false);
  assert.equal(hasDeviceConsent({localStorage: {getItem() {throw new Error('denied');}}}), false);
  assert.equal(hasDeviceConsent({localStorage: {getItem: () => null}}), false);
  assert.equal(hasDeviceConsent({localStorage: {getItem: () => 'yes'}}), true);
  assert.match(section('const [storageEnabled,', 'const [appNotice'), /hasDeviceConsent\(window\)/);
});

test('countdown uses elapsed time and clamps expiry at zero', () => {
  assert.equal(remainingSeconds(60000, 30000), 30);
  assert.equal(remainingSeconds(60000, 59999), 1);
  assert.equal(remainingSeconds(60000, 60000), 0);
  assert.equal(remainingSeconds(60000, 90000), 0);
});

test('actual timer handlers preserve pause duration, reconcile return, reset and restart', () => {
  let now = 0, tick, cleanup, remaining = 60, status = '';
  const events = new Map();
  const ctx = vm.createContext({remainingSeconds, timerRunning: false, timerMinutes: 1,
    timerDeadlineRef: {current: null}, timerPausedMsRef: {current: 60000},
    Date: {now: () => now},
    setTimerRunning: v => {ctx.timerRunning = v;}, setTimerRemaining: v => {remaining = v;},
    setTimerStatus: v => {status = v;}, setTimerMinutes: v => {ctx.timerMinutes = v;},
    window: {setInterval: f => {tick = f; return 1;}, clearInterval() {},
      addEventListener: (n, f) => events.set(n, f), removeEventListener: n => events.delete(n)},
    document: {addEventListener: (n, f) => events.set(n, f), removeEventListener: n => events.delete(n)}
  });
  vm.runInContext(section('  function toggleTimer()', '  function openFeedback'), ctx);
  vm.runInContext(section('  function resetTimer()', '  function saveNote'), ctx);
  vm.runInContext('toggleTimer()', ctx);
  cleanup = vm.runInContext(`(() => {${section('    if (!timerRunning) return;', '  }, [timerRunning]);')}})()`, ctx);
  now = 30500; tick(); assert.equal(remaining, 30);
  vm.runInContext('toggleTimer()', ctx); assert.equal(status, 'Timer paused.');
  assert.equal(ctx.timerPausedMsRef.current, 29500);
  now = 90000; tick(); assert.equal(remaining, 30);
  vm.runInContext('toggleTimer()', ctx); assert.equal(ctx.timerDeadlineRef.current, 119500);
  now = 100000; events.get('visibilitychange')(); assert.equal(remaining, 20);
  now = 120000; events.get('pageshow')(); assert.equal(remaining, 0);
  assert.equal(ctx.timerRunning, false); assert.equal(status, 'Timer finished.');
  vm.runInContext('toggleTimer()', ctx); assert.equal(remaining, 60);
  vm.runInContext('resetTimer()', ctx); assert.equal(ctx.timerDeadlineRef.current, null);
  assert.equal(remaining, 60); assert.equal(ctx.timerRunning, false);
  vm.runInContext('updateTimerMinutes(2)', ctx); assert.equal(remaining, 120);
  assert.equal(ctx.timerPausedMsRef.current, 120000);
  cleanup(); assert.equal(events.size, 0);
});

test('focus restoration prefers original visible trigger and handles replaced or hidden triggers', () => {
  const calls = [];
  const element = (name, connected, visible) => ({isConnected: connected,
    getClientRects: () => visible ? [{}] : [], focus: () => calls.push(name)});
  const fallback = element('fallback', true, true);
  restoreViewFocus(element('original', true, true), fallback);
  restoreViewFocus(element('removed', false, true), fallback);
  restoreViewFocus(element('hidden', true, false), fallback);
  restoreViewFocus(null, null);
  assert.deepEqual(calls, ['original', 'fallback', 'fallback']);
  assert.match(source, /id="calm-reset-title" tabIndex="-1"/);
  assert.match(source, /getElementById\("calm-reset-title"\)\?\.focus/);
  assert.match(section('  function closeFeedback()', '  function closeCommunicationBoard'), /restoreViewFocus\(feedbackTriggerRef.current, fallback\)/);
});

test('clearing denied storage reports failure without reloading or claiming success', () => {
  let notice = '', reloaded = false;
  const ctx = vm.createContext({setAppNotice: v => {notice = v;}, window: {
    confirm: () => true, localStorage: {removeItem() {throw new Error('denied');}},
    location: {reload: () => {reloaded = true;}}}});
  vm.runInContext(section('function resetSavedData()', '  function goToSection'), ctx);
  vm.runInContext('resetSavedData()', ctx);
  assert.equal(reloaded, false); assert.match(notice, /could not be cleared/);
});
