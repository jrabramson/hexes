optionsFor = function(hex, reset) {
	reset = reset || false;
	if (world.focusedHex && !reset) {
		world.focusedHex.hoverBack();
		if (world.focusedHex == hex) {
			world.focusedHex = undefined;
			return;
		}
	}
	clearOptions();
	world.focusedHex = hex;
	world.focusedHex.hover();
	if (!Meteor.user() || !hex) {
		return;
	}
	if (hex.owner) {
		if (hex.owner == Meteor.user()._id) {
			var type = hex.structure.level > 0 ? 'tower' : hex.production.level > 0 ? 'production' : 'empty';
			switch (type) {
				case 'empty':
					getOptions(['choiceTower', 'choiceProduction'], hex);
					break;
				case 'tower':
					getOptions(['woodTower', 'sandTower', 'stoneTower', 'obsidianTower', 'demolish'], hex);
					break;
				case 'production':
					getOptions(['upgrade'], hex);
					break;
				default:
					break;
			}
		}
	} else {
		getOptions(['buy'], hex);
	}
}


buildOptions = function() {
	ui = game.add.group();
	ui.z = 1;

	options = {};
	userDeps.depend();
	
	addOption('buy', 'flag', Actions.buyHex, {
		tooltip: {
			title: 'Buy Hex',
			cost: {
				wealth: 50 * (Meteor.user() ? Meteor.user().owned.length : 0)
			},
			body: 'Purchase this hex, adding it to your territory and allowing you to build structures on it.',
		}
	});
	addOption('upgrade', 'flag', Actions.buyProduction, {
		tooltip: {
			title: 'Upgrade Production',
			cost: {
				wealth: 100, 
				wood: 50 * world.focusedHex.production.level, 
				brick: 50 * world.focusedHex.production.level
			},
			body: 'Upgrage the quality of production for this hex, increasing the amount of resources it produces every turn.'
		}
	});

	addOption('choiceTower', tower('wood'), optionCategory, {
		type: 'tower',
		tooltip: {
			title: 'Towers',
			cost: {},
			body: 'Building towers stops a hex from produc'
		}
	});
	addOption('choiceProduction', 'grass', optionCategory, {
		type: 'production',
		tooltip: {
			title: 'Towers',
			cost: {},
			body: 'Building towers stops a hex from produc'
		}
	});

	addOption('woodTower', tower('wood'), Actions.buyTower, {
		type: 1, 
		material: 'wood',
		tooltip: {
			title: 'Towers',
			cost: {},
			body: 'Building towers stops a hex from produc'
		}
	});
	addOption('sandTower', tower('sandstone'), Actions.buyTower, {
		type: 1, 
		material: 'sandstone',
		tooltip: {
			title: 'Towers',
			cost: {},
			body: 'Building towers stops a hex from produc'
		}
	});
	addOption('stoneTower', tower('stone'), Actions.buyTower, {
		type: 1, 
		material: 'stone',
		tooltip: {
			title: 'Towers',
			cost: {},
			body: 'Building towers stops a hex from produc'
		}
	});
	addOption('obsidianTower', tower('obsidian'), Actions.buyTower, {
		type: 1, 
		material: 'obsidian',
		tooltip: {
			title: 'Towers',
			cost: {},
			body: 'Building towers stops a hex from produc'
		}
	});

	addOption('demolish', 'flag', Actions.demolish, {});

	addOption('back', 'flag', Actions.back, {});
}

optionCategory = function(params) {
	var category = {
		tower: ['woodTower', 'sandTower', 'stoneTower', 'obsidianTower', 'back'],
		production: ['upgrade', 'back']
	}

	clearOptions();
	getOptions(category[params.type], params.hex);
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
		Session.set('option', {tooltip: option.tooltip});
	}), this);

	options[name].expose = function(hex, n) {
		this.x = hex.baseX;
		this.y = hex.baseY;

		var bottomRow = n < 5 ? true : false;
		var rightLeft = n <= (bottomRow ? 2 : 6) ? 1 : 2.5;
		var destination = {
			y: (
				n > (bottomRow ? 2 : 6) ? 
					  (bottomRow ? hex.baseY + 20 : hex.baseY - 70) 
					: (bottomRow ? hex.baseY + 70 : hex.baseY - 120)
				),
			x: (
				n % 2 == 1 ? 
						hex.baseX - (30 * rightLeft) 
					: hex.baseX + (30 * rightLeft)
				)
		}

		game.add.tween(this)
			.to(destination ,100, Phaser.Easing.Linear.None)
			.start();
	}
}

getOptions = function(requested, hex) {
	requested.forEach(function(option, i) {
		options[option].hex = hex
		options[option].expose(hex, i + 1);
	});
}

clearOptions = function() {
	Session.set('option', {});
	for (option in options) {
		options[option].x = -9999;
	}
}