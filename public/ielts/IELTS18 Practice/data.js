const tests = [
 {listening:[[12],[13,14],[15,16],[17]], reading:[[[18,19],[[20,1,7],[21,8,13]]],[[22,23],[[24,14,18],[25,19,21],[26,22,26]]],[[27,28],[[29,27,35],[30,36,40]]]], writing:[31,32], speaking:33},
 {listening:[[34,35],[36,37],[38,39],[40]], reading:[[[41,42],[[43,1,8],[44,9,13]]],[[45,46],[[47,14,19],[48,20,23],[49,24,26]]],[[50,51],[[52,27,33],[53,34,40]]]], writing:[54,55], speaking:56},
 {listening:[[57],[58,59],[60,61],[62]], reading:[[[63,64],[[65,1,8],[66,9,13]]],[[68,69],[[67,14,20],[70,21,23],[71,24,26]]],[[72,73],[[74,27,30],[75,31,35],[76,36,40]]]], writing:[77,78], speaking:79},
 {listening:[[80],[81,82],[83,84],[85]], reading:[[[86,87],[[88,1,9],[89,10,13]]],[[90,91],[[92,14,16],[93,17,26]]],[[94,95],[[96,27,36],[97,37,40]]]], writing:[98,99], speaking:100},
];
const listeningPageEnds = [
 [[10],[15,20],[26,30],[40]],
 [[5,10],[14,20],[26,30],[40]],
 [[10],[14,20],[24,30],[40]],
 [[10],[14,20],[27,30],[40]]
];
const [abc,abcd,abcde,abcdefg,abcdefgh,abcdefghi] = ['A/B/C','A/B/C/D','A/B/C/D/E','A/B/C/D/E/F/G','A/B/C/D/E/F/G/H','A/B/C/D/E/F/G/H/I'];
const abcdef='A/B/C/D/E/F';
const tf='TRUE/FALSE/NOT GIVEN', yn='YES/NO/NOT GIVEN';
const formats=[
 {listening:[[11,13,abc],[14,15,abcde],[16,20,abcdefg],[21,26,abc],[27,30,abcde]],reading:[[8,13,tf],[14,18,abcdefg],[19,21,abc],[27,31,abcdef],[36,40,abcd]]},
 {listening:[[11,14,abcde],[15,20,abcdefghi],[21,24,abc],[25,26,abcde],[27,30,abcdef]],reading:[[9,13,tf],[14,19,abcd],[20,23,yn],[24,26,abcdef],[27,33,tf]]},
 {listening:[[11,14,abcde],[15,20,abc],[21,24,abcde],[25,30,abcdefg]],reading:[[1,4,abcdefgh],[9,13,abcd],[14,20,'i/ii/iii/iv/v/vi/vii/viii'],[21,23,abcd],[27,30,abcd],[31,35,abcdefghi],[36,40,yn]]},
 {listening:[[11,14,abc],[15,20,abcdefgh],[21,22,abcde],[23,27,abcdefg],[28,30,abc]],reading:[[1,5,abcde],[10,13,abcde],[14,16,abcd],[17,22,abcde],[23,30,yn],[31,36,abcdefghi+'/J'],[37,40,abcd]]},
];
const keys=[
 {listening:'DW30 7YZ|DW307YZ;24 April|24th April;dentist;parking;Claxby;late;evening;supermarket;pollution;storage;C;A;A;B|E;B|E;B;G;D;A;F;A;B;A;C;B;A;B|E;B|E;A|C;A|C;fences;family;helicopters;stress;sides;breathing;feet;employment;weapons;tourism',reading:'lettuces;1,000 kg|1000 kg|1000kg|1,000kg;consumption|food consumption;pesticides;journeys;producers;flavour|flavor;TRUE;NOT GIVEN;FALSE;TRUE;FALSE;NOT GIVEN;B;A;C;E;B;B;C;C;fire;nutrients;cavities;hawthorn;rare;C;F;A;E;B;sustainability;fuel;explosions;bankrupt;C;D;B;D;A'},
 {listening:'training;discount;taxi;service;English;Wivenhoe;equipment;9.75;deliveries;Sunday;B|E;B|E;B|C;B|C;G;C;D;B;H;A;C;A;B;B;A|B;A|B;D;A;C;F;convenient;suits;tailor;profession;visible;string|strings;waist|waists;perfume;image;handbag',reading:'antlers|deer antlers;posts|timber posts;tree trunks;oxen;glaciers;druids;burial;calendar;TRUE;FALSE;FALSE;TRUE;NOT GIVEN;C;A;B;D;C;D;YES;NOT GIVEN;NO;YES;C;A;E;NOT GIVEN;NOT GIVEN;TRUE;FALSE;TRUE;NOT GIVEN;FALSE;transport;staircases;engineering;rule;Roman;Paris;outwards'},
 {listening:'Marrowfield;relative;socialise|socialize;full;Domestic Life;clouds;timing;Animal Magic;movement|animal movement;dark;B|C;B|C;B|D;B|D;C;B;B;C;A;A;A|E;A|E;B|D;B|D;G;E;B;C;F;A;technical;cheap;thousands;identification;tracking;military;location;prediction;database;trust',reading:'G;D;C;F;architects;moisture;layers;speed;C;A;B;D;A;iii;viii;vi;v;vii;i;iv;A;C;B;speed;fifty|50;strict;B;A;C;C;H;D;F;E;B;NO;NOT GIVEN;YES;NO;NOT GIVEN'},
 {listening:'receptionist;Medical;Chastons;appointments;database;experience;confident;temporary;1.15;parking;B;A;A;C;F;G;E;A;C;B;B|D;B|D;D;A;C;G;F;A;B;C;plot;poverty;Europe;poetry;drawings;furniture;lamps;harbour|harbor;children;relatives',reading:'D;C;E;B;D;energy;food;gardening;obesity;C|D;C|D;A|D;A|D;B;C;D;C;B;A;E;B;D;YES;NO;NOT GIVEN;YES;YES;NOT GIVEN;NO;NO;I;F;A;C;H;E;B;A;D;C'},
].map(({listening,reading})=>({listening:listening.split(';'),reading:reading.split(';')}));
const unordered=[
 {listening:[14,27,29],reading:[]},
 {listening:[11,13,25],reading:[]},
 {listening:[11,13,21,23],reading:[]},
 {listening:[21],reading:[10,12]},
];