const COLORS = {
  "CC-X": "#d8d8d2",
  "CC-MH": "#a7adb0",
  "CC-MHX": "#707a7d",
  "CC-COR": "#c0b49c",
  "C-COR1": "#8c8172",
  DC: "#4f5654",
  UNKNOWN: "#2f3432"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
