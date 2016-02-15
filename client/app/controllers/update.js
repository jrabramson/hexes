update = function() {
	game.world.bringToTop(ui);

	if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
		game.show_resource_tooltips();
	} else {
		game.hide_resource_tooltips();
	}

	if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W))
	{
	    game.world.pivot.y -= 10;
	}
	else if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S))
	{
	    game.world.pivot.y += 10;
	}

	if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A))
	{
	    game.world.pivot.x -= 10;
	}
	else if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D))
	{
	    game.world.pivot.x += 10;
	}


	if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
	    worldScale += 0.05;
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.E)) {
	    worldScale -= 0.05;
	}

	worldScale = Phaser.Math.clamp(worldScale, 0.5, 1.5);
  game.world.scale.set(worldScale);
}