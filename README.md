# Real Pomodoro

A focused 25-minute Pomodoro timer with 5-minute breaks. Local alarms and notifications only.

**Homepage:** https://github.com/sudipawtg/realpomodoro

## Design

**Less text, more visual guidance.** See [DESIGN.md](./DESIGN.md).

## Features

- 25-minute focus sessions and 5-minute breaks
- Authoritative timer in the service worker using absolute timestamps and `chrome.alarms`
- Start, pause, continue, and reset
- Desktop notifications when a session completes (no auto-start of the next session)
- Daily focus session counter (resets at local midnight)
- Tomato/coral focus theme and calm green break theme

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Persist timer state and today's completed focus count locally |
| `alarms` | Fire when a running session ends, even if the popup is closed |
| `notifications` | Show a brief message when focus or break completes |

No host permissions. No network access.

## Load unpacked

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `realpomodoro/`
5. Pin the extension and open the popup

## Development / short durations

Production durations are 25 min focus / 5 min break. For faster manual testing:

- Set `"version": "1.0.0-dev"` in `manifest.json`, **or**
- Set `DEV_SHORT = true` at the top of `shared.js`

Short test durations are 3 s focus / 1 s break.

## Run tests

Pure timer logic lives in `shared.js` and is tested with Node (no Chrome required):

```bash
node scripts/shared.test.js
```

Regenerate icons (requires Pillow):

```bash
python3 scripts/generate_icons.py
```

## Storage schema

```text
realpomodoro.schemaVersion: 1
realpomodoro.timer: { mode, status, durationMs, remainingMs, endAt, completionId? }
realpomodoro.daily: { date: YYYY-MM-DD, completedFocusSessions }
```

Alarm name: `realpomodoro.timer`

## Store publishing

See `store/` for listing copy, privacy policy, policy compliance notes, and a publish checklist.

## Manual QA checklist

1. Popup shows **realpomodoro** wordmark, mode label, circular timer, and today's count
2. **Start** begins countdown; ring progress moves; **Pause** / **Continue** work
3. **Reset** returns to full duration while staying in the current mode
4. Mode switch (Focus / Break) is available only when idle
5. Completing focus shows notification, increments today's count, switches to break idle with **Start break**
6. Completing break shows notification and switches to focus idle — neither auto-starts
7. Close popup while running; reopen — remaining time is correct
8. Reload extension while running — alarm is recreated; expired sessions complete once without duplicate notifications
