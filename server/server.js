Meteor.startup(function () {

    if (Worlds.find().count() === 0) {
      newWorld = Worlds.insert({
      	name: "The World"
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
	      	      	world: Worlds.findOne()._id,
	      	      	x: i,
	      	      	y: j,
	      	      	offset: row,
	      	      	terrain: terrainTypes[rand],
                  owner: null
	      	      });
      	}
      }

  	}
});

Meteor.publish('hexes', function() {
  return Hexes.find();
});

Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {fields: {'username': 1, 'owned': 1, 'colour': 1}});
});

Meteor.publish("credit", function () {
    return Meteor.users.find(Meteor.userId, {fields: {'credit': 1}});
});

Meteor.methods({
  buyHex : function(hex){
    current_user = Meteor.users.find({_id: this.userId}).fetch();
    if (!current_user.hexes) {
      Hexes.update(hex._id, {$set: {owner: this.userId}});
      u = Meteor.users.update( { _id: Meteor.userId() }, { $push: {owned: hex._id} });
    }  
  }
});

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

Accounts.onCreateUser( function (options, user) {
    user.credit = 100;
    user.colour = getRandomColor();
    return user;
});

Meteor.users.deny({  
  update: function() {
    return true;
  }
});