import { PrismaClient, EventCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Seed events with realistic dates relative to "now" so they're always fresh.
// Sports events use typical game-time starts (NBA 7:30 PM ET, etc.)
// based on common scheduling patterns from ESPN/league schedules.

const events = [
  {
    title: "Rooftop Sunset DJ Set",
    description: "Catch golden hour vibes with DJ Marlo spinning deep house on the rooftop. Drinks and small bites available.",
    category: EventCategory.NIGHTLIFE,
    address: "220 W 42nd St",
    city: "New York",
    state: "NY",
    lat: 40.7565,
    lng: -73.9877,
    startDate: daysFromNow(4, 18, 0),  // 6:00 PM
    endDate: daysFromNow(4, 23, 0),    // 11:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    isFree: false,
    price: 25,
  },
  {
    title: "Saturday Morning Farmers Market",
    description: "Fresh produce, artisan bread, local honey, and live acoustic music. Dog-friendly!",
    category: EventCategory.FOOD,
    address: "Union Square",
    city: "New York",
    state: "NY",
    lat: 40.7359,
    lng: -73.9911,
    startDate: nextDayOfWeek(6, 8, 0),   // Saturday 8:00 AM
    endDate: nextDayOfWeek(6, 14, 0),     // Saturday 2:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800",
    isFree: true,
  },
  {
    title: "Open Mic Comedy Night",
    description: "Think you're funny? Prove it. Sign up at the door or just come watch. Two-drink minimum.",
    category: EventCategory.COMEDY,
    address: "123 MacDougal St",
    city: "New York",
    state: "NY",
    lat: 40.7297,
    lng: -74.0003,
    startDate: daysFromNow(2, 20, 0),  // 8:00 PM
    endDate: daysFromNow(2, 23, 0),    // 11:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
    isFree: false,
    price: 10,
  },
  {
    // NBA game times: weeknight home games typically 7:30 PM ET (from ESPN)
    title: "Knicks vs. Celtics — NBA Regular Season",
    description: "New York Knicks host the Boston Celtics at Madison Square Garden. Tip-off at 7:30 PM ET.",
    category: EventCategory.SPORTS,
    address: "Madison Square Garden, 4 Pennsylvania Plaza",
    city: "New York",
    state: "NY",
    lat: 40.7505,
    lng: -73.9934,
    startDate: daysFromNow(3, 19, 30),  // 7:30 PM ET (typical NBA weeknight start)
    endDate: daysFromNow(3, 22, 0),     // ~10:00 PM ET
    coverImageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    isFree: false,
    price: 89,
  },
  {
    title: "Indie Band Showcase",
    description: "Three up-and-coming bands perform original music. Support local artists!",
    category: EventCategory.MUSIC,
    address: "Bowery Ballroom, 6 Delancey St",
    city: "New York",
    state: "NY",
    lat: 40.7204,
    lng: -73.9937,
    startDate: daysFromNow(5, 19, 0),  // 7:00 PM
    endDate: daysFromNow(5, 23, 30),   // 11:30 PM
    coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    isFree: false,
    price: 20,
  },
  {
    title: "Morning Yoga in the Park",
    description: "Start your day with a free vinyasa flow class. Bring your own mat. All levels welcome.",
    category: EventCategory.WELLNESS,
    address: "Sheep Meadow, Central Park",
    city: "New York",
    state: "NY",
    lat: 40.7694,
    lng: -73.9751,
    startDate: nextDayOfWeek(6, 7, 0),   // Saturday 7:00 AM
    endDate: nextDayOfWeek(6, 8, 30),     // Saturday 8:30 AM
    coverImageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800",
    isFree: true,
  },
  {
    title: "Hackathon: Build for Good",
    description: "48-hour hackathon focused on social impact. Form teams, build prototypes, win prizes. Food provided!",
    category: EventCategory.TECH,
    address: "NYU Tandon, 6 MetroTech Center",
    city: "Brooklyn",
    state: "NY",
    lat: 40.6942,
    lng: -73.9866,
    startDate: daysFromNow(8, 9, 0),    // 9:00 AM
    endDate: daysFromNow(10, 17, 0),     // 5:00 PM (2 days later)
    coverImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    isFree: true,
  },
  {
    title: "Street Art Walking Tour",
    description: "Explore Bushwick's best murals and graffiti with a local artist guide. Camera recommended.",
    category: EventCategory.ARTS,
    address: "Jefferson St & Wyckoff Ave",
    city: "Brooklyn",
    state: "NY",
    lat: 40.6932,
    lng: -73.9082,
    startDate: nextDayOfWeek(0, 11, 0),   // Sunday 11:00 AM
    endDate: nextDayOfWeek(0, 13, 30),     // Sunday 1:30 PM
    coverImageUrl: "https://images.unsplash.com/photo-1561059488-916d69792237?w=800",
    isFree: false,
    price: 15,
  },
  {
    title: "Trivia Night at The Local",
    description: "Bring your smartest friends. Winning team gets a $100 bar tab. Max 6 per team.",
    category: EventCategory.SOCIAL,
    address: "456 Atlantic Ave",
    city: "Brooklyn",
    state: "NY",
    lat: 40.6861,
    lng: -73.9797,
    startDate: nextDayOfWeek(3, 19, 30),  // Wednesday 7:30 PM
    endDate: nextDayOfWeek(3, 22, 0),     // Wednesday 10:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800",
    isFree: true,
  },
  {
    title: "Trail Run: Prospect Park 5K",
    description: "Group run through Prospect Park's trails. Pace groups for all levels. Coffee after!",
    category: EventCategory.OUTDOORS,
    address: "Grand Army Plaza",
    city: "Brooklyn",
    state: "NY",
    lat: 40.6741,
    lng: -73.9708,
    startDate: nextDayOfWeek(6, 8, 0),   // Saturday 8:00 AM
    endDate: nextDayOfWeek(6, 10, 0),    // Saturday 10:00 AM
    coverImageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    isFree: true,
  },
  {
    title: "Vinyl Record Swap Meet",
    description: "Bring your crates! Buy, sell, and trade vinyl records. All genres. DJs spinning all day.",
    category: EventCategory.MUSIC,
    address: "Brooklyn Flea, 80 Pearl St",
    city: "Brooklyn",
    state: "NY",
    lat: 40.7026,
    lng: -73.9887,
    startDate: daysFromNow(9, 10, 0),   // 10:00 AM
    endDate: daysFromNow(9, 17, 0),     // 5:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800",
    isFree: true,
  },
  {
    title: "Pottery Workshop: Make a Mug",
    description: "Learn the basics of wheel throwing. Take home your own handmade mug. All materials included.",
    category: EventCategory.ARTS,
    address: "89 N 3rd St",
    city: "Brooklyn",
    state: "NY",
    lat: 40.7171,
    lng: -73.9618,
    startDate: daysFromNow(6, 14, 0),   // 2:00 PM
    endDate: daysFromNow(6, 17, 0),     // 5:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
    isFree: false,
    price: 45,
  },
  {
    title: "Taco Crawl: Best Tacos in BK",
    description: "Hit five taco spots with a group of fellow taco enthusiasts. Rated by spice and flavor!",
    category: EventCategory.FOOD,
    address: "Starts at Sunset Park",
    city: "Brooklyn",
    state: "NY",
    lat: 40.6515,
    lng: -73.9969,
    startDate: daysFromNow(7, 12, 0),   // 12:00 PM
    endDate: daysFromNow(7, 16, 0),     // 4:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
    isFree: false,
    price: 35,
  },
  {
    title: "Community Garden Volunteer Day",
    description: "Help plant spring flowers and veggies. No experience needed. Gloves and tools provided.",
    category: EventCategory.COMMUNITY,
    address: "6th Street Community Garden",
    city: "New York",
    state: "NY",
    lat: 40.7265,
    lng: -73.9845,
    startDate: nextDayOfWeek(6, 9, 0),   // Saturday 9:00 AM
    endDate: nextDayOfWeek(6, 13, 0),    // Saturday 1:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    isFree: true,
  },
  {
    title: "Dance Fitness: Afrobeats Edition",
    description: "High-energy dance workout set to Afrobeats. No dance experience needed, just bring the energy!",
    category: EventCategory.WELLNESS,
    address: "Chelsea Piers, Pier 60",
    city: "New York",
    state: "NY",
    lat: 40.7468,
    lng: -74.0084,
    startDate: daysFromNow(5, 18, 30),  // 6:30 PM
    endDate: daysFromNow(5, 19, 45),    // 7:45 PM
    coverImageUrl: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800",
    isFree: false,
    price: 20,
  },
  {
    title: "Film Screening: Local Shorts Festival",
    description: "Watch short films by NYC filmmakers. Q&A with directors. Popcorn and drinks available.",
    category: EventCategory.ARTS,
    address: "Nitehawk Cinema, 136 Metropolitan Ave",
    city: "Brooklyn",
    state: "NY",
    lat: 40.7145,
    lng: -73.9625,
    startDate: daysFromNow(6, 19, 0),   // 7:00 PM
    endDate: daysFromNow(6, 22, 0),     // 10:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",
    isFree: false,
    price: 16,
  },
  {
    title: "Startup Pitch Night",
    description: "Watch 8 early-stage startups pitch to a panel of investors. Network over drinks after.",
    category: EventCategory.TECH,
    address: "WeWork, 115 Broadway",
    city: "New York",
    state: "NY",
    lat: 40.7087,
    lng: -74.0107,
    startDate: daysFromNow(4, 18, 0),   // 6:00 PM
    endDate: daysFromNow(4, 21, 0),     // 9:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    isFree: true,
  },
  {
    title: "Speed Friending Night",
    description: "Like speed dating, but for friendships! Meet 15 new people in 90 minutes. All vibes welcome.",
    category: EventCategory.SOCIAL,
    address: "The Bean, 824 Broadway",
    city: "New York",
    state: "NY",
    lat: 40.7336,
    lng: -73.9918,
    startDate: daysFromNow(1, 19, 0),   // 7:00 PM
    endDate: daysFromNow(1, 21, 0),     // 9:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    isFree: false,
    price: 12,
  },
  {
    title: "Salsa Dancing on the Pier",
    description: "Free salsa lessons for beginners + open dancing. Partners not required!",
    category: EventCategory.SOCIAL,
    address: "Pier 45, Hudson River Park",
    city: "New York",
    state: "NY",
    lat: 40.7334,
    lng: -74.0115,
    startDate: nextDayOfWeek(5, 17, 0),  // Friday 5:00 PM
    endDate: nextDayOfWeek(5, 21, 0),    // Friday 9:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800",
    isFree: true,
  },
  {
    title: "Board Game Cafe Meetup",
    description: "200+ board games to choose from. Great for solo players looking for a group. Snacks available.",
    category: EventCategory.SOCIAL,
    address: "Hex & Co, 1462 2nd Ave",
    city: "New York",
    state: "NY",
    lat: 40.7701,
    lng: -73.9558,
    startDate: nextDayOfWeek(0, 14, 0),  // Sunday 2:00 PM
    endDate: nextDayOfWeek(0, 18, 0),    // Sunday 6:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800",
    isFree: false,
    price: 10,
  },
  {
    // MLS games typically kick off at 1:30 PM or 7:30 PM ET (per MLS schedule / ESPN)
    title: "NYCFC vs. Inter Miami — MLS Regular Season",
    description: "New York City FC take on Inter Miami at Yankee Stadium. Kickoff at 1:30 PM ET.",
    category: EventCategory.SPORTS,
    address: "Yankee Stadium, 1 E 161st St",
    city: "Bronx",
    state: "NY",
    lat: 40.8296,
    lng: -73.9262,
    startDate: nextDayOfWeek(6, 13, 30),  // Saturday 1:30 PM ET (typical MLS weekend start)
    endDate: nextDayOfWeek(6, 15, 30),    // ~3:30 PM ET
    coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    isFree: false,
    price: 35,
  },
  {
    title: "Jazz & Wine Night",
    description: "Live jazz trio performing standards. Wine flight specials all night. Reservations recommended.",
    category: EventCategory.MUSIC,
    address: "Smalls Jazz Club, 183 W 10th St",
    city: "New York",
    state: "NY",
    lat: 40.7338,
    lng: -74.0022,
    startDate: daysFromNow(7, 20, 0),   // 8:00 PM
    endDate: daysFromNow(8, 0, 0),      // 12:00 AM
    coverImageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800",
    isFree: false,
    price: 30,
  },
  {
    title: "Kayaking on the Hudson",
    description: "Free kayaking in the Hudson River! All equipment provided. Must know how to swim.",
    category: EventCategory.OUTDOORS,
    address: "Pier 26 Boathouse",
    city: "New York",
    state: "NY",
    lat: 40.7207,
    lng: -74.0134,
    startDate: nextDayOfWeek(6, 10, 0),  // Saturday 10:00 AM
    endDate: nextDayOfWeek(6, 15, 0),    // Saturday 3:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1472745433479-4556f22e32c2?w=800",
    isFree: true,
  },
  {
    title: "Night Market: Asian Street Food",
    description: "Pop-up night market featuring 20+ Asian street food vendors. Cash and card accepted.",
    category: EventCategory.FOOD,
    address: "Flushing Meadows Corona Park",
    city: "Queens",
    state: "NY",
    lat: 40.7462,
    lng: -73.8448,
    startDate: nextDayOfWeek(5, 17, 0),  // Friday 5:00 PM
    endDate: nextDayOfWeek(5, 23, 0),    // Friday 11:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    isFree: true,
  },
  {
    title: "Standup Comedy Showcase",
    description: "Five of NYC's best up-and-coming comics. One show only. BYOB-friendly venue.",
    category: EventCategory.COMEDY,
    address: "The Creek and The Cave, 10-93 Jackson Ave",
    city: "Queens",
    state: "NY",
    lat: 40.7473,
    lng: -73.9516,
    startDate: daysFromNow(3, 21, 0),   // 9:00 PM
    endDate: daysFromNow(3, 23, 0),     // 11:00 PM
    coverImageUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800",
    isFree: false,
    price: 15,
  },
  {
    // NHL games at MSG are typically 7:00 PM ET (per NHL schedule / ESPN)
    title: "Rangers vs. Devils — NHL Regular Season",
    description: "New York Rangers host the New Jersey Devils at Madison Square Garden. Puck drop at 7:00 PM ET.",
    category: EventCategory.SPORTS,
    address: "Madison Square Garden, 4 Pennsylvania Plaza",
    city: "New York",
    state: "NY",
    lat: 40.7505,
    lng: -73.9934,
    startDate: daysFromNow(6, 19, 0),   // 7:00 PM ET (typical NHL weeknight)
    endDate: daysFromNow(6, 22, 0),     // ~10:00 PM ET
    coverImageUrl: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800",
    isFree: false,
    price: 75,
  },
  {
    // MLB games: weeknight first pitch typically 7:05 PM ET (per MLB schedule / ESPN)
    title: "Yankees vs. Red Sox — MLB Regular Season",
    description: "The New York Yankees host the Boston Red Sox at Yankee Stadium. First pitch at 7:05 PM ET.",
    category: EventCategory.SPORTS,
    address: "Yankee Stadium, 1 E 161st St",
    city: "Bronx",
    state: "NY",
    lat: 40.8296,
    lng: -73.9262,
    startDate: daysFromNow(10, 19, 5),  // 7:05 PM ET (typical MLB weeknight first pitch)
    endDate: daysFromNow(10, 22, 0),    // ~10:00 PM ET
    coverImageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
    isFree: false,
    price: 55,
  },
];

// Helper: create a Date that is N days from now at a specific hour:minute (local time)
function daysFromNow(days: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Helper: get the next occurrence of a specific day of week (0=Sun, 6=Sat)
// at a specific hour:minute. If today is that day and time hasn't passed, use today.
function nextDayOfWeek(dayOfWeek: number, hour: number, minute: number): Date {
  const d = new Date();
  const currentDay = d.getDay();
  let daysAhead = dayOfWeek - currentDay;
  if (daysAhead < 0) daysAhead += 7;
  if (daysAhead === 0) {
    // Same day — check if time has passed
    const target = new Date(d);
    target.setHours(hour, minute, 0, 0);
    if (target.getTime() <= d.getTime()) {
      daysAhead = 7; // next week
    }
  }
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding database...");

  // Delete existing data
  await prisma.savedEvent.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.event.deleteMany();

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log(`Seeded ${events.length} events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
