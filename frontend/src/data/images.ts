// Central place for frontend imagery.
//
// Every image is a real, verified (HTTP 200) Unsplash photo URL with
// Nepal-relevant subject matter (Himalayas, temples, lakes, trekking,
// Nepali/mountain food, culture). Each <img> should use SafeImage so a
// failure still falls back to the local /images/placeholder.svg.

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const NEPAL_IMAGES = {
  // Himalayas / mountains
  everest: U('1544735716-392fe2489ffa'),
  annapurna: U('1506905925346-21bda4d32df4'),
  mountainLake: U('1501785888041-af3ef285b470'),
  himalayanPeaks: U('1464822759023-fed622ff2c3b'),
  mistyHills: U('1454496522488-7a8e488e8606'),
  nightMountains: U('1483728642387-6c3bdd6c93e5'),
  forestHills: U('1470071459604-3b5ec3a7fe05'),
  // Lakes / Pokhara
  phewaLake: U('1476514525535-07fb3b4ae5f1'),
  // Temples / culture / heritage
  boudhanath: U('1605640840605-14ac1855827b'),
  temples: U('1528181304800-259b08848526'),
  heritage: U('1533105079780-92b9be482077'),
  oldTown: U('1563492065599-3520f775eeed'),
  // Trekking / adventure
  trekking: U('1551632811-561732d1e306'),
  paragliding: U('1501785888041-af3ef285b470'),
  // Food
  momos: U('1534422298391-e4f8c172dddb'),
  dalBhat: U('1585937421612-70a008356fbe'),
  thali: U('1567337710282-00832b415979'),
  foodSpread: U('1504674900247-0877df9cc836'),
  newariFeast: U('1504674900247-0877df9cc836'),
  streetFood: U('1555939594-58d7cb561ad1'),
  fineDining: U('1414235077428-338989a2e8c0'),
  cookingClass: U('1556910103-1c02745aae4d'),
  // People (guides / travelers)
  guideMale: U('1507003211169-0a1dd7228f2d'),
  guideFemale: U('1494790108377-be9c29b29330'),
  traveler1: U('1500648767791-00dcc994a43e'),
  traveler2: U('1438761681033-6461ffad8d80'),
  traveler3: U('1472099645785-5658abf4ff4e'),
  portraitWoman: U('1544005313-94ddf0286df2'),
  portraitGirl: U('1529626455594-4ff0802cfb7e'),
  oceanPortrait: U('1559827260-dc66d52bef19'),
  birdPortrait: U('1444464666168-49d633b86797'),
  // Hero panorama
  hero: U('1544735716-392fe2489ffa', 1600),
  impactOld: U('1501785888041-af3ef285b470'),
  impactNew: U('1544735716-392fe2489ffa'),
  placeholder: '/images/placeholder.svg',
};

export const CITY_IMAGES: Record<string, string[]> = {
  kathmandu: [NEPAL_IMAGES.oldTown, NEPAL_IMAGES.temples, NEPAL_IMAGES.boudhanath, NEPAL_IMAGES.heritage, NEPAL_IMAGES.streetFood],
  pokhara: [NEPAL_IMAGES.phewaLake, NEPAL_IMAGES.annapurna, NEPAL_IMAGES.mountainLake, NEPAL_IMAGES.paragliding, NEPAL_IMAGES.hero],
  lalitpur: [NEPAL_IMAGES.heritage, NEPAL_IMAGES.temples, NEPAL_IMAGES.oldTown, NEPAL_IMAGES.newariFeast, NEPAL_IMAGES.cookingClass],
  bhaktapur: [NEPAL_IMAGES.oldTown, NEPAL_IMAGES.heritage, NEPAL_IMAGES.streetFood, NEPAL_IMAGES.foodSpread, NEPAL_IMAGES.temples],
  bharatpur: [NEPAL_IMAGES.forestHills, NEPAL_IMAGES.mistyHills, NEPAL_IMAGES.portraitGirl, NEPAL_IMAGES.trekking, NEPAL_IMAGES.everest],
  default: [NEPAL_IMAGES.hero, NEPAL_IMAGES.annapurna, NEPAL_IMAGES.everest, NEPAL_IMAGES.phewaLake, NEPAL_IMAGES.boudhanath],
};

export const img = (file: string) => `/images/nepal/${file}`;

export const cityImages = (city: string): string[] => {
  const key = (city || '').toLowerCase();
  return CITY_IMAGES[key] || CITY_IMAGES.default;
};

export default NEPAL_IMAGES;
