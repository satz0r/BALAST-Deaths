// Cache configuration
const CACHE_KEY = "wow_deaths_cache";
const CACHE_TIME_KEY = "wow_deaths_cache_time";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function loadData() {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

    if (
      cached &&
      cacheTime &&
      Date.now() - parseInt(cacheTime) < CACHE_DURATION
    ) {
      console.log("Loading data from cache");
      const cachedDeaths = JSON.parse(cached);
      processDataAndInitialize(cachedDeaths);
      return;
    }

    console.log("Loading fresh data from database");
    const { data: deaths, error } = await sb
      .from("guild_deaths")
      .select("*")
      .order("death_date", { ascending: true });
    if (error) throw error;

    // Cache the fresh data
    localStorage.setItem(CACHE_KEY, JSON.stringify(deaths));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    processDataAndInitialize(deaths);
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

    // Add cache clear button after a short delay
    setTimeout(addCacheClearButton, 100);
  }
}

function processDataAndInitialize(deaths) {
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

  const deathCauses = [
    ...new Set(data.filter((d) => d.death_cause).map((d) => d.death_cause)),
  ].sort();
  const deathCauseSelect = d3.select("#deathCauseFilter");
  deathCauseSelect.selectAll("option:not(:first-child)").remove();
  deathCauses.forEach((cause) => {
    deathCauseSelect.append("option").attr("value", cause).text(cause);
  });

  d3.select("#classFilter").on("change", debouncedUpdateDashboard);
  d3.select("#levelFilter").on("change", debouncedUpdateDashboard);
  d3.select("#locationFilter").on("change", debouncedUpdateDashboard);
  d3.select("#deathCauseFilter").on("change", debouncedUpdateDashboard);
  d3.select("#raidFilter").on("change", debouncedUpdateDashboard); // Checkbox change event
  d3.select("#resetFilters").on("click", resetAllFilters);
}

function resetAllFilters() {
  // Reset all filter dropdowns to their default values
  d3.select("#classFilter").property("value", "all");
  d3.select("#levelFilter").property("value", "all");
  d3.select("#locationFilter").property("value", "all");
  d3.select("#deathCauseFilter").property("value", "all");
  d3.select("#raidFilter").property("checked", false); // Reset checkbox to unchecked

  // Update the dashboard with reset filters
  updateDashboard();
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
  const deathCauseFilter = d3.select("#deathCauseFilter").node().value;
  const raidFilterChecked = d3.select("#raidFilter").node().checked; // Get checkbox state

  filteredData = data.filter((d) => {
    if (classFilter !== "all" && d.class !== classFilter) return false;
    if (locationFilter !== "all" && d.location !== locationFilter) return false;
    if (deathCauseFilter !== "all" && d.death_cause !== deathCauseFilter)
      return false;
    if (raidFilterChecked && !d.isRaid) return false; // If checkbox is checked, only show raid deaths

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
