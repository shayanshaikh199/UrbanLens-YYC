import { Loader2 } from "lucide-react";
import { useState } from "react";

const QUICK_QUERIES = [
  { label: "Commercial", query: "show commercial buildings" },
  { label: "Tallest", query: "show the tallest buildings" },
  { label: "DC zoning", query: "show buildings in DC zoning" },
  { label: "High value", query: "show buildings with assessed value over 10000000" },
  { label: "Mixed use", query: "show mixed use buildings" }
];

export function QueryPanel({ onSubmit, loading, error, result, icon }) {
  const [query, setQuery] = useState("show commercial buildings");

  function handleSubmit(event) {
    event.preventDefault();
    if (query.trim()) onSubmit(query.trim());
  }

  function runQuickQuery(nextQuery) {
    setQuery(nextQuery);
    onSubmit(nextQuery);
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        {icon}
        <h2>Ask the map</h2>
      </div>
      <form className="queryForm" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="highlight buildings over 100 feet"
        />
        <button disabled={loading}>
          {loading ? <Loader2 className="spin" size={16} /> : "Run"}
        </button>
      </form>
      <div className="quickQueryGrid" aria-label="Quick queries">
        {QUICK_QUERIES.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={loading}
            onClick={() => runQuickQuery(item.query)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error ? <p className="formError">{error}</p> : null}
      {result ? (
        <div className="queryResult">
          <span>{querySource(result.method)}</span>
          <strong>{result.match_count} matches</strong>
          <small>{filterSummary(result.filters)}</small>
        </div>
      ) : null}
    </section>
  );
}

function querySource(method) {
  if (method === "llm") return "Groq parsed";
  if (method === "saved-project") return "Saved filter";
  if (method?.includes("superlative")) return "Ranked";
  return "Rule parsed";
}

function filterSummary(filters = []) {
  if (!filters.length) return "No filters applied";
  return filters.map((filter) => describeFilter(filter)).join(" and ");
}

function describeFilter(filter) {
  if (filter.operator === "top") {
    const direction = filter.direction === "asc" ? "lowest" : "highest";
    return `${direction} ${labelFor(filter.attribute)} results`;
  }
  return `${labelFor(filter.attribute)} ${operatorFor(filter.operator)} ${valueFor(filter)}`;
}

function labelFor(attribute) {
  const labels = {
    assessed_value: "assessed value",
    height_m: "height",
    land_use: "land use"
  };
  return labels[attribute] ?? attribute?.replaceAll("_", " ") ?? "field";
}

function operatorFor(operator) {
  const operators = {
    ">": "over",
    ">=": "at least",
    "<": "under",
    "<=": "at most",
    "=": "is",
    contains: "contains"
  };
  return operators[operator] ?? operator;
}

function valueFor(filter) {
  if (filter.attribute === "assessed_value" && Number.isFinite(Number(filter.value))) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    }).format(filter.value);
  }
  if (filter.attribute === "height_m" && Number.isFinite(Number(filter.value))) {
    return `${filter.value} m`;
  }
  return String(filter.value ?? "unknown");
}
