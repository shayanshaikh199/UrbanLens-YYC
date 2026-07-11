const COLORS = {
  "CC-X": "#7fa08d",
  "CC-MH": "#658bb1",
  "CC-MHX": "#9a8abd",
  "CC-COR": "#c4a15a",
  "C-COR1": "#bd8465",
  DC: "#87966c",
  UNKNOWN: "#b5bdb8"
};

export function zoningColor(zoning) {
  return COLORS[zoning] || COLORS.UNKNOWN;
}
