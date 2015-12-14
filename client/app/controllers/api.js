updateHex = function(updated_id) {
	old = world.children.filter(function(hex) {
		return hex._id == updated_id
	});
	hexData = Hexes.findOne({_id: updated_id});
	old[0].owner = hexData.owner
	old[0].ownerName = hexData.ownerName
	old[0].structure = hexData.structure
	var decorations = decorate(old[0]);
	decorations.forEach(function(decoration) {
		old[0].addChild(decoration);
	});
	hexSelect(world.focusedHex);
	tooltip(old[0]);
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