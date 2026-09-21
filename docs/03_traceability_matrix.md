# Traceability Matrix

Maps every documented hazard (ISO 14971, see `docs/02_risk_analysis.md`)
to the automated test that verifies it, proving complete coverage —
nothing tested without a reason, nothing risky left untested.

| Hazard ID | Description | Risk Score | Tier | Test Case | Test Method | Status |
|---|---|---|---|---|---|---|
| H-01 | SpO2 desaturation with normal HR silently missed | 15 | Critical | `test_H01_spo2_desaturation_triggers_critical_alarm` | Automated (Playwright) | Pass (post-fix) |
| H-02 | Severe bradycardia/tachycardia alarm correctness | 10 | Critical | `test_H02_severe_bradycardia_triggers_critical_alarm` | Automated (Playwright) | Pass |
| H-03 | Warning-tier alarm fails to display for elevated vitals | 9 | Medium | `test_H03_elevated_heart_rate_triggers_warning_alarm` | Automated (Playwright) | Pass |
| H-04 | Acknowledge button fails to dismiss alarm | 4 | Low | `test_H04_acknowledge_button_dismisses_alarm` | Automated (Playwright) | Pass |
| H-05 | UI theme toggle malfunction (cosmetic) | 2 | Low | `test_H05_theme_toggle_switches_dark_mode` | Automated (Playwright) | Pass |

**Coverage: 5/5 hazards (100%) have at least one automated test. 5/5 tests currently passing.**

## Pipeline enforcement

The CI/CD pipeline (`.github/workflows/ci.yml`) runs all `critical_risk_p1`
tagged tests (H-01, H-02) in a dedicated gate job before any other pipeline
step runs. A failure in this gate halts the pipeline and automatically
opens a GitHub Issue — verified working via a controlled demo (bug
reintroduced on a throwaway branch, pipeline correctly failed and
alerted, branch closed without merging).
