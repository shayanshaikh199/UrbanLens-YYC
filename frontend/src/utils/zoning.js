const COLORS = {
  "CC-X": "#8aa1a8",
  "CC-MH": "#748c94",
  "CC-MHX": "#8c839b",
  "CC-COR": "#c0a06c",
  "C-COR1": "#ac826f",
  DC: "#b49786",
  UNKNOWN: "#7b847e"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
