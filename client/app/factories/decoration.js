buildDecoration = function(sprite, min, max, variants, scale, elev, moves) {
	var decorations = [];
	for (var j=0;j<game.rnd.integerInRange(min,max);j++) {
		var x = moves ? (20 + game.rnd.realInRange(-15, 15)) : 0;
		var y = (moves ? (hexHeight / 2) + (game.rnd.realInRange(0, 15)) : -23) - elev;
		var deco = game.add.sprite(
				x, 
				y, 
				'hexsheet',
				sprite + (variants > 1 ? game.rnd.integerInRange(1, variants) : '')
			);
		// deco.autoCull = true;
		// deco.anchor.setTo(0,0);
		deco.scale.setTo(scale);
		decorations.push(deco);
	}
	return decorations;
}