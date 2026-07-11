const COLORS = {
  "CC-X": "#78948a",
  "CC-MH": "#6f86a3",
  "CC-MHX": "#8c7fa4",
  "CC-COR": "#b99654",
  "C-COR1": "#b27b5d",
  DC: "#7d8b68",
  UNKNOWN: "#aeb8b2"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
