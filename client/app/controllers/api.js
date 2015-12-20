updateHex = function(updated_id) {
	var hex = world.children.filter(function(hex) {
		return hex._id == updated_id
	})[0];
	hexData = Hexes.findOne({_id: updated_id});
	
	hex.owner = hexData.owner;
	hex.ownerName = hexData.ownerName;
	hex.structure = hexData.structure;
	hex.walls = hexData.walls;
	hex.colour = hexData.colour;
	decorate(hex);

	hexSelect(world.focusedHex);
}

buyHex = function() {
    Meteor.call('buyHex', Hexes.findOne({_id: world.focusedHex._id})); 
}

upgradeHex = function() {
    Meteor.call('upgradeHex', Hexes.findOne({_id: world.focusedHex._id})); 
}

buyTower = function(tower) {
	var struct = {
		type: tower.type, 
		material: tower.material, 
		variant: game.rnd.integerInRange(1,2)};
    Meteor.apply('buyTower', [Hexes.findOne({_id: world.focusedHex._id}), struct]); 
}