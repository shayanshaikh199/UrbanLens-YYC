import { Building2, FileText, ReceiptText, X } from "lucide-react";

export function DataPanel({ building, permit, relatedPermits = [], matchSummary = "", onClose }) {
  if (building) {
    return (
      <section className="panel selectedPanel">
        <PanelHeader icon={<Building2 size={16} />} title="Selected building" onClose={onClose} />
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
        <PanelHeader icon={<FileText size={16} />} title="Selected permit" onClose={onClose} />
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

  return null;
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
  const visiblePermits = permits.slice(0, 3);
  const hiddenCount = Math.max(0, permits.length - visiblePermits.length);

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
        <span>{permits.length}</span>
      </div>
      <div className="miniPermitList">
        {visiblePermits.map((item) => (
          <div key={item.id} className="miniPermit">
            <span className="permitStatusBadge">{statusLabel(item.status)}</span>
            <div className="miniPermitMain">
              <strong>{item.permit_type || "Permit record"}</strong>
              <small>{dateLabel(item.properties?.issued_date)}</small>
            </div>
            {item.estimated_project_cost ? (
              <span className="permitCost">{currency(item.estimated_project_cost)}</span>
            ) : null}
          </div>
        ))}
      </div>
      {hiddenCount ? <p className="permitOverflow">+{hiddenCount} more permit records</p> : null}
    </div>
  );
}

function PanelHeader({ icon, title, onClose }) {
  return (
    <div className="panelHeader">
      {icon}
      <h2>{title}</h2>
      {onClose ? (
        <button className="popupCloseButton" type="button" onClick={onClose} title="Close details">
          <X size={16} />
        </button>
      ) : null}
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

function statusLabel(value) {
  const label = value && value !== "UNKNOWN" ? value : "Unknown";
  return label.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
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
