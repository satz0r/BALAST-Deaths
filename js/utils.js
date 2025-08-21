let tooltip; // Tooltip element

function showTooltip(event, content) {
  if (!tooltip) tooltip = d3.select("#tooltip");
  tooltip
    .style("opacity", 1)
    .html(content)
    .style("left", event.pageX + 15 + "px")
    .style("top", event.pageY - 10 + "px");
}

function hideTooltip() {
  if (tooltip) tooltip.style("opacity", 0);
}

function moveTooltip(event) {
  if (tooltip) {
    tooltip
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 10 + "px");
  }
}

function getSmartTickCount(maxValue) {
  // Ensure we never have more ticks than unique integer values
  const integerMax = Math.floor(maxValue);
  if (integerMax <= 0) return 2; // Show 0 and 1 at minimum
  if (integerMax === 1) return 2; // Show 0 and 1
  if (integerMax === 2) return 3; // Show 0, 1, 2
  if (integerMax <= 5) return integerMax + 1; // Show all integers from 0 to max
  if (integerMax <= 10) return Math.min(integerMax + 1, 6);
  return Math.min(10, Math.ceil(integerMax / 5));
}

function formatIntegerTicks(d) {
  // Only show integer values, no decimals
  return Math.floor(d) === d ? d.toString() : "";
}

function calculateLeftMargin(data, key = "loc", fontSize = 11) {
  const maxLength = Math.max(...data.map((d) => (d[key] ? d[key].length : 0)));
  return Math.max(80, maxLength * 7 + 20);
}

function updateFilter(filterId, value) {
  const select = d3.select(`#${filterId}`);
  select.property("value", value);
  debouncedUpdateDashboard();
}

function getLevelRangeColor(level) {
  if (level === null || level === undefined) return "#999";
  if (level >= 1 && level <= 20) return levelRangeColors["10-20"];
  if (level >= 21 && level <= 40) return levelRangeColors["21-40"];
  if (level >= 41 && level <= 59) return levelRangeColors["41-59"];
  if (level === 60) return levelRangeColors["60"];
  return "#999"; // fallback color
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced dashboard update for better performance
const debouncedUpdateDashboard = debounce(() => {
  updateDashboard();
}, 50);

// Debounced resize handler for responsive charts
const debouncedResizeCharts = debounce(() => {
  if (
    typeof updateCharts === "function" &&
    filteredData &&
    filteredData.length > 0
  ) {
    updateCharts();
  }
}, 250);

// Add resize listener when DOM is ready
if (typeof window !== "undefined") {
  window.addEventListener("resize", debouncedResizeCharts);
  // Also handle orientation changes on mobile devices
  window.addEventListener("orientationchange", () => {
    // Small delay to let the browser finish the orientation change
    setTimeout(debouncedResizeCharts, 100);
  });
}

function showChartLoading(chartId) {
  const container = d3.select(chartId);
  container.selectAll("*").remove();
  container
    .append("div")
    .attr("class", "chart-loading")
    .style("text-align", "center")
    .style("padding", "40px")
    .style("color", "#4ecdc4")
    .style("font-size", "14px")
    .html(
      '<div style="animation: pulse 1.5s ease-in-out infinite;">📊 Updating chart...</div>'
    );
}

function showChartError(chartId, chartName) {
  const container = d3.select(chartId);
  container.selectAll("*").remove();
  container
    .append("div")
    .attr("class", "chart-error")
    .style("text-align", "center")
    .style("padding", "40px")
    .style("color", "#ff6b6b")
    .style("font-size", "14px")
    .html(`⚠️ Error loading ${chartName} chart`);
}

function createChartSafely(chartFunction, chartName, chartId) {
  try {
    showChartLoading(chartId);
    setTimeout(() => {
      try {
        chartFunction();
      } catch (error) {
        console.error(`Error creating ${chartName}:`, error);
        showChartError(chartId, chartName);
      }
    }, 50);
  } catch (error) {
    console.error(`Error initializing ${chartName}:`, error);
    showChartError(chartId, chartName);
  }
}

function createCharacterListBase(containerId, data, options = {}) {
  const {
    maxHeight = "400px",
    borderColor = "#45b7d1",
    backButtonText = "← Back to Chart",
    onBackClick,
    additionalInfoFunction = null,
    padding = "10px 12px",
    margin = "3px 0",
  } = options;

  const container = d3.select(containerId);
  container.selectAll("*").remove();

  // Create a styled list container
  const listContainer = container
    .append("div")
    .style("max-height", maxHeight)
    .style("overflow-y", "auto")
    .style("padding", "10px");

  // Add a "Clear Filter" button
  listContainer
    .append("div")
    .style("margin-bottom", "15px")
    .append("button")
    .text(backButtonText)
    .style("background", "#4ecdc4")
    .style("color", "white")
    .style("border", "none")
    .style("padding", "8px 16px")
    .style("border-radius", "5px")
    .style("cursor", "pointer")
    .on("click", onBackClick);

  // Create character list
  const characterItems = listContainer
    .selectAll(".character-item")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "character-item")
    .style("padding", padding)
    .style("margin", margin)
    .style("background", "rgba(255, 255, 255, 0.1)")
    .style("border-radius", "5px")
    .style("border-left", `4px solid ${borderColor}`)
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

      // Get additional info if function provided
      const additionalInfo = additionalInfoFunction
        ? additionalInfoFunction(d)
        : "";

      return `
          <div style="flex: 1; min-width: 200px;">
            <div style="color: ${playerNameColor}; font-weight: 500; margin-bottom: 2px;">${d.name}</div>
            ${additionalInfo}
          </div>
          <div style="text-align: right; margin-left: 10px;">
            <div style="color: #45b7d1; font-size: 0.9em;">${formattedDate}</div>
            <div style="color: ${levelColor}; font-weight: bold; font-size: 0.9em;">${levelDisplay}</div>
          </div>
        `;
    });

  return listContainer;
}

function clearDataCache() {
  localStorage.removeItem("wow_deaths_cache");
  localStorage.removeItem("wow_deaths_cache_time");
  console.log("Data cache cleared");
}

function addCacheClearButton() {
  // Add a cache clear button to error messages
  const errorDiv = document.getElementById("error");
  if (errorDiv && errorDiv.style.display !== "none") {
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear Cache & Retry";
    clearButton.style.cssText = `
      background: #4ecdc4;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 15px;
      font-size: 14px;
    `;
    clearButton.onclick = () => {
      clearDataCache();
      window.location.reload();
    };
    errorDiv.appendChild(clearButton);
  }
}
