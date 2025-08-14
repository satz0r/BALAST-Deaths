function createLocationChart() {
  const locationCounts = d3.rollup(
    filteredData.filter((d) => d.location),
    (v) => v.length,
    (d) => d.location
  );
  const locationData = Array.from(locationCounts, ([loc, count]) => ({
    loc,
    count,
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const leftMargin = calculateLeftMargin(locationData);
  const customMargins = { top: 20, right: 30, bottom: 40, left: leftMargin };

  const { g, width, height } = createBaseChart(
    "#locationChart",
    400,
    false,
    customMargins
  );

  const y = d3
    .scaleBand()
    .domain(locationData.map((d) => d.loc))
    .range([0, height])
    .padding(0.1);

  const maxCount = d3.max(locationData, (d) => d.count) || 1;
  const x = d3.scaleLinear().domain([0, maxCount]).range([0, width]);

  g.selectAll(".bar")
    .data(locationData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr(
      "y",
      (d) =>
        y(d.loc) + (y.bandwidth() - Math.min(MAX_BAR_HEIGHT, y.bandwidth())) / 2
    )
    .attr("height", (d) => Math.min(MAX_BAR_HEIGHT, y.bandwidth()))
    .attr("x", 0)
    .attr("width", (d) => x(d.count))
    .attr("fill", "#45b7d1")
    .style("cursor", "pointer")
    .on("click", (event, d) => updateFilter("locationFilter", d.loc))
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("opacity", 0.7);
      showTooltip(event, `<strong>${d.loc}</strong><br/>Deaths: ${d.count}`);
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
    .attr("dx", "-5");

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
