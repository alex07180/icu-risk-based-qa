# SaMD Risk-Based Automated Test Suite — ICU Central Monitoring Dashboard (Simulated)

A portfolio project applying **risk-based software testing** (ISO 14971)
and **Software as a Medical Device (SaMD)** QA principles to a simulated
ICU patient monitoring dashboard — built to demonstrate medical device
QA readiness for a Werkstudent role in German MedTech.

## The idea

In consumer software, a bug is an inconvenience. In medical device
software, a bug can be the difference between a patient being alerted
in time or not. **Risk-based testing** is the industry-standard response:
instead of testing everything equally, test depth is explicitly driven
by a documented patient-safety risk score (ISO 14971), and a CI/CD
pipeline enforces that a **Critical-risk** test failure blocks release —
automatically, not by relying on someone remembering to check.

## What's actually in this repo

| Component | What it does |
|---|---|
| `app/` | A simulated ICU dashboard (3 patients, live vitals, alarm banners) — the "device under test" |
| `docs/02_risk_analysis.md` | ISO 14971 risk analysis: 5 documented hazards, scored and tiered (Critical / Medium / Low) |
| `tests/test_dashboard.py` | Automated Playwright test suite, tagged by risk tier, each test citing its Hazard ID |
| `.github/workflows/ci.yml` | CI/CD pipeline: runs Critical-risk tests first; **blocks further pipeline steps and auto-opens a GitHub Issue if any fail** |

## A real bug, found and fixed by this process

This project isn't a toy example — it caught a genuine defect:

**Hazard H-01:** the dashboard's critical-alarm logic required SpO2 < 90%
**and** heart rate > 150bpm simultaneously before flagging a critical
alarm — meaning a patient desaturating with a *normal* heart rate (a
clinically realistic scenario) would silently receive only a low-priority
warning instead of a critical alert.

This was found by an automated `critical_risk_p1`-tagged test, logged as
a GitHub Issue referencing the hazard, fixed in `app.js`, and verified
by the same test turning green on retest. The CI pipeline's ability to
catch this class of regression automatically was then separately
verified by deliberately reintroducing the bug on a throwaway branch —
the pipeline correctly failed the build and auto-opened a P1 incident
issue before that branch was closed without merging.

## How to run it yourself

```bash
git clone https://github.com/alex07180/icu-risk-based-qa.git
cd icu-risk-based-qa
python3 -m venv venv
source venv/bin/activate
pip install pytest pytest-playwright
playwright install chromium

# Run everything
pytest -v

# Run only the critical-risk tier (what the CI pipeline gates on)
pytest -m critical_risk_p1 -v
```

Open `app/index.html` directly in a browser to explore the dashboard manually.

## Standards referenced

- **ISO 14971** — Application of risk management to medical devices
- **IEC 62304** — Medical device software lifecycle processes (informs the Class B rigor level applied throughout)

## What a production version would still need

This is a portfolio-scale demonstration, not a deployable product. A
real system would additionally require: a full ISO 13485 Quality
Management System, formal design controls, a backend with real sensor
integration and audit trail, usability engineering per IEC 62366, and
clinical validation with real users.

## Author

[Alex Peelipose] — QA Engineer (4 years, fintech) transitioning into medical
device QA / regulatory affairs, currently pursuing an MSc in Biomedical
Engineering at Ulm University, Germany.
