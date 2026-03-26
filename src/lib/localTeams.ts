// Local sports team data — maps metro areas to their flagship teams and colors.
// Used to dynamically theme the app based on user location.
// Colors sourced from official team brand guidelines.

export type LocalTeam = {
  city: string;
  team: string;
  school?: string; // For college teams — e.g. "Arkansas" for "Fayetteville"
  league: string;
  espnId: string; // ESPN abbreviation — used to build logo URL
  colors: {
    primary: string;    // hex — used to generate Tailwind brand palette
    secondary: string;  // hex — accent color
    primaryHSL: string; // HSL values for CSS variable (no parens)
  };
  lat: number;
  lng: number;
  radius: number; // miles — how far this team's "territory" extends
};

// Build ESPN CDN logo URL from league + team abbreviation
export function getTeamLogoUrl(team: LocalTeam): string {
  return `https://a.espncdn.com/i/teamlogos/${team.league.toLowerCase()}/500/${team.espnId}.png`;
}

// Flagship team per metro area (most culturally prominent / largest fanbase)
export const LOCAL_TEAMS: LocalTeam[] = [
  // AFC North
  { city: "Baltimore", team: "Ravens", league: "NFL", espnId: "bal", colors: { primary: "#241773", secondary: "#9E7C0C", primaryHSL: "252 70% 27%" }, lat: 39.2904, lng: -76.6122, radius: 50 },
  { city: "Pittsburgh", team: "Steelers", league: "NFL", espnId: "pit", colors: { primary: "#FFB612", secondary: "#101820", primaryHSL: "42 100% 54%" }, lat: 40.4406, lng: -79.9959, radius: 60 },
  { city: "Cincinnati", team: "Bengals", league: "NFL", espnId: "cin", colors: { primary: "#FB4F14", secondary: "#000000", primaryHSL: "18 97% 53%" }, lat: 39.1031, lng: -84.5120, radius: 50 },
  { city: "Cleveland", team: "Cavaliers", league: "NBA", espnId: "cle", colors: { primary: "#6F263D", secondary: "#FFB81C", primaryHSL: "341 49% 29%" }, lat: 41.4993, lng: -81.6944, radius: 50 },

  // AFC East / NFC East
  { city: "New York", team: "Yankees", league: "MLB", espnId: "nyy", colors: { primary: "#003087", secondary: "#FFFFFF", primaryHSL: "218 100% 27%" }, lat: 40.7128, lng: -74.0060, radius: 40 },
  { city: "Boston", team: "Red Sox", league: "MLB", espnId: "bos", colors: { primary: "#BD3039", secondary: "#0C2340", primaryHSL: "357 61% 47%" }, lat: 42.3601, lng: -71.0589, radius: 50 },
  { city: "Philadelphia", team: "Eagles", league: "NFL", espnId: "phi", colors: { primary: "#004C54", secondary: "#A5ACAF", primaryHSL: "185 100% 17%" }, lat: 39.9526, lng: -75.1652, radius: 40 },
  { city: "Miami", team: "Heat", league: "NBA", espnId: "mia", colors: { primary: "#98002E", secondary: "#F9A01B", primaryHSL: "342 100% 30%" }, lat: 25.7617, lng: -80.1918, radius: 60 },
  { city: "Buffalo", team: "Bills", league: "NFL", espnId: "buf", colors: { primary: "#00338D", secondary: "#C60C30", primaryHSL: "217 100% 28%" }, lat: 42.8864, lng: -78.8784, radius: 50 },

  // NFC North
  { city: "Chicago", team: "Bears", league: "NFL", espnId: "chi", colors: { primary: "#0B162A", secondary: "#C83803", primaryHSL: "218 66% 11%" }, lat: 41.8781, lng: -87.6298, radius: 60 },
  { city: "Green Bay", team: "Packers", league: "NFL", espnId: "gb", colors: { primary: "#203731", secondary: "#FFB612", primaryHSL: "160 24% 17%" }, lat: 44.5133, lng: -88.0133, radius: 50 },
  { city: "Detroit", team: "Lions", league: "NFL", espnId: "det", colors: { primary: "#0076B6", secondary: "#B0B7BC", primaryHSL: "199 100% 36%" }, lat: 42.3314, lng: -83.0458, radius: 50 },
  { city: "Minneapolis", team: "Vikings", league: "NFL", espnId: "min", colors: { primary: "#4F2683", secondary: "#FFC62F", primaryHSL: "268 53% 33%" }, lat: 44.9778, lng: -93.2650, radius: 60 },

  // AFC/NFC South
  { city: "Dallas", team: "Cowboys", league: "NFL", espnId: "dal", colors: { primary: "#003594", secondary: "#869397", primaryHSL: "218 100% 29%" }, lat: 32.7767, lng: -96.7970, radius: 80 },
  { city: "Houston", team: "Texans", league: "NFL", espnId: "hou", colors: { primary: "#03202F", secondary: "#A71930", primaryHSL: "201 88% 10%" }, lat: 29.7604, lng: -95.3698, radius: 70 },
  { city: "Atlanta", team: "Falcons", league: "NFL", espnId: "atl", colors: { primary: "#A71930", secondary: "#000000", primaryHSL: "351 76% 38%" }, lat: 33.7490, lng: -84.3880, radius: 60 },
  { city: "New Orleans", team: "Saints", league: "NFL", espnId: "no", colors: { primary: "#D3BC8D", secondary: "#101820", primaryHSL: "38 46% 69%" }, lat: 29.9511, lng: -90.0715, radius: 60 },
  { city: "Nashville", team: "Titans", league: "NFL", espnId: "ten", colors: { primary: "#4B92DB", secondary: "#C8102E", primaryHSL: "211 65% 58%" }, lat: 36.1627, lng: -86.7816, radius: 50 },
  { city: "Charlotte", team: "Panthers", league: "NFL", espnId: "car", colors: { primary: "#0085CA", secondary: "#101820", primaryHSL: "198 100% 40%" }, lat: 35.2271, lng: -80.8431, radius: 50 },
  { city: "Jacksonville", team: "Jaguars", league: "NFL", espnId: "jax", colors: { primary: "#006778", secondary: "#9F792C", primaryHSL: "188 100% 24%" }, lat: 30.3322, lng: -81.6557, radius: 50 },
  { city: "Tampa Bay", team: "Buccaneers", league: "NFL", espnId: "tb", colors: { primary: "#D50A0A", secondary: "#34302B", primaryHSL: "0 91% 44%" }, lat: 27.9506, lng: -82.4572, radius: 50 },
  { city: "Indianapolis", team: "Colts", league: "NFL", espnId: "ind", colors: { primary: "#002C5F", secondary: "#A2AAAD", primaryHSL: "212 100% 19%" }, lat: 39.7684, lng: -86.1581, radius: 50 },

  // AFC/NFC West
  { city: "Los Angeles", team: "Lakers", league: "NBA", espnId: "lal", colors: { primary: "#552583", secondary: "#FDB927", primaryHSL: "270 55% 33%" }, lat: 34.0522, lng: -118.2437, radius: 60 },
  { city: "San Francisco", team: "49ers", league: "NFL", espnId: "sf", colors: { primary: "#AA0000", secondary: "#B3995D", primaryHSL: "0 100% 33%" }, lat: 37.7749, lng: -122.4194, radius: 50 },
  { city: "Seattle", team: "Seahawks", league: "NFL", espnId: "sea", colors: { primary: "#002244", secondary: "#69BE28", primaryHSL: "210 100% 13%" }, lat: 47.6062, lng: -122.3321, radius: 60 },
  { city: "Denver", team: "Broncos", league: "NFL", espnId: "den", colors: { primary: "#FB4F14", secondary: "#002244", primaryHSL: "18 97% 53%" }, lat: 39.7392, lng: -104.9903, radius: 70 },
  { city: "Phoenix", team: "Suns", league: "NBA", espnId: "phx", colors: { primary: "#1D1160", secondary: "#E56020", primaryHSL: "253 72% 22%" }, lat: 33.4484, lng: -112.0740, radius: 60 },
  { city: "Las Vegas", team: "Raiders", league: "NFL", espnId: "lv", colors: { primary: "#A5ACAF", secondary: "#000000", primaryHSL: "200 4% 67%" }, lat: 36.1699, lng: -115.1398, radius: 50 },
  { city: "Kansas City", team: "Chiefs", league: "NFL", espnId: "kc", colors: { primary: "#E31837", secondary: "#FFB81C", primaryHSL: "351 83% 49%" }, lat: 39.0997, lng: -94.5786, radius: 60 },
  { city: "San Diego", team: "Padres", league: "MLB", espnId: "sd", colors: { primary: "#2F241D", secondary: "#FFC425", primaryHSL: "26 26% 15%" }, lat: 32.7157, lng: -117.1611, radius: 40 },
  { city: "Portland", team: "Trail Blazers", league: "NBA", espnId: "por", colors: { primary: "#E03A3E", secondary: "#000000", primaryHSL: "359 73% 55%" }, lat: 45.5152, lng: -122.6784, radius: 50 },
  { city: "Salt Lake City", team: "Jazz", league: "NBA", espnId: "uta", colors: { primary: "#002B5C", secondary: "#00471B", primaryHSL: "212 100% 18%" }, lat: 40.7608, lng: -111.8910, radius: 60 },

  // Other major metros
  { city: "Washington", team: "Commanders", league: "NFL", espnId: "wsh", colors: { primary: "#5A1414", secondary: "#FFB612", primaryHSL: "0 63% 22%" }, lat: 38.9072, lng: -77.0369, radius: 40 },
  { city: "Milwaukee", team: "Bucks", league: "NBA", espnId: "mil", colors: { primary: "#00471B", secondary: "#EEE1C6", primaryHSL: "152 100% 14%" }, lat: 43.0389, lng: -87.9065, radius: 40 },
  { city: "Sacramento", team: "Kings", league: "NBA", espnId: "sac", colors: { primary: "#5A2D81", secondary: "#63727A", primaryHSL: "271 48% 34%" }, lat: 38.5816, lng: -121.4944, radius: 40 },
  { city: "Memphis", team: "Grizzlies", league: "NBA", espnId: "mem", colors: { primary: "#5D76A9", secondary: "#12173F", primaryHSL: "219 32% 52%" }, lat: 35.1495, lng: -90.0490, radius: 50 },
  { city: "Oklahoma City", team: "Thunder", league: "NBA", espnId: "okc", colors: { primary: "#007AC1", secondary: "#EF6100", primaryHSL: "199 100% 38%" }, lat: 35.4676, lng: -97.5164, radius: 60 },
  { city: "Orlando", team: "Magic", league: "NBA", espnId: "orl", colors: { primary: "#0077C0", secondary: "#C4CED4", primaryHSL: "200 100% 38%" }, lat: 28.5383, lng: -81.3792, radius: 50 },
  { city: "San Antonio", team: "Spurs", league: "NBA", espnId: "sa", colors: { primary: "#C4CED4", secondary: "#000000", primaryHSL: "200 10% 80%" }, lat: 29.4241, lng: -98.4936, radius: 50 },
  { city: "Toronto", team: "Raptors", league: "NBA", espnId: "tor", colors: { primary: "#CE1141", secondary: "#000000", primaryHSL: "347 87% 44%" }, lat: 43.6532, lng: -79.3832, radius: 40 },

  // --- College Teams ---
  // Power conferences + notable programs, especially in areas without pro teams.
  // Smaller radii so they don't override nearby pro teams.

  // SEC
  { city: "Fayetteville", team: "Razorbacks", school: "Arkansas", league: "ncaa", espnId: "8", colors: { primary: "#9D2235", secondary: "#FFFFFF", primaryHSL: "350 66% 37%" }, lat: 36.0822, lng: -94.1719, radius: 40 },
  { city: "Tuscaloosa", team: "Crimson Tide", school: "Alabama", league: "ncaa", espnId: "333", colors: { primary: "#9E1B32", secondary: "#FFFFFF", primaryHSL: "349 72% 36%" }, lat: 33.2098, lng: -87.5692, radius: 40 },
  { city: "Auburn", team: "Tigers", school: "Auburn", league: "ncaa", espnId: "2", colors: { primary: "#0C2340", secondary: "#E87722", primaryHSL: "213 68% 15%" }, lat: 32.6099, lng: -85.4808, radius: 35 },
  { city: "Athens", team: "Bulldogs", school: "Georgia", league: "ncaa", espnId: "61", colors: { primary: "#BA0C2F", secondary: "#000000", primaryHSL: "349 90% 39%" }, lat: 33.9519, lng: -83.3576, radius: 35 },
  { city: "Gainesville", team: "Gators", school: "Florida", league: "ncaa", espnId: "57", colors: { primary: "#0021A5", secondary: "#FA4616", primaryHSL: "228 100% 32%" }, lat: 29.6516, lng: -82.3248, radius: 35 },
  { city: "Baton Rouge", team: "Tigers", school: "LSU", league: "ncaa", espnId: "99", colors: { primary: "#461D7C", secondary: "#FDD023", primaryHSL: "267 61% 30%" }, lat: 30.4515, lng: -91.1871, radius: 35 },
  { city: "Knoxville", team: "Volunteers", school: "Tennessee", league: "ncaa", espnId: "2633", colors: { primary: "#FF8200", secondary: "#FFFFFF", primaryHSL: "31 100% 50%" }, lat: 35.9606, lng: -83.9207, radius: 35 },
  { city: "College Station", team: "Aggies", school: "Texas A&M", league: "ncaa", espnId: "245", colors: { primary: "#500000", secondary: "#FFFFFF", primaryHSL: "0 100% 16%" }, lat: 30.6280, lng: -96.3344, radius: 35 },
  { city: "Columbia", team: "Gamecocks", school: "South Carolina", league: "ncaa", espnId: "2579", colors: { primary: "#73000A", secondary: "#000000", primaryHSL: "356 100% 23%" }, lat: 34.0007, lng: -81.0348, radius: 35 },
  { city: "Lexington", team: "Wildcats", school: "Kentucky", league: "ncaa", espnId: "96", colors: { primary: "#0033A0", secondary: "#FFFFFF", primaryHSL: "220 100% 31%" }, lat: 38.0406, lng: -84.5037, radius: 35 },
  { city: "Oxford", team: "Rebels", school: "Ole Miss", league: "ncaa", espnId: "145", colors: { primary: "#CE1126", secondary: "#14213D", primaryHSL: "354 85% 44%" }, lat: 34.3665, lng: -89.5192, radius: 30 },
  { city: "Starkville", team: "Bulldogs", school: "Mississippi State", league: "ncaa", espnId: "344", colors: { primary: "#660000", secondary: "#FFFFFF", primaryHSL: "0 100% 20%" }, lat: 33.4504, lng: -88.8184, radius: 30 },

  // Big Ten
  { city: "Columbus", team: "Buckeyes", school: "Ohio State", league: "ncaa", espnId: "194", colors: { primary: "#BB0000", secondary: "#666666", primaryHSL: "0 100% 37%" }, lat: 39.9612, lng: -82.9988, radius: 35 },
  { city: "Ann Arbor", team: "Wolverines", school: "Michigan", league: "ncaa", espnId: "130", colors: { primary: "#00274C", secondary: "#FFCB05", primaryHSL: "209 100% 15%" }, lat: 42.2808, lng: -83.7430, radius: 30 },
  { city: "State College", team: "Nittany Lions", school: "Penn State", league: "ncaa", espnId: "213", colors: { primary: "#041E42", secondary: "#FFFFFF", primaryHSL: "214 91% 14%" }, lat: 40.7934, lng: -77.8600, radius: 35 },
  { city: "Lincoln", team: "Cornhuskers", school: "Nebraska", league: "ncaa", espnId: "158", colors: { primary: "#E41C38", secondary: "#FFFFFF", primaryHSL: "352 79% 50%" }, lat: 40.8136, lng: -96.7026, radius: 40 },
  { city: "Madison", team: "Badgers", school: "Wisconsin", league: "ncaa", espnId: "275", colors: { primary: "#C5050C", secondary: "#FFFFFF", primaryHSL: "358 93% 40%" }, lat: 43.0731, lng: -89.4012, radius: 30 },
  { city: "Iowa City", team: "Hawkeyes", school: "Iowa", league: "ncaa", espnId: "2294", colors: { primary: "#FFCD00", secondary: "#000000", primaryHSL: "48 100% 50%" }, lat: 41.6611, lng: -91.5302, radius: 35 },
  { city: "Eugene", team: "Ducks", school: "Oregon", league: "ncaa", espnId: "2483", colors: { primary: "#154733", secondary: "#FEE123", primaryHSL: "155 53% 18%" }, lat: 44.0521, lng: -123.0868, radius: 35 },
  { city: "Los Angeles", team: "Trojans", school: "USC", league: "ncaa", espnId: "30", colors: { primary: "#990000", secondary: "#FFC72C", primaryHSL: "0 100% 30%" }, lat: 34.0224, lng: -118.2851, radius: 15 },
  { city: "Los Angeles", team: "Bruins", school: "UCLA", league: "ncaa", espnId: "26", colors: { primary: "#2D68C4", secondary: "#F2A900", primaryHSL: "216 63% 47%" }, lat: 34.0689, lng: -118.4452, radius: 10 },

  // Big 12
  { city: "Austin", team: "Longhorns", school: "Texas", league: "ncaa", espnId: "251", colors: { primary: "#BF5700", secondary: "#FFFFFF", primaryHSL: "23 100% 37%" }, lat: 30.2672, lng: -97.7431, radius: 35 },
  { city: "Norman", team: "Sooners", school: "Oklahoma", league: "ncaa", espnId: "201", colors: { primary: "#841617", secondary: "#FFFFFF", primaryHSL: "0 72% 30%" }, lat: 35.2226, lng: -97.4395, radius: 30 },
  { city: "Lubbock", team: "Red Raiders", school: "Texas Tech", league: "ncaa", espnId: "2641", colors: { primary: "#CC0000", secondary: "#000000", primaryHSL: "0 100% 40%" }, lat: 33.5779, lng: -101.8552, radius: 40 },
  { city: "Waco", team: "Bears", school: "Baylor", league: "ncaa", espnId: "239", colors: { primary: "#154734", secondary: "#FFB81C", primaryHSL: "155 55% 18%" }, lat: 31.5493, lng: -97.1467, radius: 30 },
  { city: "Stillwater", team: "Cowboys", school: "Oklahoma State", league: "ncaa", espnId: "197", colors: { primary: "#FF7300", secondary: "#000000", primaryHSL: "27 100% 50%" }, lat: 36.1156, lng: -97.0584, radius: 30 },
  { city: "Boulder", team: "Buffaloes", school: "Colorado", league: "ncaa", espnId: "38", colors: { primary: "#CFB87C", secondary: "#000000", primaryHSL: "42 42% 65%" }, lat: 40.0150, lng: -105.2705, radius: 30 },
  { city: "Provo", team: "Cougars", school: "BYU", league: "ncaa", espnId: "252", colors: { primary: "#002E5D", secondary: "#FFFFFF", primaryHSL: "211 100% 18%" }, lat: 40.2338, lng: -111.6585, radius: 30 },
  { city: "Morgantown", team: "Mountaineers", school: "West Virginia", league: "ncaa", espnId: "277", colors: { primary: "#002855", secondary: "#EAAA00", primaryHSL: "210 100% 17%" }, lat: 39.6295, lng: -79.9559, radius: 35 },

  // ACC
  { city: "Clemson", team: "Tigers", school: "Clemson", league: "ncaa", espnId: "228", colors: { primary: "#F56600", secondary: "#522D80", primaryHSL: "25 100% 48%" }, lat: 34.6834, lng: -82.8374, radius: 30 },
  { city: "Tallahassee", team: "Seminoles", school: "Florida State", league: "ncaa", espnId: "52", colors: { primary: "#782F40", secondary: "#CEB888", primaryHSL: "345 44% 33%" }, lat: 30.4383, lng: -84.2807, radius: 35 },
  { city: "Chapel Hill", team: "Tar Heels", school: "UNC", league: "ncaa", espnId: "153", colors: { primary: "#7BAFD4", secondary: "#FFFFFF", primaryHSL: "202 50% 65%" }, lat: 35.9132, lng: -79.0558, radius: 25 },
  { city: "Durham", team: "Blue Devils", school: "Duke", league: "ncaa", espnId: "150", colors: { primary: "#003087", secondary: "#FFFFFF", primaryHSL: "218 100% 27%" }, lat: 35.9940, lng: -78.8986, radius: 20 },
  { city: "Blacksburg", team: "Hokies", school: "Virginia Tech", league: "ncaa", espnId: "259", colors: { primary: "#630031", secondary: "#CF4420", primaryHSL: "330 100% 19%" }, lat: 37.2296, lng: -80.4139, radius: 30 },
  { city: "Louisville", team: "Cardinals", school: "Louisville", league: "ncaa", espnId: "97", colors: { primary: "#AD0000", secondary: "#000000", primaryHSL: "0 100% 34%" }, lat: 38.2527, lng: -85.7585, radius: 35 },
  { city: "Syracuse", team: "Orange", school: "Syracuse", league: "ncaa", espnId: "183", colors: { primary: "#D44500", secondary: "#FFFFFF", primaryHSL: "19 100% 42%" }, lat: 43.0481, lng: -76.1474, radius: 35 },

  // Other notable programs
  { city: "South Bend", team: "Fighting Irish", school: "Notre Dame", league: "ncaa", espnId: "87", colors: { primary: "#0C2340", secondary: "#C99700", primaryHSL: "213 68% 15%" }, lat: 41.7002, lng: -86.2380, radius: 30 },
  { city: "Tucson", team: "Wildcats", school: "Arizona", league: "ncaa", espnId: "12", colors: { primary: "#CC0033", secondary: "#003366", primaryHSL: "347 100% 40%" }, lat: 32.2226, lng: -110.9747, radius: 35 },
];

// Haversine distance in miles
function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find the nearest team to a given lat/lng, within that team's radius
export function findLocalTeam(lat: number, lng: number): LocalTeam | null {
  let closest: LocalTeam | null = null;
  let closestDist = Infinity;

  for (const team of LOCAL_TEAMS) {
    const dist = distanceMiles(lat, lng, team.lat, team.lng);
    if (dist <= team.radius && dist < closestDist) {
      closest = team;
      closestDist = dist;
    }
  }

  return closest;
}

// Generate a full brand color palette from a single hex color.
// Returns shades 50-950 by adjusting lightness.
export function generatePalette(hex: string): Record<string, string> {
  const { h, s, l } = hexToHSL(hex);

  // Target lightnesses for each shade (Tailwind-style distribution)
  const shades: [string, number][] = [
    ["50", 96],
    ["100", 91],
    ["200", 82],
    ["300", 68],
    ["400", 53],
    ["500", 44],
    ["600", l],       // Original color lightness
    ["700", l * 0.82],
    ["800", l * 0.68],
    ["900", l * 0.55],
    ["950", l * 0.32],
  ];

  const palette: Record<string, string> = {};
  for (const [shade, lightness] of shades) {
    palette[shade] = hslToHex(h, s, Math.round(lightness));
  }
  return palette;
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
