import { Building2, Database, Eye, Layers, Loader2, Save, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { CityScene } from "./components/CityScene.jsx";
import { DataPanel } from "./components/DataPanel.jsx";
import { ProjectPanel } from "./components/ProjectPanel.jsx";
import { QueryPanel } from "./components/QueryPanel.jsx";
import { ResultsPanel } from "./components/ResultsPanel.jsx";
import { useMapData } from "./hooks/useMapData.js";
import { useProjects } from "./hooks/useProjects.js";
import { filterBuildings, runQuery } from "./services/api.js";

export default function App() {
  const { buildings, permits, metadata, loading, error, refresh } = useMapData();
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showPermits, setShowPermits] = useState(true);
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState("");
  const [username, setUsername] = useState("shayan");
  const projects = useProjects(username);

  const matchedIds = useMemo(
    () => new Set(queryResult?.matched_building_ids ?? []),
    [queryResult]
  );
  const matchedBuildings = useMemo(
    () => buildings.filter((building) => matchedIds.has(building.id)),
    [buildings, matchedIds]
  );
  const visiblePermitCount = showPermits ? Math.min(permits.length, 45) : 0;
  const selectedBuildingPermits = useMemo(() => {
    if (!selectedBuilding) return [];
    const buildingKey = addressKey(selectedBuilding.address);
    if (!buildingKey) return [];
    return permits
      .filter((permit) => {
        const permitKey = addressKey(permit.address);
        return permitKey && (permitKey.includes(buildingKey) || buildingKey.includes(permitKey));
      })
      .slice(0, 4);
  }, [permits, selectedBuilding]);

  async function handleQuery(query) {
    setQueryLoading(true);
    setQueryError("");
    try {
      const result = await runQuery(query);
      setQueryResult(result);
      setSelectedPermit(null);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  }

  async function handleSaveProject(name) {
    if (!queryResult) return;
    await projects.saveProject({
      name,
      query: queryResult.query,
      filters: queryResult.filters
    });
  }

  async function handleLoadProject(project) {
    setQueryLoading(true);
    setQueryError("");
    try {
      const result = await filterBuildings(project.filters);
      setQueryResult({
        query: project.query || project.name,
        method: "saved-project",
        filters: project.filters,
        matched_building_ids: result.matched_building_ids,
        match_count: result.match_count
      });
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  }

  return (
    <main className="appShell">
      <section className="mapStage" aria-label="3D Calgary map">
        {loading ? (
          <div className="loadingState">
            <Loader2 className="spin" size={24} />
            <span>Loading Calgary block data</span>
          </div>
        ) : (
          <CityScene
            buildings={buildings}
            permits={permits}
            metadata={metadata}
            matchedIds={matchedIds}
            selectedBuilding={selectedBuilding}
            selectedPermit={selectedPermit}
            showPermits={showPermits}
            onClearSelection={() => {
              setSelectedBuilding(null);
              setSelectedPermit(null);
            }}
            onSelectBuilding={(building) => {
              setSelectedBuilding((current) => (current?.id === building.id ? null : building));
              setSelectedPermit(null);
            }}
            onSelectPermit={(permit) => {
              setSelectedPermit((current) => (current?.id === permit.id ? null : permit));
              setSelectedBuilding(null);
            }}
          />
        )}
      </section>

      <aside className="controlRail" aria-label="UrbanLens controls">
        <header className="brandBlock">
          <div>
            <p className="eyebrow">UrbanLensYYC</p>
            <h1>Calgary block intelligence</h1>
          </div>
          <button className="iconButton" onClick={refresh} title="Refresh cached Calgary data">
            <Database size={18} />
          </button>
        </header>

        {error ? <div className="alert">{error}</div> : null}

        <div className="metricGrid">
          <Metric icon={<Building2 size={16} />} label="Buildings" value={buildings.length} />
          <Metric icon={<Layers size={16} />} label="Pins" value={`${visiblePermitCount}/${permits.length}`} />
          <Metric icon={<Eye size={16} />} label="Matches" value={queryResult?.match_count ?? 0} />
        </div>

        <label className="userInput">
          <UserRound size={16} />
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="username"
          />
        </label>

        <div className="toggleRow">
          <span>Permit layer</span>
          <button
            className={showPermits ? "toggle isOn" : "toggle"}
            onClick={() => setShowPermits((value) => !value)}
            aria-pressed={showPermits}
          >
            <span />
          </button>
        </div>

        <QueryPanel
          onSubmit={handleQuery}
          loading={queryLoading}
          error={queryError}
          result={queryResult}
          icon={<Search size={16} />}
        />

        <ProjectPanel
          projects={projects.items}
          loading={projects.loading}
          disabled={!queryResult}
          onSave={handleSaveProject}
          onLoad={handleLoadProject}
          icon={<Save size={16} />}
        />

        <ResultsPanel
          buildings={matchedBuildings}
          selectedBuildingId={selectedBuilding?.id}
          onSelectBuilding={(building) => {
            setSelectedBuilding((current) => (current?.id === building.id ? null : building));
            setSelectedPermit(null);
          }}
        />

        <DataPanel
          building={selectedBuilding}
          permit={selectedPermit}
          relatedPermits={selectedBuildingPermits}
          metadata={metadata}
        />
      </aside>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      <div className="metricIcon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function addressKey(value = "") {
  return String(value)
    .toUpperCase()
    .replace(/^#\S+\s+/, "")
    .replace(/\b(CALGARY|AB|CANADA)\b/g, "")
    .replace(/[^A-Z0-9]/g, "");
}
