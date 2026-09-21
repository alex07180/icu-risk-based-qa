A **Critical Risk (P1)** automated test has failed in the CI pipeline.

Per this project's risk-based testing policy (see `docs/02_risk_analysis.md`),
a failing `critical_risk_p1` test represents a patient-safety hazard that
**must** be resolved before any further deployment.

**Action required:**
1. Review the failed test's output in the GitHub Actions run log
2. Identify the related Hazard ID (cited in the failing test's docstring)
3. Fix the underlying defect
4. Re-run the pipeline and confirm `critical_risk_p1` tests pass
5. Close this issue once verified

This issue was opened automatically by the CI pipeline (`.github/workflows/ci.yml`).
