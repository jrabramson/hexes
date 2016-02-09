hexHover = function(hex) {
  Session.set('option', {});
	world.hovered = hex;
	if (!world.focusedHex || world.focusedHex == hex) {
		Session.set('hovered', {
			terrain: hex.terrain,
			resource: hex.resource,
			owner: hex.ownerName,
			state: hex.state
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