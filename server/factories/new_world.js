newWorld = function() {
  World.insert({
  	name: "The World",
    live: true
  });

  var terrainTypes = [
    		'grass', 'grass', 'grass', 'grass', 'grass', 
        'forest','forest','forest', 
    		'ground','ground','ground', 
        'stone','stone', 
    		'sand', 
    		'water'
  		];

  var count = 0;
  for(i=0;i<100;i++) {
  	for(j=0;j<100;j++) {
  		rand = Math.floor(Math.random()*15);
    	Hexes.insert({
          order: count,
        	world: World.findOne({ live: true })._id,
        	x: j,
        	y: i,
          level: 0,
        	terrain: terrainTypes[rand],
          walls: [0, 0, 0, 0, 0, 0],
          owner: null,
          ownerName: null,
          structure: {
            level: 0,
            type: [],
            material: [],
            variant: [],
            roof: false
          }
        });
      count++;
  	}
  }
  
  Timer.insert({
    world: World.findOne({ live: true })._id,
    remaining: turnTime,
    turns: 0
  });
}