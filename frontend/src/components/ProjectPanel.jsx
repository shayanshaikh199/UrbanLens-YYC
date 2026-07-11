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
            <strong>{project.name}</strong>
            <span>{project.query || "Saved filter"}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
