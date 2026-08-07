# Chrome Web Store Publish Checklist — realpomodoro

Use this after local QA. Upload from your Google developer account.
Policy reference: https://developer.chrome.com/docs/webstore/program-policies/policies

## Before you start (account)

1. Developer fee paid at the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Enable **2-Step Verification** on the publisher Google account (required to publish or update).
3. Confirm the developer contact email can receive Google mail (not filtered as spam).
4. Privacy policy is public:
   `https://raw.githubusercontent.com/sudipawtg/realpomodoro/main/store/PRIVACY_POLICY.md`

## Local QA

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `realpomodoro/` folder
4. Open the popup and verify:
   - Idle focus shows `25:00` and **Start**
   - **Start** / **Pause** / **Continue** / **Reset** work
   - Mode switch (Focus / Break) works when idle only
   - Break idle shows **Start break**
   - Today's focus count increments after a completed focus session
   - Completing focus → notification → break idle (does not auto-start)
   - Completing break → notification → focus idle (does not auto-start)
5. Close popup while running; reopen — time remains accurate
6. Reload extension while running — alarm restored; expired session completes once
7. No console errors in popup or service worker; Network tab shows no extension requests

## Optional: fast QA with short durations

Set `"version": "1.0.0-dev"` in `manifest.json` or `DEV_SHORT = true` in `shared.js`, reload extension, and repeat completion/notification tests (3 s focus / 1 s break).

## Upload package

ZIP the extension root so `manifest.json` is at the top level (not nested in another folder).

Suggested name: `realpomodoro-1.0.0.zip`

Include:

- `manifest.json`
- `popup.html`, `popup.css`, `popup.js`
- `service-worker.js`, `shared.js`
- `icons/` (16, 32, 48, 128)
- `README.md` (optional in ZIP)

Do not include `.git`, `scripts/`, or store markdown unless you want them in the package (not required for runtime).

## Store listing

Copy from `store/LISTING.md`:

- Name: **realpomodoro**
- Summary: short description from LISTING.md
- Detailed description: full block from LISTING.md
- Category: **Productivity**
- Language: **English**
- Homepage: `https://github.com/sudipawtg/realpomodoro`

## Images

| Dashboard field | File |
| --- | --- |
| Store icon | `icons/icon-128.png` |
| Screenshot 1 | Popup idle (focus) |
| Screenshot 2 | Popup running (focus countdown) |

## Privacy tab (must match the product)

- Collects user data? **No**
- Remote code? **No**
- Privacy policy URL:
  `https://raw.githubusercontent.com/sudipawtg/realpomodoro/main/store/PRIVACY_POLICY.md`
- Single purpose:
  **Provides a local Pomodoro timer (25-minute focus and 5-minute break) in the browser toolbar popup, with optional completion notifications and a daily focus session counter. realpomodoro does not collect user data, show ads, or communicate with remote servers.**

## Permissions (justification fields)

Paste from `store/LISTING.md` → Permission justification table for `storage`, `alarms`, and `notifications`.

## Submit

1. Save draft and confirm every required field is filled.
2. Choose distribution regions.
3. Submit for review.
4. Watch the developer email for policy questions.

## After approval

- Install from the public listing and confirm timer + notifications.
- Bump `version` in `manifest.json` for every future upload.
- Keep `store/POLICY_COMPLIANCE.md` updated if features or permissions change.
