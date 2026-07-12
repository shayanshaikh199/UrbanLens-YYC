import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const LAND_USES = ["Any", "COMMERCIAL", "MIXED USE", "RESIDENTIAL"];
const ZONING_CODES = ["Any", "DC", "CC-X", "CC-MH", "CC-MHX", "CC-COR", "C-COR1"];

export function ManualFilterPanel({ loading, onApply, onClear }) {
  const [landUse, setLandUse] = useState("Any");
  const [zoning, setZoning] = useState("Any");
  const [minHeight, setMinHeight] = useState("");
  const [minValue, setMinValue] = useState("");
  const [open, setOpen] = useState(true);

  const filters = useMemo(
    () => buildFilters({ landUse, zoning, minHeight, minValue }),
    [landUse, zoning, minHeight, minValue]
  );
  const hasFilters = filters.length > 0;

  function handleSubmit(event) {
    event.preventDefault();
    onApply(filters);
  }

  function handleClear() {
    setLandUse("Any");
    setZoning("Any");
    setMinHeight("");
    setMinValue("");
    onClear();
  }

  return (
    <section className={open ? "panel collapsiblePanel isOpen" : "panel collapsiblePanel"}>
      <button
        className="collapsibleHeader"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>
          <SlidersHorizontal size={16} />
          Manual filters
        </span>
        <strong>{hasFilters ? `${filters.length} active` : open ? "Hide" : "Show"}</strong>
        <ChevronDown size={16} />
      </button>
      {open ? <form className="manualFilterForm" onSubmit={handleSubmit}>
        <label>
          <span>Use</span>
          <select value={landUse} onChange={(event) => setLandUse(event.target.value)}>
            {LAND_USES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Zoning</span>
          <select value={zoning} onChange={(event) => setZoning(event.target.value)}>
            {ZONING_CODES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Min height</span>
          <input
            inputMode="decimal"
            min="0"
            type="number"
            value={minHeight}
            onChange={(event) => setMinHeight(event.target.value)}
            placeholder="m"
          />
        </label>
        <label>
          <span>Min value</span>
          <input
            inputMode="numeric"
            min="0"
            step="1"
            type="number"
            value={minValue}
            onChange={(event) => setMinValue(event.target.value)}
            placeholder="CAD"
          />
        </label>
        <div className="manualFilterActions">
          <button type="button" className="secondaryButton" onClick={handleClear} disabled={loading || !hasFilters}>
            Clear
          </button>
          <button disabled={loading || !hasFilters}>Apply</button>
        </div>
      </form> : null}
    </section>
  );
}

function buildFilters({ landUse, zoning, minHeight, minValue }) {
  const filters = [];
  if (landUse !== "Any") {
    filters.push({ attribute: "land_use", operator: "contains", value: landUse });
  }
  if (zoning !== "Any") {
    filters.push({ attribute: "zoning", operator: "contains", value: zoning });
  }
  if (Number.isFinite(Number(minHeight)) && minHeight !== "") {
    filters.push({ attribute: "height_m", operator: ">=", value: Number(minHeight), unit: "m" });
  }
  if (Number.isFinite(Number(minValue)) && minValue !== "") {
    filters.push({ attribute: "assessed_value", operator: ">=", value: Number(minValue), unit: "cad" });
  }
  return filters;
}
