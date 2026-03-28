// Sports team lookup — maps team names to ESPN IDs for logo URLs.
// Covers NFL, NBA, MLB, NHL, and MLS teams.
// Used by EventCard to show team logos on sports matchup cards.

export type SportTeam = {
  name: string; // Full team name (e.g. "Lakers")
  city: string; // City name (e.g. "Los Angeles")
  league: string;
  espnId: string;
};

// All major North American pro sports teams
const TEAMS: SportTeam[] = [
  // NBA
  { name: "Hawks", city: "Atlanta", league: "nba", espnId: "atl" },
  { name: "Celtics", city: "Boston", league: "nba", espnId: "bos" },
  { name: "Nets", city: "Brooklyn", league: "nba", espnId: "bkn" },
  { name: "Hornets", city: "Charlotte", league: "nba", espnId: "cha" },
  { name: "Bulls", city: "Chicago", league: "nba", espnId: "chi" },
  { name: "Cavaliers", city: "Cleveland", league: "nba", espnId: "cle" },
  { name: "Mavericks", city: "Dallas", league: "nba", espnId: "dal" },
  { name: "Nuggets", city: "Denver", league: "nba", espnId: "den" },
  { name: "Pistons", city: "Detroit", league: "nba", espnId: "det" },
  { name: "Warriors", city: "Golden State", league: "nba", espnId: "gs" },
  { name: "Rockets", city: "Houston", league: "nba", espnId: "hou" },
  { name: "Pacers", city: "Indiana", league: "nba", espnId: "ind" },
  { name: "Clippers", city: "Los Angeles", league: "nba", espnId: "lac" },
  { name: "Lakers", city: "Los Angeles", league: "nba", espnId: "lal" },
  { name: "Grizzlies", city: "Memphis", league: "nba", espnId: "mem" },
  { name: "Heat", city: "Miami", league: "nba", espnId: "mia" },
  { name: "Bucks", city: "Milwaukee", league: "nba", espnId: "mil" },
  { name: "Timberwolves", city: "Minnesota", league: "nba", espnId: "min" },
  { name: "Pelicans", city: "New Orleans", league: "nba", espnId: "no" },
  { name: "Knicks", city: "New York", league: "nba", espnId: "ny" },
  { name: "Thunder", city: "Oklahoma City", league: "nba", espnId: "okc" },
  { name: "Magic", city: "Orlando", league: "nba", espnId: "orl" },
  { name: "76ers", city: "Philadelphia", league: "nba", espnId: "phi" },
  { name: "Sixers", city: "Philadelphia", league: "nba", espnId: "phi" },
  { name: "Suns", city: "Phoenix", league: "nba", espnId: "phx" },
  { name: "Trail Blazers", city: "Portland", league: "nba", espnId: "por" },
  { name: "Blazers", city: "Portland", league: "nba", espnId: "por" },
  { name: "Kings", city: "Sacramento", league: "nba", espnId: "sac" },
  { name: "Spurs", city: "San Antonio", league: "nba", espnId: "sa" },
  { name: "Raptors", city: "Toronto", league: "nba", espnId: "tor" },
  { name: "Jazz", city: "Utah", league: "nba", espnId: "uta" },
  { name: "Wizards", city: "Washington", league: "nba", espnId: "wsh" },

  // NFL
  { name: "Cardinals", city: "Arizona", league: "nfl", espnId: "ari" },
  { name: "Falcons", city: "Atlanta", league: "nfl", espnId: "atl" },
  { name: "Ravens", city: "Baltimore", league: "nfl", espnId: "bal" },
  { name: "Bills", city: "Buffalo", league: "nfl", espnId: "buf" },
  { name: "Panthers", city: "Carolina", league: "nfl", espnId: "car" },
  { name: "Bears", city: "Chicago", league: "nfl", espnId: "chi" },
  { name: "Bengals", city: "Cincinnati", league: "nfl", espnId: "cin" },
  { name: "Browns", city: "Cleveland", league: "nfl", espnId: "cle" },
  { name: "Cowboys", city: "Dallas", league: "nfl", espnId: "dal" },
  { name: "Broncos", city: "Denver", league: "nfl", espnId: "den" },
  { name: "Lions", city: "Detroit", league: "nfl", espnId: "det" },
  { name: "Packers", city: "Green Bay", league: "nfl", espnId: "gb" },
  { name: "Texans", city: "Houston", league: "nfl", espnId: "hou" },
  { name: "Colts", city: "Indianapolis", league: "nfl", espnId: "ind" },
  { name: "Jaguars", city: "Jacksonville", league: "nfl", espnId: "jax" },
  { name: "Chiefs", city: "Kansas City", league: "nfl", espnId: "kc" },
  { name: "Raiders", city: "Las Vegas", league: "nfl", espnId: "lv" },
  { name: "Chargers", city: "Los Angeles", league: "nfl", espnId: "lac" },
  { name: "Rams", city: "Los Angeles", league: "nfl", espnId: "lar" },
  { name: "Dolphins", city: "Miami", league: "nfl", espnId: "mia" },
  { name: "Vikings", city: "Minnesota", league: "nfl", espnId: "min" },
  { name: "Patriots", city: "New England", league: "nfl", espnId: "ne" },
  { name: "Saints", city: "New Orleans", league: "nfl", espnId: "no" },
  { name: "Giants", city: "New York", league: "nfl", espnId: "nyg" },
  { name: "Jets", city: "New York", league: "nfl", espnId: "nyj" },
  { name: "Eagles", city: "Philadelphia", league: "nfl", espnId: "phi" },
  { name: "Steelers", city: "Pittsburgh", league: "nfl", espnId: "pit" },
  { name: "49ers", city: "San Francisco", league: "nfl", espnId: "sf" },
  { name: "Seahawks", city: "Seattle", league: "nfl", espnId: "sea" },
  { name: "Buccaneers", city: "Tampa Bay", league: "nfl", espnId: "tb" },
  { name: "Titans", city: "Tennessee", league: "nfl", espnId: "ten" },
  { name: "Commanders", city: "Washington", league: "nfl", espnId: "wsh" },

  // MLB
  { name: "Diamondbacks", city: "Arizona", league: "mlb", espnId: "ari" },
  { name: "Braves", city: "Atlanta", league: "mlb", espnId: "atl" },
  { name: "Orioles", city: "Baltimore", league: "mlb", espnId: "bal" },
  { name: "Red Sox", city: "Boston", league: "mlb", espnId: "bos" },
  { name: "Cubs", city: "Chicago", league: "mlb", espnId: "chc" },
  { name: "White Sox", city: "Chicago", league: "mlb", espnId: "chw" },
  { name: "Reds", city: "Cincinnati", league: "mlb", espnId: "cin" },
  { name: "Guardians", city: "Cleveland", league: "mlb", espnId: "cle" },
  { name: "Rockies", city: "Colorado", league: "mlb", espnId: "col" },
  { name: "Tigers", city: "Detroit", league: "mlb", espnId: "det" },
  { name: "Astros", city: "Houston", league: "mlb", espnId: "hou" },
  { name: "Royals", city: "Kansas City", league: "mlb", espnId: "kc" },
  { name: "Angels", city: "Los Angeles", league: "mlb", espnId: "laa" },
  { name: "Dodgers", city: "Los Angeles", league: "mlb", espnId: "lad" },
  { name: "Marlins", city: "Miami", league: "mlb", espnId: "mia" },
  { name: "Brewers", city: "Milwaukee", league: "mlb", espnId: "mil" },
  { name: "Twins", city: "Minnesota", league: "mlb", espnId: "min" },
  { name: "Mets", city: "New York", league: "mlb", espnId: "nym" },
  { name: "Yankees", city: "New York", league: "mlb", espnId: "nyy" },
  { name: "Athletics", city: "Oakland", league: "mlb", espnId: "oak" },
  { name: "Phillies", city: "Philadelphia", league: "mlb", espnId: "phi" },
  { name: "Pirates", city: "Pittsburgh", league: "mlb", espnId: "pit" },
  { name: "Padres", city: "San Diego", league: "mlb", espnId: "sd" },
  { name: "Giants", city: "San Francisco", league: "mlb", espnId: "sf" },
  { name: "Mariners", city: "Seattle", league: "mlb", espnId: "sea" },
  { name: "Cardinals", city: "St. Louis", league: "mlb", espnId: "stl" },
  { name: "Rays", city: "Tampa Bay", league: "mlb", espnId: "tb" },
  { name: "Rangers", city: "Texas", league: "mlb", espnId: "tex" },
  { name: "Blue Jays", city: "Toronto", league: "mlb", espnId: "tor" },
  { name: "Nationals", city: "Washington", league: "mlb", espnId: "wsh" },

  // NHL
  { name: "Ducks", city: "Anaheim", league: "nhl", espnId: "ana" },
  { name: "Coyotes", city: "Arizona", league: "nhl", espnId: "ari" },
  { name: "Bruins", city: "Boston", league: "nhl", espnId: "bos" },
  { name: "Sabres", city: "Buffalo", league: "nhl", espnId: "buf" },
  { name: "Flames", city: "Calgary", league: "nhl", espnId: "cgy" },
  { name: "Hurricanes", city: "Carolina", league: "nhl", espnId: "car" },
  { name: "Blackhawks", city: "Chicago", league: "nhl", espnId: "chi" },
  { name: "Avalanche", city: "Colorado", league: "nhl", espnId: "col" },
  { name: "Blue Jackets", city: "Columbus", league: "nhl", espnId: "cbj" },
  { name: "Stars", city: "Dallas", league: "nhl", espnId: "dal" },
  { name: "Red Wings", city: "Detroit", league: "nhl", espnId: "det" },
  { name: "Oilers", city: "Edmonton", league: "nhl", espnId: "edm" },
  { name: "Panthers", city: "Florida", league: "nhl", espnId: "fla" },
  { name: "Kings", city: "Los Angeles", league: "nhl", espnId: "la" },
  { name: "Wild", city: "Minnesota", league: "nhl", espnId: "min" },
  { name: "Canadiens", city: "Montreal", league: "nhl", espnId: "mtl" },
  { name: "Predators", city: "Nashville", league: "nhl", espnId: "nsh" },
  { name: "Devils", city: "New Jersey", league: "nhl", espnId: "njd" },
  { name: "Islanders", city: "New York", league: "nhl", espnId: "nyi" },
  { name: "Rangers", city: "New York", league: "nhl", espnId: "nyr" },
  { name: "Senators", city: "Ottawa", league: "nhl", espnId: "ott" },
  { name: "Flyers", city: "Philadelphia", league: "nhl", espnId: "phi" },
  { name: "Penguins", city: "Pittsburgh", league: "nhl", espnId: "pit" },
  { name: "Sharks", city: "San Jose", league: "nhl", espnId: "sj" },
  { name: "Kraken", city: "Seattle", league: "nhl", espnId: "sea" },
  { name: "Blues", city: "St. Louis", league: "nhl", espnId: "stl" },
  { name: "Lightning", city: "Tampa Bay", league: "nhl", espnId: "tb" },
  { name: "Maple Leafs", city: "Toronto", league: "nhl", espnId: "tor" },
  { name: "Utah Hockey Club", city: "Utah", league: "nhl", espnId: "uta" },
  { name: "Canucks", city: "Vancouver", league: "nhl", espnId: "van" },
  { name: "Golden Knights", city: "Vegas", league: "nhl", espnId: "vgk" },
  { name: "Capitals", city: "Washington", league: "nhl", espnId: "wsh" },
  { name: "Jets", city: "Winnipeg", league: "nhl", espnId: "wpg" },

  // MLS
  { name: "Atlanta United", city: "Atlanta", league: "soccer", espnId: "atlanta-united-fc" },
  { name: "Austin FC", city: "Austin", league: "soccer", espnId: "austin-fc" },
  { name: "Charlotte FC", city: "Charlotte", league: "soccer", espnId: "charlotte-fc" },
  { name: "Chicago Fire", city: "Chicago", league: "soccer", espnId: "chicago-fire-fc" },
  { name: "FC Cincinnati", city: "Cincinnati", league: "soccer", espnId: "fc-cincinnati" },
  { name: "Colorado Rapids", city: "Colorado", league: "soccer", espnId: "colorado-rapids" },
  { name: "Columbus Crew", city: "Columbus", league: "soccer", espnId: "columbus-crew" },
  { name: "FC Dallas", city: "Dallas", league: "soccer", espnId: "fc-dallas" },
  { name: "D.C. United", city: "Washington", league: "soccer", espnId: "dc-united" },
  { name: "Houston Dynamo", city: "Houston", league: "soccer", espnId: "houston-dynamo-fc" },
  { name: "Sporting KC", city: "Kansas City", league: "soccer", espnId: "sporting-kansas-city" },
  { name: "LA Galaxy", city: "Los Angeles", league: "soccer", espnId: "la-galaxy" },
  { name: "LAFC", city: "Los Angeles", league: "soccer", espnId: "los-angeles-fc" },
  { name: "Inter Miami", city: "Miami", league: "soccer", espnId: "inter-miami-cf" },
  { name: "Minnesota United", city: "Minnesota", league: "soccer", espnId: "minnesota-united-fc" },
  { name: "CF Montreal", city: "Montreal", league: "soccer", espnId: "cf-montreal" },
  { name: "Nashville SC", city: "Nashville", league: "soccer", espnId: "nashville-sc" },
  { name: "New England Revolution", city: "New England", league: "soccer", espnId: "new-england-revolution" },
  { name: "NYCFC", city: "New York", league: "soccer", espnId: "new-york-city-fc" },
  { name: "New York Red Bulls", city: "New York", league: "soccer", espnId: "new-york-red-bulls" },
  { name: "Red Bulls", city: "New York", league: "soccer", espnId: "new-york-red-bulls" },
  { name: "Orlando City", city: "Orlando", league: "soccer", espnId: "orlando-city-sc" },
  { name: "Philadelphia Union", city: "Philadelphia", league: "soccer", espnId: "philadelphia-union" },
  { name: "Portland Timbers", city: "Portland", league: "soccer", espnId: "portland-timbers" },
  { name: "Real Salt Lake", city: "Salt Lake", league: "soccer", espnId: "real-salt-lake" },
  { name: "San Jose Earthquakes", city: "San Jose", league: "soccer", espnId: "san-jose-earthquakes" },
  { name: "Seattle Sounders", city: "Seattle", league: "soccer", espnId: "seattle-sounders-fc" },
  { name: "St. Louis City", city: "St. Louis", league: "soccer", espnId: "st-louis-city-sc" },
  { name: "Toronto FC", city: "Toronto", league: "soccer", espnId: "toronto-fc" },
  { name: "Vancouver Whitecaps", city: "Vancouver", league: "soccer", espnId: "vancouver-whitecaps-fc" },
];

// Build lookup maps for fast matching
const teamByName = new Map<string, SportTeam>();
const teamByCityName = new Map<string, SportTeam>();

for (const team of TEAMS) {
  const nameLower = team.name.toLowerCase();
  const cityNameLower = `${team.city} ${team.name}`.toLowerCase();
  // Only set if not already present (first match wins for duplicates like "Rangers")
  if (!teamByName.has(nameLower)) teamByName.set(nameLower, team);
  teamByCityName.set(cityNameLower, team);
}

function getLogoUrl(team: SportTeam): string {
  return `https://a.espncdn.com/i/teamlogos/${team.league}/500/${team.espnId}.png`;
}

export type MatchupTeams = {
  home: { name: string; logo: string } | null;
  away: { name: string; logo: string } | null;
};

// Parse a sports event title to extract two teams and their logos
export function parseMatchup(title: string): MatchupTeams | null {
  // Match patterns: "Team A vs. Team B", "Team A v. Team B", "Team A vs Team B"
  const match = title.match(/^(.+?)\s+(?:vs?\.?)\s+(.+?)(?:\s*[—\-:(\[].*)?$/i);
  if (!match) return null;

  const [, rawHome, rawAway] = match;
  const home = findTeam(rawHome.trim());
  const away = findTeam(rawAway.trim());

  // Only return if we found at least one team
  if (!home && !away) return null;

  return { home, away };
}

function findTeam(text: string): { name: string; logo: string } | null {
  const lower = text.toLowerCase();

  // Try full "City Name" match first (most specific)
  const fullMatch = teamByCityName.get(lower);
  if (fullMatch) return { name: fullMatch.name, logo: getLogoUrl(fullMatch) };

  // Try just the team name (last word or known multi-word names)
  for (const [key, team] of teamByCityName) {
    if (lower.includes(key) || key.includes(lower)) {
      return { name: team.name, logo: getLogoUrl(team) };
    }
  }

  // Try matching just the team name portion
  const nameParts = lower.split(/\s+/);
  // Try progressively shorter suffixes: "New York Rangers" -> "York Rangers" -> "Rangers"
  for (let i = 0; i < nameParts.length; i++) {
    const suffix = nameParts.slice(i).join(" ");
    const nameMatch = teamByName.get(suffix);
    if (nameMatch) return { name: nameMatch.name, logo: getLogoUrl(nameMatch) };
  }

  return null;
}
