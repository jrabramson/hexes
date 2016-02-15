mouseWheel = function(event) {
	if (tweening) {
		return;
	}
	if (event.wheelDelta < 0 && worldScale > 0.3) {
		worldScale = 0.3;
	}
	else if (event.wheelDelta > 0 && worldScale < 1) {
		worldScale = 0.8;
	}

	var centerHex = world.hovered;

	world.pivot.x = Math.round(centerHex.x);
	world.pivot.y = Math.round(centerHex.y);
	world.x = Math.round(centerHex.x);
	world.y = Math.round(centerHex.y);

	world.scale.setTo(worldScale);
}