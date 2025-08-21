function createTimelineChart() {
  const customMargins = { top: 20, right: 80, bottom: 50, left: 60 }; // Reduced bottom from 80 to 50
  const {
    g,
    width: containerWidth,
    height,
    svg,
  } = createBaseChart("#timelineChart", 360, true, customMargins);

  const width = Math.max(containerWidth, MIN_TIMELINE_WIDTH);

  // Update SVG width to accommodate the full chart width including margins
  const totalSVGWidth = width + customMargins.left + customMargins.right;
  svg.attr("width", totalSVGWidth);

  // Set consistent date range: Nov 1, 2024 to end of current month
  const minDate = new Date(2024, 10, 1); // November 1, 2024 (month is 0-indexed)
  const currentDate = new Date();
  const maxDate = d3.timeMonth.ceil(currentDate); // End of current month

  // Rollup daily data with names
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

  // Rollup monthly data for secondary Y-axis
  const monthlyData = d3.rollup(
    filteredData,
    (v) => v.length,
    (d) => d3.timeMonth(d.date)
  );

  const monthlyArray = Array.from(monthlyData, ([date, count]) => ({
    date,
    count,
  })).sort((a, b) => a.date - b.date);

  // Set up scales
  const x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

  const maxDailyCount = d3.max(dailyArray, (d) => d.count) || 1;
  const y = d3.scaleLinear().domain([0, maxDailyCount]).range([height, 0]);

  const maxMonthlyCount = d3.max(monthlyArray, (d) => d.count) || 1;
  const yRight = d3
    .scaleLinear()
    .domain([0, maxMonthlyCount])
    .range([height, 0]);

  // Calculate bar widths
  const dailyBarWidth = Math.max(
    1,
    Math.min(4, (width / dailyArray.length) * 0.8) - 1
  );

  // Calculate monthly bar width to span the entire month with no gaps
  const getMonthlyBarWidth = (d) => {
    const monthStart = d3.timeMonth(d.date);
    const monthEnd = d3.timeMonth.offset(monthStart, 1);
    return x(monthEnd) - x(monthStart);
  };

  // Draw monthly bars first (behind daily bars)
  g.selectAll(".monthly-bar")
    .data(monthlyArray)
    .enter()
    .append("rect")
    .attr("class", "monthly-bar")
    .attr("x", (d) => x(d3.timeMonth(d.date)))
    .attr("width", getMonthlyBarWidth)
    .attr("y", (d) => yRight(d.count))
    .attr("height", (d) => height - yRight(d.count))
    .attr("fill", "rgba(78, 205, 196, 0.3)")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("fill", "rgba(78, 205, 196, 0.5)");
      showTooltip(
        event,
        `<strong>${d3.timeFormat("%B %Y")(d.date)}</strong><br/>
         Monthly Deaths: ${d.count}`
      );
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).style("fill", "rgba(78, 205, 196, 0.3)");
      hideTooltip();
    });

  // Draw daily bars (on top)
  g.selectAll(".daily-bar")
    .data(dailyArray)
    .enter()
    .append("rect")
    .attr("class", "daily-bar")
    .attr("x", (d) => x(d.date) - dailyBarWidth / 2)
    .attr("width", dailyBarWidth)
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
         Daily Deaths: ${d.count}<br/>
         ${formattedNames}`
      );
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).style("opacity", 1);
      hideTooltip();
    });

  // X-axis
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

  // Left Y-axis (daily deaths)
  g.append("g")
    .attr("class", "axis")
    .call(
      d3
        .axisLeft(y)
        .ticks(getSmartTickCount(maxDailyCount))
        .tickFormat(formatIntegerTicks)
    );

  // Right Y-axis (monthly deaths)
  g.append("g")
    .attr("class", "axis axis-right")
    .attr("transform", `translate(${width},0)`)
    .call(
      d3
        .axisRight(yRight)
        .ticks(getSmartTickCount(maxMonthlyCount))
        .tickFormat(formatIntegerTicks)
    );

  // Add axis labels
  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", 20 - customMargins.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("fill", "#ff6b6b")
    .style("font-size", "12px")
    .text("Daily Deaths");

  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", width + customMargins.right - 40)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("fill", "#4ecdc4")
    .style("font-size", "12px")
    .text("Monthly Deaths");

  // Add WoW Classic phase indicators
  const phases = [
    { date: new Date(2025, 0, 9), name: "Phase 2", color: "#ffffffff" },
    { date: new Date(2025, 2, 20), name: "Phase 3", color: "#ffffffff" },
    { date: new Date(2025, 4, 1), name: "Phase 4", color: "#ffffffff" },
    { date: new Date(2025, 6, 10), name: "Phase 5", color: "#ffffffff" },
  ];

  // Only show phases that fall within our date range
  const visiblePhases = phases.filter(
    (phase) => phase.date >= minDate && phase.date <= maxDate
  );

  // Add phase indicator lines
  g.selectAll(".phase-line")
    .data(visiblePhases)
    .enter()
    .append("line")
    .attr("class", "phase-line")
    .attr("x1", (d) => x(d.date))
    .attr("x2", (d) => x(d.date))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4,4")
    .style("opacity", 0.7);

  // Add phase labels
  g.selectAll(".phase-label")
    .data(visiblePhases)
    .enter()
    .append("text")
    .attr("class", "phase-label")
    .attr("x", (d) => x(d.date))
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("fill", (d) => d.color)
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .text((d) => d.name);
}
