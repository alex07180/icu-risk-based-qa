# Verification & Validation Summary Report

## 1. Summary

This project applied risk-based software testing (ISO 14971) to a
simulated ICU central monitoring dashboard, treated as a Class B SaMD
(IEC 62304) component. A documented risk analysis identified 5 hazards,
tiered by risk score, driving an automated Playwright test suite gated
by a GitHub Actions CI/CD pipeline that halts on any critical-risk
failure and auto-escalates via an incident issue.

## 2. Traceability Coverage

**5/5 hazards (100%) traced to at least one automated test.**
See `docs/03_traceability_matrix.md` for the full mapping.

## 3. Defect Summary

| Defect ID | Related Hazard | Severity | Status |
|---|---|---|---|
| DEF-001 | H-01 | Critical | Fixed, verified by regression test, closed |

1 defect found, 1 fixed, 0 remaining open.

## 4. Pipeline Verification

The CI/CD critical-risk gate was independently verified by deliberately
reintroducing DEF-001 on an isolated demo branch:
- Pipeline correctly failed the `critical_risk_gate` job
- `full_suite` job was correctly skipped (never ran)
- A P1 incident GitHub Issue was correctly auto-created
- Demo branch was closed without merging; `main` confirmed clean

## 5. Residual Risk Statement

| Hazard | Pre-Mitigation Score | Post-Mitigation Residual Score | Zone |
|---|---|---|---|
| H-01 | 15 (Unacceptable) | 5 (Medium/ALARP) | Acceptable with monitoring |
| H-02 | 10 (Unacceptable) | 5 (Medium/ALARP) | Acceptable with monitoring |
| H-03 | 9 (Medium/ALARP) | 3 (Acceptable) | Acceptable |
| H-04 | 4 (Acceptable) | 4 (Acceptable) | Acceptable |
| H-05 | 2 (Acceptable) | 2 (Acceptable) | Acceptable |

All identified hazards have residual risk within an acceptable or
ALARP zone, with automated regression coverage in place to detect
recurrence.

## 6. Conclusion

Based on the verification activities documented above, the software is
considered to meet its specified requirements within the scope defined
in the Project Charter, with all identified risks reduced to an
acceptable level and continuous regression protection enforced via CI/CD.

## 7. Limitations

This is a portfolio-scale project, not a production medical device:
- No real sensor/hardware integration — vitals are scenario-simulated
- No persistent data storage or audit trail (required for real ISO 13485 design controls)
- No formal usability engineering study (IEC 62366) conducted
- No independent design review or clinical validation with real users
- Branch protection enforcing "required status checks" was documented as
  a recommended next step but not enabled on this repository
