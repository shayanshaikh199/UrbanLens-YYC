import { Loader2 } from "lucide-react";
import { useState } from "react";

export function QueryPanel({ onSubmit, loading, error, result, icon }) {
  const [query, setQuery] = useState("show commercial buildings");

  function handleSubmit(event) {
    event.preventDefault();
    if (query.trim()) onSubmit(query.trim());
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
      {error ? <p className="formError">{error}</p> : null}
      {result ? (
        <div className="queryResult">
          <span>{result.method}</span>
          <strong>{result.match_count} matches</strong>
        </div>
      ) : null}
    </section>
  );
}
