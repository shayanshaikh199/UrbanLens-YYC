import { Trash2, UserRound } from "lucide-react";
import { useState } from "react";

import { filterSummary } from "../utils/filterText.js";

export function ProjectPanel({ projects, loading, error, notice, disabled, username, onUsernameChange, onSave, onLoad, onDelete, icon }) {
  const [name, setName] = useState("");
  const usernameMissing = !username.trim();
  const saveDisabled = disabled || usernameMissing || !name.trim();

  async function handleSave(event) {
    event.preventDefault();
    if (saveDisabled) return;
    await onSave(name.trim());
    setName("");
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        {icon}
        <h2>Projects</h2>
      </div>
      <label className="projectUserInput">
        <UserRound size={15} />
        <input
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="Name for saved filters"
        />
      </label>
      <form className="saveForm" onSubmit={handleSave}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Save current filter"
          disabled={disabled || usernameMissing}
        />
        <button disabled={saveDisabled}>Save</button>
      </form>
      {notice ? <p className={notice.startsWith("Saved") || notice.startsWith("Loaded") ? "formSuccess" : "formError"}>{notice}</p> : null}
      {error ? <p className="formError">{error}</p> : null}
      <div className="projectList">
        {loading ? <p>Loading projects</p> : null}
        {!loading && usernameMissing ? <p>Enter a username to load saved projects</p> : null}
        {!loading && !usernameMissing && projects.length === 0 ? <p>No saved projects yet</p> : null}
        {projects.map((project) => (
          <article className="projectCard" key={project.id}>
            <button className="projectLoadButton" onClick={() => onLoad(project)}>
              <div className="projectTitleRow">
                <strong>{project.name}</strong>
                <time dateTime={project.updated_at}>{dateLabel(project.updated_at)}</time>
              </div>
              <span>{project.query || "Saved filter"}</span>
              <small>{filterSummary(project.filters)}</small>
            </button>
            <button
              className="projectDeleteButton"
              onClick={() => onDelete(project)}
              title={`Delete ${project.name}`}
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
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
