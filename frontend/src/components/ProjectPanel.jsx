import { useState } from "react";

export function ProjectPanel({ projects, loading, disabled, onSave, onLoad, icon }) {
  const [name, setName] = useState("");

  async function handleSave(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await onSave(name.trim());
    setName("");
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        {icon}
        <h2>Projects</h2>
      </div>
      <form className="saveForm" onSubmit={handleSave}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Save current filter"
          disabled={disabled}
        />
        <button disabled={disabled || !name.trim()}>Save</button>
      </form>
      <div className="projectList">
        {loading ? <p>Loading projects</p> : null}
        {!loading && projects.length === 0 ? <p>No saved projects yet</p> : null}
        {projects.map((project) => (
          <button key={project.id} onClick={() => onLoad(project)}>
            <div className="projectTitleRow">
              <strong>{project.name}</strong>
              <time dateTime={project.updated_at}>{dateLabel(project.updated_at)}</time>
            </div>
            <span>{project.query || "Saved filter"}</span>
            <small>{filterSummary(project.filters)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function filterSummary(filters = []) {
  if (!filters.length) return "No filters saved";
  return filters.map((filter) => describeFilter(filter)).join(" and ");
}

function describeFilter(filter) {
  if (filter.operator === "top") {
    return `${filter.direction === "asc" ? "lowest" : "highest"} ${labelFor(filter.attribute)} ranking`;
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

function dateLabel(value) {
  if (!value) return "Saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved";
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "2-digit"
  }).format(date);
}
