export function filterSummary(filters = []) {
  if (!filters.length) return "No filters applied";
  return filters.map((filter) => describeFilter(filter)).join(" and ");
}

export function resultExplanation(result) {
  if (!result) return "";
  const count = Number(result.match_count ?? 0);
  const noun = count === 1 ? "building" : "buildings";
  if (!result.filters?.length) {
    return `Matched ${count} ${noun} without an active filter.`;
  }
  return `Matched ${count} ${noun} where ${filterSummary(result.filters)}.`;
}

export function describeFilter(filter) {
  if (filter.operator === "top") {
    const direction = filter.direction === "asc" ? "lowest" : "highest";
    return `${direction} ${labelFor(filter.attribute)} results`;
  }
  return `${labelFor(filter.attribute)} ${operatorFor(filter.operator)} ${valueFor(filter)}`;
}

export function labelFor(attribute) {
  const labels = {
    assessed_value: "assessed value",
    floors: "floors",
    height_m: "height",
    land_use: "land use",
    zoning: "zoning"
  };
  return labels[attribute] ?? attribute?.replaceAll("_", " ") ?? "field";
}

function operatorFor(operator) {
  const operators = {
    ">": "over",
    ">=": "at least",
    "<": "under",
    "<=": "at most",
    "=": "is",
    contains: "contains"
  };
  return operators[operator] ?? operator;
}

function valueFor(filter) {
  if (filter.attribute === "assessed_value" && Number.isFinite(Number(filter.value))) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    }).format(filter.value);
  }
  if (filter.attribute === "height_m" && Number.isFinite(Number(filter.value))) {
    return `${filter.value} m`;
  }
  return String(filter.value ?? "unknown");
}
