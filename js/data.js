/* Real astronomical facts for the Sun and all 8 planets. Distances/sizes below are on a symbolic visual scale — see distReal for actual figures. */
export const BODIES = [
  {
    key:'sun', name:'The Sun', tagline:'The center of the Solar System and its only star — its gravity holds every planet in orbit.',
    color:0xffd27a, glow:0xffb454, radius:5.2, isSun:true,
    facts:{
      'Diameter':'1,392,000 km (~109x Earth)',
      'Composition':'73% hydrogen, 25% helium, trace heavier elements',
      'Surface temp':'~5,500°C (core ~15,000,000°C)',
      'Age':'~4.6 billion years',
      'Light travel time':'~8 minutes 20 seconds to reach Earth'
    }
  },
  {
    key:'mercury', name:'Mercury', tagline:'The smallest planet and closest to the Sun — with almost no atmosphere at all.',
    color:0x9c9c9c, radius:0.42, dist:9.0, tilt:0.03, speed:47.4, distReal:'57.9 million km', period:'88 days',
    composition:'Iron-rich core and a rocky, mineral crust; the core makes up ~75% of the planet',
    oxygen:0, water:0, waterNote:'No liquid water; a small amount of ice may exist in permanently shadowed polar craters',
    atmosphere:'Essentially none (a thin exosphere with traces of oxygen, sodium and helium)',
    moons:[]
  },
  {
    key:'venus', name:'Venus', tagline:'Earth\'s "twin" in size — but a thick carbon-dioxide atmosphere makes it the hottest planet in the Solar System.',
    color:0xe8c07a, radius:0.62, dist:12.6, tilt:177.4, speed:35.0, distReal:'108.2 million km', period:'225 days (rotates backwards)',
    composition:'Rocky planet with an iron core and basalt-like crust; thick clouds of sulfuric acid',
    oxygen:0, water:0, waterNote:'No liquid water; surface temperature of ~465°C would vaporize it instantly',
    atmosphere:'96.5% carbon dioxide, 3.5% nitrogen — no oxygen',
    moons:[]
  },
  {
    key:'earth', name:'Earth', tagline:'The only known life-bearing planet — liquid water, an oxygen-rich atmosphere, and one natural moon.',
    color:0x3aa0ff, radius:0.66, dist:16.4, tilt:23.4, speed:29.8, distReal:'149.6 million km (1 AU)', period:'365.25 days',
    composition:'Iron-nickel core, silicate mantle and crust; ~71% of the surface covered by ocean',
    oxygen:21, water:71, waterNote:'~71% of the surface is covered by liquid water (oceans, rivers, lakes)',
    atmosphere:'78% nitrogen, 21% oxygen, 1% argon and other gases',
    moons:[{name:'The Moon', note:'Earth\'s only natural satellite, 3,474 km in diameter'}]
  },
  {
    key:'mars', name:'Mars', tagline:'The "Red Planet" — a surface coated in iron oxide, polar ice caps, and a future target for human exploration.',
    color:0xc1440e, radius:0.5, dist:20.6, tilt:25.2, speed:24.1, distReal:'227.9 million km', period:'687 days',
    composition:'Iron-sulfur core, basaltic rock, iron-oxide (rust) dust that gives the planet its red color',
    oxygen:0.13, water:0, waterNote:'No liquid water; water ice and frozen CO2 are stored at the polar caps',
    atmosphere:'95% carbon dioxide, 2.6% nitrogen, trace oxygen — extremely thin',
    moons:[{name:'Phobos', note:'Irregularly shaped, slowly spiraling closer to Mars'},{name:'Deimos', note:'The smaller and more distant of Mars\' two moons'}]
  },
  {
    key:'jupiter', name:'Jupiter', tagline:'The largest planet in the Solar System — a massive gas giant, famous for its Great Red Spot storm.',
    color:0xd8ad7a, radius:2.3, dist:28.5, tilt:3.1, speed:13.1, distReal:'778.5 million km', period:'11.86 years',
    composition:'Mostly hydrogen and helium gas; may have a small rocky/metallic core',
    oxygen:0, water:0, waterNote:'No solid surface, so no liquid water; water vapor is suspected within the cloud layers',
    atmosphere:'~90% hydrogen, ~10% helium, traces of methane and ammonia',
    moons:[{name:'Io', note:'The most volcanically active body in the Solar System'},{name:'Europa', note:'May hide a liquid ocean beneath its icy surface'},{name:'Ganymede', note:'The largest moon in the Solar System — bigger than Mercury'},{name:'Callisto', note:'An ancient, heavily cratered surface'}],
    moonNote:'Total confirmed moons: 95+ (the four above are the major "Galilean" moons)'
  },
  {
    key:'saturn', name:'Saturn', tagline:'Famous for its iconic rings of ice and rock — the least dense planet in the Solar System, light enough to float on water.',
    color:0xead9a8, radius:1.95, dist:36.0, tilt:26.7, speed:9.7, distReal:'1,434 million km', period:'29.4 years', hasRing:true,
    composition:'Mostly hydrogen and helium; the rings are made of ice and rock particles',
    oxygen:0, water:0, waterNote:'No solid surface; water exists as ice in the rings and on several of its moons',
    atmosphere:'~96% hydrogen, ~3% helium, trace methane',
    moons:[{name:'Titan', note:'Saturn\'s largest moon, with a thick atmosphere and lakes of liquid methane'},{name:'Enceladus', note:'Geysers of water vapor erupt from an ocean beneath its icy crust'}],
    moonNote:'Total confirmed moons: 146+ (two notable ones shown above)'
  },
  {
    key:'uranus', name:'Uranus', tagline:'An ice giant that rolls almost sideways along its orbit, tilted at a striking 97.8°.',
    color:0x9fe0e0, radius:1.35, dist:43.0, tilt:97.8, speed:6.8, distReal:'2,871 million km', period:'84 years',
    composition:'A mantle rich in water, ammonia and methane ices, wrapped in a hydrogen-helium atmosphere',
    oxygen:0, water:0, waterNote:'No liquid water, but the mantle is thought to hold vast amounts of water-ice compounds',
    atmosphere:'83% hydrogen, 15% helium, 2% methane (which gives it its blue-green color)',
    moons:[{name:'Titania', note:'Uranus\' largest moon'},{name:'Oberon', note:'An old, heavily cratered surface covered in mountains'}],
    moonNote:'Total confirmed moons: 28 (two notable ones shown above)'
  },
  {
    key:'neptune', name:'Neptune', tagline:'The farthest planet from the Sun — known for violent storms and the fastest winds in the Solar System.',
    color:0x4169e1, radius:1.3, dist:49.5, tilt:28.3, speed:5.4, distReal:'4,495 million km', period:'165 years',
    composition:'A mantle rich in water, ammonia and methane ices, wrapped in a hydrogen-helium atmosphere',
    oxygen:0, water:0, waterNote:'No liquid water; methane gas is responsible for its deep blue color',
    atmosphere:'80% hydrogen, 19% helium, 1.5% methane',
    moons:[{name:'Triton', note:'The only large moon that orbits backwards, with active ice volcanoes'}],
    moonNote:'Total confirmed moons: 16 (one notable one shown above)'
  }
];
