function createBaseChart(
  containerId,
  customHeight = 300,
  hasRotatedLabels = false,
  customMargins = null
) {
  let margin;

  if (customMargins) {
    margin = customMargins;
  } else {
    margin = {
      top: 20,
      right: 20,
      bottom: hasRotatedLabels ? 80 : 40,
      left: 40,
    };
  }

  const container = d3.select(containerId);
  const containerWidth = container.node().getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;
  const height = customHeight - margin.bottom - margin.top;

  container.selectAll("*").remove();

  const svg = container
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", customHeight)
    .style("display", "block")
    .style("margin", "0 auto");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { container, svg, g, width, height, margin };
}
