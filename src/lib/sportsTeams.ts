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
for (const [name, team] of uniqueMascots) {
  if (team !== null) teamByUniqueName.set(name, team);
}

function getLogoUrl(team: SportTeam): string {
  return `https://a.espncdn.com/i/teamlogos/${team.league}/500/${team.espnId}.png`;
}

function makeResult(team: SportTeam): { name: string; logo: string } {
  return { name: team.name, logo: getLogoUrl(team) };
}

export type MatchupTeams = {
  home: { name: string; logo: string } | null;
  away: { name: string; logo: string } | null;
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

function findTeam(text: string): { name: string; logo: string } | null {
  const lower = text.toLowerCase().trim();

  // 1. Exact "City Mascot" match (e.g. "New York Knicks", "Georgia Tech Yellow Jackets")
  const exactMatch = teamByCityName.get(lower);
  if (exactMatch) return makeResult(exactMatch);

  // 2. Check if input contains a known "City Mascot" combo
  //    Handles cases like "2026 NCAA ... Iowa Hawkeyes" or extra words
  for (const [cityName, team] of teamByCityName) {
    // Input contains the full city+mascot (e.g. "Iowa Hawkeyes" found in text)
    if (lower.includes(cityName)) return makeResult(team);
    // The city+mascot contains the input (e.g. input "USC" matches "usc trojans")
    // Only if input is long enough to be meaningful (>= 3 chars)
    if (lower.length >= 3 && cityName === lower) return makeResult(team);
  }

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
