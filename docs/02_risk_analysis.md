# Risk Analysis (ISO 14971) — ICU Central Monitoring Dashboard

Each hazard below is written the way a real risk file references it: a
Hazard ID, tied directly to the risk tag that will appear on its
automated test in Playwright/pytest. This mapping (Hazard → Tag) is
what makes the CI pipeline's "halt on critical failure" logic
meaningful — the pipeline isn't just failing on "a test," it's failing
on a documented patient-safety hazard.

## Severity Scale

| Score | Level | Definition |
|---|---|---|
| 5 | Catastrophic | Death or permanent harm — e.g. cardiac event goes unalarmed |
| 4 | Critical | Serious harm requiring emergency intervention |
| 3 | Serious | Requires medical intervention, not life-threatening |
| 2 | Minor | Noticeable, no clinical consequence |
| 1 | Negligible | Cosmetic / no patient impact |

## Probability Scale

| Score | Level | Definition |
|---|---|---|
| 5 | Frequent | Occurs in normal, everyday monitoring |
| 4 | Probable | Likely under plausible patient conditions |
| 3 | Occasional | Plausible but less common patient conditions |
| 2 | Remote | Rare edge-case conditions |
| 1 | Improbable | Requires multiple independent failures |

## Risk Tier → Test Tag Mapping

| Risk Score | Tier | Playwright/pytest tag |
|---|---|---|
| 10–25 | Critical | `critical_risk_p1` |
| 5–9 | Medium | `medium_risk_p2` |
| 1–4 | Low | `low_risk_p3` |

---

## Hazard Log

### H-01 — Undetected patient desaturation (SEEDED DEFECT — already found)
**Hazard:** SpO2 critical-alarm logic incorrectly requires SpO2 < 90 **AND** heart rate > 150 simultaneously, instead of SpO2 < 90 alone.
**Hazardous Situation:** A patient desaturates (SpO2 drops below 90%) while heart rate remains in a normal range — clinically realistic (e.g. early respiratory compromise before cardiac compensation kicks in).
**Harm:** No critical alarm is raised; nursing staff are not alerted; deterioration can progress unnoticed.
**Severity:** 5 (Catastrophic — undetected desaturation can be fatal)
**Probability:** 3 (Occasional — a real, plausible clinical pattern, not a rare edge case)
**Risk Score:** 15 → **Tier: Critical → tag: `critical_risk_p1`**
**Mitigation:** Fix the alarm condition to `spo2 < 90` independent of heart rate.
**Residual Risk (post-fix):** Severity 5 × Probability 1 (improbable once correctly implemented and tested) = 5 → Medium tier acceptable residual, monitored by regression test.

### H-02 — Heart rate critical alarm (verify correctness — believed correct, must confirm)
**Hazard:** Heart rate outside 40–150 bpm should trigger a critical alarm; logic must be confirmed correct via testing, not assumed.
**Hazardous Situation:** Severe bradycardia or tachycardia occurs and alarm fails to trigger due to an undiscovered logic error.
**Harm:** Cardiac event goes unalarmed.
**Severity:** 5 (Catastrophic)
**Probability:** 2 (Remote — logic appears correct on inspection, but "appears correct" is exactly why this needs an automated test, not just code review)
**Risk Score:** 10 → **Tier: Critical → tag: `critical_risk_p1`**
**Mitigation:** Automated boundary tests at 39/40/41 and 149/150/151 bpm.
**Residual Risk:** 5 × 1 = 5 (Medium, monitored).

### H-03 — Warning-tier alarm fails to display (elevated but non-critical vitals)
**Hazard:** Warning-level vitals (e.g. HR 121–149, or SpO2 90–93) fail to raise a yellow warning banner.
**Hazardous Situation:** A patient trending toward a critical state is not flagged early, delaying preventive intervention.
**Harm:** Delayed intervention; patient may progress to a critical state that could have been caught earlier.
**Severity:** 3 (Serious — delayed but not immediately life-threatening)
**Probability:** 3 (Occasional)
**Risk Score:** 9 → **Tier: Medium → tag: `medium_risk_p2`**
**Mitigation:** Automated tests confirming warning banner appears at documented boundary values.
**Residual Risk:** 3 × 1 = 3 (Low, acceptable).

### H-04 — Acknowledge button fails to dismiss an active alarm banner
**Hazard:** Clicking "Acknowledge" does not remove the banner, or removes the wrong patient's banner.
**Hazardous Situation:** Alarm fatigue — if acknowledge doesn't work cleanly, staff may start ignoring banners generally, or lose track of which alarm is for which patient.
**Harm:** Indirect — contributes to alarm fatigue, a well-documented real patient-safety issue in ICU settings.
**Severity:** 2 (Minor — indirect contributor, not itself the harm)
**Probability:** 2 (Remote)
**Risk Score:** 4 → **Tier: Low → tag: `low_risk_p3`**
**Mitigation:** Basic functional test only.
**Residual Risk:** Acceptable as-is.

### H-05 — UI theme toggle malfunctions
**Hazard:** Dark/light theme toggle doesn't switch, or switches only partially.
**Hazardous Situation:** None with clinical relevance.
**Harm:** None — cosmetic only.
**Severity:** 1 (Negligible)
**Probability:** 2 (Remote)
**Risk Score:** 2 → **Tier: Low → tag: `low_risk_p3`**
**Mitigation:** Basic smoke test only, lowest priority in the suite.
**Residual Risk:** Acceptable as-is.

---

## Summary Table

| Hazard ID | Description | Score | Tier | Test Tag |
|---|---|---|---|---|
| H-01 | SpO2 desaturation alarm silently fails | 15 | Critical | `critical_risk_p1` |
| H-02 | Heart rate alarm boundary correctness | 10 | Critical | `critical_risk_p1` |
| H-03 | Warning-tier alarm fails to display | 9 | Medium | `medium_risk_p2` |
| H-04 | Acknowledge button malfunction | 4 | Low | `low_risk_p3` |
| H-05 | Theme toggle malfunction | 2 | Low | `low_risk_p3` |

This table is what the automated test suite (Step 3) is built directly
from — every test you write will reference one of these Hazard IDs in
its docstring, exactly the way the reference blueprint showed
(`"""ISO 14971 Hazard Ref H-03: ..."""`).
