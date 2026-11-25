const tests = [
  {
    listening:[[10],[11,12],[13,14],[15]],
    reading:[
      [[16,17],[[18,1,7],[19,8,13]]],
      [[20,21],[[22,14,21],[23,22,23],[24,24,26]]],
      [[25,26],[[27,27,30],[28,31,36],[29,37,40]]],
    ],
    writing:[30,31],speaking:32,
  },
  {
    listening:[[33,34],[35,36],[37,38],[39]],
    reading:[
      [[40,41],[[42,1,7],[43,8,13]]],
      [[44,45],[[46,14,22],[47,23,26]]],
      [[48,49],[[50,27,32],[51,33,40]]],
    ],
    writing:[52,53],speaking:54,
  },
  {
    listening:[[55,56],[57,58],[59,60],[61]],
    reading:[
      [[62,63],[[64,1,7],[65,8,13]]],
      [[66,67],[[68,14,22],[69,23,26]]],
      [[70,71],[[72,27,30],[73,31,34],[74,35,40]]],
    ],
    writing:[75,76],speaking:77,
  },
  {
    listening:[[78],[79,80],[81,82],[83]],
    reading:[
      [[84,85],[[86,1,6],[87,7,13]]],
      [[88,89],[[90,14,23],[91,24,26]]],
      [[92,93],[[94,27,30],[95,31,40]]],
    ],
    writing:[96,97],speaking:98,
  },
];

const listeningPageEnds = [
  [[10],[15,20],[24,30],[40]],
  [[6,10],[16,20],[24,30],[40]],
  [[6,10],[16,20],[25,30],[40]],
  [[10],[14,20],[25,30],[40]],
];

const trueFalse = 'TRUE/FALSE/NOT GIVEN';
const yesNo = 'YES/NO/NOT GIVEN';
const formats = [
  {reading:[[1,7,trueFalse],[37,40,yesNo]]},
  {reading:[[8,13,trueFalse],[33,37,yesNo]]},
  {reading:[[1,7,trueFalse],[35,40,yesNo]]},
  {reading:[[1,6,trueFalse],[36,40,yesNo]]},
];

const keys = [
  {
    listening:[
      '69|sixty-nine|sixty nine','stream','data','map','visitors','sounds','freedom','skills','4.95','leaders',
      'B','A','B','C','A','G','C','B','D','A',
      'B|D','B|D','A|E','A|E','D','G','C','B','F','H',
      'walls','son','fuel','oxygen','rectangular','lamps','family','winter','soil','rain',
    ],
    reading:[
      'FALSE','FALSE','NOT GIVEN','FALSE','NOT GIVEN','TRUE','TRUE','paint','topspin','training',
      'intestines|gut','weights','grips','D','G','C','A','G','B','B|D',
      'B|D','C|E','C|E','grain','punishment','ransom','D','A','C','D',
      'G','J','H','B','E','C','YES','NOT GIVEN','NO','NOT GIVEN',
    ],
  },
  {
    listening:[
      'Mathieson','beginners','college','New','11|eleven|11 am|eleven am|11 a.m.|eleven a.m.','instrument','ear','clapping','recording','alone',
      'A','B','A','B','C','A','C|E','C|E','A|B','A|B',
      'A','B','B','B','E','B','A','C','C','A',
      'move','short','discs','oxygen','tube','temperatures','protein','space','seaweed','endangered',
    ],
    reading:[
      'piston','coal','workshops','labour|labor','quality','railway|railways','sanitation','NOT GIVEN','FALSE','NOT GIVEN',
      'TRUE','TRUE','NOT GIVEN','D','F','A','C','F','injury','serves',
      'excitement','visualisation|visualization','B|D','B|D','A|E','A|E','H','A','C','B',
      'J','I','YES','NOT GIVEN','YES','NOT GIVEN','NO','C','B','D',
    ],
  },
  {
    listening:[
      'harbour|harbor','bridge','3.30|3:30|three thirty|½|half 3|half three|three','rose','sign','purple','samphire','melon','coconut','strawberry',
      'C','D','F','G','B','H','D|E','D|E','B|C','B|C',
      'C','B','A','A','C','C','H','E','B','F',
      'clothing','mouths','salt','toothpaste','fertilisers|fertilizers','nutrients','growth','weight','acid','society',
    ],
    reading:[
      'FALSE','FALSE','TRUE','NOT GIVEN','TRUE','NOT GIVEN','FALSE','caves','stone','bones',
      'beads','pottery','spices','G','A','H','B','carbon','fires','biodiversity',
      'ditches','subsidence','A','C','D','B','D','A','C','B',
      'C','E','F','B','NO','YES','NO','NOT GIVEN','NOT GIVEN','YES',
    ],
  },
  {
    listening:[
      'Kaeden','locker|lockers','passport','uniform','third|3rd','0412 665 903|0412665903','yellow','plastic','ice','gloves',
      'C|E','C|E','A|D','A|D','A','B','C','A','C','B',
      'A','C','A','B','C','D','F','A','C','G',
      'competition','food','disease','agriculture','maps','cattle','speed','monkeys','fishing','flooding',
    ],
    reading:[
      'FALSE','TRUE','FALSE','NOT GIVEN','FALSE','TRUE','colonies','spring','endangered','habitat|habitats',
      'Europe','southern','diet','C','F','E','D','D','B','A',
      'E','B','C','waste','machinery','caution','C','C','B','A',
      'egalitarianism','status','hunting','domineering','autonomy','NOT GIVEN','NO','YES','NOT GIVEN','NO',
    ],
  },
];

// Each number marks the first question in a two-answer group printed “in either order”.
const unordered = [
  {listening:[21,23],reading:[20,22]},
  {listening:[17,19],reading:[23,25]},
  {listening:[17,19],reading:[]},
  {listening:[11,13],reading:[]},
];
