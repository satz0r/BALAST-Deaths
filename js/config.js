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
  "10-20": "#fcababff",
  "21-40": "#ff7777ff",
  "41-59": "#e64747ff",
  60: "#b41c1cff",
};

// Chart constants
const MAX_BAR_WIDTH = 40;
const MAX_BAR_HEIGHT = 40;
const MIN_TIMELINE_WIDTH = 800;
