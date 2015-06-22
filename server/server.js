var turnTime = 120000;

Meteor.startup(function () {

    if (Worlds.find({ live: true }).count() === 0) {
      newWorld = Worlds.insert({
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

      for(i=0;i<100;i++) {
      	for(j=0;j<100;j++) {
      		var row = i % 2 ? 'odd' : 'even';
      		rand = Math.floor(Math.random()*15);
	      	Hexes.insert({
	      	      	world: Worlds.findOne({ live: true })._id,
	      	      	x: i,
	      	      	y: j,
	      	      	offset: row,
	      	      	terrain: terrainTypes[rand],
                  walls: [0, 0, 0, 0, 0, 0],
                  owner: null
	      	      });
      	}
      }

      Timer.insert({
        world: Worlds.findOne({ live: true })._id,
        remaining: turnTime,
        turns: 0
      });

  	}

    turn();

});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function current_world() {
  return Worlds.findOne({ live: true })._id;
}

//................Collection Pubs

Meteor.publish('hexes', function() {
    return Hexes.find({ world: current_world() });
});

Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {fields: { 'username': 1, 'owned': 1, 'colour': 1 }});
});

Meteor.publish("wealth", function () {
    return Meteor.users.find(Meteor.userId, {fields: { 'wealth': 1 }});

});
Meteor.publish("timer", function () {
    return Timer.find({ world: current_world() });
});

//................Methods

Meteor.methods({
  buyHex : function(hex){
    current_user = Meteor.users.find({_id: this.userId}).fetch();
    if (!current_user.hexes) {
      Hexes.update(hex._id, {$set: {owner: this.userId}});
      Meteor.users.update( { _id: Meteor.userId() }, { $set: {owned: hex._id} });
    }  
  },
  updateWall : function(hexes){
    hexes.forEach(function (id) {
      hex = Hexes.findOne({ _id: id });
      Hexes.update(hex, { $set: {walls: hex.look()} });  
    });
  }
});

//...............Account Hooks

Accounts.onCreateUser( function (options, user) {
    user.wealth = 100;
    user.population = 100;
    user.resources.wood = 100;
    user.resources.ore = 100;
    user.resources.glass = 100;
    user.colour = getRandomColor();
    return user;
});

Meteor.users.deny({  
  update: function() {
    return true;
  }
});

//................Wall Formatting

Hexes.before.update(function (userId, doc, fieldNames, modifier, options) {

}, {fetchPrevious: false});

Hexes.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (fieldNames.indexOf('owner') >= 0) {
    hex = Hexes.findOne({_id: doc._id});
    Hexes.update(hex, { $set: {walls: hex.look()} });
    var neighbors = [];
    for (i=0;i<6;i++) {
      if (!_.isUndefined(hex.look(i)) && hex.look(i).owner === hex.owner) {
        i >= 3 ? j = (i - 3) : j = (i + 3);
        neighbors.push(hex.look(i)._id);
      }
    }
    Meteor.call('updateWall', neighbors, function (error, result) {});
  }
}, {fetchPrevious: false});

//................Game Timer

var startTime, countAmt, interval, timer;
timer = Timer.findOne({ world: current_world() });

Meteor.setInterval(function () {
    turn();
}, turnTime);

function turn() {
  Meteor._debug("Turn");
  startTimer(turnTime);
}

function now() {
  return ((new Date()).getTime()+2);
}

function tick() {
  var elapsed = now() - startTime;
  Meteor._debug(elapsed);
  var cnt = countAmt - elapsed;
  Meteor._debug(cnt);
  Meteor._debug("Tick");
  if (cnt > 0) {''
    Timer.update(timer._id, { $set: { remaining: cnt }});
  } else {
    Timer.update(timer, { $set: { remaining: 0 }});
    Timer.update(timer, { $inc: { turns: 1 }});
    clearInterval(interval);
  }
}

function startTimer(millisecs) {
  clearInterval(interval);
  Timer.update(timer._id, { $set: { remaining: millisecs }});
  countAmt = millisecs;
  startTime = now();
  interval = Meteor.setInterval(tick, 1000);  
}