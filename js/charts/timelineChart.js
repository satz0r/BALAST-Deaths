function createTimelineChart() {
  const customMargins = { top: 20, right: 20, bottom: 80, left: 60 };
  const {
    g,
    width: containerWidth,
    height,
  } = createBaseChart("#timelineChart", 360, true, customMargins);

  const width = Math.max(containerWidth, MIN_TIMELINE_WIDTH);

  // Rollup with names
  const dailyData = d3.rollup(
    filteredData,
    (v) => ({
      count: v.length,
      names: v.map((dd) => dd.characterName),
    }),
    (d) => d3.timeDay(d.date)
  );

  const dailyArray = Array.from(dailyData, ([date, info]) => ({
    date,
    count: info.count,
    names: info.names,
  })).sort((a, b) => a.date - b.date);

  // Add padding to time domain
  const dayMs = 1000 * 60 * 60 * 24;
  const minDate = new Date(d3.min(dailyArray, (d) => d.date) - dayMs / 2);
  const maxDate = new Date(d3.max(dailyArray, (d) => d.date) + dayMs / 2);

  const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

  const maxCount = d3.max(dailyArray, (d) => d.count) || 1;
  const y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

  const barWidth = Math.min(4, (width / dailyArray.length) * 0.8);

  g.selectAll(".daily-bar")
    .data(dailyArray)
    .enter()
    .append("rect")
    .attr("class", "daily-bar")
    .attr("x", (d) => x(d.date) - barWidth / 2)
    .attr("width", barWidth)
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => height - y(d.count))
    .attr("fill", "#ff6b6b")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("opacity", 0.7);
      const formattedNames = d.names.join("<br/>");
      showTooltip(
        event,
        `<strong>${d3.timeFormat("%B %d, %Y")(d.date)}</strong><br/>
         Deaths: ${d.count}<br/>
         ${formattedNames}`
      );
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).style("opacity", 1);
      hideTooltip();
    });

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(getSmartTickCount(maxCount)));
}
