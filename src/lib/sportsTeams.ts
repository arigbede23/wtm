// Sports team lookup — maps team names to ESPN IDs for logo URLs.
// Covers NFL, NBA, MLB, NHL, and MLS teams.
// Used by EventCard to show team logos on sports matchup cards.

export type SportTeam = {
  name: string; // Full team name (e.g. "Lakers")
  city: string; // City name (e.g. "Los Angeles")
  league: string;
  espnId: string;
  logoUrl?: string; // Override for non-ESPN logo sources (e.g. MiLB)
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

  // NCAA — major programs (ESPN logo URL uses numeric team IDs for college)
  // SEC
  { name: "Crimson Tide", city: "Alabama", league: "ncaa", espnId: "333" },
  { name: "Razorbacks", city: "Arkansas", league: "ncaa", espnId: "8" },
  { name: "Tigers", city: "Auburn", league: "ncaa", espnId: "2" },
  { name: "Gators", city: "Florida", league: "ncaa", espnId: "57" },
  { name: "Bulldogs", city: "Georgia", league: "ncaa", espnId: "61" },
  { name: "Wildcats", city: "Kentucky", league: "ncaa", espnId: "96" },
  { name: "Tigers", city: "LSU", league: "ncaa", espnId: "99" },
  { name: "Rebels", city: "Ole Miss", league: "ncaa", espnId: "145" },
  { name: "Bulldogs", city: "Mississippi State", league: "ncaa", espnId: "344" },
  { name: "Tigers", city: "Missouri", league: "ncaa", espnId: "142" },
  { name: "Gamecocks", city: "South Carolina", league: "ncaa", espnId: "2579" },
  { name: "Volunteers", city: "Tennessee", league: "ncaa", espnId: "2633" },
  { name: "Aggies", city: "Texas A&M", league: "ncaa", espnId: "245" },
  { name: "Commodores", city: "Vanderbilt", league: "ncaa", espnId: "238" },

  // Big Ten
  { name: "Hoosiers", city: "Indiana", league: "ncaa", espnId: "84" },
  { name: "Hawkeyes", city: "Iowa", league: "ncaa", espnId: "2294" },
  { name: "Terrapins", city: "Maryland", league: "ncaa", espnId: "120" },
  { name: "Wolverines", city: "Michigan", league: "ncaa", espnId: "130" },
  { name: "Spartans", city: "Michigan State", league: "ncaa", espnId: "127" },
  { name: "Golden Gophers", city: "Minnesota", league: "ncaa", espnId: "135" },
  { name: "Cornhuskers", city: "Nebraska", league: "ncaa", espnId: "158" },
  { name: "Wildcats", city: "Northwestern", league: "ncaa", espnId: "77" },
  { name: "Buckeyes", city: "Ohio State", league: "ncaa", espnId: "194" },
  { name: "Ducks", city: "Oregon", league: "ncaa", espnId: "2483" },
  { name: "Nittany Lions", city: "Penn State", league: "ncaa", espnId: "213" },
  { name: "Boilermakers", city: "Purdue", league: "ncaa", espnId: "2509" },
  { name: "Scarlet Knights", city: "Rutgers", league: "ncaa", espnId: "164" },
  { name: "Trojans", city: "USC", league: "ncaa", espnId: "30" },
  { name: "Bruins", city: "UCLA", league: "ncaa", espnId: "26" },
  { name: "Huskies", city: "Washington", league: "ncaa", espnId: "264" },
  { name: "Badgers", city: "Wisconsin", league: "ncaa", espnId: "275" },

  // Big 12
  { name: "Wildcats", city: "Arizona State", league: "ncaa", espnId: "9" },
  { name: "Sun Devils", city: "Arizona State", league: "ncaa", espnId: "9" },
  { name: "Wildcats", city: "Arizona", league: "ncaa", espnId: "12" },
  { name: "Bears", city: "Baylor", league: "ncaa", espnId: "239" },
  { name: "Cougars", city: "BYU", league: "ncaa", espnId: "252" },
  { name: "Bearcats", city: "Cincinnati", league: "ncaa", espnId: "2132" },
  { name: "Buffaloes", city: "Colorado", league: "ncaa", espnId: "38" },
  { name: "Cyclones", city: "Iowa State", league: "ncaa", espnId: "66" },
  { name: "Jayhawks", city: "Kansas", league: "ncaa", espnId: "2305" },
  { name: "Wildcats", city: "Kansas State", league: "ncaa", espnId: "2306" },
  { name: "Sooners", city: "Oklahoma", league: "ncaa", espnId: "201" },
  { name: "Cowboys", city: "Oklahoma State", league: "ncaa", espnId: "197" },
  { name: "Horned Frogs", city: "TCU", league: "ncaa", espnId: "2628" },
  { name: "Red Raiders", city: "Texas Tech", league: "ncaa", espnId: "2641" },
  { name: "Longhorns", city: "Texas", league: "ncaa", espnId: "251" },
  { name: "Cougars", city: "Houston", league: "ncaa", espnId: "248" },
  { name: "Mountaineers", city: "West Virginia", league: "ncaa", espnId: "277" },
  { name: "Knights", city: "UCF", league: "ncaa", espnId: "2116" },

  // ACC
  { name: "Eagles", city: "Boston College", league: "ncaa", espnId: "103" },
  { name: "Tigers", city: "Clemson", league: "ncaa", espnId: "228" },
  { name: "Blue Devils", city: "Duke", league: "ncaa", espnId: "150" },
  { name: "Seminoles", city: "Florida State", league: "ncaa", espnId: "52" },
  { name: "Yellow Jackets", city: "Georgia Tech", league: "ncaa", espnId: "59" },
  { name: "Cardinals", city: "Louisville", league: "ncaa", espnId: "97" },
  { name: "Hurricanes", city: "Miami", league: "ncaa", espnId: "2390" },
  { name: "Tar Heels", city: "North Carolina", league: "ncaa", espnId: "153" },
  { name: "Wolfpack", city: "North Carolina State", league: "ncaa", espnId: "152" },
  { name: "Wolfpack", city: "NC State", league: "ncaa", espnId: "152" },
  { name: "Fighting Irish", city: "Notre Dame", league: "ncaa", espnId: "87" },
  { name: "Panthers", city: "Pittsburgh", league: "ncaa", espnId: "221" },
  { name: "Demon Deacons", city: "Wake Forest", league: "ncaa", espnId: "154" },
  { name: "Orange", city: "Syracuse", league: "ncaa", espnId: "183" },
  { name: "Cavaliers", city: "Virginia", league: "ncaa", espnId: "258" },
  { name: "Hokies", city: "Virginia Tech", league: "ncaa", espnId: "259" },
  { name: "Cardinals", city: "Stanford", league: "ncaa", espnId: "24" },
  { name: "Golden Bears", city: "Cal", league: "ncaa", espnId: "25" },
  { name: "Mustangs", city: "SMU", league: "ncaa", espnId: "2567" },

  // Other notable programs
  { name: "Bulldogs", city: "Gonzaga", league: "ncaa", espnId: "2250" },
  { name: "Bluejays", city: "Creighton", league: "ncaa", espnId: "156" },
  { name: "Wildcats", city: "Villanova", league: "ncaa", espnId: "222" },
  { name: "Bobcats", city: "Texas State", league: "ncaa", espnId: "326" },
  { name: "Bobcats", city: "Texas State San Marcos", league: "ncaa", espnId: "326" },
  { name: "Roadrunners", city: "UTSA", league: "ncaa", espnId: "2636" },
  { name: "Roadrunners", city: "Texas San Antonio", league: "ncaa", espnId: "2636" },
  { name: "Bearkats", city: "Sam Houston State", league: "ncaa", espnId: "2534" },
  { name: "Bearkats", city: "Sam Houston", league: "ncaa", espnId: "2534" },
  { name: "Patriots", city: "Dallas Baptist", league: "ncaa", espnId: "2166" },
  { name: "Redhawks", city: "Seattle University", league: "ncaa", espnId: "2547" },
  { name: "Cougars", city: "WSU", league: "ncaa", espnId: "265" },
  { name: "Cougars", city: "Washington State", league: "ncaa", espnId: "265" },
  { name: "Bears", city: "Missouri State", league: "ncaa", espnId: "2623" },
  { name: "Thundering Herd", city: "Marshall", league: "ncaa", espnId: "276" },
  { name: "Panthers", city: "Georgia State", league: "ncaa", espnId: "2247" },
  { name: "Anteaters", city: "UC Irvine", league: "ncaa", espnId: "300" },
  { name: "Beach", city: "Long Beach State", league: "ncaa", espnId: "299" },
  { name: "Athletics", city: "Long Beach State", league: "ncaa", espnId: "299" },
  { name: "Fightin Illini", city: "Illinois", league: "ncaa", espnId: "356" },
  { name: "Fighting Illini", city: "Illinois", league: "ncaa", espnId: "356" },
  { name: "Texans", city: "Tarleton State", league: "ncaa", espnId: "2624" },
  { name: "Owls", city: "Florida Atlantic", league: "ncaa", espnId: "2226" },
  { name: "Eagles", city: "Florida Gulf Coast", league: "ncaa", espnId: "526" },
  { name: "Panthers", city: "Florida International", league: "ncaa", espnId: "2229" },
  { name: "Eagles", city: "Georgia Southern", league: "ncaa", espnId: "290" },
  { name: "Pirates", city: "East Carolina", league: "ncaa", espnId: "151" },
  { name: "Gamecocks", city: "Jacksonville State", league: "ncaa", espnId: "55" },
  { name: "Titans", city: "Cal State Fullerton", league: "ncaa", espnId: "2239" },
  { name: "Bulls", city: "South Florida", league: "ncaa", espnId: "58" },
  { name: "Spartans", city: "South Carolina Upstate", league: "ncaa", espnId: "2908" },
  { name: "Lions", city: "North Alabama", league: "ncaa", espnId: "2453" },
  { name: "Cardinal", city: "Stanford", league: "ncaa", espnId: "24" },
  { name: "Aggies", city: "UC Davis", league: "ncaa", espnId: "302" },
  { name: "Islanders", city: "Texas A&M Corpus Christi", league: "ncaa", espnId: "357" },
  { name: "Vaqueros", city: "Texas Rio Grande Valley", league: "ncaa", espnId: "2638" },
  { name: "Rebels", city: "UNLV", league: "ncaa", espnId: "2439" },
  { name: "UNLV", city: "UNLV", league: "ncaa", espnId: "2439" },
  { name: "Trojans", city: "Little Rock", league: "ncaa", espnId: "2031" },
  { name: "Trojans", city: "Arkansas Little Rock", league: "ncaa", espnId: "2031" },
  { name: "Trojans", city: "Troy", league: "ncaa", espnId: "2653" },
  { name: "Cardinals", city: "Lamar", league: "ncaa", espnId: "2320" },
  { name: "Cardinals", city: "Lamar University", league: "ncaa", espnId: "2320" },
  { name: "Mens", city: "Kennesaw State", league: "ncaa", espnId: "338" },
  { name: "Owls", city: "Kennesaw State", league: "ncaa", espnId: "338" },
  // HBCUs
  { name: "Golden Lions", city: "UAPB", league: "ncaa", espnId: "2029" },
  { name: "Golden Lions", city: "Arkansas-Pine Bluff", league: "ncaa", espnId: "2029" },
  { name: "Golden Lions", city: "Arkansas Pine Bluff", league: "ncaa", espnId: "2029" },
  { name: "Tigers", city: "Jackson State", league: "ncaa", espnId: "2296" },
  { name: "Tigers", city: "Grambling", league: "ncaa", espnId: "2755" },
  { name: "Tigers", city: "Grambling State", league: "ncaa", espnId: "2755" },
  { name: "Jaguars", city: "Southern", league: "ncaa", espnId: "2582" },
  { name: "Jaguars", city: "Southern University", league: "ncaa", espnId: "2582" },
  { name: "Panthers", city: "Prairie View", league: "ncaa", espnId: "2504" },
  { name: "Panthers", city: "Prairie View A&M", league: "ncaa", espnId: "2504" },
  { name: "Tigers", city: "Texas Southern", league: "ncaa", espnId: "2640" },
  { name: "Pirates", city: "Hampton", league: "ncaa", espnId: "2272" },
  { name: "Spartans", city: "Norfolk State", league: "ncaa", espnId: "2450" },
  { name: "Bears", city: "Morgan State", league: "ncaa", espnId: "2424" },
  { name: "Aggies", city: "North Carolina A&T", league: "ncaa", espnId: "2448" },
  { name: "Aggies", city: "NC A&T", league: "ncaa", espnId: "2448" },
  { name: "Bulldogs", city: "South Carolina State", league: "ncaa", espnId: "2569" },
  { name: "Bulldogs", city: "SC State", league: "ncaa", espnId: "2569" },
  { name: "Eagles", city: "Coppin State", league: "ncaa", espnId: "2154" },
  { name: "Rattlers", city: "Florida A&M", league: "ncaa", espnId: "50" },
  { name: "Rattlers", city: "FAMU", league: "ncaa", espnId: "50" },
  { name: "Bison", city: "Howard", league: "ncaa", espnId: "47" },
  { name: "Bulldogs", city: "Alabama A&M", league: "ncaa", espnId: "2010" },
  { name: "Hornets", city: "Alabama State", league: "ncaa", espnId: "2011" },
  { name: "Braves", city: "Alcorn State", league: "ncaa", espnId: "2016" },
  { name: "Wildcats", city: "Bethune-Cookman", league: "ncaa", espnId: "2065" },
  { name: "Wildcats", city: "Bethune Cookman", league: "ncaa", espnId: "2065" },
  { name: "Hornets", city: "Delaware State", league: "ncaa", espnId: "2169" },
  { name: "Bulldogs", city: "Mississippi Valley State", league: "ncaa", espnId: "2400" },
  { name: "Delta Devils", city: "Mississippi Valley State", league: "ncaa", espnId: "2400" },
  { name: "Demons", city: "Northwestern State", league: "ncaa", espnId: "2466" },

  // MiLB (Minor League Baseball) — uses MLB static CDN for logos
  { name: "Naturals", city: "Northwest Arkansas", league: "milb", espnId: "1350", logoUrl: "https://www.mlbstatic.com/team-logos/1350.svg" },
  { name: "Sod Poodles", city: "Amarillo", league: "milb", espnId: "5368", logoUrl: "https://www.mlbstatic.com/team-logos/5368.svg" },
  { name: "Rainiers", city: "Tacoma", league: "milb", espnId: "529", logoUrl: "https://www.mlbstatic.com/team-logos/529.svg" },
  { name: "RoughRiders", city: "Frisco", league: "milb", espnId: "540", logoUrl: "https://www.mlbstatic.com/team-logos/540.svg" },
  { name: "Cubs", city: "South Bend", league: "milb", espnId: "550", logoUrl: "https://www.mlbstatic.com/team-logos/550.svg" },
  { name: "Chihuahuas", city: "El Paso", league: "milb", espnId: "4904", logoUrl: "https://www.mlbstatic.com/team-logos/4904.svg" },
  { name: "Sounds", city: "Nashville", league: "milb", espnId: "556", logoUrl: "https://www.mlbstatic.com/team-logos/556.svg" },
  { name: "River Bandits", city: "Quad Cities", league: "milb", espnId: "565", logoUrl: "https://www.mlbstatic.com/team-logos/565.svg" },
  { name: "Travelers", city: "Arkansas", league: "milb", espnId: "574", logoUrl: "https://www.mlbstatic.com/team-logos/574.svg" },
  { name: "Express", city: "Round Rock", league: "milb", espnId: "102", logoUrl: "https://www.mlbstatic.com/team-logos/102.svg" },
  { name: "River Cats", city: "Sacramento", league: "milb", espnId: "105", logoUrl: "https://www.mlbstatic.com/team-logos/105.svg" },
  { name: "Stripers", city: "Gwinnett", league: "milb", espnId: "431", logoUrl: "https://www.mlbstatic.com/team-logos/431.svg" },
  { name: "Hooks", city: "Corpus Christi", league: "milb", espnId: "482", logoUrl: "https://www.mlbstatic.com/team-logos/482.svg" },
  { name: "Redbirds", city: "Memphis", league: "milb", espnId: "235", logoUrl: "https://www.mlbstatic.com/team-logos/235.svg" },
  { name: "Knights", city: "Charlotte", league: "milb", espnId: "494", logoUrl: "https://www.mlbstatic.com/team-logos/494.svg" },
];

// Build lookup maps for fast matching
// Map "city mascot" → team (e.g. "usc trojans", "boston celtics")
const teamByCityName = new Map<string, SportTeam>();
// Map mascot → team, but only for UNIQUE mascot names
const uniqueMascots = new Map<string, SportTeam | null>();

for (const team of TEAMS) {
  const cityNameLower = `${team.city} ${team.name}`.toLowerCase();
  teamByCityName.set(cityNameLower, team);

  // Track which mascot names are unique vs shared
  const nameLower = team.name.toLowerCase();
  if (uniqueMascots.has(nameLower)) {
    // Seen before — mark as ambiguous (null)
    uniqueMascots.set(nameLower, null);
  } else {
    uniqueMascots.set(nameLower, team);
  }
}

// Only allow mascot-only matching for truly unique names
const teamByUniqueName = new Map<string, SportTeam>();
uniqueMascots.forEach((team, name) => {
  if (team !== null) teamByUniqueName.set(name, team);
});

// Team colors keyed by "league/espnId" — primary brand color hex
const TEAM_COLORS: Record<string, string> = {
  // NBA
  "nba/atl": "#E03A3E", "nba/bos": "#007A33", "nba/bkn": "#000000", "nba/cha": "#1D1160",
  "nba/chi": "#CE1141", "nba/cle": "#6F263D", "nba/dal": "#00538C", "nba/den": "#0E2240",
  "nba/det": "#C8102E", "nba/gs": "#1D428A", "nba/hou": "#CE1141", "nba/ind": "#002D62",
  "nba/lac": "#C8102E", "nba/lal": "#552583", "nba/mem": "#5D76A9", "nba/mia": "#98002E",
  "nba/mil": "#00471B", "nba/min": "#0C2340", "nba/no": "#0C2340", "nba/ny": "#006BB6",
  "nba/okc": "#007AC1", "nba/orl": "#0077C0", "nba/phi": "#006BB6", "nba/phx": "#1D1160",
  "nba/por": "#E03A3E", "nba/sac": "#5A2D81", "nba/sa": "#C4CED4", "nba/tor": "#CE1141",
  "nba/uta": "#002B5C", "nba/wsh": "#002B5C",
  // NFL
  "nfl/ari": "#97233F", "nfl/atl": "#A71930", "nfl/bal": "#241773", "nfl/buf": "#00338D",
  "nfl/car": "#0085CA", "nfl/chi": "#0B162A", "nfl/cin": "#FB4F14", "nfl/cle": "#311D00",
  "nfl/dal": "#003594", "nfl/den": "#FB4F14", "nfl/det": "#0076B6", "nfl/gb": "#203731",
  "nfl/hou": "#03202F", "nfl/ind": "#002C5F", "nfl/jax": "#006778", "nfl/kc": "#E31837",
  "nfl/lv": "#000000", "nfl/lac": "#0080C6", "nfl/lar": "#003594", "nfl/mia": "#008E97",
  "nfl/min": "#4F2683", "nfl/ne": "#002244", "nfl/no": "#D3BC8D", "nfl/nyg": "#0B2265",
  "nfl/nyj": "#125740", "nfl/phi": "#004C54", "nfl/pit": "#FFB612", "nfl/sf": "#AA0000",
  "nfl/sea": "#002244", "nfl/tb": "#D50A0A", "nfl/ten": "#4B92DB", "nfl/wsh": "#5A1414",
  // MLB
  "mlb/ari": "#A71930", "mlb/atl": "#CE1141", "mlb/bal": "#DF4601", "mlb/bos": "#BD3039",
  "mlb/chc": "#0E3386", "mlb/chw": "#27251F", "mlb/cin": "#C6011F", "mlb/cle": "#00385D",
  "mlb/col": "#333366", "mlb/det": "#0C2340", "mlb/hou": "#002D62", "mlb/kc": "#004687",
  "mlb/laa": "#BA0021", "mlb/lad": "#005A9C", "mlb/mia": "#00A3E0", "mlb/mil": "#12284B",
  "mlb/min": "#002B5C", "mlb/nym": "#002D72", "mlb/nyy": "#003087", "mlb/oak": "#003831",
  "mlb/phi": "#E81828", "mlb/pit": "#27251F", "mlb/sd": "#2F241D", "mlb/sf": "#FD5A1E",
  "mlb/sea": "#0C2C56", "mlb/stl": "#C41E3A", "mlb/tb": "#092C5C", "mlb/tex": "#003278",
  "mlb/tor": "#134A8E", "mlb/wsh": "#AB0003",
  // NHL
  "nhl/ana": "#F47A38", "nhl/ari": "#8C2633", "nhl/bos": "#FFB81C", "nhl/buf": "#002654",
  "nhl/cgy": "#D2001C", "nhl/car": "#CC0000", "nhl/chi": "#CF0A2C", "nhl/col": "#6F263D",
  "nhl/cbj": "#002654", "nhl/dal": "#006847", "nhl/det": "#CE1126", "nhl/edm": "#041E42",
  "nhl/fla": "#041E42", "nhl/la": "#111111", "nhl/min": "#154734", "nhl/mtl": "#AF1E2D",
  "nhl/nsh": "#FFB81C", "nhl/njd": "#CE1126", "nhl/nyi": "#00539B", "nhl/nyr": "#0038A8",
  "nhl/ott": "#C52032", "nhl/phi": "#F74902", "nhl/pit": "#FCB514", "nhl/sj": "#006D75",
  "nhl/sea": "#99D9D9", "nhl/stl": "#002F87", "nhl/tb": "#002868", "nhl/tor": "#00205B",
  "nhl/uta": "#69B3E7", "nhl/van": "#00205B", "nhl/vgk": "#B4975A", "nhl/wsh": "#041E42",
  "nhl/wpg": "#041E42",
  // MiLB
  "milb/1350": "#00843D", "milb/5368": "#1C2841", "milb/529": "#003DA5", "milb/540": "#C8102E",
  "milb/550": "#0E3386", "milb/4904": "#1C2841", "milb/556": "#CC0000", "milb/565": "#003DA5",
  "milb/574": "#C8102E", "milb/102": "#003DA5", "milb/105": "#00553E", "milb/431": "#003087",
  "milb/482": "#002D62", "milb/235": "#C8102E", "milb/494": "#000000",
};

// NCAA colors from localTeams.ts
const NCAA_COLORS: Record<string, string> = {
  "8": "#9D2235", "333": "#9E1B32", "2": "#0C2340", "61": "#BA0C2F", "57": "#0021A5",
  "99": "#461D7C", "2633": "#FF8200", "245": "#500000", "2579": "#73000A", "96": "#0033A0",
  "145": "#CE1126", "344": "#660000", "194": "#BB0000", "130": "#00274C", "213": "#041E42",
  "158": "#E41C38", "275": "#C5050C", "2294": "#FFCD00", "2483": "#154733", "30": "#990000",
  "26": "#2D68C4", "251": "#BF5700", "201": "#841617", "2641": "#CC0000", "239": "#154734",
  "197": "#FF7300", "38": "#CFB87C", "252": "#002E5D", "277": "#002855", "228": "#F56600",
  "52": "#782F40", "153": "#7BAFD4", "150": "#003087", "259": "#630031", "97": "#AD0000",
  "183": "#D44500", "87": "#0C2340", "12": "#CC0033", "2029": "#FFD700", "2296": "#1A2857",
  "2755": "#000000", "2582": "#0033A0", "2504": "#4B0082", "2640": "#800000", "2272": "#003DA5",
  "2450": "#007A33", "2424": "#FF4500", "2448": "#003DA5", "2569": "#003DA5", "50": "#FF4500",
  "47": "#003DA5", "2010": "#800000", "2011": "#000000", "2016": "#4B0082", "2065": "#800000",
  "142": "#F1B82D", "238": "#866D4B", "84": "#990000", "120": "#E03A3E", "127": "#18453B",
  "135": "#7A0019", "77": "#4E2A84", "2509": "#CFB991", "164": "#CC0033", "356": "#E84A27",
  "9": "#8C1D40", "2132": "#E00122", "66": "#C8102E", "2305": "#0051BA", "2306": "#512888",
  "2628": "#4D1979", "248": "#C8102E", "2116": "#BA9B37", "103": "#98002E", "59": "#003057",
  "2390": "#F47321", "152": "#CC0000", "221": "#003594", "154": "#9E7E38", "258": "#232D4B",
  "24": "#8C1515", "25": "#003262", "2567": "#0033A0", "2250": "#002967", "222": "#003366",
  "326": "#501214", "2636": "#0C2340", "2534": "#F47321", "2166": "#002D62", "2547": "#AA0000",
  "265": "#981E32", "2623": "#800000", "276": "#00B140", "2247": "#0039A6", "300": "#0064A4",
  "299": "#000000", "2624": "#4B0082", "2226": "#003366", "526": "#002D62", "2229": "#002D62",
  "290": "#011E41", "151": "#592A8A", "55": "#CC0000", "2239": "#00274C", "58": "#006747",
  "2908": "#00573F", "2453": "#4B0082", "302": "#002855", "357": "#0067C5", "2638": "#003015",
  "2439": "#CF0A2C", "2031": "#8B0000", "2653": "#8B0000", "2320": "#C8102E", "338": "#FDBB30",
  "2400": "#006341", "2466": "#4B0082", "2169": "#CC0000", "2154": "#003399",
};

function getTeamColor(team: SportTeam): string {
  const key = `${team.league}/${team.espnId}`;
  if (TEAM_COLORS[key]) return TEAM_COLORS[key];
  if (team.league === "ncaa" && NCAA_COLORS[team.espnId]) return NCAA_COLORS[team.espnId];
  return "#333333";
}

function getLogoUrl(team: SportTeam): string {
  if (team.logoUrl) return team.logoUrl;
  return `https://a.espncdn.com/i/teamlogos/${team.league}/500/${team.espnId}.png`;
}

type TeamResult = { name: string; logo: string; color: string };

function makeResult(team: SportTeam): TeamResult {
  return { name: team.name, logo: getLogoUrl(team), color: getTeamColor(team) };
}

export type MatchupTeams = {
  home: TeamResult | null;
  away: TeamResult | null;
};

// Strip sport suffixes that Ticketmaster appends to college team names
const SPORT_SUFFIXES = /\s+(?:Baseball|Softball|Basketball|Football|Soccer|Volleyball|Hockey|Lacrosse|Tennis|Track|Wrestling|Gymnastics|Swimming|Women's|Men's|Mens|Womens)$/i;

// Parse a sports event title to extract two teams and their logos
export function parseMatchup(title: string): MatchupTeams | null {
  // Match patterns: "Team A vs. Team B", "Team A v. Team B", "Team A Vs Team B"
  // The trailing group captures suffixes like "— NBA Regular Season" or ": 5-Borough Race"
  // but NOT hyphens inside team names (e.g. "Bethune-Cookman")
  const match = title.match(/^(.+?)\s+(?:vs?\.?)\s+(.+?)(?:\s*[—:(\[].*)?$/i);
  if (!match) return null;

  const [, rawHome, rawAway] = match;
  // Strip sport suffixes (e.g. "Georgia Bulldogs Baseball" -> "Georgia Bulldogs")
  const cleanHome = rawHome.trim().replace(SPORT_SUFFIXES, "").replace(SPORT_SUFFIXES, "");
  const cleanAway = rawAway.trim().replace(SPORT_SUFFIXES, "").replace(SPORT_SUFFIXES, "");
  const home = findTeam(cleanHome);
  const away = findTeam(cleanAway);

  if (!home && !away) return null;

  return { home, away };
}

function findTeam(text: string): TeamResult | null {
  const lower = text.toLowerCase().trim();

  // 1. Exact "City Mascot" match (e.g. "New York Knicks", "Georgia Tech Yellow Jackets")
  const exactMatch = teamByCityName.get(lower);
  if (exactMatch) return makeResult(exactMatch);

  // 2. Check if input contains a known "City Mascot" combo
  //    Handles cases like "2026 NCAA ... Iowa Hawkeyes" or extra words
  let containsMatch: SportTeam | undefined;
  teamByCityName.forEach((team, cityName) => {
    if (containsMatch) return;
    if (lower.includes(cityName)) containsMatch = team;
    else if (lower.length >= 3 && cityName === lower) containsMatch = team;
  });
  if (containsMatch) return makeResult(containsMatch);

  // 3. Check if input ends with a known "City Mascot"
  //    e.g. "North Carolina State Wolfpack" — try progressively from start
  const words = lower.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const suffix = words.slice(i).join(" ");
    const suffixMatch = teamByCityName.get(suffix);
    if (suffixMatch) return makeResult(suffixMatch);
  }

  // 4. Only for UNIQUE mascot names, match on mascot alone
  //    e.g. "Hawkeyes" is unique, but "Trojans", "Eagles", "Panthers" are NOT
  for (let i = 0; i < words.length; i++) {
    const suffix = words.slice(i).join(" ");
    const uniqueMatch = teamByUniqueName.get(suffix);
    if (uniqueMatch) return makeResult(uniqueMatch);
  }

  return null;
}
