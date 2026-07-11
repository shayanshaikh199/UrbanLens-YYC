import { SunMedium } from "lucide-react";

export function SunStudyPanel({ hour, shadowsEnabled, onHourChange, onToggleShadows }) {
  return (
    <section className="panel sunPanel">
      <div className="panelHeader">
        <SunMedium size={16} />
        <h2>Sun study</h2>
      </div>
      <div className="sunControlHeader">
        <span>{timeLabel(hour)}</span>
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
        min="7"
        max="19"
        step="1"
        value={hour}
        onChange={(event) => onHourChange(Number(event.target.value))}
        aria-label="Time of day"
      />
      <div className="sunTicks" aria-hidden="true">
        <span>7 AM</span>
        <span>Noon</span>
        <span>7 PM</span>
      </div>
    </section>
  );
}

function timeLabel(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const value = hour > 12 ? hour - 12 : hour;
  return `${value}:00 ${suffix}`;
}
