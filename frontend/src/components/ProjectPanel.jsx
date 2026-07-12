import { Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { filterSummary } from "../utils/filterText.js";

export function ProjectPanel({ projects, loading, error, notice, username, onUsernameChange, onLoad, onDelete }) {
  const usernameMissing = !username.trim();
  const [draftUsername, setDraftUsername] = useState(username);

  useEffect(() => {
    setDraftUsername(username);
  }, [username]);

  function handleUsernameSubmit(event) {
    event.preventDefault();
    const nextUsername = draftUsername.trim();
    if (nextUsername.length < 2) return;
    onUsernameChange(nextUsername);
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>Saved searches</h2>
      </div>
      <form className="projectUserInput" onSubmit={handleUsernameSubmit}>
        <label>
          <UserRound size={15} />
          <input
            value={draftUsername}
            onChange={(event) => setDraftUsername(event.target.value)}
            placeholder="Enter username"
          />
        </label>
        <button type="submit" disabled={draftUsername.trim().length < 2}>
          Load
        </button>
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
