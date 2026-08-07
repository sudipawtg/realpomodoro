# Privacy Policy for realpomodoro

**Last updated:** 7 August 2026

**Product homepage:** https://github.com/sudipawtg/realpomodoro

realpomodoro (“the extension”) is a Chrome extension that provides a local Pomodoro timer in the browser toolbar popup.

## Summary

realpomodoro does not collect, transmit, sell, or share personal information. realpomodoro does not use Google APIs to access browsing history or account data.

## Data not collected

realpomodoro does not collect:

- Names, email addresses, or account information
- Browsing history or website content
- Location data
- Health, financial, or authentication information
- Analytics, advertising identifiers, or usage telemetry
- Cookies or similar tracking technologies

## Local storage on your device

The extension stores the following locally using Chrome's `storage` API on your device only:

- Timer mode (focus or break), status (idle, running, paused), durations, remaining time, and scheduled end timestamp
- Today's date and count of completed focus sessions
- An internal completion identifier used to avoid duplicate completion notifications

This data is not transmitted to the developer or any third party.

## Notifications

When a focus session or break ends, the extension may show a single desktop notification through Chrome's `notifications` API. Notification text is fixed in the extension package. No personal data is included in notifications.

## Alarms

The extension uses Chrome's `alarms` API with one alarm name (`realpomodoro.timer`) so the timer can finish accurately when the popup is closed.

## Permissions

| Permission | Purpose |
| --- | --- |
| `storage` | Local timer and daily counter state |
| `alarms` | Session end scheduling in the service worker |
| `notifications` | Optional completion alerts |

realpomodoro requests **no host permissions**.

realpomodoro makes **no network requests**.

## Chrome Web Store User Data Policy

realpomodoro is designed to comply with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq). Because realpomodoro does not collect user data, Limited Use obligations for transmitted data do not apply.

## Children's privacy

realpomodoro does not knowingly collect personal information from anyone, including children.

## Changes to this policy

If this privacy policy changes, the “Last updated” date at the top will be revised.

## Contact

For privacy questions, open an issue at https://github.com/sudipawtg/realpomodoro/issues or use the support email listed on the Chrome Web Store listing for realpomodoro.
