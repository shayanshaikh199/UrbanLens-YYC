const COLORS = {
  "CC-X": "#e2e1da",
  "CC-MH": "#c4c9c9",
  "CC-MHX": "#a3abad",
  "CC-COR": "#d2c6ab",
  "C-COR1": "#b2a18b",
  DC: "#8c9691",
  UNKNOWN: "#757d78"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
