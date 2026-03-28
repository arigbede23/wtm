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

  // HBCUs — smaller radii so they don't override nearby pro/P5 teams
  { city: "Pine Bluff", team: "Golden Lions", school: "UAPB", league: "ncaa", espnId: "2029", colors: { primary: "#FFD700", secondary: "#000000", primaryHSL: "51 100% 50%" }, lat: 34.2284, lng: -92.0032, radius: 20 },
  { city: "Jackson", team: "Tigers", school: "Jackson State", league: "ncaa", espnId: "2296", colors: { primary: "#1A2857", secondary: "#FFFFFF", primaryHSL: "228 53% 22%" }, lat: 32.2988, lng: -90.1848, radius: 20 },
  { city: "Grambling", team: "Tigers", school: "Grambling State", league: "ncaa", espnId: "2755", colors: { primary: "#000000", secondary: "#FFD700", primaryHSL: "0 0% 0%" }, lat: 32.5265, lng: -92.7143, radius: 25 },
  { city: "Baton Rouge", team: "Jaguars", school: "Southern", league: "ncaa", espnId: "2582", colors: { primary: "#0033A0", secondary: "#FFC72C", primaryHSL: "220 100% 31%" }, lat: 30.5270, lng: -91.1723, radius: 10 },
  { city: "Prairie View", team: "Panthers", school: "Prairie View A&M", league: "ncaa", espnId: "2504", colors: { primary: "#4B0082", secondary: "#FFD700", primaryHSL: "275 100% 26%" }, lat: 30.0930, lng: -95.9865, radius: 15 },
  { city: "Houston", team: "Tigers", school: "Texas Southern", league: "ncaa", espnId: "2640", colors: { primary: "#800000", secondary: "#C0C0C0", primaryHSL: "0 100% 25%" }, lat: 29.7252, lng: -95.3544, radius: 5 },
  { city: "Hampton", team: "Pirates", school: "Hampton", league: "ncaa", espnId: "2272", colors: { primary: "#003DA5", secondary: "#FFFFFF", primaryHSL: "218 100% 32%" }, lat: 37.0198, lng: -76.3374, radius: 15 },
  { city: "Norfolk", team: "Spartans", school: "Norfolk State", league: "ncaa", espnId: "2450", colors: { primary: "#007A33", secondary: "#FFD700", primaryHSL: "147 100% 24%" }, lat: 36.8508, lng: -76.2859, radius: 10 },
  { city: "Baltimore", team: "Bears", school: "Morgan State", league: "ncaa", espnId: "2424", colors: { primary: "#FF4500", secondary: "#003399", primaryHSL: "16 100% 50%" }, lat: 39.3434, lng: -76.5844, radius: 5 },
  { city: "Greensboro", team: "Aggies", school: "NC A&T", league: "ncaa", espnId: "2448", colors: { primary: "#003DA5", secondary: "#FFD700", primaryHSL: "218 100% 32%" }, lat: 36.0726, lng: -79.7920, radius: 15 },
  { city: "Orangeburg", team: "Bulldogs", school: "SC State", league: "ncaa", espnId: "2569", colors: { primary: "#003DA5", secondary: "#800000", primaryHSL: "218 100% 32%" }, lat: 33.4918, lng: -80.8565, radius: 20 },
  { city: "Tallahassee", team: "Rattlers", school: "Florida A&M", league: "ncaa", espnId: "50", colors: { primary: "#FF4500", secondary: "#006400", primaryHSL: "16 100% 50%" }, lat: 30.4243, lng: -84.2873, radius: 5 },
  { city: "Washington", team: "Bison", school: "Howard", league: "ncaa", espnId: "47", colors: { primary: "#003DA5", secondary: "#E21833", primaryHSL: "218 100% 32%" }, lat: 38.9228, lng: -77.0196, radius: 5 },
  { city: "Huntsville", team: "Bulldogs", school: "Alabama A&M", league: "ncaa", espnId: "2010", colors: { primary: "#800000", secondary: "#FFFFFF", primaryHSL: "0 100% 25%" }, lat: 34.7834, lng: -86.5716, radius: 20 },
  { city: "Montgomery", team: "Hornets", school: "Alabama State", league: "ncaa", espnId: "2011", colors: { primary: "#000000", secondary: "#FFD700", primaryHSL: "0 0% 0%" }, lat: 32.3639, lng: -86.2817, radius: 20 },
  { city: "Lorman", team: "Braves", school: "Alcorn State", league: "ncaa", espnId: "2016", colors: { primary: "#4B0082", secondary: "#FFD700", primaryHSL: "275 100% 26%" }, lat: 31.8499, lng: -91.1373, radius: 25 },
  { city: "Daytona Beach", team: "Wildcats", school: "Bethune-Cookman", league: "ncaa", espnId: "2065", colors: { primary: "#800000", secondary: "#FFD700", primaryHSL: "0 100% 25%" }, lat: 29.1947, lng: -81.0483, radius: 15 },

  // --- Additional P5/G5/Mid-Major schools ---

  // SEC additions
  { city: "Columbia", team: "Tigers", school: "Missouri", league: "ncaa", espnId: "142", colors: { primary: "#F1B82D", secondary: "#000000", primaryHSL: "42 88% 56%" }, lat: 38.9404, lng: -92.3277, radius: 25 },
  { city: "Nashville", team: "Commodores", school: "Vanderbilt", league: "ncaa", espnId: "238", colors: { primary: "#866D4B", secondary: "#000000", primaryHSL: "30 29% 41%" }, lat: 36.1447, lng: -86.8027, radius: 10 },

  // Big Ten additions
  { city: "Bloomington", team: "Hoosiers", school: "Indiana", league: "ncaa", espnId: "84", colors: { primary: "#990000", secondary: "#FFFFFF", primaryHSL: "0 100% 30%" }, lat: 39.1653, lng: -86.5264, radius: 25 },
  { city: "College Park", team: "Terrapins", school: "Maryland", league: "ncaa", espnId: "120", colors: { primary: "#E03A3E", secondary: "#FFD520", primaryHSL: "359 73% 55%" }, lat: 38.9869, lng: -76.9426, radius: 10 },
  { city: "East Lansing", team: "Spartans", school: "Michigan State", league: "ncaa", espnId: "127", colors: { primary: "#18453B", secondary: "#FFFFFF", primaryHSL: "161 44% 18%" }, lat: 42.7355, lng: -84.4836, radius: 20 },
  { city: "Minneapolis", team: "Golden Gophers", school: "Minnesota", league: "ncaa", espnId: "135", colors: { primary: "#7A0019", secondary: "#FFCC33", primaryHSL: "345 100% 24%" }, lat: 44.9740, lng: -93.2277, radius: 10 },
  { city: "Evanston", team: "Wildcats", school: "Northwestern", league: "ncaa", espnId: "77", colors: { primary: "#4E2A84", secondary: "#FFFFFF", primaryHSL: "270 52% 34%" }, lat: 42.0565, lng: -87.6753, radius: 10 },
  { city: "West Lafayette", team: "Boilermakers", school: "Purdue", league: "ncaa", espnId: "2509", colors: { primary: "#CFB991", secondary: "#000000", primaryHSL: "37 40% 69%" }, lat: 40.4259, lng: -86.9081, radius: 25 },
  { city: "Piscataway", team: "Scarlet Knights", school: "Rutgers", league: "ncaa", espnId: "164", colors: { primary: "#CC0033", secondary: "#000000", primaryHSL: "347 100% 40%" }, lat: 40.5008, lng: -74.4474, radius: 10 },
  { city: "Champaign", team: "Fighting Illini", school: "Illinois", league: "ncaa", espnId: "356", colors: { primary: "#E84A27", secondary: "#13294B", primaryHSL: "11 80% 53%" }, lat: 40.1020, lng: -88.2272, radius: 25 },

  // Big 12 additions
  { city: "Tempe", team: "Sun Devils", school: "Arizona State", league: "ncaa", espnId: "9", colors: { primary: "#8C1D40", secondary: "#FFC627", primaryHSL: "340 65% 33%" }, lat: 33.4242, lng: -111.9281, radius: 15 },
  { city: "Cincinnati", team: "Bearcats", school: "Cincinnati", league: "ncaa", espnId: "2132", colors: { primary: "#E00122", secondary: "#000000", primaryHSL: "354 100% 44%" }, lat: 39.1312, lng: -84.5150, radius: 10 },
  { city: "Ames", team: "Cyclones", school: "Iowa State", league: "ncaa", espnId: "66", colors: { primary: "#C8102E", secondary: "#F1BE48", primaryHSL: "351 83% 42%" }, lat: 42.0267, lng: -93.6465, radius: 25 },
  { city: "Lawrence", team: "Jayhawks", school: "Kansas", league: "ncaa", espnId: "2305", colors: { primary: "#0051BA", secondary: "#E8000D", primaryHSL: "216 100% 36%" }, lat: 38.9717, lng: -95.2353, radius: 25 },
  { city: "Manhattan", team: "Wildcats", school: "Kansas State", league: "ncaa", espnId: "2306", colors: { primary: "#512888", secondary: "#FFFFFF", primaryHSL: "267 52% 35%" }, lat: 39.1836, lng: -96.5717, radius: 25 },
  { city: "Fort Worth", team: "Horned Frogs", school: "TCU", league: "ncaa", espnId: "2628", colors: { primary: "#4D1979", secondary: "#FFFFFF", primaryHSL: "276 64% 29%" }, lat: 32.7097, lng: -97.3633, radius: 10 },
  { city: "Houston", team: "Cougars", school: "Houston", league: "ncaa", espnId: "248", colors: { primary: "#C8102E", secondary: "#FFFFFF", primaryHSL: "351 83% 42%" }, lat: 29.7199, lng: -95.3422, radius: 5 },
  { city: "Orlando", team: "Knights", school: "UCF", league: "ncaa", espnId: "2116", colors: { primary: "#BA9B37", secondary: "#000000", primaryHSL: "44 53% 47%" }, lat: 28.6024, lng: -81.2001, radius: 15 },

  // ACC additions
  { city: "Chestnut Hill", team: "Eagles", school: "Boston College", league: "ncaa", espnId: "103", colors: { primary: "#98002E", secondary: "#BC9B6A", primaryHSL: "342 100% 30%" }, lat: 42.3355, lng: -71.1685, radius: 8 },
  { city: "Atlanta", team: "Yellow Jackets", school: "Georgia Tech", league: "ncaa", espnId: "59", colors: { primary: "#003057", secondary: "#B3A369", primaryHSL: "209 100% 17%" }, lat: 33.7756, lng: -84.3963, radius: 8 },
  { city: "Coral Gables", team: "Hurricanes", school: "Miami", league: "ncaa", espnId: "2390", colors: { primary: "#F47321", secondary: "#005030", primaryHSL: "24 91% 54%" }, lat: 25.7192, lng: -80.2783, radius: 8 },
  { city: "Chapel Hill", team: "Tar Heels", school: "North Carolina", league: "ncaa", espnId: "153", colors: { primary: "#7BAFD4", secondary: "#FFFFFF", primaryHSL: "202 50% 65%" }, lat: 35.9049, lng: -79.0469, radius: 15 },
  { city: "Raleigh", team: "Wolfpack", school: "NC State", league: "ncaa", espnId: "152", colors: { primary: "#CC0000", secondary: "#000000", primaryHSL: "0 100% 40%" }, lat: 35.7847, lng: -78.6821, radius: 12 },
  { city: "Pittsburgh", team: "Panthers", school: "Pittsburgh", league: "ncaa", espnId: "221", colors: { primary: "#003594", secondary: "#FFB81C", primaryHSL: "218 100% 29%" }, lat: 40.4443, lng: -79.9533, radius: 8 },
  { city: "Winston-Salem", team: "Demon Deacons", school: "Wake Forest", league: "ncaa", espnId: "154", colors: { primary: "#9E7E38", secondary: "#000000", primaryHSL: "42 48% 42%" }, lat: 36.1340, lng: -80.2776, radius: 15 },
  { city: "Charlottesville", team: "Cavaliers", school: "Virginia", league: "ncaa", espnId: "258", colors: { primary: "#232D4B", secondary: "#F84C1E", primaryHSL: "224 37% 22%" }, lat: 38.0336, lng: -78.5080, radius: 20 },
  { city: "Stanford", team: "Cardinal", school: "Stanford", league: "ncaa", espnId: "24", colors: { primary: "#8C1515", secondary: "#FFFFFF", primaryHSL: "0 73% 31%" }, lat: 37.4275, lng: -122.1697, radius: 8 },
  { city: "Berkeley", team: "Golden Bears", school: "Cal", league: "ncaa", espnId: "25", colors: { primary: "#003262", secondary: "#FDB515", primaryHSL: "213 100% 19%" }, lat: 37.8716, lng: -122.2588, radius: 8 },
  { city: "Dallas", team: "Mustangs", school: "SMU", league: "ncaa", espnId: "2567", colors: { primary: "#0033A0", secondary: "#C8102E", primaryHSL: "220 100% 31%" }, lat: 32.8432, lng: -96.7833, radius: 5 },

  // Other notable programs
  { city: "Spokane", team: "Bulldogs", school: "Gonzaga", league: "ncaa", espnId: "2250", colors: { primary: "#002967", secondary: "#C8102E", primaryHSL: "217 100% 20%" }, lat: 47.6671, lng: -117.4025, radius: 20 },
  { city: "Villanova", team: "Wildcats", school: "Villanova", league: "ncaa", espnId: "222", colors: { primary: "#003366", secondary: "#FFFFFF", primaryHSL: "210 100% 20%" }, lat: 40.0388, lng: -75.3453, radius: 8 },
  { city: "San Marcos", team: "Bobcats", school: "Texas State", league: "ncaa", espnId: "326", colors: { primary: "#501214", secondary: "#8D734A", primaryHSL: "358 64% 19%" }, lat: 29.8833, lng: -97.9414, radius: 15 },
  { city: "San Antonio", team: "Roadrunners", school: "UTSA", league: "ncaa", espnId: "2636", colors: { primary: "#0C2340", secondary: "#F47321", primaryHSL: "213 68% 15%" }, lat: 29.5830, lng: -98.6196, radius: 10 },
  { city: "Huntsville", team: "Bearkats", school: "Sam Houston", league: "ncaa", espnId: "2534", colors: { primary: "#F47321", secondary: "#FFFFFF", primaryHSL: "24 91% 54%" }, lat: 30.7235, lng: -95.5508, radius: 20 },
  { city: "Dallas", team: "Patriots", school: "Dallas Baptist", league: "ncaa", espnId: "2166", colors: { primary: "#002D62", secondary: "#C8102E", primaryHSL: "213 100% 19%" }, lat: 32.7234, lng: -96.8957, radius: 3 },
  { city: "Seattle", team: "Redhawks", school: "Seattle University", league: "ncaa", espnId: "2547", colors: { primary: "#AA0000", secondary: "#FFFFFF", primaryHSL: "0 100% 33%" }, lat: 47.6116, lng: -122.3178, radius: 3 },
  { city: "Pullman", team: "Cougars", school: "Washington State", league: "ncaa", espnId: "265", colors: { primary: "#981E32", secondary: "#5E6A71", primaryHSL: "349 66% 36%" }, lat: 46.7298, lng: -117.1818, radius: 25 },
  { city: "Springfield", team: "Bears", school: "Missouri State", league: "ncaa", espnId: "2623", colors: { primary: "#800000", secondary: "#FFFFFF", primaryHSL: "0 100% 25%" }, lat: 37.2090, lng: -93.2923, radius: 20 },
  { city: "Huntington", team: "Thundering Herd", school: "Marshall", league: "ncaa", espnId: "276", colors: { primary: "#00B140", secondary: "#FFFFFF", primaryHSL: "142 100% 35%" }, lat: 38.4192, lng: -82.4452, radius: 25 },
  { city: "Atlanta", team: "Panthers", school: "Georgia State", league: "ncaa", espnId: "2247", colors: { primary: "#0039A6", secondary: "#CC0000", primaryHSL: "219 100% 33%" }, lat: 33.7530, lng: -84.3853, radius: 3 },
  { city: "Irvine", team: "Anteaters", school: "UC Irvine", league: "ncaa", espnId: "300", colors: { primary: "#0064A4", secondary: "#FFD200", primaryHSL: "204 100% 32%" }, lat: 33.6405, lng: -117.8443, radius: 10 },
  { city: "Long Beach", team: "Beach", school: "Long Beach State", league: "ncaa", espnId: "299", colors: { primary: "#000000", secondary: "#F0AB00", primaryHSL: "0 0% 0%" }, lat: 33.7838, lng: -118.1141, radius: 10 },
  { city: "Stephenville", team: "Texans", school: "Tarleton State", league: "ncaa", espnId: "2624", colors: { primary: "#4B0082", secondary: "#FFFFFF", primaryHSL: "275 100% 26%" }, lat: 32.2210, lng: -98.2022, radius: 25 },
  { city: "Boca Raton", team: "Owls", school: "Florida Atlantic", league: "ncaa", espnId: "2226", colors: { primary: "#003366", secondary: "#CC0000", primaryHSL: "210 100% 20%" }, lat: 26.3683, lng: -80.1018, radius: 10 },
  { city: "Fort Myers", team: "Eagles", school: "Florida Gulf Coast", league: "ncaa", espnId: "526", colors: { primary: "#002D62", secondary: "#00B140", primaryHSL: "213 100% 19%" }, lat: 26.4637, lng: -81.7709, radius: 15 },
  { city: "Miami", team: "Panthers", school: "Florida International", league: "ncaa", espnId: "2229", colors: { primary: "#002D62", secondary: "#B6862C", primaryHSL: "213 100% 19%" }, lat: 25.7559, lng: -80.3749, radius: 5 },
  { city: "Statesboro", team: "Eagles", school: "Georgia Southern", league: "ncaa", espnId: "290", colors: { primary: "#011E41", secondary: "#FFFFFF", primaryHSL: "214 95% 13%" }, lat: 32.4488, lng: -81.7832, radius: 20 },
  { city: "Greenville", team: "Pirates", school: "East Carolina", league: "ncaa", espnId: "151", colors: { primary: "#592A8A", secondary: "#FFC600", primaryHSL: "270 50% 35%" }, lat: 35.6127, lng: -77.3664, radius: 20 },
  { city: "Jacksonville", team: "Gamecocks", school: "Jacksonville State", league: "ncaa", espnId: "55", colors: { primary: "#CC0000", secondary: "#FFFFFF", primaryHSL: "0 100% 40%" }, lat: 33.8221, lng: -85.7651, radius: 20 },
  { city: "Fullerton", team: "Titans", school: "Cal State Fullerton", league: "ncaa", espnId: "2239", colors: { primary: "#00274C", secondary: "#F47321", primaryHSL: "209 100% 15%" }, lat: 33.8829, lng: -117.8853, radius: 8 },
  { city: "Tampa", team: "Bulls", school: "South Florida", league: "ncaa", espnId: "58", colors: { primary: "#006747", secondary: "#CFC493", primaryHSL: "156 100% 20%" }, lat: 28.0587, lng: -82.4139, radius: 8 },
  { city: "Spartanburg", team: "Spartans", school: "South Carolina Upstate", league: "ncaa", espnId: "2908", colors: { primary: "#00573F", secondary: "#000000", primaryHSL: "161 100% 17%" }, lat: 34.9496, lng: -81.9320, radius: 15 },
  { city: "Florence", team: "Lions", school: "North Alabama", league: "ncaa", espnId: "2453", colors: { primary: "#4B0082", secondary: "#FFD700", primaryHSL: "275 100% 26%" }, lat: 34.7998, lng: -87.6772, radius: 20 },
  { city: "Davis", team: "Aggies", school: "UC Davis", league: "ncaa", espnId: "302", colors: { primary: "#002855", secondary: "#B3A369", primaryHSL: "212 100% 17%" }, lat: 38.5382, lng: -121.7617, radius: 10 },
  { city: "Corpus Christi", team: "Islanders", school: "Texas A&M Corpus Christi", league: "ncaa", espnId: "357", colors: { primary: "#0067C5", secondary: "#007F3E", primaryHSL: "205 100% 39%" }, lat: 27.7175, lng: -97.3257, radius: 15 },
  { city: "Edinburg", team: "Vaqueros", school: "Texas Rio Grande Valley", league: "ncaa", espnId: "2638", colors: { primary: "#003015", secondary: "#F47321", primaryHSL: "150 100% 9%" }, lat: 26.3017, lng: -98.1633, radius: 20 },
  { city: "Las Vegas", team: "Rebels", school: "UNLV", league: "ncaa", espnId: "2439", colors: { primary: "#CF0A2C", secondary: "#000000", primaryHSL: "350 90% 40%" }, lat: 36.1083, lng: -115.1456, radius: 10 },
  { city: "Little Rock", team: "Trojans", school: "Little Rock", league: "ncaa", espnId: "2031", colors: { primary: "#8B0000", secondary: "#C0C0C0", primaryHSL: "0 100% 27%" }, lat: 34.7465, lng: -92.2896, radius: 15 },
  { city: "Troy", team: "Trojans", school: "Troy", league: "ncaa", espnId: "2653", colors: { primary: "#8B0000", secondary: "#A09E9E", primaryHSL: "0 100% 27%" }, lat: 31.8088, lng: -85.9700, radius: 20 },
  { city: "Beaumont", team: "Cardinals", school: "Lamar", league: "ncaa", espnId: "2320", colors: { primary: "#C8102E", secondary: "#FFFFFF", primaryHSL: "351 83% 42%" }, lat: 30.0802, lng: -94.1266, radius: 20 },
  { city: "Kennesaw", team: "Owls", school: "Kennesaw State", league: "ncaa", espnId: "338", colors: { primary: "#FDBB30", secondary: "#000000", primaryHSL: "42 98% 59%" }, lat: 34.0234, lng: -84.6155, radius: 10 },
  { city: "Itta Bena", team: "Delta Devils", school: "Mississippi Valley State", league: "ncaa", espnId: "2400", colors: { primary: "#006341", secondary: "#FFFFFF", primaryHSL: "152 100% 19%" }, lat: 33.4951, lng: -90.3190, radius: 25 },
  { city: "Natchitoches", team: "Demons", school: "Northwestern State", league: "ncaa", espnId: "2466", colors: { primary: "#4B0082", secondary: "#F47321", primaryHSL: "275 100% 26%" }, lat: 31.7607, lng: -93.0863, radius: 25 },
  { city: "Dover", team: "Hornets", school: "Delaware State", league: "ncaa", espnId: "2169", colors: { primary: "#CC0000", secondary: "#003399", primaryHSL: "0 100% 40%" }, lat: 39.1582, lng: -75.5244, radius: 15 },
  { city: "Baltimore", team: "Eagles", school: "Coppin State", league: "ncaa", espnId: "2154", colors: { primary: "#003399", secondary: "#FFD700", primaryHSL: "220 100% 30%" }, lat: 39.3105, lng: -76.6536, radius: 3 },
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
