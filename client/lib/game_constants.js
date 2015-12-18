userDeps = new Deps.Dependency;

hexagonAngle = 0.523598776;
sideLength = 37;
hexHeight = Math.sin(hexagonAngle) * sideLength;
hexRadius = Math.cos(hexagonAngle) * sideLength;
hexRectangleHeight = sideLength + 2 * hexHeight;
hexRectangleWidth = 2 * hexRadius;

game = {};
collection = [];
cursors = null;
world = null;
hover = null;
hexes = null;
menu = null;
buttons = null;
worldScale = 1;
ui = null;
wasd = null;
tweening = false;

newMenu = {};