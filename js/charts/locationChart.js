function createLocationChart() {
  const locationFilter = d3.select("#locationFilter").node().value;
  const titleElement = d3.select("#locationChartTitle");

  // If a specific location is selected, show character list instead of chart
  if (locationFilter !== "all") {
    titleElement.text(`Deaths in: ${locationFilter}`);
    createLocationCharacterList();
    return;
  }

  titleElement.text("Most Dangerous Locations");

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
    .on("click", (event, d) => {
      hideTooltip(); // Hide tooltip when clicking
      updateFilter("locationFilter", d.loc);
    })
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

function createLocationCharacterList() {
  const locationFilter = d3.select("#locationFilter").node().value;

  // Get all deaths for the selected location
  const locationDeaths = filteredData
    .filter((d) => d.location === locationFilter)
    .map((d) => ({
      name: d.characterName,
      date: d.date,
      level: d.level,
      class: d.class,
      deathCause: d.death_cause,
      isRaid: d.isRaid,
      dateString: d.death_date,
    }))
    .sort((a, b) => b.date - a.date); // Sort by newest first

  const container = d3.select("#locationChart");
  container.selectAll("*").remove();

  // Create a styled list container
  const listContainer = container
    .append("div")
    .style("max-height", "400px")
    .style("overflow-y", "auto")
    .style("padding", "10px");

  // Add a "Clear Filter" button
  listContainer
    .append("div")
    .style("margin-bottom", "15px")
    .append("button")
    .text("← Back to Location Chart")
    .style("background", "#4ecdc4")
    .style("color", "white")
    .style("border", "none")
    .style("padding", "8px 16px")
    .style("border-radius", "5px")
    .style("cursor", "pointer")
    .on("click", () => {
      updateFilter("locationFilter", "all");
    });

  // Create character list
  const characterItems = listContainer
    .selectAll(".character-item")
    .data(locationDeaths)
    .enter()
    .append("div")
    .attr("class", "character-item")
    .style("padding", "10px 12px")
    .style("margin", "3px 0")
    .style("background", "rgba(255, 255, 255, 0.1)")
    .style("border-radius", "5px")
    .style("border-left", `4px solid #45b7d1`)
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
      const deathCauseDisplay = d.deathCause || "Unknown";

      return `
          <div style="flex: 1; min-width: 200px;">
            <div style="color: ${playerNameColor}; font-weight: 500; margin-bottom: 2px;">${d.name}</div>
            <div style="font-size: 0.85em; color: #ff6b6b;">
              ${deathCauseDisplay}
            </div>
          </div>
          <div style="text-align: right; margin-left: 10px;">
            <div style="color: #45b7d1; font-size: 0.9em;">${formattedDate}</div>
            <div style="color: ${levelColor}; font-weight: bold; font-size: 0.9em;">${levelDisplay}</div>
          </div>
        `;
    });
}
