import { Building2, Database, Eye, Layers, Loader2, Save, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { CityScene } from "./components/CityScene.jsx";
import { DataPanel } from "./components/DataPanel.jsx";
import { InsightsPanel } from "./components/InsightsPanel.jsx";
import { ManualFilterPanel } from "./components/ManualFilterPanel.jsx";
import { ProjectPanel } from "./components/ProjectPanel.jsx";
import { QueryPanel } from "./components/QueryPanel.jsx";
import { ResultsPanel } from "./components/ResultsPanel.jsx";
import { SunStudyPanel } from "./components/SunStudyPanel.jsx";
import { useMapData } from "./hooks/useMapData.js";
import { useProjects } from "./hooks/useProjects.js";
import { filterBuildings, runQuery } from "./services/api.js";

export default function App() {
  const { buildings, permits, metadata, loading, error, refresh } = useMapData();
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showPermits, setShowPermits] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [sunHour, setSunHour] = useState(14);
  const [shadowsEnabled, setShadowsEnabled] = useState(true);
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState("");
  const [username, setUsername] = useState("shayan");
  const [projectNotice, setProjectNotice] = useState("");
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
  const selectedMatchSummary = useMemo(() => {
    if (!selectedBuilding || !matchedIds.has(selectedBuilding.id)) return "";
    return describeFilters(queryResult?.filters);
  }, [matchedIds, queryResult?.filters, selectedBuilding]);

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
    setProjectNotice("");
    try {
      await projects.saveProject({
        name,
        query: queryResult.query,
        filters: queryResult.filters
      });
      setProjectNotice(`Saved "${name}"`);
    } catch (err) {
      setProjectNotice(err.message);
    }
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
      setProjectNotice(`Loaded "${project.name}"`);
      setSelectedBuilding(null);
      setSelectedPermit(null);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  }

  async function handleManualFilters(filters) {
    setQueryLoading(true);
    setQueryError("");
    try {
      const result = await filterBuildings(filters);
      setQueryResult({
        query: "Manual filter",
        method: "manual-filter",
        filters,
        matched_building_ids: result.matched_building_ids,
        match_count: result.match_count
      });
      setProjectNotice("");
      setSelectedBuilding(null);
      setSelectedPermit(null);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setQueryLoading(false);
    }
  }

  function handleClearManualFilters() {
    if (queryResult?.method === "manual-filter") {
      setQueryResult(null);
      setSelectedBuilding(null);
      setSelectedPermit(null);
    }
    setQueryError("");
  }

  async function handleDeleteProject(project) {
    setProjectNotice("");
    try {
      await projects.deleteProject(project.id);
      setProjectNotice(`Deleted "${project.name}"`);
    } catch (err) {
      setProjectNotice(err.message);
    }
  }

  return (
    <main className="appShell">
      <section className="mapStage" aria-label="3D Calgary map">
        <div className="mapOverlay">
          <span>Downtown Core / Stephen Ave</span>
          <strong>{buildings.length} buildings</strong>
          <em>{visiblePermitCount} visible permits</em>
        </div>
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
            showRoads={showRoads}
            sunHour={sunHour}
            shadowsEnabled={shadowsEnabled}
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
            <p className="brandSubline">Downtown Core / Stephen Ave</p>
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

        <div className="layerControls">
          <div className="toggleRow">
            <span>OSM roads</span>
            <button
              className={showRoads ? "toggle isOn" : "toggle"}
              onClick={() => setShowRoads((value) => !value)}
              aria-pressed={showRoads}
            >
              <span />
            </button>
          </div>
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
        </div>

        <QueryPanel
          onSubmit={handleQuery}
          loading={queryLoading}
          error={queryError}
          result={queryResult}
          icon={<Search size={16} />}
        />

        <ManualFilterPanel
          loading={queryLoading}
          onApply={handleManualFilters}
          onClear={handleClearManualFilters}
        />

        <SunStudyPanel
          hour={sunHour}
          shadowsEnabled={shadowsEnabled}
          onHourChange={setSunHour}
          onToggleShadows={setShadowsEnabled}
        />

        <ProjectPanel
          projects={projects.items}
          loading={projects.loading}
          error={projects.error}
          notice={projectNotice}
          disabled={!queryResult}
          username={username}
          onSave={handleSaveProject}
          onLoad={handleLoadProject}
          onDelete={handleDeleteProject}
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
          matchSummary={selectedMatchSummary}
          metadata={metadata}
        />

        <InsightsPanel buildings={buildings} permits={permits} />
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

function describeFilters(filters = []) {
  if (!filters.length) return "Matched the current query";
  return filters.map((filter) => describeFilter(filter)).join(" and ");
}

function describeFilter(filter) {
  if (filter.operator === "top") {
    return `${filter.direction === "asc" ? "Lowest" : "Highest"} ${fieldLabel(filter.attribute)} ranking`;
  }
  return `${fieldLabel(filter.attribute)} ${operatorLabel(filter.operator)} ${filterValue(filter)}`;
}

function fieldLabel(attribute) {
  const labels = {
    assessed_value: "Assessed value",
    height_m: "Height",
    land_use: "Land use"
  };
  return labels[attribute] ?? attribute?.replaceAll("_", " ") ?? "Field";
}

function operatorLabel(operator) {
  const labels = {
    ">": "over",
    ">=": "at least",
    "<": "under",
    "<=": "at most",
    "=": "is",
    contains: "contains"
  };
  return labels[operator] ?? operator;
}

function filterValue(filter) {
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
