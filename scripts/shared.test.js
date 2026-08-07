const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const MODE_FOCUS = "focus";
const MODE_BREAK = "break";
const STATUS_IDLE = "idle";
const STATUS_RUNNING = "running";
const STATUS_PAUSED = "paused";

const sharedPath = path.join(__dirname, "..", "shared.js");
const code = fs.readFileSync(sharedPath, "utf8");
const context = {};

vm.createContext(context);
vm.runInContext(code, context);

const productionDurations = context.getDurations("1.0.0", false);
assert.strictEqual(productionDurations.focusMs, 1500000);
assert.strictEqual(productionDurations.breakMs, 300000);

const devDurations = context.getDurations("1.0.0-dev", false);
assert.strictEqual(devDurations.focusMs, 3000);
assert.strictEqual(devDurations.breakMs, 1000);

const shortDurations = context.getDurations("1.0.0", true);
assert.strictEqual(shortDurations.focusMs, 3000);

assert.strictEqual(context.formatMs(1500000), "25:00");
assert.strictEqual(context.formatMs(300000), "05:00");
assert.strictEqual(context.formatMs(61000), "01:01");
assert.strictEqual(context.formatMs(999), "00:01");
assert.strictEqual(context.formatMs(0), "00:00");

const nowMs = Date.parse("2026-08-07T12:34:56");
assert.strictEqual(context.getLocalDateString(nowMs), "2026-08-07");

const defaultTimer = context.createDefaultTimer(MODE_FOCUS, productionDurations);
assert.strictEqual(defaultTimer.mode, MODE_FOCUS);
assert.strictEqual(defaultTimer.status, STATUS_IDLE);
assert.strictEqual(defaultTimer.durationMs, 1500000);
assert.strictEqual(defaultTimer.remainingMs, 1500000);
assert.strictEqual(defaultTimer.endAt, null);

const runningTimer = context.applyStart(defaultTimer, nowMs);
assert.strictEqual(runningTimer.status, STATUS_RUNNING);
assert.strictEqual(runningTimer.endAt, nowMs + 1500000);
assert.strictEqual(context.deriveRemaining(runningTimer, nowMs + 60000), 1440000);

const pausedTimer = context.applyPause(runningTimer, nowMs + 60000);
assert.strictEqual(pausedTimer.status, STATUS_PAUSED);
assert.strictEqual(pausedTimer.remainingMs, 1440000);
assert.strictEqual(pausedTimer.endAt, null);

const continuedTimer = context.applyContinue(pausedTimer, nowMs + 120000);
assert.strictEqual(continuedTimer.status, STATUS_RUNNING);
assert.strictEqual(continuedTimer.endAt, nowMs + 120000 + 1440000);

const resetTimer = context.applyReset(continuedTimer, productionDurations);
assert.strictEqual(resetTimer.status, STATUS_IDLE);
assert.strictEqual(resetTimer.remainingMs, 1500000);

const daily = context.createDefaultDaily(nowMs);
assert.strictEqual(daily.date, "2026-08-07");
assert.strictEqual(daily.completedFocusSessions, 0);

const nextDayDaily = context.reconcileDaily(daily, Date.parse("2026-08-08T01:00:00"));
assert.strictEqual(nextDayDaily.date, "2026-08-08");
assert.strictEqual(nextDayDaily.completedFocusSessions, 0);

const focusComplete = context.applyComplete(
  context.createDefaultTimer(MODE_FOCUS, productionDurations),
  daily,
  nowMs,
  productionDurations,
);
assert.strictEqual(focusComplete.timer.mode, MODE_BREAK);
assert.strictEqual(focusComplete.timer.status, STATUS_IDLE);
assert.strictEqual(focusComplete.daily.completedFocusSessions, 1);
assert.strictEqual(focusComplete.notification.title, "Focus session complete.");

const breakComplete = context.applyComplete(
  context.createDefaultTimer(MODE_BREAK, productionDurations),
  focusComplete.daily,
  nowMs,
  productionDurations,
);
assert.strictEqual(breakComplete.timer.mode, MODE_FOCUS);
assert.strictEqual(breakComplete.daily.completedFocusSessions, 1);

assert.strictEqual(context.getPrimaryActionLabel(defaultTimer), "Start");
assert.strictEqual(
  context.getPrimaryActionLabel(context.createDefaultTimer(MODE_BREAK, productionDurations)),
  "Start break",
);
assert.strictEqual(
  context.getPrimaryActionLabel(Object.assign({}, defaultTimer, { status: STATUS_RUNNING })),
  "Pause",
);
assert.strictEqual(
  context.getPrimaryActionLabel(Object.assign({}, defaultTimer, { status: STATUS_PAUSED })),
  "Continue",
);

const expiredRunning = {
  mode: MODE_FOCUS,
  status: STATUS_RUNNING,
  durationMs: 1500000,
  remainingMs: 0,
  endAt: nowMs - 1000,
  completionId: null,
};
assert.strictEqual(context.isTimerExpired(expiredRunning, nowMs), true);

const invalidTimer = context.validateTimerState({ mode: "invalid" }, productionDurations);
assert.strictEqual(invalidTimer.ok, false);

const switched = context.applySwitchMode(defaultTimer, MODE_BREAK, productionDurations);
assert.strictEqual(switched.mode, MODE_BREAK);
assert.strictEqual(switched.durationMs, 300000);

assert.strictEqual(context.shouldNotifyCompletion("abc", "abc"), false);
assert.strictEqual(context.shouldNotifyCompletion("abc", "def"), true);
assert.strictEqual(context.shouldNotifyCompletion(null, null), false);

console.log("shared.test.js passed");
