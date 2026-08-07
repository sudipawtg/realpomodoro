const SCHEMA_VERSION = 1;
const STORAGE_KEY_SCHEMA_VERSION = "realpomodoro.schemaVersion";
const STORAGE_KEY_TIMER = "realpomodoro.timer";
const STORAGE_KEY_DAILY = "realpomodoro.daily";
const ALARM_NAME = "realpomodoro.timer";

const PRODUCTION_FOCUS_MS = 1500000;
const PRODUCTION_BREAK_MS = 300000;
const TEST_FOCUS_MS = 3000;
const TEST_BREAK_MS = 1000;

const DEV_SHORT = false;

const TIMER_MODE_FOCUS = "focus";
const TIMER_MODE_BREAK = "break";

const TIMER_STATUS_IDLE = "idle";
const TIMER_STATUS_RUNNING = "running";
const TIMER_STATUS_PAUSED = "paused";
const TIMER_STATUS_COMPLETE = "complete";

const MESSAGE_GET_STATE = "GET_STATE";
const MESSAGE_START = "START";
const MESSAGE_PAUSE = "PAUSE";
const MESSAGE_CONTINUE = "CONTINUE";
const MESSAGE_RESET = "RESET";
const MESSAGE_SWITCH_MODE = "SWITCH_MODE";

const NOTIFICATION_FOCUS_TITLE = "Focus session complete.";
const NOTIFICATION_FOCUS_BODY =
  "Nice work. Take a five-minute break when you are ready.";
const NOTIFICATION_BREAK_TITLE = "Break complete.";
const NOTIFICATION_BREAK_BODY =
  "Break is over. Start your next focus session when you are ready.";

function shouldUseShortDurations(manifestVersion, devShortOverride) {
  const devShort = devShortOverride !== undefined ? devShortOverride : DEV_SHORT;
  if (devShort) {
    return true;
  }
  if (typeof manifestVersion === "string" && manifestVersion.indexOf("dev") !== -1) {
    return true;
  }
  return false;
}

function getDurations(manifestVersion, devShortOverride) {
  if (shouldUseShortDurations(manifestVersion, devShortOverride)) {
    return {
      focusMs: TEST_FOCUS_MS,
      breakMs: TEST_BREAK_MS,
    };
  }
  return {
    focusMs: PRODUCTION_FOCUS_MS,
    breakMs: PRODUCTION_BREAK_MS,
  };
}

function isValidMode(value) {
  return value === TIMER_MODE_FOCUS || value === TIMER_MODE_BREAK;
}

function isValidStatus(value) {
  return (
    value === TIMER_STATUS_IDLE ||
    value === TIMER_STATUS_RUNNING ||
    value === TIMER_STATUS_PAUSED ||
    value === TIMER_STATUS_COMPLETE
  );
}

function isValidDuration(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isValidRemaining(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidEndAt(value) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function getDurationForMode(mode, durations) {
  return mode === TIMER_MODE_BREAK ? durations.breakMs : durations.focusMs;
}

function createDefaultTimer(mode, durations) {
  const safeMode = isValidMode(mode) ? mode : TIMER_MODE_FOCUS;
  const durationMs = getDurationForMode(safeMode, durations);
  return {
    mode: safeMode,
    status: TIMER_STATUS_IDLE,
    durationMs: durationMs,
    remainingMs: durationMs,
    endAt: null,
    completionId: null,
  };
}

function validateTimerState(raw, durations) {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      timer: createDefaultTimer(TIMER_MODE_FOCUS, durations),
      error: "Timer payload must be an object.",
    };
  }

  if (!isValidMode(raw.mode)) {
    return {
      ok: false,
      timer: createDefaultTimer(TIMER_MODE_FOCUS, durations),
      error: "Invalid timer mode.",
    };
  }

  if (!isValidStatus(raw.status)) {
    return {
      ok: false,
      timer: createDefaultTimer(raw.mode, durations),
      error: "Invalid timer status.",
    };
  }

  const expectedDuration = getDurationForMode(raw.mode, durations);
  const durationMs = isValidDuration(raw.durationMs) ? raw.durationMs : expectedDuration;
  const remainingMs = isValidRemaining(raw.remainingMs)
    ? Math.min(raw.remainingMs, durationMs)
    : durationMs;
  const endAt = isValidEndAt(raw.endAt) ? raw.endAt : null;
  const completionId =
    raw.completionId === null || typeof raw.completionId === "string"
      ? raw.completionId
      : null;

  if (raw.status === TIMER_STATUS_RUNNING && endAt === null) {
    return {
      ok: false,
      timer: createDefaultTimer(raw.mode, durations),
      error: "Running timer must have endAt.",
    };
  }

  if (raw.status !== TIMER_STATUS_RUNNING && endAt !== null) {
    return {
      ok: false,
      timer: createDefaultTimer(raw.mode, durations),
      error: "Non-running timer must not have endAt.",
    };
  }

  return {
    ok: true,
    timer: {
      mode: raw.mode,
      status: raw.status,
      durationMs: durationMs,
      remainingMs: remainingMs,
      endAt: endAt,
      completionId: completionId,
    },
    error: "",
  };
}

function getLocalDateString(nowMs) {
  const date = new Date(nowMs);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultDaily(nowMs) {
  return {
    date: getLocalDateString(nowMs),
    completedFocusSessions: 0,
  };
}

function validateDailyState(raw, nowMs) {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      daily: createDefaultDaily(nowMs),
      error: "Daily payload must be an object.",
    };
  }

  const date =
    typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
      ? raw.date
      : getLocalDateString(nowMs);
  const completedFocusSessions =
    typeof raw.completedFocusSessions === "number" &&
    Number.isFinite(raw.completedFocusSessions) &&
    raw.completedFocusSessions >= 0
      ? Math.floor(raw.completedFocusSessions)
      : 0;

  return {
    ok: true,
    daily: {
      date: date,
      completedFocusSessions: completedFocusSessions,
    },
    error: "",
  };
}

function reconcileDaily(daily, nowMs) {
  const today = getLocalDateString(nowMs);
  if (daily.date === today) {
    return daily;
  }
  return {
    date: today,
    completedFocusSessions: 0,
  };
}

function formatMs(ms) {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function deriveRemaining(timer, nowMs) {
  if (timer.status === TIMER_STATUS_RUNNING && timer.endAt !== null) {
    return Math.max(0, timer.endAt - nowMs);
  }
  return Math.max(0, timer.remainingMs);
}

function isTimerExpired(timer, nowMs) {
  return (
    timer.status === TIMER_STATUS_RUNNING &&
    timer.endAt !== null &&
    nowMs >= timer.endAt
  );
}

function generateCompletionId(nowMs) {
  return `${nowMs}-${Math.random().toString(36).slice(2, 10)}`;
}

function applyStart(timer, nowMs) {
  if (timer.status !== TIMER_STATUS_IDLE && timer.status !== TIMER_STATUS_PAUSED) {
    return timer;
  }

  const remainingMs =
    timer.status === TIMER_STATUS_PAUSED ? timer.remainingMs : timer.durationMs;

  if (remainingMs <= 0) {
    return timer;
  }

  return {
    mode: timer.mode,
    status: TIMER_STATUS_RUNNING,
    durationMs: timer.durationMs,
    remainingMs: remainingMs,
    endAt: nowMs + remainingMs,
    completionId: null,
  };
}

function applyPause(timer, nowMs) {
  if (timer.status !== TIMER_STATUS_RUNNING) {
    return timer;
  }

  const remainingMs = Math.max(0, timer.endAt - nowMs);

  return {
    mode: timer.mode,
    status: TIMER_STATUS_PAUSED,
    durationMs: timer.durationMs,
    remainingMs: remainingMs,
    endAt: null,
    completionId: null,
  };
}

function applyContinue(timer, nowMs) {
  if (timer.status !== TIMER_STATUS_PAUSED) {
    return timer;
  }

  if (timer.remainingMs <= 0) {
    return timer;
  }

  return {
    mode: timer.mode,
    status: TIMER_STATUS_RUNNING,
    durationMs: timer.durationMs,
    remainingMs: timer.remainingMs,
    endAt: nowMs + timer.remainingMs,
    completionId: null,
  };
}

function applyReset(timer, durations) {
  return createDefaultTimer(timer.mode, durations);
}

function applySwitchMode(timer, nextMode, durations) {
  if (timer.status !== TIMER_STATUS_IDLE) {
    return timer;
  }
  if (!isValidMode(nextMode) || nextMode === timer.mode) {
    return timer;
  }
  return createDefaultTimer(nextMode, durations);
}

function getNextModeAfterComplete(mode) {
  return mode === TIMER_MODE_FOCUS ? TIMER_MODE_BREAK : TIMER_MODE_FOCUS;
}

function getNotificationForMode(mode) {
  if (mode === TIMER_MODE_FOCUS) {
    return {
      title: NOTIFICATION_FOCUS_TITLE,
      body: NOTIFICATION_FOCUS_BODY,
    };
  }
  return {
    title: NOTIFICATION_BREAK_TITLE,
    body: NOTIFICATION_BREAK_BODY,
  };
}

function applyComplete(timer, daily, nowMs, durations) {
  const completionId = generateCompletionId(nowMs);
  const notification = getNotificationForMode(timer.mode);
  let nextDaily = daily;

  if (timer.mode === TIMER_MODE_FOCUS) {
    nextDaily = {
      date: daily.date,
      completedFocusSessions: daily.completedFocusSessions + 1,
    };
  }

  const nextMode = getNextModeAfterComplete(timer.mode);
  const nextTimer = createDefaultTimer(nextMode, durations);

  return {
    timer: nextTimer,
    daily: nextDaily,
    completionId: completionId,
    notification: notification,
  };
}

function getPrimaryActionLabel(timer) {
  if (timer.status === TIMER_STATUS_RUNNING) {
    return "Pause";
  }
  if (timer.status === TIMER_STATUS_PAUSED) {
    return "Continue";
  }
  if (timer.mode === TIMER_MODE_BREAK) {
    return "Start break";
  }
  return "Start";
}

function getModeLabel(mode) {
  return mode === TIMER_MODE_BREAK ? "Break" : "Focus";
}

function getProgressFraction(timer, nowMs) {
  if (timer.durationMs <= 0) {
    return 0;
  }
  const remaining = deriveRemaining(timer, nowMs);
  const elapsed = timer.durationMs - remaining;
  return Math.min(1, Math.max(0, elapsed / timer.durationMs));
}

function buildAlarmScheduleAt(endAtMs) {
  return {
    when: endAtMs,
  };
}

function shouldNotifyCompletion(completionId, lastNotifiedCompletionId) {
  if (!completionId) {
    return false;
  }
  return completionId !== lastNotifiedCompletionId;
}
