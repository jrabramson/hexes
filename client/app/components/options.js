optionsFor = function(hex) {
	if (world.focusedHex) {
		world.focusedHex.hoverBack();
		if (world.focusedHex == hex) {
			world.focusedHex = undefined;
			clearSelected();
			return;
		}
	}
	if (!Meteor.user() || !hex) {
		return;
	}
	world.focusedHex = hex;
	if (hex.owner) {
		if (hex.owner == Meteor.user()._id && hex.structure.level < 3) {
			getOptions(['woodTower', 'sandTower', 'stoneTower', 'obsidianTower'], hex)
		}
	} else {
		getOptions(['buy'], hex);
	}
}

buildOptions = function() {
	ui = game.add.group();
	ui.z = 1;

	options = {};
	addOption('buy', 'flag', buyHex, {});
	addOption('upgrade', 'flag', upgradeHex, {});

	addOption('woodTower', tower('wood'), buyTower, {type: 1, material: 'wood'});
	addOption('sandTower', tower('sandstone'), buyTower, {type: 1, material: 'sandstone'});
	addOption('stoneTower', tower('stone'), buyTower, {type: 1, material: 'stone'});
	addOption('obsidianTower', tower('obsidian'), buyTower, {type: 1, material: 'obsidian'});
}

tower = function(type) {
	return 'level'+ 2 + '-' + type + '-' + 1
}

addOption = function(name, icon, func, args, x, y) {
	x = x || -9999;
	y = y || -9999;
	options[name] = game.add.button(x, y, 'spritesheet', func, this, 'ui-circle'); 
	for (var arg in args) { 
		options[name][arg] = args[arg]
	} 
	ui.add(options[name]);
	options[name].anchor.setTo(0, 0);

	options[name].icon = game.add.image(0, 0, 'spritesheet', icon);
	options[name].icon.anchor.setTo(0, 0);
	options[name].icon.scale.setTo(0.3);
	options[name].icon.x = 23;
	options[name].icon.y = 21;
	options[name].addChild(options[name].icon);

	options[name].events.onInputDown.add((function(option) { option.y = option.y + 5 }), this);
	options[name].events.onInputUp.add((function(option) { option.y = option.y - 5 }), this);
	options[name].events.onInputOver.add((function(option) { 
		Session.set('option', {material: option.material, type: option.type});
	}), this);

	options[name].expose = function(hex, n) {
		this.x = hex.baseX;
		this.y = hex.baseY;

		var topBottom = n <= 2 ? 1 : 2.5;
		var destination = {
			y: (n <= 2 == 0 ? hex.baseY + 10 : hex.baseY + 60),
			x: (n % 2 == 1 ? hex.baseX - (30 * topBottom) : hex.baseX + (30 * topBottom))
		}

		game.add.tween(this)
			.to(destination ,100, Phaser.Easing.Linear.None)
			.start();
	}
}

getOptions = function(requested, hex) {
	requested.forEach(function(option, i) {
		options[option].expose(hex, i + 1);
	});
}