const COLORS = {
  "CC-X": "#7ea48f",
  "CC-MH": "#6b8fb4",
  "CC-MHX": "#9b8bc2",
  "CC-COR": "#c9a65f",
  "C-COR1": "#c58b6b",
  DC: "#8f9a6d",
  UNKNOWN: "#aeb8b2"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
