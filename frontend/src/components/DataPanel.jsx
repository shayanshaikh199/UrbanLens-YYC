import { Building2, FileText, MapPinned } from "lucide-react";

export function DataPanel({ building, permit, metadata }) {
  if (building) {
    return (
      <section className="panel">
        <PanelHeader icon={<Building2 size={16} />} title="Selected building" />
        <dl className="detailList">
          <Row label="Address" value={building.address} />
          <Row label="Height" value={`${building.height_m} m`} />
          <Row label="Floors" value={building.floors} />
          <Row label="Zoning" value={building.zoning} />
          <Row label="Land use" value={building.land_use} />
          <Row label="Assessed" value={currency(building.assessed_value)} />
        </dl>
      </section>
    );
  }

  if (permit) {
    return (
      <section className="panel">
        <PanelHeader icon={<FileText size={16} />} title="Selected permit" />
        <dl className="detailList">
          <Row label="Address" value={permit.address} />
          <Row label="Type" value={permit.permit_type} />
          <Row label="Status" value={permit.status} />
          <Row label="Cost" value={currency(permit.estimated_project_cost)} />
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
