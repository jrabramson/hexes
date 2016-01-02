Hex = function(hex, i) {
	var hexagonX = hex.x * hexRectangleWidth + ((Math.floor(i/100) % 2) * hexRadius);
	var hexagonY = hex.y * (sideLength + hexHeight);
	var hexagon = world.create(hexagonX,hexagonY,'spritesheet',hex.terrain);
	
	hexagon._id = hex._id;
	hexagon.owner = hex.owner;
	hexagon.ownerName = hex.ownerName;
	hexagon.terrain = hex.terrain;
	hexagon.level = hex.level;
	hexagon.baseY = hexagonY;
	hexagon.baseX = hexagonX;
	hexagon.structure = hex.structure;
	hexagon.production = hex.production;
	hexagon.walls = hex.walls;
	hexagon.colour = hex.colour;
	hexagon.autoCull = true;
	hexagon.inputEnabled = true;
	hexagon.events.onInputDown.add(hexSelect, this);
	hexagon.events.onInputOver.add(hexHover, this);

	hexagon.hoverBack = function() {
		game.add.tween(this)
			.to({y: this.baseY}, 200, Phaser.Easing.Linear.None)
			.start();
	}

	hexagon.hover = function() {
		hover = game.add.tween(this)
			.to({y: this.baseY - 15}, 100, Phaser.Easing.Linear.None)
			.start();
	}

	decorate(hexagon);
}