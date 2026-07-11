import { SunMedium } from "lucide-react";

export function SunStudyPanel({ hour, shadowsEnabled, onHourChange, onToggleShadows }) {
  return (
    <section className="panel sunPanel">
      <div className="panelHeader">
        <SunMedium size={16} />
        <h2>Sun study</h2>
      </div>
      <div className="sunControlHeader">
        <div className="sunTimeStack">
          <span>{timeLabel(hour)}</span>
          <small>{periodLabel(hour)}</small>
        </div>
        <button
          className={shadowsEnabled ? "toggle isOn" : "toggle"}
          onClick={() => onToggleShadows((value) => !value)}
          aria-pressed={shadowsEnabled}
          title="Toggle building shadows"
        >
          <span />
        </button>
      </div>
      <input
        className="sunSlider"
        type="range"
        min="0"
        max="23"
        step="1"
        value={hour}
        onChange={(event) => onHourChange(Number(event.target.value))}
        aria-label="Time of day"
      />
      <div className="sunTicks" aria-hidden="true">
        <span>Midnight</span>
        <span>Noon</span>
        <span>11 PM</span>
      </div>
    </section>
  );
}

function timeLabel(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const value = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${value}:00 ${suffix}`;
}

function periodLabel(hour) {
  if (hour < 5 || hour >= 21) return "Night";
  if (hour < 8) return "Sunrise";
  if (hour < 17) return "Daylight";
  if (hour < 20) return "Golden hour";
  return "Dusk";
}
