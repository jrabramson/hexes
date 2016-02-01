
realEstateWorker = function(hex, user) {
  var current_user = Meteor.users.findOne({_id: user.userId});
  var hex_tax = current_user.owned.length * 50;

  if (hex.owner == null && current_user.wealth >= hex_tax) {
    var selected = Hexes.findOne({_id: hex._id});
    var walls = selected.look();
    Meteor._debug('purchasing: ' + hex.x + ', ' + hex.y);
    
    Hexes.update(
      {_id: hex._id}, 
      { $set: { owner: user.userId, ownerName: current_user.username, colour: current_user.colour, walls: walls } }
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
    return 'Error when purchasing ' + hex.x + ', ' + hex.y;
  }
}
