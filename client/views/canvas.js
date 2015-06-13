Template.canvas.rendered = function () {


  var width  = window.innerWidth;
  var height = window.innerHeight;

  var roadStyles = {
    "major_road": { color: "#555", width: 1.4 },
    "minor_road": { color: "#aaa", width: 0.8 },
    "highway":    { color: "#222", width: 1.8 }
  };

  var canvas = d3.select("body")
    .append("canvas")
    .attr("width", width)
    .attr("height", height);

  var context = canvas.node().getContext("2d");

  var tile = d3.geo.tile()
    .size([ width, height ]);

  tilePath = d3.geo.path()
    .projection(d3.geo.mercator())
    .context(context);

  var cachedTiles = {};

  var center = [ -74.1, 39.94 ];

  var projection = d3.geo.mercator()
    .scale((1 << 22) / 2 / Math.PI)
    .translate([ -width / 2, -height / 2 ]);

  var zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([ 1 << 18, 1 << 26 ])
    .size([ width, height ])
    .translate(projection(center).map(function(x) { return -x; }))
    .on("zoom", zoomed);

  canvas.call(zoom);
  zoomed();

  function groupByKind(data) {
    return data.reduce(function(memo, d) {
      var kind = d.properties.kind;

      if (memo[kind]) { memo[kind].push(d); }
      else            { memo[kind] = [ d ]; }

      return memo;
    }, {});
  }

  function drawTile(tiles, d, data) {
    var k = Math.pow(2, d[2]) * 256;
    var x = (d[0] + tiles.translate[0]) * tiles.scale;
    var y = (d[1] + tiles.translate[1]) * tiles.scale;
    var s = tiles.scale / 256;

    tilePath
      .projection()
      .translate([ k / 2 - d[0] * 256, k / 2 - d[1] * 256 ])
      .scale(k / 2 / Math.PI);

    context.save();
    context.translate(x, y);
    context.scale(s, s);

    var key;

    for (key in data) {
      var style = roadStyles[key];

      if (style) {
        context.beginPath();
        data[key].forEach(tilePath);
        context.closePath();

        context.strokeStyle = style.color;
        context.lineWidth   = style.width;

        context.stroke();
      }
    }

    context.restore();
  }

  function zoomed() {
    var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      .call();

    context.clearRect(0, 0, width, height);

    tiles.forEach(function(d) {
      var letters = [ "a", "b", "c" ];
      var letter = letters[(d[0] * 31 + d[1]) % 3];
      var hexes = Hexes.find().fetch();

      if (cachedTiles[hexes] && cachedTiles[hexes].caching === false && cachedTiles[hexes].drawing === false) {
        drawTile(tiles, d, cachedTiles[hexes].data);
      }
      else if (!cachedTiles[hexes]) {
        cachedTiles[hexes] = { caching: true, drawing: false, data: [] };

        d3.entries(hexes, function(error, data) {
          if (error) {
            console.error("caching tiles error", error, hexes, data);
            delete cachedTiles[hexes];
          }
          else {
            // var data = data.features.sort(function(a, b) {
            //   return a.properties.sort_key - b.properties.sort_key;
            // });
        	console.log(data);
            cachedTiles[hexes] = { caching: false, drawing: true, data: groupByKind(data) };
            drawTile(tiles, d, cachedTiles[hexes].data);
            cachedTiles[hexes].drawing = false;
          }
        });
      }
    });
  }


}

d3.geo.tile = function() {
  var size = [960, 500],
      scale = 256,
      translate = [size[0] / 2, size[1] / 2],
      zoomDelta = 0;

  function tile() {
    var z = Math.max(Math.log(scale) / Math.LN2 - 8, 0),
        z0 = Math.round(z + zoomDelta),
        k = Math.pow(2, z - z0 + 8),
        origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k],
        tiles = [],
        cols = d3.range(Math.max(0, Math.floor(-origin[0])), Math.max(0, Math.ceil(size[0] / k - origin[0]))),
        rows = d3.range(Math.max(0, Math.floor(-origin[1])), Math.max(0, Math.ceil(size[1] / k - origin[1])));

    rows.forEach(function(y) {
      cols.forEach(function(x) {
        tiles.push([x, y, z0]);
      });
    });

    tiles.translate = origin;
    tiles.scale = k;

    return tiles;
  }

  tile.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return tile;
  };

  tile.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return tile;
  };

  tile.translate = function(_) {
    if (!arguments.length) return translate;
    translate = _;
    return tile;
  };

  tile.zoomDelta = function(_) {
    if (!arguments.length) return zoomDelta;
    zoomDelta = +_;
    return tile;
  };

  return tile;
};