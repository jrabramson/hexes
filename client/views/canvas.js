Template.canvas.rendered = function () {


  var width  = window.innerWidth;
  var height = window.innerHeight;

  canvas = d3.select("body")
    .append("canvas")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoomed));
  var ctx = canvas.node().getContext("2d");

  var tilesetImage = new Image();
    tilesetImage.src = 'images/tileGrass.png';
    tilesetImage.onload = drawImage;
  var tileSize = 64;       // The size of a tile (32×32)
  var hexes = Hexes.find().fetch();
  var rowTileCount = 20;   // The number of tiles in a row of our background
  var colTileCount = 32;   // The number of tiles in a column of our background
  var imageNumTiles = 16;  // The number of tiles per row in the tileset image
  function drawImage () {

  	hexes.forEach(function(hex) {
  		// console.log(hex);
  		ctx.drawImage(tilesetImage, 
            (0), 
           	(0), 
           	tileSize, tileSize, 
           	(hex.x * tileSize), 
           	(hex.y * tileSize), 
           	tileSize, tileSize);
  	});

     // for (var r = 0; r < rowTileCount; r++) {
     //    for (var c = 0; c < colTileCount; c++) {
     //       var tile = ground[ r ][ c ];
     //       var tileRow = (tile / imageNumTiles) | 0; // Bitwise OR operation
     //       var tileCol = (tile % imageNumTiles) | 0;
     //       ctx.drawImage(tilesetImage, 
     //       	(tileCol * tileSize), 
     //       	(tileRow * tileSize), 
     //       	tileSize, tileSize, 
     //       	(c * tileSize), 
     //       	(r * tileSize), 
     //       	tileSize, 
     //       	tileSize);
     //    }
     // }
  }

  function zoomed() {
    // canvas.save();
    canvas.clearRect(0, 0, width, height);
    canvas.translate(d3.event.translate[0], d3.event.translate[1]);
    canvas.scale(d3.event.scale, d3.event.scale);
    draw();
    canvas.restore();
  }

  // var zoom = d3.behavior.zoom()
  //     .scale(2)
  //     .scaleExtent([ 3, 12 ])
  //     .size([ width, height ])
  //     // .translate(projection(center).map(function(x) { return -x; }))
  //     .on("zoom", zoomed);

  //   canvas.call(zoom);

  console.log(canvas.node())
  
}