hexHover = function(hex) { 
  Session.set('option', {});
	world.hovered = hex;
	if (!world.focusedHex || world.focusedHex == hex) {
		Session.set('hovered', {
			terrain: hex.terrain, 
			owner: hex.ownerName, 
			structure: hex.structure,
			production: hex.production
		});
	}
}

hexSelect = function(hex) {
	if (!hex) {
		return;
	}

	clearOptions();
	optionsFor(hex);
}