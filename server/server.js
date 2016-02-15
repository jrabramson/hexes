var turnTime = 120000;

Meteor.startup(function () {

  hexWorld = {};

  function newGame() {

    World.insert({
      name: "The World",
      live: true,
      leaderboard: {}
    });

    var terrainTypes = [
          'grass', 'grass', 'grass', 'grass', 'grass',
          'forest','forest','forest',
          'ground','ground','ground',
          'stone','stone',
          'sand',
          'water'
        ];

    var resourceMap = {
      'grass': 'grain',
      'forest': 'wood',
      'ground': 'brick',
      'stone': 'ore',
      'sand': 'glass',
      'water': 'fish'
    }

    var count = 0;
    var variant = 1;
    for(i=0;i<32;i++) {
      for(j=0;j<32;j++) {
        var rand = Math.floor(Math.random()*15);
        var terrain = terrainTypes[rand];
        Hexes.findAndModify({
          query: {x: j, y: i},
          update: {$set: {
            order: count,
            x: j,
            y: i,
            terrain: terrain,
            variant: variant,
            resource: resourceMap[terrain],
            walls: [0, 0, 0, 0, 0, 0],
            owner: null,
            ownerName: null,
            state: {
              type: null,
              level: 0,
              structure: {}
            }
          }
        },
        new: true,
        upsert: true
      });

      count++;
      variant == 3 ? variant = 1 : variant++;
      }
    }

    Market.findAndModify({
      query: {name: 'market'},
      update: {
        $set: {
          name: 'market',
          wood: {value: 10, trend: true},
          ore: {value: 10, trend: true},
          glass: {value: 10, trend: true},
          grain: {value: 10, trend: true},
          fish : {value: 10, trend: true},
          brick: {value: 10, trend: true}
        }
      },
      new: true,
      upsert: true
    });

    Timer.findAndModify({
      query: {name: 'timer'},
      update: {
        $set: {
          name: 'timer',
          remaining: turnTime,
          turns: 0
        }
      },
      new: true,
      upsert: true
    });

    Meteor.users.update({}, {
      $set: {
        owned: [],
        wealth: 3000,
        population: 1000,
        resources: {
          wood : 100,
          ore  : 100,
          glass: 100,
          grain: 100,
          fish : 100,
          brick: 100
        }
      }
    }, {multi: true})

    startGame();
  }

  if (World.find({live: true}).count() === 0) {
    newGame();
  } else {
    startGame();
  }

  function startGame() {
    turn();
    turnInterval = Meteor.setInterval(function () {
        turn();
    }, turnTime);
  }

  Hexes._ensureIndex({ "x": 1 });
  Hexes._ensureIndex({ "y": 1 });
  Hexes._ensureIndex({ "owner": 1 });

  function getRandomColour() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  //................Collection Pubs

  Meteor.publish('hexes', function() {
      return Hexes.find();
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
      return Timer.find();
      // return hexWorld.tick;
  });

  Meteor.publish("market", function () {
      return Market.find();
  });

  //................Methods

  Meteor.methods({
    buyHex : function(hex) {
      var current_user = Meteor.users.findOne({_id: this.userId});
      var hex_tax = current_user.owned.length * 50;
      var has_hexes = hex_tax > 0;
      var selected = Hexes.findOne({_id: hex._id});

      if (hex.owner == null && current_user.wealth >= hex_tax) {
        if (has_hexes && selected.adjacent(this.userId) == false) {
          return 'Hexes must be purchased adjacent to your territory'
        }

        this.unblock();
        var walls = selected.look();
        Meteor._debug('purchasing: ' + hex.x + ', ' + hex.y);

        Hexes.update(
          {_id: hex._id},
          { $set: { owner: this.userId, ownerName: current_user.username, colour: current_user.colour, walls: walls } }
        );

        Meteor._debug('updating walls');
        selected.surrounding().forEach(function(n) {
          n.updateWalls();
        })

        Meteor._debug('updating user');
        Meteor.users.update(
          { _id: Meteor.userId() },
          { $push: { owned: hex._id }, $inc: { wealth: -hex_tax } }
        );
        return 'Purchased ' + hex.x + ', ' + hex.y;
      } else {
        return 'Could not afford hex: ' + hex.x + ', ' + hex.y;
      }
    },
    buyTower : function(hex, struct) {
      if (hex.state.type && hex.state.type != 'tower') {
        return 'Failed to buy tower, hex is ' + hex.state;
      }

      var current_user = Meteor.users.findOne({_id: this.userId});
      var towerCost = function(struct) {
        var cost_map = {
          "wood": { $inc: { wealth: -50, "resources.wood": -100, "resources.glass": -50 } },
          "sandstone": { $inc: { wealth: -50, "resources.brick": -100, "resources.glass": -50 } },
          "stone": { $inc: { wealth: -50, "resources.brick": -100, "resources.glass": -50 } },
          "obsidian": { $inc: { wealth: -50, "resources.brick": -100, "resources.ore": -100, "resources.glass": -50 } }
        }
        return cost_map[struct.material]
      }
      var canAfford = function(struct, hex, current_user) {
        var tower_map = {
          "wood": function() {
            return (current_user.resources.wood >= 100
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          },
          "sandstone": function() {
            return (hex.terrain == "sand"
              && current_user.resources.brick >= 50
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          },
          "stone": function() {
            return (current_user.resources.brick >= 100
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          },
          "obsidian": function() {
            return (current_user.resources.brick >= 100
              && current_user.resources.ore >= 100
              && current_user.resources.glass >= 50
              && current_user.wealth >= 50);
          }
        };
        return tower_map[struct.material]();
      }
      if (hex.owner == current_user._id && hex.state.level < 3 && canAfford(struct, hex, current_user)) {
        console.log(current_user.username + ' is building: ' + struct.type + "-" + struct.material + "-" + struct.variant);
        Hexes.update(
          {_id: hex._id},
          {
            $set: {
              'state.type': 'tower',
              'state.structure.type': [],
              'state.structure.material': [],
              'state.structure.variant': []
            }
          }
        );
        Hexes.update(
          {_id: hex._id},
          {
            $inc: { 'state.level': 1 },
            $set: {
              'state.type': 'tower',
            },
            $push: {
              'state.structure.type': struct.type,
              'state.structure.material': struct.material,
              'state.structure.variant': struct.variant
            }
          }
        );
        Meteor.users.update(
          { _id: Meteor.userId() },
          towerCost(struct)
        );
        return 'Bought ' + struct.material + ' tower on ' + hex.x + ', ' + hex.y;
      } else {
        console.log(current_user.username + ' failed to buy tower ' + struct.type + ' - ' + struct.material);
        return 'Failed to buy ' + struct.material + ' tower on ' + hex.x + ', ' + hex.y;
      }
    },
    buyProduction : function(hex) {
      if (hex.state.type && hex.state.type != 'production') {
        return 'Failed to buy production, hex is ' + hex.state;
      }

      var current_user = Meteor.users.findOne({_id: this.userId});
      var hex_tax = hex.state.level * 50;

      if (hex.owner == current_user._id && hex.state.level < 3 && current_user.wealth >= hex_tax && current_user.resources.wood >= 50) {
        console.log('upgrading: ' + hex.x + ', ' + hex.y)
        Hexes.update(
          {_id: hex._id},
          {
            $inc: {
              'state.level': 1
            },
            $set: {
              'state.type': 'production',
              'state.structure.type': ''
            }
          }
        );
        Meteor.users.update(
          { _id: Meteor.userId() },
          { $inc: { wealth: -hex_tax } }
        );
        return 'Built production on ' + hex.x + ', ' + hex.y;
      } else {
        console.log(current_user.username + ' failed to buy production on ' + hex.x + ', ' + hex.y);
        return 'Failed to buy production on ' + hex.x + ', ' + hex.y;
      }
    },
    buyVillage: function(hex) {
      var current_user = Meteor.users.findOne({_id: this.userId});
      var hex_tax = hex.level * 25;

      if (hex.state && hex.state != 'village') {
        return 'Failed to buy village, hex is ' + hex.state;
      }


    },
    buyResource : function(transaction) {
      var current_user = Meteor.users.findOne({_id: this.userId});
      var market = Market.findOne();

      result = market.buy(transaction.resource, transaction.amount, current_user.wealth);

      var change = {wealth: -result};
      change['resources.' + transaction.resource] = transaction.amount;

      if (result) {
        Meteor.users.update(
          { _id: Meteor.userId() },
          { $inc: change }
        );
        return 'Bought ' + transaction.amount + ' ' + transaction.resource + ' for ' + result + 'w';
      } else {
        return 'Failed to buy ' + transaction.amount + ' ' + transaction.resource;
      }
    },
    sellResource : function(transaction) {
      var current_user = Meteor.users.findOne({_id: this.userId});
      var market = Market.findOne();

      result = market.sell(transaction.resource, transaction.amount, current_user.resources[transaction.resource]);

      var change = {wealth: result};
      change['resources.' + transaction.resource] = -transaction.amount;

      if (result) {
        Meteor.users.update(
          { _id: Meteor.userId() },
          { $inc: change }
        );
        return 'Sold ' + transaction.amount + ' ' + transaction.resource + ' for ' + result + 'w';
      } else {
        return 'Failed to sell ' + transaction.amount + ' ' + transaction.resource;
      }
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
      user.colour = Math.random() * 0xffffff;
      return user;
  });

  Meteor.users.deny({
    update: function() {
      return true;
    }
  });

  //................Wall Formatting

  Hexes.before.update(function (userId, doc, fieldNames, modifier, options) {

  }, {fetchPrevious: true});

  Hexes.after.update(function (userId, doc, fieldNames, modifier, options) {
    if (fieldNames.indexOf('owner') >= 0) {
      hex = Hexes.findOne({_id: doc._id});
      Hexes.update({_id: hex._id}, { $set: {walls: hex.look()} });
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

  var startTime, countAmt, interval;

  function turn() {
    var timer = Timer.findOne()._id;
    Timer.update({_id: timer}, { $inc: { turns: 1 }});
    // hexWorld.turn = Timer.findOne(timer).turns;
    harvest();
    Meteor._debug("Turn " + Timer.findOne(timer).turns);
    if (Timer.findOne(timer).turns >= 500) {
      console.log('Game Over!');
      Meteor.clearInterval(turnInterval);
      gameOver();
    }
  }

  function now() {
    return (new Date()).getTime() + 2;
  }

  function harvest() {
    claimed = Hexes.find({ owner: { $type: 2 } });
    claimed.forEach(function(hex) {
      var inc = hex.getIncrement();
      var res = {}
      res['resources.' + hex.resource] = inc;

      Meteor.users.update({_id: hex.owner._id}, { $inc: res });
    });
  }

  //................Game Over

  function gameOver() {
    World.update({live: true}, {$set: {live: false}}, {multi: true});
    newGame();
  }

});