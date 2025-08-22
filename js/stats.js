function updateStats() {
  const totalDeaths = filteredData.length;

  const deathCauseCounts = d3.rollup(
    filteredData.filter((d) => d.death_cause),
    (v) => v.length,
    (d) => d.death_cause
  );

  const deathCauseCountsArray = Array.from(deathCauseCounts).sort(
    (a, b) => b[1] - a[1]
  );

  let deathCause = "N/A";
  if (deathCauseCountsArray.length > 0) {
    const maxCount = deathCauseCountsArray[0][1];
    const topDeathCauses = deathCauseCountsArray.filter(
      ([_, count]) => count === maxCount
    );
    if (topDeathCauses.length <= 3) {
      deathCause = topDeathCauses.map(([dc]) => dc).join(", ");
    }
  }

  const raidDeaths = filteredData.filter((d) => d.isRaid).length;

  let daysWithoutDeath = "0";
  if (filteredData.length) {
    const lastDeath = new Date(d3.max(filteredData, (d) => d.date));
    const today = new Date();
    daysWithoutDeath = Math.floor((today - lastDeath) / (1000 * 60 * 60 * 24));
  }

  const zoneCounts = d3.rollup(
    filteredData.filter(
      (d) => d.location && d.location.toLowerCase() !== "unknown"
    ),
    (v) => v.length,
    (d) => d.location
  );
  const deadliestZone =
    Array.from(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const statsHtml = `
    <div class="stat-item"><span class="stat-label">Total Deaths:</span><span class="stat-value">${totalDeaths}</span></div>
    <div class="stat-item"><span class="stat-label">Top Killer:</span><span class="stat-value">${deathCause}</span></div>
    <div class="stat-item"><span class="stat-label">Raid Deaths:</span><span class="stat-value">${raidDeaths}</span></div>
    <div class="stat-item"><span class="stat-label">Days Without Death:</span><span class="stat-value">${daysWithoutDeath}</span></div>
    <div class="stat-item"><span class="stat-label">Deadliest Zone:</span><span class="stat-value">${deadliestZone}</span></div>
  `;
  d3.select("#stats-overview").html(statsHtml);
}
