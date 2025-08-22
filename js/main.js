function createCharts() {
  createChartSafely(createClassChart, "Class", "#classChart");
  createChartSafely(createLevelChart, "Level", "#levelChart");
  createChartSafely(createLocationChart, "Location", "#locationChart");
  createChartSafely(createDeathCauseChart, "Death Cause", "#deathCauseChart");
  createChartSafely(createTimelineChart, "Timeline", "#timelineChart");
}

function createMasterCharacterList() {
  // Update filtered count
  d3.select("#filtered-count").text(`(${filteredData.length})`);

  // Create the master character list
  createCharacterList({
    containerId: "#master-character-list",
    filterType: "", // No filter type for master list
    filterValue: "all",
    data: filteredData,
    borderColor: COLORS.primary,
    backButtonText: "← Clear All Filters",
    maxHeight: "calc(80vh - 100px)",
  });
}

function updateCharts() {
  createCharts();
  createMasterCharacterList(); // Update master list when filters change
}

document.addEventListener("DOMContentLoaded", loadData);
