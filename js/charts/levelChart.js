function createLevelChart() {
  const levelFilter = d3.select("#levelFilter").node().value;
  const titleElement = d3.select("#levelChartTitle");

  // If a specific level range is selected, show character list instead of chart
  if (levelFilter !== "all") {
    titleElement.text(`Level ${levelFilter} Deaths`);
    createLevelCharacterList();
    return;
  }

  titleElement.text("Deaths by Level Range");

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

function createLevelCharacterList() {
  const levelFilter = d3.select("#levelFilter").node().value;

  // Get all deaths for the selected level range
  let levelDeaths = [];
  if (levelFilter === "10-20") {
    levelDeaths = filteredData.filter((d) => d.level >= 1 && d.level <= 20);
  } else if (levelFilter === "21-40") {
    levelDeaths = filteredData.filter((d) => d.level >= 21 && d.level <= 40);
  } else if (levelFilter === "41-59") {
    levelDeaths = filteredData.filter((d) => d.level >= 41 && d.level <= 59);
  } else if (levelFilter === "60") {
    levelDeaths = filteredData.filter((d) => d.level === 60);
  }

  const levelCharacterData = levelDeaths
    .map((d) => ({
      name: d.characterName,
      date: d.date,
      level: d.level,
      class: d.class,
      location: d.location,
      deathCause: d.death_cause,
      isRaid: d.isRaid,
      dateString: d.death_date,
    }))
    .sort((a, b) => b.date - a.date); // Sort by newest first

  const container = d3.select("#levelChart");
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
    .text("← Back to Level Chart")
    .style("background", "#4ecdc4")
    .style("color", "white")
    .style("border", "none")
    .style("padding", "8px 16px")
    .style("border-radius", "5px")
    .style("cursor", "pointer")
    .on("click", () => {
      updateFilter("levelFilter", "all");
    });

  // Create character list
  const characterItems = listContainer
    .selectAll(".character-item")
    .data(levelCharacterData)
    .enter()
    .append("div")
    .attr("class", "character-item")
    .style("padding", "10px 12px")
    .style("margin", "3px 0")
    .style("background", "rgba(255, 255, 255, 0.1)")
    .style("border-radius", "5px")
    .style(
      "border-left",
      `4px solid ${levelRangeColors[levelFilter] || "#45b7d1"}`
    )
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
