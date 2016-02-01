update = function() {
	game.world.bringToTop(ui);

	if (cursors.up.isDown) // || wasd.up.isDown
	{
	    game.camera.y -= 10;
	}
	else if (cursors.down.isDown) // || wasd.down.isDown
	{
	    game.camera.y += 10;
	}

	if (cursors.left.isDown) // || wasd.left.isDown
	{
	    game.camera.x -= 10;
	}
	else if (cursors.right.isDown) // || wasd.right.isDown
	{
	    game.camera.x += 10;
	}
}