decorate = function(hex) {
	hex.children.forEach(function(deco) {
		deco.destroy();
	});
	if (hex.structure.level > 0) {
		var buildings = [];
		for (var i=0;i<hex.structure.level;i++) {
			var step = buildDecoration(
				'level'+Math.min(2,i+1)+'-'+hex.structure.material[i]+'-'+hex.structure.variant[i], 
				1, 1, 0, 1, (25 * i), false
			);
			buildings = buildings.concat(step);
		}
		if (hex.structure.roof) {
			buildings = buildings.concat(buildDecoration('roof', 1, 1, 4, 1, (25*(hex.structure.level-1)) + 20, false));
		} else {
			buildings = buildings.concat(buildDecoration('ring', 1, 1, 4, 1, (25*(hex.structure.level-1)) + 10, false));
		}
		return buildings;
	}
	switch (hex.terrain) {
		case 'forest':
			return buildDecoration('tree', 1, 1, 3, 0.3, 0, true);
		case 'sand':
			return buildDecoration('cactus', 0, 1, 2, 0.2, 0, true);
		case 'stone':
			return buildDecoration('icon_stone', 0, 1, 1, 0.2, 0, true);
		default:
			return [];
	}
}