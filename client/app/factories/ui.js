buildTooltip = function() {
	ui = game.add.group();
	ui.z = 1;
	menu = ui.create(-999, -999, null); 
	menu.anchor.setTo(0, 0);
	
	menu.gui = ui.create(0, 0, 'hexsheet', 'menu');
	menu.gui.anchor.setTo(0, 0);
	menu.addChild(menu.gui);

	menu.terrainIcon = ui.create(15, 15, 'hexsheet', 'icon_grass');
	menu.terrainIcon.anchor.setTo(0, 0);
	menu.addChild(menu.terrainIcon);

	menu.terrain = game.add.text(35, 15, '', {
        font: "14px Arial",
        fill: "black"
    });
	menu.terrain.anchor.setTo(0, 0);
	menu.addChild(menu.terrain);

	menu.content = game.add.text(15, 37, '', {
        font: "14px Arial",
        fill: "black"
    });
	menu.content.anchor.setTo(0, 0);
	menu.addChild(menu.content);

	buttons = {};
	buildButton('buy', 'Buy Hex', buyHex, {});
	buildButton('upgradeHex', 'Upgrade Hex', upgradeHex, {});

	buildButton('buildStructure11', 'Wooden Tower', buyTower, {type: 1, material: 'wood'});
	buildButton('buildStructure12', 'SandStone Tower', buyTower, {type: 1, material: 'sandstone'});
	buildButton('buildStructure13', 'Stone Tower', buyTower, {type: 1, material: 'stone'});
	buildButton('buildStructure14', 'Obsidian Tower', buyTower, {type: 1, material: 'obsidian'});
}

tooltip = function(hex) {
	if (world.focusedHex && world.focusedHex != hex) {
		return;
	} else if (hex == false) {
		return menu.x = -9999;
	}
	menu.x = hex.x + 70;
	menu.y = hex.y - 30;
	menu.terrainIcon.scale.setTo(iconScale(hex.terrain));
	menu.terrainIcon.frameName = 'icon_' + hex.terrain;
	var capitalized = hex.terrain.substring(0, 1).toUpperCase() + hex.terrain.substring(1);
	menu.terrain.setText(capitalized);
	var content = [
		(hex.ownerName ? hex.ownerName : 'Unclaimed')
		+ '\n'
		+ 'Level: ' + hex.level
	]
	menu.content.setText(content);
}

iconScale = function(terrain) {
	switch (terrain) {
		case 'forest':
		case 'sand':
			return 0.25;
		case 'grass':
			return 0.7;
		case 'ground':
			return 0.4;
		case 'stone':
		case 'water':
			return 0.2;
		default:
			return 0;
	}
}
