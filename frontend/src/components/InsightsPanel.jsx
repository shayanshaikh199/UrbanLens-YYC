import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

export function InsightsPanel({ buildings, permits }) {
  const insights = useMemo(() => buildInsights(buildings, permits), [buildings, permits]);

  if (!buildings.length) return null;

  return (
    <section className="panel">
      <div className="panelHeader">
        <BarChart3 size={16} />
        <h2>Downtown insights</h2>
      </div>
      <div className="insightGrid">
        <Insight label="Commercial share" value={`${insights.commercialShare}%`} />
        <Insight label="Avg height" value={`${insights.averageHeight} m`} />
        <Insight label="Median assessment" value={currency(insights.medianValue)} />
      </div>
      <div className="insightList">
        <InsightRow label="Top land use" value={insights.topLandUse} />
        <InsightRow label="Top zoning" value={insights.topZoning} />
        <InsightRow label="Permit activity" value={insights.topPermitType} />
      </div>
    </section>
  );
}

function Insight({ label, value }) {
  return (
    <div className="insightMetric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InsightRow({ label, value }) {
  return (
    <div className="insightRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildInsights(buildings, permits) {
  const commercialCount = buildings.filter((item) => item.land_use === "COMMERCIAL").length;
  const heights = buildings.map((item) => Number(item.height_m)).filter(Number.isFinite);
  const values = buildings.map((item) => Number(item.assessed_value)).filter((value) => Number.isFinite(value) && value > 0);

  return {
    commercialShare: Math.round((commercialCount / buildings.length) * 100),
    averageHeight: Math.round(average(heights)),
    medianValue: median(values),
    topLandUse: topCount(buildings.map((item) => item.land_use)),
    topZoning: topCount(buildings.map((item) => item.zoning)),
    topPermitType: topCount(permits.map((item) => item.permit_type))
  };
}

function topCount(values) {
  const counts = values.reduce((acc, value) => {
    const label = value || "Unknown";
    acc.set(label, (acc.get(label) || 0) + 1);
    return acc;
  }, new Map());
  const [label, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ["None", 0];
  return count ? `${label} (${count})` : label;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function currency(value) {
  if (!value) return "Unknown";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
