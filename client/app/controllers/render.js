render = function() {
	game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
    game.debug.text(Phaser.VERSION, game.world.width - 55, 14, "#ffff00");
}