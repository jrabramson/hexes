create = function() {
	game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
	game.world.setBounds(-100, -100, 7000, 6000);
	game.camera.setPosition(3000, 3000);
	// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	// game.scale.pageAlignHorizontally = true;
	// game.scale.pageAlignVertically = true;
	// game.scale.setScreenSize(true);
	
	world = game.add.group();
	world.z = 0;

	hexes = Hexes.find({}, {sort: {order: 0}}).fetch();
	
	hexes.forEach(function(hex, i) {
		var hexagonX = hex.x * hexRectangleWidth + ((Math.floor(i/100) % 2) * hexRadius);
		var hexagonY = hex.y * (sideLength + hexHeight) + (Math.random() * 6);
		var hexagon = world.create(hexagonX,hexagonY,'hexsheet',hex.terrain);
		hexagon.owner = hex.owner;
		hexagon.ownerName = hex.ownerName;
		hexagon.terrain = hex.terrain;
		hexagon.level = hex.level;
		hexagon.baseY = hexagonY;
		hexagon.baseX = hexagonX;
		hexagon.structure = hex.structure;
		var decorations = decorate(hexagon);
		decorations.forEach(function(decoration) {
			hexagon.addChild(decoration);
		});
		hexagon._id = hex._id;
		hexagon.autoCull = true;
		hexagon.inputEnabled = true;
		hexagon.events.onInputDown.add(hexSelect, this);
		hexagon.events.onInputOver.add(hexHover, this);
		hexagon.events.onInputOut.add(hexOut, this);
	});

	world.hovered = world.children[5000];

	buildTooltip();

	cursors = game.input.keyboard.createCursorKeys();
	game.input.mouse.mouseWheelCallback = mouseWheel;

	game.time.advancedTiming = true;

	// wasd = {
 //        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
 //        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
 //        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
 //        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
 //    };
}