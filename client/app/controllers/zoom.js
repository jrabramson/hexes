mouseWheel = function(event) {
	if (tweening) {
		return;
	}
	console.log(event.wheelDelta)
	if (event.wheelDelta < 0 && worldScale > 0.3) {
		worldScale = 0.3;
		tweening = true;
	}
	else if (event.wheelDelta > 0 && worldScale < 1) {
		worldScale = 1;
		tweening = true;
	}
	
	var centerHex = world.hovered;
	// world.children.forEach(function(hex) {
	// 	if ((hex.getBounds().x > (game.camera.width / 2) - 30) && (hex.getBounds().x < (game.camera.width / 2) + 30)) {
	// 		if ((hex.getBounds().y > (game.camera.height / 2) - 30) && (hex.getBounds().y < (game.camera.height / 2) + 30)) {
	// 			centerHex = hex;
	// 		}
	// 	}
	// });
	
	world.pivot.x = Math.round(centerHex.x);
	world.pivot.y = Math.round(centerHex.y);
	world.x = Math.round(centerHex.x);
	world.y = Math.round(centerHex.y);

	world.scale.setTo(worldScale);
	
	if (tweening) {
		// var camTween = game.add.tween(world.scale).to({x: worldScale, y: worldScale}, 1, Phaser.Easing.Linear.None, true, 0, 0, false);
		// camTween.onComplete.add(function() { tweening = false });
		// camTween.loop = false;
		tweening = false;
	}
}