const RING_CIRCUMFERENCE = 2 * Math.PI * 88;

const primaryActionButton = document.getElementById("primary-action");
const resetActionButton = document.getElementById("reset-action");
const modeFocusButton = document.getElementById("mode-focus");
const modeBreakButton = document.getElementById("mode-break");
const modeLabelElement = document.querySelector("[data-testid='mode-label']");
const timerDisplayElement = document.querySelector("[data-testid='timer-display']");
const timerProgressElement = document.querySelector(".timer-progress");
const dailyCountElement = document.querySelector("[data-testid='daily-count']");
const modeSwitchSection = document.querySelector("[data-testid='mode-switch-section']");

let latestState = null;
let tickIntervalId = null;

function sendMessage(type, payload) {
  return new Promise(function resolveMessage(resolve, reject) {
    chrome.runtime.sendMessage(Object.assign({ type: type }, payload || {}), function handleResponse(response) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response && response.error ? response.error : "Request failed"));
        return;
      }
      resolve(response.state);
    });
  });
}

function setBodyMode(mode) {
  document.body.classList.remove("mode-focus", "mode-break");
  document.body.classList.add(mode === TIMER_MODE_BREAK ? "mode-break" : "mode-focus");
}

function updateProgressRing(progress) {
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  timerProgressElement.style.strokeDashoffset = String(offset);
}

function updateModeButtons(mode, isIdle) {
  modeFocusButton.classList.toggle("is-active", mode === TIMER_MODE_FOCUS);
  modeBreakButton.classList.toggle("is-active", mode === TIMER_MODE_BREAK);
  modeSwitchSection.classList.toggle("is-disabled", !isIdle);
}

function renderState(state) {
  latestState = state;
  const timer = state.timer;
  const nowMs = Date.now();
  const remainingMs = deriveRemaining(timer, nowMs);
  const progress = getProgressFraction(timer, nowMs);
  const isIdle = timer.status === TIMER_STATUS_IDLE;

  setBodyMode(timer.mode);
  modeLabelElement.textContent = getModeLabel(timer.mode);
  timerDisplayElement.textContent = formatMs(remainingMs);
  updateProgressRing(progress);
  primaryActionButton.textContent = getPrimaryActionLabel(timer);
  dailyCountElement.textContent = String(state.daily.completedFocusSessions);
  updateModeButtons(timer.mode, isIdle);

  const isRunning = timer.status === TIMER_STATUS_RUNNING;
  resetActionButton.disabled = isIdle && remainingMs === timer.durationMs;
  modeFocusButton.disabled = !isIdle;
  modeBreakButton.disabled = !isIdle;
}

function startTickLoop() {
  if (tickIntervalId !== null) {
    return;
  }
  tickIntervalId = window.setInterval(function onTick() {
    if (!latestState) {
      return;
    }
    renderState(latestState);
  }, 250);
}

function stopTickLoop() {
  if (tickIntervalId === null) {
    return;
  }
  window.clearInterval(tickIntervalId);
  tickIntervalId = null;
}

function refreshState() {
  return sendMessage(MESSAGE_GET_STATE).then(function applyState(state) {
    renderState(state);
    if (state.timer.status === TIMER_STATUS_RUNNING) {
      startTickLoop();
    } else {
      stopTickLoop();
    }
  });
}

function handlePrimaryActionClick() {
  if (!latestState) {
    return;
  }

  const status = latestState.timer.status;
  let messageType = MESSAGE_START;
  if (status === TIMER_STATUS_RUNNING) {
    messageType = MESSAGE_PAUSE;
  } else if (status === TIMER_STATUS_PAUSED) {
    messageType = MESSAGE_CONTINUE;
  }

  sendMessage(messageType)
    .then(function applyState(state) {
      renderState(state);
      if (state.timer.status === TIMER_STATUS_RUNNING) {
        startTickLoop();
      } else {
        stopTickLoop();
      }
    })
    .catch(function logError(error) {
      console.error(error);
    });
}

function handleResetClick() {
  sendMessage(MESSAGE_RESET)
    .then(function applyState(state) {
      renderState(state);
      stopTickLoop();
    })
    .catch(function logError(error) {
      console.error(error);
    });
}

function handleModeFocusClick() {
  sendMessage(MESSAGE_SWITCH_MODE, { mode: TIMER_MODE_FOCUS })
    .then(renderState)
    .catch(function logError(error) {
      console.error(error);
    });
}

function handleModeBreakClick() {
  sendMessage(MESSAGE_SWITCH_MODE, { mode: TIMER_MODE_BREAK })
    .then(renderState)
    .catch(function logError(error) {
      console.error(error);
    });
}

function handleRuntimeMessage(message) {
  if (!message || message.type !== "STATE_UPDATED" || !message.state) {
    return;
  }
  renderState(message.state);
  if (message.state.timer.status === TIMER_STATUS_RUNNING) {
    startTickLoop();
  } else {
    stopTickLoop();
  }
}

primaryActionButton.addEventListener("click", handlePrimaryActionClick);
resetActionButton.addEventListener("click", handleResetClick);
modeFocusButton.addEventListener("click", handleModeFocusClick);
modeBreakButton.addEventListener("click", handleModeBreakClick);
chrome.runtime.onMessage.addListener(handleRuntimeMessage);

refreshState().catch(function logError(error) {
  console.error(error);
});

document.addEventListener("visibilitychange", function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    refreshState().catch(function logError(error) {
      console.error(error);
    });
  }
});
