importScripts("shared.js");

const LAST_NOTIFIED_KEY = "realpomodoro.lastNotifiedCompletionId";

let manifestVersion = "1.0.0";
let durations = getDurations(manifestVersion);

function refreshDurations() {
  manifestVersion = chrome.runtime.getManifest().version;
  durations = getDurations(manifestVersion);
}

async function readStorage() {
  const result = await chrome.storage.local.get([
    STORAGE_KEY_SCHEMA_VERSION,
    STORAGE_KEY_TIMER,
    STORAGE_KEY_DAILY,
    LAST_NOTIFIED_KEY,
  ]);

  const nowMs = Date.now();
  let timer = createDefaultTimer(TIMER_MODE_FOCUS, durations);
  let daily = createDefaultDaily(nowMs);

  const timerValidation = validateTimerState(result[STORAGE_KEY_TIMER], durations);
  if (timerValidation.ok) {
    timer = timerValidation.timer;
  }

  const dailyValidation = validateDailyState(result[STORAGE_KEY_DAILY], nowMs);
  if (dailyValidation.ok) {
    daily = dailyValidation.daily;
  }

  daily = reconcileDaily(daily, nowMs);

  return {
    timer: timer,
    daily: daily,
    lastNotifiedCompletionId: result[LAST_NOTIFIED_KEY] || null,
  };
}

async function writeStorage(timer, daily, lastNotifiedCompletionId) {
  const payload = {
    [STORAGE_KEY_SCHEMA_VERSION]: SCHEMA_VERSION,
    [STORAGE_KEY_TIMER]: timer,
    [STORAGE_KEY_DAILY]: daily,
  };

  if (lastNotifiedCompletionId !== undefined) {
    payload[LAST_NOTIFIED_KEY] = lastNotifiedCompletionId;
  }

  await chrome.storage.local.set(payload);
}

async function clearTimerAlarm() {
  await chrome.alarms.clear(ALARM_NAME);
}

async function scheduleTimerAlarm(endAtMs) {
  await clearTimerAlarm();
  await chrome.alarms.create(ALARM_NAME, buildAlarmScheduleAt(endAtMs));
}

async function syncAlarmForTimer(timer) {
  if (timer.status === TIMER_STATUS_RUNNING && timer.endAt !== null) {
    await scheduleTimerAlarm(timer.endAt);
    return;
  }
  await clearTimerAlarm();
}

async function showCompletionNotification(notification, completionId, lastNotifiedCompletionId) {
  if (!shouldNotifyCompletion(completionId, lastNotifiedCompletionId)) {
    return lastNotifiedCompletionId;
  }

  await chrome.notifications.create(`realpomodoro-${completionId}`, {
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: notification.title,
    message: notification.body,
    priority: 1,
  });

  return completionId;
}

async function completeTimer(timer, daily, nowMs, lastNotifiedCompletionId) {
  const result = applyComplete(timer, daily, nowMs, durations);
  const nextNotifiedId = await showCompletionNotification(
    result.notification,
    result.completionId,
    lastNotifiedCompletionId,
  );

  await clearTimerAlarm();
  await writeStorage(result.timer, result.daily, nextNotifiedId);
  broadcastState(result.timer, result.daily, nowMs);

  return {
    timer: result.timer,
    daily: result.daily,
    lastNotifiedCompletionId: nextNotifiedId,
  };
}

async function reconcileOnStartup() {
  refreshDurations();
  const state = await readStorage();
  const nowMs = Date.now();
  let timer = state.timer;
  let daily = reconcileDaily(state.daily, nowMs);
  let lastNotifiedCompletionId = state.lastNotifiedCompletionId;

  if (isTimerExpired(timer, nowMs)) {
    const completed = await completeTimer(timer, daily, nowMs, lastNotifiedCompletionId);
    return completed;
  }

  if (timer.status === TIMER_STATUS_RUNNING && timer.endAt !== null) {
    const existingAlarms = await chrome.alarms.getAll();
    const hasTimerAlarm = existingAlarms.some(function hasAlarm(alarm) {
      return alarm.name === ALARM_NAME;
    });
    if (!hasTimerAlarm) {
      await scheduleTimerAlarm(timer.endAt);
    }
  } else {
    await clearTimerAlarm();
  }

  if (daily.date !== state.daily.date) {
    await writeStorage(timer, daily, lastNotifiedCompletionId);
  }

  return {
    timer: timer,
    daily: daily,
    lastNotifiedCompletionId: lastNotifiedCompletionId,
  };
}

function buildPublicState(timer, daily, nowMs) {
  return {
    timer: timer,
    daily: daily,
    displayRemainingMs: deriveRemaining(timer, nowMs),
    progress: getProgressFraction(timer, nowMs),
    primaryActionLabel: getPrimaryActionLabel(timer),
    modeLabel: getModeLabel(timer.mode),
    durations: durations,
  };
}

function broadcastState(timer, daily, nowMs) {
  const payload = buildPublicState(timer, daily, nowMs);
  chrome.runtime.sendMessage({
    type: "STATE_UPDATED",
    state: payload,
  }).catch(function ignoreNoListeners() {
    // Popup may be closed.
  });
}

async function persistAndBroadcast(timer, daily, lastNotifiedCompletionId) {
  await syncAlarmForTimer(timer);
  await writeStorage(timer, daily, lastNotifiedCompletionId);
  broadcastState(timer, daily, Date.now());
}

async function handleStart() {
  const state = await readStorage();
  const nowMs = Date.now();
  let timer = state.timer;

  if (timer.status === TIMER_STATUS_IDLE) {
    timer = applyStart(timer, nowMs);
  } else if (timer.status === TIMER_STATUS_PAUSED) {
    timer = applyContinue(timer, nowMs);
  }

  await persistAndBroadcast(timer, state.daily, state.lastNotifiedCompletionId);
}

async function handlePause() {
  const state = await readStorage();
  const timer = applyPause(state.timer, Date.now());
  await persistAndBroadcast(timer, state.daily, state.lastNotifiedCompletionId);
}

async function handleContinue() {
  const state = await readStorage();
  const timer = applyContinue(state.timer, Date.now());
  await persistAndBroadcast(timer, state.daily, state.lastNotifiedCompletionId);
}

async function handleReset() {
  const state = await readStorage();
  const timer = applyReset(state.timer, durations);
  await persistAndBroadcast(timer, state.daily, state.lastNotifiedCompletionId);
}

async function handleSwitchMode(nextMode) {
  const state = await readStorage();
  const timer = applySwitchMode(state.timer, nextMode, durations);
  await persistAndBroadcast(timer, state.daily, state.lastNotifiedCompletionId);
}

async function handleGetState() {
  const state = await readStorage();
  const nowMs = Date.now();
  return buildPublicState(state.timer, state.daily, nowMs);
}

chrome.runtime.onInstalled.addListener(function onInstalled() {
  reconcileOnStartup();
});

chrome.runtime.onStartup.addListener(function onStartup() {
  reconcileOnStartup();
});

chrome.alarms.onAlarm.addListener(function onAlarm(alarm) {
  if (alarm.name !== ALARM_NAME) {
    return;
  }

  reconcileOnStartup();
});

chrome.runtime.onMessage.addListener(function onMessage(message, sender, sendResponse) {
  let handlerPromise = null;

  if (message.type === MESSAGE_GET_STATE) {
    handlerPromise = handleGetState();
  } else if (message.type === MESSAGE_START) {
    handlerPromise = handleStart().then(handleGetState);
  } else if (message.type === MESSAGE_PAUSE) {
    handlerPromise = handlePause().then(handleGetState);
  } else if (message.type === MESSAGE_CONTINUE) {
    handlerPromise = handleContinue().then(handleGetState);
  } else if (message.type === MESSAGE_RESET) {
    handlerPromise = handleReset().then(handleGetState);
  } else if (message.type === MESSAGE_SWITCH_MODE) {
    handlerPromise = handleSwitchMode(message.mode).then(handleGetState);
  }

  if (!handlerPromise) {
    return false;
  }

  handlerPromise
    .then(function resolveState(state) {
      sendResponse({ ok: true, state: state });
    })
    .catch(function rejectState(error) {
      sendResponse({
        ok: false,
        error: error && error.message ? error.message : "Unknown error",
      });
    });

  return true;
});

reconcileOnStartup();
