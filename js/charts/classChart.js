function createClassChart() {
  const classFilter = d3.select("#classFilter").node().value;
  const titleElement = d3.select("#classChartTitle");

  // If a specific class is selected, show character list instead of chart
  if (classFilter !== "all") {
    titleElement.text(`${classFilter} Characters`);
    createCharacterList();
    return;
  }

  titleElement.text("Deaths by Class");

  const { g, width, height } = createBaseChart("#classChart", 300, true);

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

function createCharacterList() {
  const classFilter = d3.select("#classFilter").node().value;

  // Get all deaths for the selected class with individual death records
  const classDeaths = filteredData
    .filter((d) => d.class === classFilter)
    .map((d) => ({
      name: d.characterName,
      date: d.date, // Use the already parsed date from data.js
      level: d.level,
      location: d.location,
      deathCause: d.death_cause,
      isRaid: d.isRaid,
      class: d.class,
      dateString: d.death_date,
    }))
    .sort((a, b) => b.date - a.date); // Sort by newest first

  const container = d3.select("#classChart");
  container.selectAll("*").remove();

  // Create a styled list container
  const listContainer = container
    .append("div")
    .style("max-height", "300px")
    .style("overflow-y", "auto")
    .style("padding", "10px");

  // Add a "Clear Filter" button
  listContainer
    .append("div")
    .style("margin-bottom", "15px")
    .append("button")
    .text("← Back to Class Chart")
    .style("background", "#4ecdc4")
    .style("color", "white")
    .style("border", "none")
    .style("padding", "8px 16px")
    .style("border-radius", "5px")
    .style("cursor", "pointer")
    .on("click", () => {
      updateFilter("classFilter", "all");
    });

  // Create character list
  const characterItems = listContainer
    .selectAll(".character-item")
    .data(classDeaths)
    .enter()
    .append("div")
    .attr("class", "character-item")
    .style("padding", "10px 12px")
    .style("margin", "3px 0")
    .style("background", "rgba(255, 255, 255, 0.1)")
    .style("border-radius", "5px")
    .style("border-left", `4px solid ${classColors[classFilter] || "#666"}`)
    .style("cursor", "pointer")
    .style("transition", "background 0.2s")
    .on("mouseover", function () {
      d3.select(this).style("background", "rgba(255, 255, 255, 0.2)");
    })
    .on("mouseout", function () {
      d3.select(this).style("background", "rgba(255, 255, 255, 0.1)");
    });

  characterItems
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("align-items", "flex-start")
    .style("flex-wrap", "wrap")
    .html((d) => {
      const formattedDate = d.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const levelDisplay =
        d.level !== null && d.level !== undefined
          ? `Level ${d.level}`
          : "Unknown";

      // Get colors from config.js
      const playerNameColor = classColors[d.class] || "#ffffff";
      const levelColor = getLevelRangeColor(d.level);
      const locationDisplay = d.location || "Unknown";
      const deathCauseDisplay = d.deathCause || "Unknown";

      // Make location bold if it's a raid death
      const locationStyle = d.isRaid ? "font-weight: bold;" : "";

      return `
          <div style="flex: 1; min-width: 200px;">
            <div style="color: ${playerNameColor}; font-weight: 500; margin-bottom: 2px;">${d.name}</div>
            <div style="font-size: 0.85em; color: #999;">
              <span style="color: #45b7d1; ${locationStyle}">${locationDisplay}</span> • 
              <span style="color: #ff6b6b;">${deathCauseDisplay}</span>
            </div>
          </div>
          <div style="text-align: right; margin-left: 10px;">
            <div style="color: #45b7d1; font-size: 0.9em;">${formattedDate}</div>
            <div style="color: ${levelColor}; font-weight: bold; font-size: 0.9em;">${levelDisplay}</div>
          </div>
        `;
    });
}
