// Supabase credentials
const SUPABASE_URL = "https://ctqnpltlpkmlvbgdqrzu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cW5wbHRscGttbHZiZ2Rxcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTA3MDEsImV4cCI6MjA3MDQ4NjcwMX0.SplNA1N6XDpGXHSRP6ChFHzmeKkaRD7ceye10JZCfNw";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let data = [];
let filteredData = [];

// Color schemes
const classColors = {
  Warrior: "#C79C6E",
  Paladin: "#F58CBA",
  Hunter: "#ABD473",
  Rogue: "#FFF569",
  Priest: "#FFFFFF",
  Mage: "#69CCF0",
  Warlock: "#9482C9",
  Druid: "#FF7D0A",
};

const levelRangeColors = {
  "10-20": "#c6ffb3",
  "21-40": "#d9fd86",
  "41-59": "#ecfb59",
  60: "#fff92c",
};

// Location colors for location chart
const locationColorCategories = {
  raids: {
    color: "#e93f3fff",
    locations: [
      "Blackwing Lair",
      "Ahn'Qiraj 40",
      "Molten Core",
      "Onyxia's Lair",
      "Zul'Gurub",
      "Naxxramas",
      "Ahn'Qiraj 20",
    ],
  },
  dungeons: {
    color: "#d6a7a7ff",
    locations: [
      "Dire Maul",
      "Stratholme",
      "Scholomance",
      "Blackrock Depths",
      "Scarlet Monastery",
      "The Stockade",
      "The Deadmines",
      "Shadowfang Keep",
      "Ragefire Chasm",
      "Maraudon",
      "Gnomeregan",
      "Blackrock Spire",
      "Blackrock Mountain",
      "Uldaman",
    ],
  },
  zones: {
    color: "#44aaff ff",
    locations: [], // Regular zones use default
  },
};

const locationColors = {
  default: "#e6e6e6ff",
};

// Death cause colors for death cause chart
const deathCauseColors = {
  default: "#e6e6e6ff",
  // Add specific death cause colors here as needed
  PvP: "#ff2222",
  Boss: "#aa1155",
  Environment: "#ff8822",
  Monster: "#44aa88",
};

// Helper function to get colors
function getLocationColor(location) {
  // Check each category
  for (const category of Object.values(locationColorCategories)) {
    if (category.locations.includes(location)) {
      return category.color;
    }
  }
  return locationColors.default;
}

function getDeathCauseColor(deathCause) {
  return deathCauseColors[deathCause] || deathCauseColors.default;
}

// Chart constants
const MAX_BAR_WIDTH = 40;
const MAX_BAR_HEIGHT = 18; // Reduced from 25 to 18 for more compact bars to fit more entries
const MIN_TIMELINE_WIDTH = 800;
