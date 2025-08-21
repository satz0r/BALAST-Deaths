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
    .html('<div class="chart-loading-content">📊 Updating chart...</div>');
}

function showChartError(chartId, chartName) {
  const container = d3.select(chartId);
  container.selectAll("*").remove();
  container
    .append("div")
    .attr("class", "chart-error")
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
    clearButton.className = "cache-clear-btn";
    clearButton.onclick = () => {
      clearDataCache();
      window.location.reload();
    };
    errorDiv.appendChild(clearButton);
  }
}

/**
 * Add or remove reset button from chart header based on filter state
 */
function updateChartResetButton(titleId, filterType, currentFilterValue) {
  const titleElement = document.getElementById(titleId);
  if (!titleElement) return;

  // Remove existing reset button
  const existingButton = titleElement.querySelector(".chart-reset-button");
  if (existingButton) {
    existingButton.remove();
  }

  // Add reset button if filter is active (not "all")
  if (currentFilterValue && currentFilterValue !== "all") {
    const resetButton = document.createElement("button");
    resetButton.className = "chart-reset-button";
    resetButton.title = "Reset filter";
    resetButton.onclick = () => {
      updateFilter(filterType, "all");
    };

    titleElement.insertBefore(resetButton, titleElement.firstChild);
  }
}
