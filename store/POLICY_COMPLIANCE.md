# Chrome Web Store Policy Compliance — realpomodoro

Mapped against the [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies) (last reviewed against the published policy text).

## Single purpose and quality

| Requirement | realpomodoro status |
| --- | --- |
| Narrow, easy-to-understand single purpose | Yes — local Pomodoro timer in toolbar popup |
| No bundled unrelated features | Yes — no search, ads, content scripts, or analytics |
| Minimum useful functionality | Yes — focus/break timers, pause/continue, notifications, daily count |
| Design guidelines (less text, more visual) | Yes — see `DESIGN.md`; short UI copy; a11y labels kept |
| No duplicate / template spam listing | Unique Pomodoro popup experience; one extension only |
| Does not modify web pages | Yes — no content scripts or host permissions |

## Privacy and user data

| Requirement | realpomodoro status |
| --- | --- |
| Collect / use / transmit user data | No — only local timer state and daily counter |
| Host permissions | None |
| Network / remote hosts | None |
| Remote code (MV3) | None — only packaged scripts |
| Privacy policy published | Yes — `store/PRIVACY_POLICY.md` (public GitHub URL) |
| Privacy dashboard answers match behavior | Yes — declare **no user data collection**; local storage only on device |

## Security and technical (Manifest V3)

| Requirement | realpomodoro status |
| --- | --- |
| Manifest V3 | Yes |
| Service worker background | Yes — authoritative timer + alarms |
| Code readable / not obfuscated | Yes — plain, named functions |
| No `eval`, remote `<script>`, or remote logic | Yes |
| Full functionality discernible from package | Yes |
| No malware, cryptomining, phishing | Yes |

## Permissions (justified)

| Permission | Used for | Narrow scope |
| --- | --- | --- |
| `storage` | Timer + daily counter persistence | Fixed keys under `realpomodoro.*` |
| `alarms` | One alarm: `realpomodoro.timer` | Created only while a session is running |
| `notifications` | Completion messages for focus/break | Fixed copy; no PII |

## Listing and marketing

| Requirement | realpomodoro status |
| --- | --- |
| Accurate name, description, screenshots | Yes — matches actual UI |
| Icon present | Yes — `icons/icon-128.png` |
| No keyword spam / fake testimonials | Yes |
| No deceptive install / unexpected behavior | Yes — timer popup only |
| No ads or affiliate injection | Yes |

## Developer account obligations (manual)

These cannot be enforced in code. Complete in your Google account before submit:

1. Enable **2-Step Verification** on the publisher Google account (required to publish).
2. Keep developer contact email correct and able to receive Google mail.
3. Fill Privacy practices honestly: no data collection, no remote code.
4. Paste the public privacy policy URL.
5. Provide a meaningful single-purpose statement (copy from `LISTING.md`).
6. Paste permission justifications for `storage`, `alarms`, and `notifications`.
7. Offer basic support via the store support email / GitHub issues.

## Known review focus areas for this product

- **Notifications:** Used only for session completion; copy is fixed and non-promotional.
- **Alarms:** Single named alarm tied to active timer; cleared when idle or paused.
- **Storage:** Local productivity counters only; no browsing data.
