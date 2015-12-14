buildButton = function(name, text, func, args, x, y) {
	x = x || -999;
	y = y || -999;
	buttons[name] = game.add.button(x, y, 'hexsheet', func, this, null, null, 'buttonpressed', 'button'); 
	for (var arg in args) { 
		buttons[name][arg] = args[arg]
	} 
	ui.add(buttons[name]);
	buttons[name].anchor.setTo(0, 0);

	buttons[name].text = game.add.text(90, 25, text, {
        font: "14px Arial",
        fill: "black"
    });
	buttons[name].text.anchor.setTo(0.5, 0.5);
	buttons[name].addChild(buttons[name].text);
	buttons[name].events.onInputDown.add((function(button) { button.y = button.y + 5 }), this);
	buttons[name].events.onInputUp.add((function(button) { button.y = button.y - 5 }), this);
}

getbuttons = function(buttonArray, hex) {
	buttonArray.forEach(function(b, i) {
		buttons[b].x = hex.baseX - 20;
		buttons[b].y = hex.baseY + 75 + (50 * i);
	});
}