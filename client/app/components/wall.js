buildWalls = function(hex) {
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
}