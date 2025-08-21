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
    .slice(0, 10);

  const leftMargin = calculateLeftMargin(deathCauseData, "death_cause");
  const customMargins = { top: 20, right: 30, bottom: 40, left: leftMargin };

  const { g, width, height } = createBaseChart(
    "#deathCauseChart",
    400,
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
    .attr("fill", "#ff6b6b")
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

  // Get all deaths for the selected death cause with individual death records
  const deathCauseDeaths = filteredData
    .filter((d) => d.death_cause === deathCauseFilter)
    .map((d) => ({
      name: d.characterName,
      date: d.date, // Use the already parsed date from data.js
      level: d.level,
      class: d.class,
      location: d.location,
      isRaid: d.isRaid,
      dateString: d.death_date,
    }))
    .sort((a, b) => b.date - a.date); // Sort by newest first

  const container = d3.select("#deathCauseChart");
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
    .text("← Back to Death Cause Chart")
    .style("background", "#4ecdc4")
    .style("color", "white")
    .style("border", "none")
    .style("padding", "8px 16px")
    .style("border-radius", "5px")
    .style("cursor", "pointer")
    .on("click", () => {
      updateFilter("deathCauseFilter", "all");
    });

  // Create character list
  const characterItems = listContainer
    .selectAll(".character-item")
    .data(deathCauseDeaths)
    .enter()
    .append("div")
    .attr("class", "character-item")
    .style("padding", "10px 12px")
    .style("margin", "3px 0")
    .style("background", "rgba(255, 255, 255, 0.1)")
    .style("border-radius", "5px")
    .style("border-left", `4px solid #ff6b6b`)
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

      // Make location bold if it's a raid death
      const locationStyle = d.isRaid ? "font-weight: bold;" : "";

      return `
          <div style="flex: 1; min-width: 200px;">
            <div style="color: ${playerNameColor}; font-weight: 500; margin-bottom: 2px;">${d.name}</div>
            <div style="font-size: 0.85em; color: #45b7d1; ${locationStyle}">
              ${locationDisplay}
            </div>
          </div>
          <div style="text-align: right; margin-left: 10px;">
            <div style="color: #45b7d1; font-size: 0.9em;">${formattedDate}</div>
            <div style="color: ${levelColor}; font-weight: bold; font-size: 0.9em;">${levelDisplay}</div>
          </div>
        `;
    });
}
