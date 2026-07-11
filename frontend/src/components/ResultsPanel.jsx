import { ListFilter } from "lucide-react";

export function ResultsPanel({ buildings, selectedBuildingId, onSelectBuilding }) {
  if (!buildings.length) return null;

  return (
    <section className="panel">
      <div className="panelHeader">
        <ListFilter size={16} />
        <h2>Matched buildings</h2>
      </div>
      <div className="resultList">
        {buildings.slice(0, 8).map((building) => (
          <button
            key={building.id}
            className={selectedBuildingId === building.id ? "resultItem isSelected" : "resultItem"}
            type="button"
            onClick={() => onSelectBuilding(building)}
          >
            <span>{building.address || "Unknown address"}</span>
            <strong>{building.zoning || "Unknown zoning"}</strong>
            <small>
              {heightLabel(building.height_m)} · {currency(building.assessed_value)}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}

function heightLabel(value) {
  if (!Number.isFinite(Number(value))) return "Unknown height";
  const meters = Number(value);
  return `${meters.toFixed(1)} m / ${(meters * 3.28084).toFixed(0)} ft`;
}

function currency(value) {
  if (!value) return "Unknown value";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  }).format(value);
}
