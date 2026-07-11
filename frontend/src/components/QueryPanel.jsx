import { Loader2 } from "lucide-react";
import { useState } from "react";

import { filterSummary, resultExplanation } from "../utils/filterText.js";

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
          <p>{resultExplanation(result)}</p>
        </div>
      ) : null}
    </section>
  );
}

function querySource(method) {
  if (method === "llm") return "Groq parsed";
  if (method === "manual-filter") return "Manual filter";
  if (method === "saved-project") return "Saved filter";
  if (method?.includes("superlative")) return "Ranked";
  return "Rule parsed";
}
