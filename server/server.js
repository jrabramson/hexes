var turnTime = 120000;

Meteor.startup(function () {

  hexWorld = {};

  if (Worlds.find({ live: true }).count() === 0) {
    Worlds.insert({
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
            world: Worlds.findOne({ live: true })._id,
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
      world: Worlds.findOne({ live: true })._id,
      remaining: turnTime,
      turns: 0
    });
	}

  function getRandomColour() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  // function current_world() {
  //   return Worlds.findOne({ live: true })._id;
  // }

  //................Collection Pubs

  Meteor.publish('hexes', function() {
      return Hexes.find({ world: Worlds.findOne({ live: true })._id });
      // return hexWorld.hexes;
  });

  Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {
      fields: { 
        'username': 1, 
        'owned'   : 1, 
        'colour'  : 1 
      }
    });
  });

  Meteor.publish("resources", function () {
    return Meteor.users.find(Meteor.userId, {
      fields: { 
        'population': 1,
        'wealth'    : 1,
        'resources' : 1
      }
    });
  });

  Meteor.publish("timer", function () {
      return Timer.find({ world: Worlds.findOne({ live: true })._id });
      // return hexWorld.tick;
  });

  //................Methods

  Meteor.methods({
    buyHex : function(hex) {
      current_user = Meteor.users.findOne({_id: this.userId});
      hex_tax = current_user.owned.length * 50;
      if (hex.owner == null && current_user.wealth >= hex_tax) {
        console.log('purchasing: ' + hex.x + ', ' + hex.y)
        Hexes.update(
          hex._id, 
          { $set: { owner: this.userId, ownerName: current_user.username} }
        );
        Meteor.users.update( 
          { _id: Meteor.userId() }, 
          { $push: { owned: hex._id }, $inc: { wealth: -hex_tax } }
        );
      }  
    },
    buyTower : function(hex, struct) {
      current_user = Meteor.users.findOne({_id: this.userId});
      var towerCost = function(struct) {
        var cost_map = {
          "wood": { $inc: { wealth: -50, "resources.wood": -100, "resources.glass": -50 } },
          "sandstone": { $inc: { wealth: -50, "resources.stone": -100, "resources.glass": -50 } },
          "stone": { $inc: { wealth: -50, "resources.stone": -100, "resources.glass": -50 } },
          "obsidian": { $inc: { wealth: -50, "resources.stone": -100, "resources.ore": -100, "resources.glass": -50 } }
        }
        return cost_map[struct.material]
      }
      var canAfford = function(struct, hex, current_user) {
        var tower_map = {
          "wood": function() {
            console.log(current_user.resources.wood);
            return (current_user.resources.wood >= 100 
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          },
          "sandstone": function() {
            return (hex.terrain == "sand" 
              && current_user.resources.stone >= 50 
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          },
          "stone": function() {
            return (current_user.resources.stone >= 100 
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          },
          "obsidian": function() {
            return (current_user.resources.stone >= 100 
              && current_user.resources.ore >= 100 
              && current_user.resources.glass >= 50 
              && current_user.wealth >= 50);
          }
        };
        return tower_map[struct.material]();
      }
      if (hex.owner == current_user._id && hex.structure.level < 3 && canAfford(struct, hex, current_user)) {
        console.log(current_user.username + ' is building: ' + struct.type + "-" + struct.material + "-" + struct.variant);
        Hexes.update(
          hex._id, 
          { 
            $inc: { 'structure.level': 1 },
            $push: { 
              'structure.type': struct.type, 
              'structure.material': struct.material, 
              'structure.variant': struct.variant 
            } 
          }
        );
        Meteor.users.update( 
          { _id: Meteor.userId() }, 
          towerCost(struct)
        );
      } else {
        console.log(current_user.username + ' failed to buy tower ' + struct.type + ' - ' + struct.material);
      }
    },
    upgradeHex : function(hex) {
      current_user = Meteor.users.findOne({_id: this.userId});
      hex_tax = hex.level * 50
      if (hex.owner == current_user._id && current_user.wealth >= hex_tax && current_user.resources.wood >= 50) {
        console.log('upgrading: ' + hex.x + ', ' + hex.y)
        Hexes.update(
          hex._id, 
          { $inc: { level: 1 } }
        );
        Meteor.users.update( 
          { _id: Meteor.userId() }, 
          { $inc: { wealth: -hex_tax } }
        );
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
      user.owned = [];
      user.wealth = 3000;
      user.population = 1000;
      user.resources = {
        wood : 100,
        ore  : 100,
        glass: 100,
        grain: 100,
        fish : 100,
        brick: 100
      }
      user.colour = getRandomColour();
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
  timer = Timer.findOne({ world: Worlds.findOne({ live: true })._id })._id;

  Meteor.setInterval(function () {
      turn();
  }, turnTime);

  function turn() {
    startTimer(turnTime);
    Timer.update(timer, { $inc: { turns: 1 }});
    // hexWorld.turn = Timer.findOne(timer).turns;
    harvest();
    Meteor._debug("Turn " + Timer.findOne(timer).turns);
  }

  function now() {
    return ((new Date()).getTime()+2);
  }

  function tick() {
    var elapsed = now() - startTime;
    hexWorld.tick = countAmt - elapsed;
    // Meteor._debug("Tick");
    if (hexWorld.tick > 0) {
      // Timer.update(timer, { $set: { remaining: cnt }});
    } else {
      // Timer.update(timer, { $set: { remaining: 0 }});
      clearInterval(interval);
    }
  }

  function startTimer(millisecs) {
    clearInterval(interval);
    // Timer.update(timer, { $set: { remaining: millisecs }});
    countAmt = millisecs;
    startTime = now();
    interval = Meteor.setInterval(tick, 1000);  
  }

  function harvest() {
    claimed = Hexes.find({ owner: { $type: 2 } });
    claimed.forEach(function(hex) {
      switch (hex.terrain) {
        case 'grass':
          Meteor.users.update(hex.owner, { $inc: { "resources.grain": 1 } });
          break;
        case 'forest':
          Meteor.users.update(hex.owner, { $inc: { "resources.wood": 1 } });
          break;
        case 'ground':
          Meteor.users.update(hex.owner, { $inc: { "resources.brick": 1 } });
          break;
        case 'stone':
          Meteor.users.update(hex.owner, { $inc: { "resources.ore": 1 } });
          break;
        case 'water':
          Meteor.users.update(hex.owner, { $inc: { "resources.fish": 1 } });
          break;
        case 'sand':
          Meteor.users.update(hex.owner, { $inc: { "resources.glass": 1 } });
          break;  
      }
    });
  }
  
  turn();

});