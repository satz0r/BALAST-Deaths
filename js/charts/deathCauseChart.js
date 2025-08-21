function createDeathCauseChart() {
  const deathCauseCounts = d3.rollup(
    filteredData.filter((d) => d.death_cause),
    (v) => v.length,
    (d) => d.death_cause
  );

  const deathCauseData = Array.from(
    deathCauseCounts,
    ([death_cause, count]) => ({
      death_cause,
      count,
    })
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Increased from 15 to 20 to show more entries with tighter spacing

  const leftMargin = calculateLeftMargin(deathCauseData, "death_cause");
  const customMargins = { top: 20, right: 30, bottom: 40, left: leftMargin };

  // Calculate dynamic height based on number of entries
  const minHeight = 200; // Minimum height for small datasets
  const barHeight = 22; // Reduced from 30 to 22 for tighter spacing
  const dynamicHeight = Math.max(
    minHeight,
    deathCauseData.length * barHeight + customMargins.top + customMargins.bottom
  );

  const { g, width, height } = createBaseChart(
    "#deathCauseChart",
    dynamicHeight, // Use dynamic height instead of fixed 500
    false,
    customMargins
  );

  const y = d3
    .scaleBand()
    .domain(deathCauseData.map((d) => d.death_cause))
    .range([0, height])
    .padding(0.05); // Reduced from 0.1 to 0.05 for tighter spacing

  const maxCount = d3.max(deathCauseData, (d) => d.count) || 1;
  const x = d3.scaleLinear().domain([0, maxCount]).range([0, width]);

  g.selectAll(".bar")
    .data(deathCauseData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr(
      "y",
      (d) =>
        y(d.death_cause) +
        (y.bandwidth() - Math.min(MAX_BAR_HEIGHT, y.bandwidth())) / 2
    )
    .attr("height", (d) => Math.min(MAX_BAR_HEIGHT, y.bandwidth()))
    .attr("x", 0)
    .attr("width", (d) => x(d.count))
    .attr("fill", (d) => getDeathCauseColor(d.death_cause))
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      hideTooltip(); // Hide tooltip when clicking
      updateFilter("deathCauseFilter", d.death_cause);
    })
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("opacity", 0.7);
      showTooltip(
        event,
        `<strong>${d.death_cause}</strong><br/>Deaths: ${d.count}`
      );
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).style("opacity", 1);
      hideTooltip();
    });

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "11px")
    .style("text-anchor", "end")
    .attr("dx", "-8")
    .attr("dy", "0.32em");

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(getSmartTickCount(maxCount))
        .tickFormat(d3.format("d"))
    );

  // Add reset button if filter is active
  const deathCauseFilter = d3.select("#deathCauseFilter").node().value;
  updateChartResetButton(
    "deathCauseChartTitle",
    "deathCauseFilter",
    deathCauseFilter
  );
}
