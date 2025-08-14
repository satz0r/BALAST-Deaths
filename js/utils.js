let tooltip; // Tooltip element

function showTooltip(event, content) {
  if (!tooltip) tooltip = d3.select("#tooltip");
  tooltip
    .style("opacity", 1)
    .html(content)
    .style("left", event.pageX + 15 + "px")
    .style("top", event.pageY - 10 + "px");
}

function hideTooltip() {
  if (tooltip) tooltip.style("opacity", 0);
}

function moveTooltip(event) {
  if (tooltip) {
    tooltip
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 10 + "px");
  }
}

function getSmartTickCount(maxValue) {
  if (maxValue <= 1) return maxValue + 1;
  if (maxValue <= 5) return maxValue + 1;
  if (maxValue <= 10) return Math.min(maxValue + 1, 6);
  return Math.min(10, Math.ceil(maxValue / 5));
}

function calculateLeftMargin(data, key = "loc", fontSize = 11) {
  const maxLength = Math.max(...data.map((d) => (d[key] ? d[key].length : 0)));
  return Math.max(80, maxLength * 7 + 20);
}

function updateFilter(filterId, value) {
  const select = d3.select(`#${filterId}`);
  select.property("value", value);
  updateDashboard();
}
