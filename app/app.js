/*
 * ICU Dashboard logic.
 *
 * NOTE FOR THIS PROJECT: this file contains a deliberately seeded defect
 * in checkAlarmState() for Patient C's SpO2 check (see comment below).
 * It is left in on purpose -- discovering it via risk-based automated
 * testing is the point of this project. Do not "fix" it before the
 * Critical_Risk_P1 test suite has been written and has failed against it.
 */

const SCENARIOS = {
  normal: {
    A: { hr: 78, spo2: 98, bp: "118/76" },
    B: { hr: 82, spo2: 97, bp: "122/80" },
    C: { hr: 75, spo2: 99, bp: "120/78" },
  },
  warning: {
    A: { hr: 80, spo2: 97, bp: "118/76" },
    B: { hr: 128, spo2: 96, bp: "140/90" }, // elevated but not critical
    C: { hr: 76, spo2: 98, bp: "119/78" },
  },
  critical_hr: {
    A: { hr: 24, spo2: 95, bp: "80/50" }, // severe bradycardia -> critical
    B: { hr: 82, spo2: 97, bp: "122/80" },
    C: { hr: 76, spo2: 98, bp: "119/78" },
  },
  critical_spo2: {
    A: { hr: 79, spo2: 97, bp: "118/76" },
    B: { hr: 81, spo2: 96, bp: "121/79" },
    C: { hr: 77, spo2: 85, bp: "118/77" }, // dangerous desaturation, HR normal
  },
  theme_toggle_only: {
    A: { hr: 78, spo2: 98, bp: "118/76" },
    B: { hr: 82, spo2: 97, bp: "122/80" },
    C: { hr: 75, spo2: 99, bp: "120/78" },
  },
};

function checkAlarmState(patientId, vitals) {
  // Heart rate check: critical if severely low or high (correct logic)
  const hrCritical = vitals.hr < 40 || vitals.hr > 150;
  const hrWarning = !hrCritical && (vitals.hr < 55 || vitals.hr > 120);

  // --- SEEDED DEFECT ---
  // SpO2 below 90% is a critical desaturation event on its own, regardless
  // of heart rate. The check below incorrectly requires BOTH low SpO2 AND
  // high heart rate before flagging critical -- so a patient desaturating
  // with a normal heart rate (exactly the critical_spo2 scenario above)
  // will NOT trigger a critical alarm. This is the catastrophic silent
  // failure this project's risk-based test suite is designed to catch.
  const spo2Critical = vitals.spo2 < 90 && vitals.hr > 150;
  // Correct version would be: const spo2Critical = vitals.spo2 < 90;

  const spo2Warning = !spo2Critical && vitals.spo2 < 94;

  if (hrCritical || spo2Critical) {
    let reason = hrCritical ? "Heart rate critical" : "SpO2 critical";
    return { level: "critical", reason };
  }
  if (hrWarning || spo2Warning) {
    let reason = hrWarning ? "Heart rate elevated/low" : "SpO2 low";
    return { level: "warning", reason };
  }
  return { level: "normal", reason: null };
}

function renderDashboard(scenarioKey) {
  const scenario = SCENARIOS[scenarioKey];
  const grid = document.getElementById("patient-grid");
  const bannerRegion = document.getElementById("alarm-banner-region");
  grid.innerHTML = "";
  bannerRegion.innerHTML = "";

  Object.entries(scenario).forEach(([patientId, vitals]) => {
    const alarm = checkAlarmState(patientId, vitals);

    const card = document.createElement("div");
    card.className = `patient-card state-${alarm.level}`;
    card.setAttribute("data-testid", `patient-card-${patientId}`);
    card.innerHTML = `
      <h3>Patient ${patientId}</h3>
      <div class="vital-row"><span>Heart Rate</span><span data-testid="hr-${patientId}">${vitals.hr} bpm</span></div>
      <div class="vital-row"><span>SpO2</span><span data-testid="spo2-${patientId}">${vitals.spo2}%</span></div>
      <div class="vital-row"><span>BP</span><span data-testid="bp-${patientId}">${vitals.bp}</span></div>
      <div class="vital-row"><span>Status</span><span data-testid="status-${patientId}">${alarm.level.toUpperCase()}</span></div>
    `;
    grid.appendChild(card);

    if (alarm.level === "critical" || alarm.level === "warning") {
      const banner = document.createElement("div");
      banner.className = `alarm-banner ${alarm.level}`;
      banner.setAttribute("data-testid", `alarm-banner-${patientId}`);
      banner.innerHTML = `
        ${alarm.level.toUpperCase()} ALARM — Patient ${patientId}: ${alarm.reason}
        <button class="acknowledge-btn" data-testid="ack-btn-${patientId}">Acknowledge</button>
      `;
      bannerRegion.appendChild(banner);

      banner.querySelector(".acknowledge-btn").addEventListener("click", () => {
        banner.remove();
      });
    }
  });
}

document.getElementById("load-scenario-btn").addEventListener("click", () => {
  const selected = document.getElementById("scenario-select").value;
  renderDashboard(selected);
});

document.getElementById("theme-toggle-btn").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Initial render
renderDashboard("normal");
