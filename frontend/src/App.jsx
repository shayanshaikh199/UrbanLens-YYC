import {
  Bookmark,
  Building2,
  Database,
  Eye,
  Layers,
  Loader2,
  MapPinned,
  Menu,
  Save,
  Search,
  Send,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CityScene } from "./components/CityScene.jsx";
import { DataPanel } from "./components/DataPanel.jsx";
import { InsightsPanel } from "./components/InsightsPanel.jsx";
import { ManualFilterPanel } from "./components/ManualFilterPanel.jsx";
import { ProjectPanel } from "./components/ProjectPanel.jsx";
import { ResultsPanel } from "./components/ResultsPanel.jsx";
import { SunStudyPanel } from "./components/SunStudyPanel.jsx";
import { transitStops } from "./data/transitStops.js";
import { useMapData } from "./hooks/useMapData.js";
import { useProjects } from "./hooks/useProjects.js";
import { filterBuildings, runQuery } from "./services/api.js";

const USERNAME_STORAGE_KEY = "urbanlens-yyc-username";

export default function App() {
  const { buildings, permits, metadata, loading, error, refresh } = useMapData();
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [showPermits, setShowPermits] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [sunHour, setSunHour] = useState(14);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [queryDraft, setQueryDraft] = useState("show commercial buildings");
  const [saveNameDraft, setSaveNameDraft] = useState("");
  const [saveNamePromptOpen, setSaveNamePromptOpen] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState("");
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(USERNAME_STORAGE_KEY) || "";
  });
  const [projectNotice, setProjectNotice] = useState("");
  const projects = useProjects(username);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cleanUsername = username.trim();
    if (cleanUsername) {
      window.localStorage.setItem(USERNAME_STORAGE_KEY, cleanUsername);
    } else {
      window.localStorage.removeItem(USERNAME_STORAGE_KEY);
    }
  }, [username]);

  const matchedIds = useMemo(
    () => new Set(queryResult?.matched_building_ids ?? []),
    [queryResult]
  );
  const matchedBuildings = useMemo(
    () => buildings.filter((building) => matchedIds.has(building.id)),
    [buildings, matchedIds]
  );
  const areaPermits = useMemo(
    () => permits.filter((permit) => permitInsideBounds(permit, metadata?.bounds)),
    [metadata?.bounds, permits]
  );
  const visiblePermitCount = showPermits ? Math.min(areaPermits.length, 45) : 0;
  const selectedBuildingPermits = useMemo(() => {
    if (!selectedBuilding) return [];
    const buildingKey = addressKey(selectedBuilding.address);
    if (!buildingKey) return [];
    return areaPermits
      .filter((permit) => {
        const permitKey = addressKey(permit.address);
        return permitKey && (permitKey.includes(buildingKey) || buildingKey.includes(permitKey));
      })
      .slice(0, 4);
  }, [areaPermits, selectedBuilding]);
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

  async function handleDockSubmit(event) {
    event.preventDefault();
    if (!queryDraft.trim()) return;
    await handleQuery(queryDraft.trim());
  }

  async function handleQuickSave() {
    if (!queryResult) return;
    const source = queryResult.query || "Map filter";
    if (!username.trim()) {
      setSaveNamePromptOpen(true);
      setProjectNotice("");
      return false;
    }
    await handleSaveProject(source, username);
    return true;
  }

  async function handleSaveProject(name, usernameOverride = username) {
    if (!queryResult) return;
    setProjectNotice("");
    try {
      await projects.saveProject({
        name,
        query: queryResult.query,
        filters: queryResult.filters
      }, usernameOverride);
      setProjectNotice(`Saved "${name}"`);
    } catch (err) {
      setProjectNotice(err.message);
    }
  }

  async function handleSaveNameSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    const nextUsername = saveNameDraft.trim();
    if (nextUsername.length < 2 || !queryResult) return;
    setUsername(nextUsername);
    setSaveNamePromptOpen(false);
    await handleSaveProject(queryResult.query || "Map filter", nextUsername);
    setProjectsOpen(true);
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
    <main className={toolsOpen ? "appShell mapFirstShell hasToolsOpen" : "appShell mapFirstShell"}>
      <section className="mapStage" aria-label="3D Calgary map">
        <div className="mapTopBar">
          <div className="mapIdentity">
            <span>UrbanLens-YYC</span>
            <strong>Downtown Core / Stephen Ave</strong>
          </div>
          <div className="mapQuickStats" aria-label="Map summary">
            <span>{buildings.length} buildings</span>
            <span>{visiblePermitCount} permit pins</span>
            <span>{queryResult?.match_count ?? 0} matches</span>
          </div>
          <button
            className="toolsButton"
            type="button"
            onClick={() => setToolsOpen(true)}
            aria-expanded={toolsOpen}
            title="Open map tools"
          >
            <Menu size={18} />
            <span>Tools</span>
          </button>
        </div>

        {error ? <div className="mapAlert">{error}</div> : null}

        {loading ? (
          <div className="loadingState">
            <Loader2 className="spin" size={24} />
            <span>Loading Calgary block data</span>
          </div>
        ) : (
          <CityScene
            buildings={buildings}
            permits={areaPermits}
            metadata={metadata}
            matchedIds={matchedIds}
            selectedBuilding={selectedBuilding}
            selectedPermit={selectedPermit}
            showPermits={showPermits}
            showRoads={showRoads}
            showTransit={showTransit}
            transitStops={transitStops}
            sunHour={sunHour}
            shadowsEnabled
            onClearSelection={() => {
              setSelectedBuilding(null);
              setSelectedPermit(null);
            }}
            onSelectBuilding={(building) => {
              setSelectedBuilding((current) => (current?.id === building.id ? null : building));
              setSelectedPermit(null);
              setProjectsOpen(false);
            }}
            onSelectPermit={(permit) => {
              setSelectedPermit((current) => (current?.id === permit.id ? null : permit));
              setSelectedBuilding(null);
              setProjectsOpen(false);
            }}
          />
        )}

        {selectedBuilding || selectedPermit ? (
          <div className="selectionPopup" role="dialog" aria-label="Selected map item">
            <DataPanel
              building={selectedBuilding}
              permit={selectedPermit}
              relatedPermits={selectedBuildingPermits}
              matchSummary={selectedMatchSummary}
              metadata={metadata}
              onClose={() => {
                setSelectedBuilding(null);
                setSelectedPermit(null);
              }}
            />
          </div>
        ) : null}

        <div className="mapSunControl">
          <SunStudyPanel
            hour={sunHour}
            onHourChange={setSunHour}
          />
        </div>

        <div className="zoningLegend" aria-label="Building color legend">
          <span>Zoning</span>
          <LegendItem color="#d9dee4" label="CC-X" />
          <LegendItem color="#9fb0c0" label="CC-MH" />
          <LegendItem color="#526477" label="CC-MHX" />
          <LegendItem color="#f1f0eb" label="CC-COR" />
          <LegendItem color="#6f7f8d" label="C-COR1" />
          <LegendItem color="#7f93a6" label="DC" />
          <LegendItem color="#ffffff" label="Selected / match outline" />
        </div>

        <form className="mapQueryDock" onSubmit={handleDockSubmit}>
          <Search size={18} />
          <input
            value={queryDraft}
            onChange={(event) => setQueryDraft(event.target.value)}
            placeholder="Ask AI to highlight buildings, permits, zoning, height..."
            aria-label="Ask AI about the map"
            onFocus={() => setSaveNamePromptOpen(false)}
          />
          <button className="dockRunButton" disabled={queryLoading || !queryDraft.trim()} title="Run query">
            {queryLoading ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
            <span>Run</span>
          </button>
          <button
            className="dockSaveButton"
            type="button"
            disabled={!queryResult}
            onClick={async () => {
              const didSave = await handleQuickSave();
              if (didSave) setProjectsOpen(true);
            }}
            title="Save current filter"
          >
            <Save size={17} />
          </button>
          {queryError ? <p className="dockMessage isError">{queryError}</p> : null}
          {projectNotice ? <p className="dockMessage">{projectNotice}</p> : null}
          {queryResult ? (
            <div className="dockResult">
              <strong>{queryResult.match_count} matches</strong>
              <span>{queryResult.query || "Current filter"}</span>
              <button
                className="dockClearMatchesButton"
                type="button"
                onClick={() => {
                  setQueryResult(null);
                  setSelectedBuilding(null);
                  setSelectedPermit(null);
                  setProjectNotice("");
                }}
                title="Clear matched buildings"
              >
                <X size={14} />
                <span>Clear matches</span>
              </button>
            </div>
          ) : null}
          {saveNamePromptOpen ? (
            <div className="saveNamePrompt">
              <span>Save under</span>
              <input
                value={saveNameDraft}
                onChange={(event) => setSaveNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Your name"
                aria-label="Name for saved searches"
                autoFocus
              />
              <button
                type="button"
                disabled={saveNameDraft.trim().length < 2}
                onClick={handleSaveNameSubmit}
              >
                Save
              </button>
            </div>
          ) : null}
        </form>

        <div className="savedProjectsArea">
          <button
            className="savedProjectsButton"
            type="button"
            onClick={() => setProjectsOpen((value) => !value)}
            aria-expanded={projectsOpen}
            title="Open saved searches"
          >
            <Bookmark size={17} />
            <span>Saved</span>
            {projects.items.length ? <strong>{projects.items.length}</strong> : null}
          </button>
          {projectsOpen ? (
            <div className="savedProjectsPopover">
              <ProjectPanel
                projects={projects.items}
                loading={projects.loading}
                error={projects.error}
                notice={projectNotice}
                username={username}
                onUsernameChange={setUsername}
                onLoad={(project) => {
                  handleLoadProject(project);
                  setProjectsOpen(false);
                }}
                onDelete={handleDeleteProject}
              />
            </div>
          ) : null}
        </div>
      </section>

      {toolsOpen ? (
        <button
          className="drawerScrim"
          type="button"
          aria-label="Close tools"
          onClick={() => setToolsOpen(false)}
        />
      ) : null}

      <aside className="toolsDrawer" aria-label="UrbanLens controls" aria-hidden={!toolsOpen}>
        <header className="drawerHeader">
          <div>
            <p className="eyebrow">UrbanLens-YYC</p>
            <h1>Map tools</h1>
          </div>
          <div className="drawerHeaderActions">
            <button className="iconButton" onClick={refresh} title="Refresh cached Calgary data">
              <Database size={18} />
            </button>
            <button className="iconButton" onClick={() => setToolsOpen(false)} title="Close tools">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="metricGrid">
          <Metric icon={<Building2 size={16} />} label="Buildings" value={buildings.length} />
          <Metric icon={<Layers size={16} />} label="Permit pins" value={`${visiblePermitCount} shown`} />
          <Metric icon={<MapPinned size={16} />} label="Bus stops" value={transitStops.length} />
          <Metric icon={<Eye size={16} />} label="Matches" value={queryResult?.match_count ?? 0} />
        </div>

        <ResultsPanel
          buildings={matchedBuildings}
          selectedBuildingId={selectedBuilding?.id}
          onSelectBuilding={(building) => {
            setSelectedBuilding((current) => (current?.id === building.id ? null : building));
            setSelectedPermit(null);
            setProjectsOpen(false);
            setToolsOpen(false);
          }}
        />

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
          <div className="toggleRow">
            <span>Bus stops</span>
            <button
              className={showTransit ? "toggle isOn" : "toggle"}
              onClick={() => setShowTransit((value) => !value)}
              aria-pressed={showTransit}
            >
              <span />
            </button>
          </div>
        </div>

        <ManualFilterPanel
          loading={queryLoading}
          onApply={handleManualFilters}
          onClear={handleClearManualFilters}
        />

        <InsightsPanel buildings={buildings} permits={areaPermits} />
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

function LegendItem({ color, label }) {
  return (
    <div className="legendItem">
      <i style={{ "--legend-color": color }} />
      <strong>{label}</strong>
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

function permitInsideBounds(permit, bounds) {
  if (!bounds?.sw || !bounds?.ne || !permit?.center) return true;
  const [lat, lng] = permit.center;
  const [south, west] = bounds.sw;
  const [north, east] = bounds.ne;
  const latPadding = Math.max((north - south) * 0.25, 0.00035);
  const lngPadding = Math.max((east - west) * 0.25, 0.00035);
  return (
    lat >= south - latPadding &&
    lat <= north + latPadding &&
    lng >= west - lngPadding &&
    lng <= east + lngPadding
  );
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
    assessed_value: "Assessment value",
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
