async function loadData() {
  try {
    const { data: deaths, error } = await sb
      .from("guild_deaths")
      .select("*")
      .order("death_date", { ascending: true });
    if (error) throw error;

    data = deaths.map((d) => ({
      ...d,
      date: new Date(d.death_date),
      level: d.level || null,
      class: d.class || null,
      location: d.zone || null,
      death_cause: d.death_cause || null,
      isRaid: d.is_raid || false,
      characterName: d.character_name || "Unknown",
    }));
    filteredData = [...data];

    tooltip = d3.select("#tooltip");

    document.getElementById("loading").style.display = "none";
    document.getElementById("dashboard-content").style.display = "block";

    populateFilters();
    updateStats();
    createCharts();
  } catch (error) {
    console.error("Error loading data:", error);
    document.getElementById("loading").style.display = "none";
    document.getElementById("error").style.display = "block";
    document.getElementById("error").innerHTML = `
      <h3>Error Loading Data</h3>
      <p>Could not connect to the database. Please check:</p>
      <ul style="text-align: left; display: inline-block;">
      <li>Internet connection</li>
      <li>Database credentials</li>
      <li>Database permissions</li>
      </ul>
      <p><strong>Error:</strong> ${error.message}</p>
    `;
  }
}

function populateFilters() {
  const classes = [
    ...new Set(data.filter((d) => d.class).map((d) => d.class)),
  ].sort();
  const classSelect = d3.select("#classFilter");
  classSelect.selectAll("option:not(:first-child)").remove();
  classes.forEach((cls) => {
    classSelect.append("option").attr("value", cls).text(cls);
  });

  const locations = [
    ...new Set(data.filter((d) => d.location).map((d) => d.location)),
  ].sort();
  const locationSelect = d3.select("#locationFilter");
  locationSelect.selectAll("option:not(:first-child)").remove();
  locations.forEach((loc) => {
    locationSelect.append("option").attr("value", loc).text(loc);
  });

  d3.select("#classFilter").on("change", updateDashboard);
  d3.select("#levelFilter").on("change", updateDashboard);
  d3.select("#locationFilter").on("change", updateDashboard);
  d3.select("#raidFilter").on("change", updateDashboard);
}

function updateDashboard() {
  applyFilters();
  updateStats();
  updateCharts();
}

function applyFilters() {
  const classFilter = d3.select("#classFilter").node().value;
  const levelFilter = d3.select("#levelFilter").node().value;
  const locationFilter = d3.select("#locationFilter").node().value;
  const raidFilter = d3.select("#raidFilter").node().value;

  filteredData = data.filter((d) => {
    if (classFilter !== "all" && d.class !== classFilter) return false;
    if (locationFilter !== "all" && d.location !== locationFilter) return false;
    if (raidFilter === "yes" && !d.isRaid) return false;
    if (raidFilter === "no" && d.isRaid) return false;

    if (levelFilter !== "all" && d.level) {
      if (levelFilter === "10-20" && (d.level < 1 || d.level > 20))
        return false;
      if (levelFilter === "21-40" && (d.level < 21 || d.level > 40))
        return false;
      if (levelFilter === "41-59" && (d.level < 41 || d.level > 59))
        return false;
      if (levelFilter === "60" && d.level !== 60) return false;
    }
    return true;
  });
}
