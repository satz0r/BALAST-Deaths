function createClassChart() {
  const customMargins = { top: 20, right: 20, bottom: 50, left: 40 }; // Reduced bottom from 80 to 50
  const { g, width, height } = createBaseChart(
    "#classChart",
    300,
    true,
    customMargins
  );

  const classCounts = d3.rollup(
    filteredData.filter((d) => d.class),
    (v) => v.length,
    (d) => d.class
  );
  const classData = Array.from(classCounts, ([key, value]) => ({
    class: key,
    count: value,
  })).sort((a, b) => b.count - a.count);

  const x = d3
    .scaleBand()
    .domain(classData.map((d) => d.class))
    .range([0, width])
    .padding(0.1);

  const maxCount = d3.max(classData, (d) => d.count) || 1;
  const y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

  const barWidth = Math.min(MAX_BAR_WIDTH, x.bandwidth());

  g.selectAll(".bar")
    .data(classData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.class) + (x.bandwidth() - barWidth) / 2)
    .attr("width", barWidth)
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => height - y(d.count))
    .attr("fill", (d) => classColors[d.class] || "#666")
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      hideTooltip(); // Hide tooltip when clicking
      updateFilter("classFilter", d.class);
    })
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("opacity", 0.7);
      showTooltip(event, `<strong>${d.class}</strong><br/>Deaths: ${d.count}`);
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).style("opacity", 1);
      hideTooltip();
    });

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  g.append("g")
    .attr("class", "axis")
    .call(
      d3
        .axisLeft(y)
        .ticks(getSmartTickCount(maxCount))
        .tickFormat(d3.format("d"))
    );
}
