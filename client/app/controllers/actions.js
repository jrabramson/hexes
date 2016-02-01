Actions = {
	updateHex: function(updated_id) {
		var hex = world.children.filter(function(hex) {
			return hex._id == updated_id
		})[0];
		hexData = Hexes.findOne({_id: updated_id});
		options['buy']['tooltip']['cost']['wealth'] = (50 * (Meteor.user() ? Meteor.user().owned.length : 1)) + 50;

		hex.owner = hexData.owner;
		hex.ownerName = hexData.ownerName;
		hex.structure = hexData.structure;
		hex.walls = hexData.walls;
		hex.state = hexData.state;
		hex.colour = hexData.colour;
		decorate(hex);

		clearOptions();
		hex.hoverBack();

	},
	buyHex: function() {
    Meteor.call('buyHex', Hexes.findOne({_id: world.focusedHex._id}), (err, res) => {
				alertify.message(res);
		});
		clearOptions(world.focusedHex);
	},
	buyProduction: function() {
    Meteor.call('buyProduction', Hexes.findOne({_id: world.focusedHex._id}), (err, res) => {
			alertify.message(res);
		});
		clearOptions(world.focusedHex);
	},
	buyTower: function(tower) {
		var struct = {
			type: tower.type,
			material: tower.material,
			variant: game.rnd.integerInRange(1,2)
		};
    Meteor.apply('buyTower', [Hexes.findOne({_id: world.focusedHex._id}), struct], (err, res) => {
			alertify.message(res);
		});
		clearOptions(world.focusedHex);
	},
	buyResource: function(res, amount) {
		Meteor.call('buyResource', {resource: res, amount: 10}, (err, res) => {
			alertify.message(res);
		});
	},
	sellResource: function(res, amount) {
		Meteor.call('sellResource', {resource: res, amount: 10}, (err, res) => {
			alertify.message(res);
		});
	},
	demolish: function() {
		debugger;
	},
	back: function() {
		optionsFor(world.focusedHex, true)
	}
}