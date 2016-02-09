buildDecoration = function(sprite, min, max, variants, scale, elev, moves) {
	var decorations = [];
	for (var j=0;j<game.rnd.integerInRange(min,max);j++) {
		var x = moves ? (20 + game.rnd.realInRange(-15, 15)) : 6;
		var y = (moves ? (hexHeight / 2) + (game.rnd.realInRange(0, 15)) : -12) - elev;
		var deco = game.add.image(
				x, y, 'hexsheet',
				sprite + (variants > 1 ? game.rnd.integerInRange(1, variants) : '')
			);
		deco.scale.setTo(scale);
		decorations.push(deco);
	}
	return decorations;
}

decorate = function(hex) {
	hex.children.forEach(function(deco) {
		deco.kill();
	});

	var wallCount = 5;
	var wallMap = ['e', 'se', 'sw', 'w', 'nw', 'ne'];
	for (var wall in hex.walls) {
		if (hex.walls[wallCount] === 1) {
			var wall = game.add.image(33, 45, 'hexsheet', 'wall-' + wallMap[wallCount]);
			wall.anchor.setTo(0.5);
			wall.tint = hex.colour;
			hex.addChild(wall);
		}
		wallCount--;

		if (wallCount == 3) {
			construct(hex);
		}
	}
}

construct = function(hex) {
	var buildings = [];

	if (hex.state.level > 0) {
		switch (hex.state.type) {
			case 'tower':
				for (var i=0;i<hex.state.level;i++) {
					var step = buildDecoration(
						'level'+Math.min(2,i+1)+'-'+hex.state.structure.material[i]+'-'+hex.state.structure.variant[i],
						1, 1, 0, 0.8, (18 * i), false
					);
					buildings = buildings.concat(step);
				}
				if (hex.structure.roof) {
					buildings = buildings.concat(buildDecoration('roof', 1, 1, 4, 0.8, (16*(hex.state.structure.level-1)) + 20, false));
				} else {
					buildings = buildings.concat(buildDecoration('ring', 1, 1, 4, 0.8, (16*(hex.state.structure.level-1)) + 10, false));
				}
				break;
			case 'production':
				break;
			case 'village':
				break;
			default:
				break;
		}
	}

	buildings.forEach(function(decoration) {
		hex.addChild(decoration);
	});
}