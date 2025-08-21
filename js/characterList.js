/**
 * Creates a standardized character list for any chart
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - The container selector (e.g., "#classChart")
 * @param {string} options.filterType - The filter type (e.g., "classFilter", "deathCauseFilter")
 * @param {string} options.filterValue - The current filter value
 * @param {Array} options.data - The filtered data array
 * @param {string} options.borderColor - The border color for list items
 * @param {string} options.backButtonText - Text for the back button
 * @param {Function} [options.getAdditionalInfo] - Function to return additional info HTML (not used in table format)
 * @param {string} options.maxHeight - Maximum height of the list container
 */
function createCharacterList(options) {
  const {
    containerId,
    filterType,
    filterValue,
    data,
    borderColor = "#45b7d1",
    backButtonText = "← Back to Chart",
    getAdditionalInfo = () => "",
    maxHeight = "400px",
  } = options;

  // Prepare character data - use the data directly as it's already properly structured
  const characterDeaths = data.sort((a, b) => b.date - a.date); // Sort by newest first

  const container = d3.select(containerId);
  container.selectAll("*").remove();

  // Create a styled list container
  const listContainer = container
    .append("div")
    .attr("class", "character-list-scrollable")
    .style("max-height", maxHeight); // Keep dynamic max-height as style

  // Add a "Clear Filter" button (only for filtered lists, not master list)
  if (filterType) {
    listContainer
      .append("div")
      .attr("class", "character-list-back-button-container")
      .append("button")
      .attr("class", "character-list-back-button")
      .text(backButtonText)
      .on("click", () => {
        updateFilter(filterType, "all");
      });
  }

  // Add table header
  listContainer.append("div").attr("class", "character-table-header").html(`
      <div>Date</div>
      <div>Lvl</div>
      <div>Name</div>
      <div>Location</div>
      <div>Cause</div>
    `);

  // Create character list
  const characterItems = listContainer
    .selectAll(".character-item")
    .data(characterDeaths)
    .enter()
    .append("div")
    .attr("class", "character-item")
    .on("mouseover", function () {
      d3.select(this).classed("character-item-hover", true);
    })
    .on("mouseout", function () {
      d3.select(this).classed("character-item-hover", false);
    });

  characterItems.html((d) => {
    const formattedDate = d.date.toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
    const levelDisplay =
      d.level !== null && d.level !== undefined ? d.level : "?";

    // Get colors from config.js
    const playerNameColor = classColors[d.class] || "#ffffff";
    const levelColor = getLevelRangeColor(d.level);
    const locationDisplay = d.location || "Unknown";
    const deathCauseDisplay = d.death_cause || "Unknown";
    const locationColor = getLocationColor(locationDisplay);
    const deathCauseColor = getDeathCauseColor(deathCauseDisplay);
    const raidClass = d.isRaid ? "raid" : "";

    return `
      <div class="character-table-date">${formattedDate}</div>
      <div class="character-table-level" style="color: ${levelColor};">${levelDisplay}</div>
      <div class="character-table-name" style="color: ${playerNameColor};">${d.characterName}</div>
      <div class="character-table-location ${raidClass}" style="color: ${locationColor};">${locationDisplay}</div>
      <div class="character-table-cause" style="color: ${deathCauseColor};">${deathCauseDisplay}</div>
    `;
  });
}

/**
 * Helper functions for generating additional info content
 */
const CharacterListHelpers = {
  // For class chart - show location and death cause
  getClassChartInfo: (d) => {
    const locationDisplay = d.location || "Unknown";
    const deathCauseDisplay = d.death_cause || "Unknown";
    const raidClass = d.isRaid ? "raid" : "";
    const locationColor = getLocationColor(locationDisplay);
    const deathCauseColor = getDeathCauseColor(deathCauseDisplay);

    return `
      <div class="character-item-details">
        <span class="character-item-location ${raidClass}" style="color: ${locationColor};">${locationDisplay}</span> • 
        <span class="character-item-death-cause" style="color: ${deathCauseColor};">${deathCauseDisplay}</span>
      </div>
    `;
  },

  // For death cause chart - show location only
  getDeathCauseChartInfo: (d) => {
    const locationDisplay = d.location || "Unknown";
    const raidClass = d.isRaid ? "raid" : "";
    const locationColor = getLocationColor(locationDisplay);

    return `
      <div class="character-item-details">
        <span class="character-item-location ${raidClass}" style="color: ${locationColor};">${locationDisplay}</span>
      </div>
    `;
  },

  // For level chart - show location and death cause
  getLevelChartInfo: (d) => {
    const locationDisplay = d.location || "Unknown";
    const deathCauseDisplay = d.death_cause || "Unknown";
    const raidClass = d.isRaid ? "raid" : "";
    const locationColor = getLocationColor(locationDisplay);
    const deathCauseColor = getDeathCauseColor(deathCauseDisplay);

    return `
      <div class="character-item-details">
        <span class="character-item-location ${raidClass}" style="color: ${locationColor};">${locationDisplay}</span> • 
        <span class="character-item-death-cause" style="color: ${deathCauseColor};">${deathCauseDisplay}</span>
      </div>
    `;
  },

  // For location chart - show death cause only
  getLocationChartInfo: (d) => {
    const deathCauseDisplay = d.death_cause || "Unknown";
    const deathCauseColor = getDeathCauseColor(deathCauseDisplay);

    return `
      <div class="character-item-details">
        <span class="character-item-death-cause" style="color: ${deathCauseColor};">${deathCauseDisplay}</span>
      </div>
    `;
  },
};
