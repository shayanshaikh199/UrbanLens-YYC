const COLORS = {
  "CC-X": "#d9dee4",
  "CC-MH": "#9fb0c0",
  "CC-MHX": "#526477",
  "CC-COR": "#f1f0eb",
  "C-COR1": "#6f7f8d",
  DC: "#7f93a6",
  UNKNOWN: "#b8c1c8"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
