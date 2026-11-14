# Settings behavior and regression coverage

Settings uses one typed view of the existing `appConfig` preferences. This change
does not migrate the image-library schema or rename stored preference keys.

## Sections and compatibility

| Section              | URL                                    |
| -------------------- | -------------------------------------- |
| Account & AI Horde   | `/artbot/settings`                     |
| Generation           | `/artbot/settings?panel=generation`    |
| Gallery & Appearance | `/artbot/settings?panel=prefs`         |
| Workers              | `/artbot/settings?panel=workers`       |
| Backups & Storage    | `/artbot/settings?panel=import-export` |
| Troubleshooting      | `/artbot/settings?panel=advanced`      |

The older `panel=worker` link remains an alias. The
`/artbot/settings#use-specific-workers` link opens Generation at the worker
selection. Unknown panels show account settings with an explanatory message.
Desktop navigation and the native mobile section selector share one registry.
Panels load independently; fixed-choice fields use native selects.

## Persistence and credentials

- `settingsSchema.ts` owns known defaults and validation. Unset trusted-worker
  selection is true in both Settings and generated requests. Reads do not persist
  defaults or discard unknown legacy fields.
- Updates reread the current settings, validate changed fields and preserve
  unrelated data. Unreadable JSON refuses a read-modify-write. A quota or backup
  fence error leaves saved and displayed previous values intact.
- Same-window saves publish a change event only after storage succeeds. Settings
  listens for storage events from other windows and rereads after subscribing,
  closing the initial-render/subscription race.
- API-key drafts survive switching sections. Validation does not publish a new
  account. The key is saved before user details are published into the shared
  cache; no second validation request is needed. Pending, failed and timed-out
  validation remain explicit. Logout is separate from resetting preferences.
- Worker allow/block selections and their mutually exclusive enabled flags save
  together. API failures keep previous worker details available with retry controls.
- Shared-key mutations reject unsuccessful HTTP responses, block duplicate
  submission and keep failed dialogs/values available. Clipboard failure does
  not discard a created key. A timed-out mutation asks the user to check the key
  list before retrying, since the server may have completed it.

## Maintenance

Maintenance shares the page operation gate and durable engine lease used by
backups. It works only on the selected library and checks cancellation, selection
and lease ownership before writes.

Thumbnail generation reads/converts one image at a time. Existing thumbnails
are its durable checkpoints, so a new run skips completed work. It reports skipped
images and preserves original source images, unknown fields and newer record
changes. Cancellation after conversion prevents its write; an individual browser
image decode is not promised to be immediately interruptible.

Pending-item deletion confirms a count and rechecks it in the same native
read/write transaction that clears the queue. A changed count requires another
confirmation. Clearing the local queue does not cancel requests already submitted
to AI Horde. Completed images stay intact.

Preference reset, input-cache reset and pending-item deletion require explicit
confirmation. Preference reset keeps the API key, unknown legacy settings, images
and saved backups. Debug-log failure is reported without leaving a stuck action.

## Verification

- Settings unit checks cover defaults, successful/failed storage writes,
  cross-window changes and the subscription race, accessible names/native
  disabled switches, shared-key failures and mutation duplication, clipboard
  denial, validation-before-publication, paused maintenance, competing backups,
  concurrent image changes and changed pending counts.
- `e2e/settingsExperience.spec.ts` exercises URL compatibility, mobile/desktop
  navigation, browser history, persistence and real cross-tab storage events,
  quota rejection, keyboard switches, worker restrictions, API-key failure/retry,
  real thumbnail conversion with pause/resume, confirmations and credential-safe
  preference reset. Network/storage failures are injected responses, not real
  physical-device low-storage acceptance.
- Normal PR CI runs the Settings experience, existing Settings/Horde lookups and
  backup suites in Chromium, Firefox and WebKit, alongside full Chromium coverage.
- Native Files/PWA checks remain in the [iOS runner](../scripts/ios-pwa/README.md).
  The [physical-device matrix](backup-design.md#physical-iphone-checks) remains
  separate from desktop, simulator and mocked-fault coverage.
