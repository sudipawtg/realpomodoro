# Chrome Web Store Listing — realpomodoro

Copy these fields into the Chrome Web Store Developer Dashboard.
Aligned with the [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies).

## Item information

| Field | Value |
| --- | --- |
| Name | Real Pomodoro |
| Version | 1.0.0 (from `manifest.json`) |
| Language | English |
| Category | Productivity |
| Visibility | Public |
| Homepage | https://github.com/sudipawtg/realpomodoro |
| Support | GitHub Issues on https://github.com/sudipawtg/realpomodoro/issues |

## Short description (manifest / summary, max 132 characters)

A focused 25-minute Pomodoro timer with 5-minute breaks. Local alarms and notifications only.

Character count: 93

## Detailed description

```text
realpomodoro is a quiet Pomodoro timer in your browser toolbar.

This extension has one purpose: help you run focused 25-minute work sessions and 5-minute breaks. It does not track browsing, does not inject content into web pages, and does not communicate with remote servers.

What realpomodoro does
• 25-minute focus timer and 5-minute break timer
• Start, pause, continue, and reset from the toolbar popup
• Keeps counting accurately when the popup is closed (service worker + alarms)
• Shows a desktop notification when focus or break completes
• Counts completed focus sessions for today (resets at local midnight)
• Lets you switch between focus and break while idle

What realpomodoro does not do
• No accounts or sign-in
• No analytics, ads, or affiliate links
• No host permissions or access to website content
• No network requests
• No auto-start of the next session — you choose when to begin

How to use
1. Install realpomodoro
2. Click the toolbar icon
3. Press Start for a focus session
4. When notified, take a break and press Start break when ready
5. Repeat

Privacy
Timer state and today's session count are stored locally in Chrome storage on your device only.
```

## Single purpose statement (dashboard field)

Provides a local Pomodoro timer (25-minute focus and 5-minute break) in the browser toolbar popup, with optional completion notifications and a daily focus session counter. realpomodoro does not collect user data, show ads, or communicate with remote servers.

## Permission justification

| Permission | Justification |
| --- | --- |
| `storage` | Saves timer mode, remaining time, running/paused state, and today's completed focus session count locally so sessions survive popup close and browser restart. |
| `alarms` | Schedules a single alarm named `realpomodoro.timer` so the service worker can complete a session at the correct time when the popup is not open. |
| `notifications` | Shows one brief desktop notification when a focus session or break ends ("Focus session complete." / "Break complete.") so you know when to switch modes. |

No host permissions are requested.

## Design guidelines

UI follows **Less text, more visual guidance**. See [DESIGN.md](../DESIGN.md) in this repository.

- One main idea and one primary action per screen
- Short titles, brief status text, specific button labels
- Show with visuals first; keep accessibility labels

## Privacy practices answers

| Question | Answer |
| --- | --- |
| Does this item collect or use user data? | **No** |
| Personally identifiable information | Not collected |
| Health information | Not collected |
| Financial and payment information | Not collected |
| Authentication information | Not collected |
| Personal communications | Not collected |
| Location | Not collected |
| Web history | Not collected |
| User activity | Not collected |
| Website content | Not collected |
| Does this item sell user data? | **No** |
| Does this item use remote code? | **No** |
| Does this item communicate with a remote host? | **No** |
| Data usage certification | Certify compliance with the Chrome Web Store User Data Policy |

## Assets to upload

| Asset | Path |
| --- | --- |
| Store icon | `icons/icon-128.png` |
| Screenshot 1 | Popup idle — focus mode |
| Screenshot 2 | Popup running — focus countdown |

## Privacy policy URL

https://raw.githubusercontent.com/sudipawtg/realpomodoro/main/store/PRIVACY_POLICY.md
