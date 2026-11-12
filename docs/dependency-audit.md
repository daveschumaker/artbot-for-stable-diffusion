# Dependency audit — 2026-11-11

## Rejected deepmerge report

`npm audit` reports GHSA-gcqx-w48m-w2h4 / CVE-2026-93753 against `deepmerge@4.3.1`,
which Jest loads through `jest-config`. The scanner expands this into seven
low-severity development-package entries. The audit reports no moderate, high
or critical entries in this checkout.

The authoritative [CVE record](https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/93xxx/CVE-2026-93753.json)
is **REJECTED**, with a rejection date of **2026-11-02**. The assigning authority,
VulnCheck, rejected it because the report does not describe a security
vulnerability. The [upstream discussion](https://github.com/TehShrike/deepmerge/issues/273)
records the investigation and rejection. The behavior affects the merged
object's inherited properties; it does not modify global `Object.prototype`,
and the submitted input could already supply the same values as ordinary keys.

The [GitHub advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) and npm
audit metadata still list the report. Consequently, `npm audit` currently exits
nonzero even though the CVE has been rejected. Record this discrepancy explicitly
when reporting scan results; it is not an outstanding confirmed vulnerability or
a zero-advisory scan.

U11 is resolved by verifying the authoritative rejection and correcting the
release notes. The validated Jest dependency tree remains installed, and audit
output stays visible. Future advisory IDs or newly affected packages need their
own investigation; this disposition covers only GHSA-gcqx-w48m-w2h4.
