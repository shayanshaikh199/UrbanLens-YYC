import { Building2, FileText, MapPinned, ReceiptText } from "lucide-react";

export function DataPanel({ building, permit, relatedPermits = [], matchSummary = "", metadata }) {
  if (building) {
    return (
      <section className="panel selectedPanel">
        <PanelHeader icon={<Building2 size={16} />} title="Selected building" />
        <div className="selectionBadge">Building selected</div>
        <div className="statRow">
          <Stat label="Height" value={`${building.height_m} m`} />
          <Stat label="Floors" value={building.floors} />
          <Stat label="Use" value={building.land_use} />
        </div>
        <dl className="detailList">
          <Row label="Address" value={building.address} />
          <Row label="Zoning" value={building.zoning} />
          <Row label="Assessed" value={currency(building.assessed_value)} />
        </dl>
        {matchSummary ? (
          <div className="matchReason">
            <span>Matched query</span>
            <strong>{matchSummary}</strong>
          </div>
        ) : null}
        <PermitSummary permits={relatedPermits} />
      </section>
    );
  }

  if (permit) {
    return (
      <section className="panel selectedPanel permitPanel">
        <PanelHeader icon={<FileText size={16} />} title="Selected permit" />
        <div className="selectionBadge">Permit marker selected</div>
        <div className="statRow">
          <Stat label="Status" value={permit.status} />
          <Stat label="Cost" value={currency(permit.estimated_project_cost)} />
        </div>
        <dl className="detailList">
          <Row label="Address" value={permit.address} />
          <Row label="Type" value={permit.permit_type} />
          <Row label="Number" value={permit.properties?.permit_number} />
          <Row label="Issued" value={dateLabel(permit.properties?.issued_date)} />
          <Row label="Contractor" value={permit.properties?.contractor} />
        </dl>
      </section>
    );
  }

  return (
    <section className="panel">
      <PanelHeader icon={<MapPinned size={16} />} title="Area" />
      <dl className="detailList">
        <Row label="Name" value={metadata?.area_name ?? "Calgary"} />
        <Row label="Source" value={metadata?.source ?? "cache"} />
        <Row label="Center" value={metadata?.center?.join(", ")} />
      </dl>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value ?? "Unknown"}</strong>
    </div>
  );
}

function PermitSummary({ permits }) {
  if (!permits.length) {
    return (
      <div className="permitSummary empty">
        <ReceiptText size={15} />
        <span>No permit records matched this building address.</span>
      </div>
    );
  }

  return (
    <div className="permitSummary">
      <div className="summaryHeader">
        <ReceiptText size={15} />
        <strong>Related permits</strong>
      </div>
      <div className="miniPermitList">
        {permits.map((item) => (
          <div key={item.id} className="miniPermit">
            <span>{item.status || "Unknown status"}</span>
            <strong>{currency(item.estimated_project_cost)}</strong>
            <small>{item.permit_type}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelHeader({ icon, title }) {
  return (
    <div className="panelHeader">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value ?? "Unknown"}</dd>
    </>
  );
}

function currency(value) {
  if (!value) return "Unknown";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  }).format(value);
}

function dateLabel(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}
