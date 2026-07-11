export function SunStudyPanel({ hour, onHourChange }) {
  return (
    <section className="panel sunPanel">
      <div className="sunControlHeader">
        <div className="sunTimeStack">
          <span>{timeLabel(hour)}</span>
          <small>{periodLabel(hour)}</small>
        </div>
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
  if (hour < 20) return "Sunset";
  return "Dusk";
}
