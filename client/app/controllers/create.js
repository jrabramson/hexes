create = function() {
	game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
	game.world.setBounds(-100, -100, 7000, 6000);
	game.camera.setPosition(3000, 3000);

	world = game.add.group();
	world.z = 0;

	hexes = Hexes.find({}, {sort: {order: 0}}).fetch();

	hexes.forEach(function(hex, i) {
		new Hex(hex, i);
	});

	world.hovered = world.children[5000];
	world.focusedHex = world.children[5000];

	buildOptions();

	cursors = game.input.keyboard.createCursorKeys();
	game.input.mouse.mouseWheelCallback = mouseWheel;

	game.time.advancedTiming = true;

	// wasd = {
	//    up: game.input.keyboard.addKey(Phaser.Keyboard.W),
	//    down: game.input.keyboard.addKey(Phaser.Keyboard.S),
	//    left: game.input.keyboard.addKey(Phaser.Keyboard.A),
	//    right: game.input.keyboard.addKey(Phaser.Keyboard.D),
	//  };
	}