Hex = function(hex, i) {
	var hexagonAngle = 0.523598776;
	var sideLength = 37.5;
	var hexHeight = Math.sin(hexagonAngle) * sideLength;
	var hexRadius = Math.cos(hexagonAngle) * sideLength;
	var hexRectangleHeight = sideLength + 2 * hexHeight;
	var hexRectangleWidth = 2 * hexRadius;

	var hexagonX = hex.x * hexRectangleWidth + ((Math.floor(i/32) % 2) * hexRadius);
	var hexagonY = hex.y * (sideLength + hexHeight);
	var hexagon = world.create(hexagonX, hexagonY, 'hexsheet', hex.spriteName());
	var sliced_hash = hex.slice(
		'_id',
		'variant',
		'owner',
		'ownerName',
		'terrain',
		'resource',
		'state',
		'structure',
		'production',
		'walls',
		'colour',
		'adjacent',
		'getIncrement'
	);

	_.extend(hexagon, sliced_hash);
	hexagon.baseY = hexagonY;
	hexagon.baseX = hexagonX;
	hexagon.systemY = hex.y;
	hexagon.systemX = hex.x;
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
			.to({y: this.y - 15}, 100, Phaser.Easing.Linear.None)
			.start();
	}

	decorate(hexagon);
}