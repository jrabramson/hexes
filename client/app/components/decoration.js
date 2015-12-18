buildDecoration = function(sprite, min, max, variants, scale, elev, moves) {
	var decorations = [];
	for (var j=0;j<game.rnd.integerInRange(min,max);j++) {
		var x = moves ? (20 + game.rnd.realInRange(-15, 15)) : 6;
		var y = (moves ? (hexHeight / 2) + (game.rnd.realInRange(0, 15)) : -12) - elev;
		var deco = game.add.image(
				x, y, 'spritesheet',
				sprite + (variants > 1 ? game.rnd.integerInRange(1, variants) : '')
			);
		// deco.autoCull = true;
		// deco.anchor.setTo(0,0);
		deco.scale.setTo(scale);
		decorations.push(deco);
	}
	return decorations;
}

decorate = function(hex) {
	hex.children.forEach(function(deco) {
		console.log(deco);
		deco.destroy();
	});

	// if (hex.structure.level > 0) {
	// 	var buildings = [];
	// 	for (var i=0;i<hex.structure.level;i++) {
	// 		var step = buildDecoration(
	// 			'level'+Math.min(2,i+1)+'-'+hex.structure.material[i]+'-'+hex.structure.variant[i], 
	// 			1, 1, 0, 0.8, (18 * i), false
	// 		);
	// 		buildings = buildings.concat(step);
	// 	}
	// 	if (hex.structure.roof) {
	// 		buildings = buildings.concat(buildDecoration('roof', 1, 1, 4, 0.8, (16*(hex.structure.level-1)) + 20, false));
	// 	} else {
	// 		buildings = buildings.concat(buildDecoration('ring', 1, 1, 4, 0.8, (16*(hex.structure.level-1)) + 10, false));
	// 	}
	// 	return buildings;
	// }

	// buildings.forEach(function(decoration) {
	// 	hex.addChild(decoration);
	// });

	var wallCount = 0
	var wallMap = ['e', 'se', 'sw', 'w', 'nw', 'ne'];
	for (var wall in hex.walls) {
		if (hex.walls[wall] === 1) {
			var wall = game.add.image(33, 45, 'spritesheet', 'wall-' + wallMap[wallCount]);
			wall.anchor.setTo(0.5);
			wall.tint = hex.colour;
			hex.addChild(wall);
		}
		wallCount++;
	}


	// switch (hex.terrain) {
	// 	case 'forest':
	// 		return buildDecoration('tree', 1, 1, 3, 0.3, 0, true);
	// 	case 'sand':
	// 		return buildDecoration('cactus', 0, 1, 2, 0.2, 0, true);
	// 	case 'stone':
	// 		return buildDecoration('icon_stone', 0, 1, 1, 0.2, 0, true);
	// 	default:
	// 		return [];
	// }
}