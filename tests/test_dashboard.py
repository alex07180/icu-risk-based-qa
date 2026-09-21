"""
test_dashboard.py

Risk-based automated test suite for the ICU Central Monitoring Dashboard.

Every test is tagged with a pytest marker matching its ISO 14971 risk
tier from docs/02_risk_analysis.md, and every test's docstring cites
the specific Hazard ID it verifies. This is what makes the CI pipeline's
"halt on critical failure" logic meaningful: a failing @critical_risk_p1
test means a documented patient-safety hazard, not just a broken assert.

No local web server needed: the dashboard is a static page, so we load
it directly via a file:// URL.
"""

import pathlib
import pytest
from playwright.sync_api import Page, expect

# Build an absolute file:// URL to app/index.html, regardless of where
# pytest is run from.
APP_PATH = pathlib.Path(__file__).parent.parent / "app" / "index.html"
APP_URL = f"file://{APP_PATH.resolve()}"


def load_scenario(page: Page, scenario_value: str):
    """Helper: open the dashboard and select+load a given scenario."""
    page.goto(APP_URL)
    page.select_option("#scenario-select", scenario_value)
    page.click("#load-scenario-btn")


# ---------------------------------------------------------------------
# CRITICAL_RISK_P1 — must never fail on a release build
# ---------------------------------------------------------------------

@pytest.mark.critical_risk_p1
def test_H01_spo2_desaturation_triggers_critical_alarm(page: Page):
    """
    ISO 14971 Hazard Ref H-01: SpO2 < 90% must trigger a critical alarm
    even when heart rate is normal. Risk Score 15 (Catastrophic severity).

    NOTE: this test is EXPECTED TO FAIL against the current app.js --
    a critical alarm requires SpO2<90 AND HR>150 simultaneously, so a
    patient desaturating with a normal heart rate is silently missed.
    A failing result here is the test suite working correctly.
    """
    load_scenario(page, "critical_spo2")
    banner = page.locator('[data-testid="alarm-banner-C"]')
    expect(banner).to_be_visible()
    expect(banner).to_contain_text("CRITICAL")


@pytest.mark.critical_risk_p1
def test_H02_severe_bradycardia_triggers_critical_alarm(page: Page):
    """
    ISO 14971 Hazard Ref H-02: heart rate below 40bpm must trigger a
    critical alarm. Risk Score 10 (Catastrophic severity, remote
    probability once verified).
    """
    load_scenario(page, "critical_hr")
    banner = page.locator('[data-testid="alarm-banner-A"]')
    expect(banner).to_be_visible()
    expect(banner).to_contain_text("CRITICAL")


# ---------------------------------------------------------------------
# MEDIUM_RISK_P2 — should not block release alone, but must be tracked
# ---------------------------------------------------------------------

@pytest.mark.medium_risk_p2
def test_H03_elevated_heart_rate_triggers_warning_alarm(page: Page):
    """
    ISO 14971 Hazard Ref H-03: heart rate in the elevated-but-not-critical
    range (121-149bpm) must trigger a WARNING-level banner, not silence.
    Risk Score 9.
    """
    load_scenario(page, "warning")
    banner = page.locator('[data-testid="alarm-banner-B"]')
    expect(banner).to_be_visible()
    expect(banner).to_contain_text("WARNING")


# ---------------------------------------------------------------------
# LOW_RISK_P3 — cosmetic / non-clinical, lowest test priority
# ---------------------------------------------------------------------

@pytest.mark.low_risk_p3
def test_H04_acknowledge_button_dismisses_alarm(page: Page):
    """ISO 14971 Hazard Ref H-04: acknowledging an alarm removes its banner."""
    load_scenario(page, "critical_hr")
    banner = page.locator('[data-testid="alarm-banner-A"]')
    expect(banner).to_be_visible()
    page.click('[data-testid="ack-btn-A"]')
    expect(banner).not_to_be_visible()


@pytest.mark.low_risk_p3
def test_H05_theme_toggle_switches_dark_mode(page: Page):
    """ISO 14971 Hazard Ref H-05: theme toggle is cosmetic only, no clinical impact."""
    page.goto(APP_URL)
    page.click("#theme-toggle-btn")
    body = page.locator("body")
    expect(body).to_have_class("dark-theme")
