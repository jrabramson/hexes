create = function() {
	game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

	game.tooltips_enabled = false;
	game.show_resource_tooltips = function() {
		if (game.tooltips_enabled) {
			return;
		}
		var territory = world.filter((hex) => { return hex.ownerName }).list;
		territory.forEach(function(hex) {
			var tooltip = game.add.text(13, 16, "+" + hex.getIncrement());
			// tooltip.anchor.set(0.5);
	    tooltip.align = 'center';

	    tooltip.font = 'Arial Black';
	    tooltip.fontSize = 30;
	    tooltip.fontWeight = 'bold';

	    var fill = "#" + Meteor.users.findOne({ username: hex.ownerName }).colour.toString(16).toUpperCase().split('.')[0];
	    tooltip.fill = fill;

	    tooltip.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 0);
	    hex.addChild(tooltip);
	    tooltips.push(tooltip);
		});
		game.tooltips_enabled = true;
	}

	game.hide_resource_tooltips = function() {
		if (game.tooltips_enabled) {
			tooltips.forEach(function(t) {
				t.destroy();
			});
			tooltips = [];
			game.tooltips_enabled = false;
		}
	}

	$('#camera canvas').on('blur', function(e) {
		game.input.enabled = false;
	}).on('focus', function(e) {
		game.input.enabled = true;
	});

	$('#camera canvas').on('mouseout', function(e) {
		Session.set('hovered', {});
		Session.set('option', {});
	});

	game.world.setBounds(-1000, -1000, 2000, 2000);
	game.camera.x = (game.width * -0.5);
	game.camera.y = (game.height * -0.5);
	game.world.pivot.x = 950;
	game.world.pivot.y = 950;

	world = game.add.group();
	world.z = 0;

	hexes = Hexes.find({}, {sort: {order: 0}}).fetch();

	hexes.forEach(function(hex, i) {
		new Hex(hex, i);
	});

	world.hovered = world.children[512];
	world.focusedHex = world.children[512];

	buildOptions();

	cursors = game.input.keyboard.createCursorKeys();

	game.time.advancedTiming = true;
}