
hexHover = function(hex) { 
	world.hovered = hex;
	if (!world.focusedHex || world.focusedHex == hex) {
		tooltip(hex);
		hover = game.add.tween(hex);
		hover.to({y: hex.baseY - 15}, 100, Phaser.Easing.Linear.None);
		hover.start();
	}
}
hexOut = function(hex) { 
	if (world.focusedHex != hex) {
		tooltip(false);
		hover.stop();
		hoverBack = game.add.tween(hex);
		hoverBack.to({y: hex.baseY}, 200, Phaser.Easing.Linear.None);
		hoverBack.start();
	}
}
hexSelect = function(hex) {
	clearSelected();
	if (world.focusedHex) {
		hoverBack = game.add.tween(world.focusedHex);
		hoverBack.to({y: world.focusedHex.baseY}, 200, Phaser.Easing.Linear.None);
		hoverBack.start();
		if (world.focusedHex == hex) {
			world.focusedHex = undefined;
			clearSelected();
			tooltip(false);
			return;
		}
	}
	if (!Meteor.user()) {
		return;
	}
	if (hex) {
		world.focusedHex = hex;
		if (hex.owner) {
			if (hex.owner == Meteor.user()._id) {
				if (hex.structure.level < 3) {
					getbuttons(['buildStructure11', 'buildStructure12', 'buildStructure13', 'buildStructure14'], hex)
				}
			}
		} else {
			getbuttons(['buy'], hex);
		}
	}
}
clearSelected = function() {
	for (button in buttons) {
		buttons[button].x = -9999;
	}
}	