hexHover = function(hex) { 
	world.hovered = hex;
	if (!world.focusedHex || world.focusedHex == hex) {
		Session.set('hovered', {terrain: hex.terrain, owner: hex.ownerName, level: hex.level});
	}
}

hexSelect = function(hex) {
	if (!hex) {
		return;
	}

	hex.hover();
	clearSelected();
	optionsFor(hex);
}

clearSelected = function() {
	Session.set('option', {});
	for (option in options) {
		options[option].x = -9999;
	}
}