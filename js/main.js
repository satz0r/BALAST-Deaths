function createCharts() {
  createChartSafely(createClassChart, "Class", "#classChart");
  createChartSafely(createLevelChart, "Level", "#levelChart");
  createChartSafely(createLocationChart, "Location", "#locationChart");
  createChartSafely(createDeathCauseChart, "Death Cause", "#deathCauseChart");
  createChartSafely(createTimelineChart, "Timeline", "#timelineChart");
}

function updateCharts() {
  createCharts();
}

document.addEventListener("DOMContentLoaded", loadData);
