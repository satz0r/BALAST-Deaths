function createDeathCauseChart() {
  const deathCauseFilter = d3.select("#deathCauseFilter").node().value;
  const titleElement = d3.select("#deathCauseChartTitle");

  // If a specific death cause is selected, show character list instead of chart
  if (deathCauseFilter !== "all") {
    titleElement.text(`Deaths by: ${deathCauseFilter}`);
    createDeathCauseCharacterList();
    return;
  }

  titleElement.text("Cause of Death");

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
    .slice(0, 15); // Increased from 10 to 15

  const leftMargin = calculateLeftMargin(deathCauseData, "death_cause");
  const customMargins = { top: 20, right: 30, bottom: 40, left: leftMargin };

  const { g, width, height } = createBaseChart(
    "#deathCauseChart",
    500, // Increased height from 400 to 500
    false,
    customMargins
  );

  const y = d3
    .scaleBand()
    .domain(deathCauseData.map((d) => d.death_cause))
    .range([0, height])
    .padding(0.1);

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
}

function createDeathCauseCharacterList() {
  const deathCauseFilter = d3.select("#deathCauseFilter").node().value;
  const deathCauseData = filteredData.filter(
    (d) => d.death_cause === deathCauseFilter
  );

  createCharacterList({
    containerId: "#deathCauseChart",
    filterType: "deathCauseFilter",
    filterValue: deathCauseFilter,
    data: deathCauseData,
    borderColor: getDeathCauseColor(deathCauseFilter), // Use death cause-specific color
    backButtonText: "← Back to Death Cause Chart",
    getAdditionalInfo: CharacterListHelpers.getDeathCauseChartInfo,
  });
}
