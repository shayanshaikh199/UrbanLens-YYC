const COLORS = {
  "CC-X": "#d5c089",
  "CC-MH": "#a9bdc7",
  "CC-MHX": "#91a98e",
  "CC-COR": "#c79b73",
  "C-COR1": "#9f8ab7",
  DC: "#c8c3b1",
  UNKNOWN: "#8b938c"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
