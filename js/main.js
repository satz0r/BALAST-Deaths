function createCharts() {
  createClassChart();
  createLevelChart();
  createTimelineChart();
  createLocationChart();
  createDeathCauseChart();
}

function updateCharts() {
  createCharts();
}

document.addEventListener("DOMContentLoaded", loadData);
