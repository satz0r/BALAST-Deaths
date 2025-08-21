function createLevelChart() {
  const { g, width, height } = createBaseChart("#levelChart", 300, false);

  const levelData = filteredData.filter((d) => d.level);
  const ranges = [
    {
      range: "10-20",
      count: levelData.filter((d) => d.level >= 1 && d.level <= 20).length,
    },
    {
      range: "21-40",
      count: levelData.filter((d) => d.level >= 21 && d.level <= 40).length,
    },
    {
      range: "41-59",
      count: levelData.filter((d) => d.level >= 41 && d.level <= 59).length,
    },
    { range: "60", count: levelData.filter((d) => d.level === 60).length },
  ];

  const x = d3
    .scaleBand()
    .domain(ranges.map((d) => d.range))
    .range([0, width])
    .padding(0.1);

  const maxCount = d3.max(ranges, (d) => d.count) || 1;
  const y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

  const barWidth = Math.min(MAX_BAR_WIDTH, x.bandwidth());

  g.selectAll(".bar")
    .data(ranges)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.range) + (x.bandwidth() - barWidth) / 2)
    .attr("width", barWidth)
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => height - y(d.count))
    .attr("fill", (d) => levelRangeColors[d.range] || "#45b7d1")
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      hideTooltip(); // Hide tooltip when clicking
      updateFilter("levelFilter", d.range);
    })
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("opacity", 0.7);
      showTooltip(
        event,
        `<strong>Level ${d.range}</strong><br/>Deaths: ${d.count}`
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
    .call(
      d3
        .axisLeft(y)
        .ticks(getSmartTickCount(maxCount))
        .tickFormat(d3.format("d"))
    );
}
