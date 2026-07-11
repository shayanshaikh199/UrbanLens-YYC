const COLORS = {
  "CC-X": "#2dd4bf",
  "CC-MH": "#60a5fa",
  "CC-MHX": "#a3e635",
  "CC-COR": "#fb7185",
  "C-COR1": "#c084fc",
  DC: "#facc15",
  UNKNOWN: "#f97316"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
