Template.game.helpers({
  hexes: function() {
      return Hexes.find();
  },
  user: function () {
    return Meteor.user();
  }
});

Template.sidebar.helpers({
  user: function () {
    return Meteor.user();
  }
});

var svg, world, width = 10000, height = 10000, x, gameColumns = 100, gameRows = 100, blocks = [
  { x: 0, y: 0 }
];
  var hexRadius = d3.min([width/((gameColumns + 0.5) * Math.sqrt(3)),
     height/((gameRows + 1/3) * 1.5)]);
var userDeps = new Deps.Dependency;
var _deps = new Deps.Dependency;
var focusedHex= {};
focused = false;

Template.focus.helpers({
  hex: function () {
    _deps.depend(); 
    return focusedHex;
  }
});

Template.game.events({
    
});

Template.game.rendered = function () {

  var hexMenu = [
      {
          title: function(d) {
            userDeps.depend(); 
            if (!Meteor.user()) {
              return "Log in to play";
            }
            if (d.value.owner) {
              return "Owner: "  + Meteor.users.findOne({_id: d.value.owner}).username;
            }
            if (Meteor.user()) {
              return 'Buy Hex';
            }
         },
          action: function(elm, d, i) {
            userDeps.depend();
            if (d.value.owner) {
              return;
            }
            if (!Meteor.user()) {
              $('#login-sign-in-link').trigger('click');
              return;
            }
            if (Meteor.user()) {
              Meteor.call('buyHex', d.value, function (error, result) { });
            }
          }
      },
      {
          title: function(d) {
            userDeps.depend(); 
            if (Meteor.user()) {
              return 'Focus tile'
            }
          },
          action: function(elm, d, i) {
            userDeps.depend(); 
            if (Meteor.user()) {
              focus(d);
            }
          }
      }
  ];

  function focus(hex) { 
    if (!focused) {  
      $('#camera').css('opacity', '0.4');
      $('#focus').fadeIn();
      focusedHex =  Hexes.findOne({ _id: hex.value._id});
      _deps.changed();
      focused = true;
    } 
  }

  function isOdd(num) { return num % 2;}


  function zoomed() {
    d3.select("#world").selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

var drag = d3.behavior.drag()
    .on('drag', function () {
    d3.event.sourceEvent.stopPropagation(); 
});

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([0.3, 3.5])
    .on("zoom", zoomed);

  svg = d3.select('#camera').append('svg');

  svg.attr('width', 1200)
    .attr('height', 800);

    var defs = svg.append("defs");

    var hexbin = d3.hexbin()
            .radius(hexRadius);

    var drawHexes = function () {
      var hexes = Hexes.find().fetch();

      world = svg.append('g')
          .call(zoom)
          .call(drag)
          .attr("transform", "translate(-3000,-3000)")
          .attr("id", "world")
          .append('g')
          .selectAll(".hex")
          .data(d3.entries(hexes))
          .enter();

      world.append("path")
          .on('contextmenu', d3.contextMenu(hexMenu), function(d) {
              console.log(d);
          })
          .attr("class", function (d) {
            _deps.depend(); 
            return "hex " + d.value.terrain + " " + (_.isEmpty(d.value.owner) ? "unclaimed" : "claimed");
          })
          .attr('id', function (d) {
            return "id" + d.value._id;
          })
          .attr("d", function (d, i) {
            isOdd(d.value.y) ? offsetx = hexRadius * 0.908 : offsetx = 0;
            return "M" + (hexRadius * d.value.x * 1.819 + offsetx) + "," + hexRadius * d.value.y * 1.578 + hexbin.hexagon();
          })
          .attr("stroke", function(d) {
            return _.isEmpty(d.value.owner) ? "black" : Meteor.users.findOne({_id: d.value.owner}).colour;
          })
          .attr("stroke-width", function(d) {
            return _.isEmpty(d.value.owner) ? "1px" : "<5px></5px>";
          })          
          .attr("stroke-dasharray", function(d) {
            if (d.value.owner) {
              $this = Hexes.findOne({_id: d.value._id});
             var neighbors = [
              $this.e().owned(), 
              $this.se().owned(), 
              $this.sw().owned(), 
              $this.w().owned(), 
              $this.nw().owned(), 
              $this.ne().owned() ];
             console.log(neighbors);
            }
            return _.isEmpty(d.value.owner) ? "1px" : "<5px></5px>";
          })
          .on('click', function(hex) {
             if (focused) {
                  $('#camera').css('opacity', '1');
                  $('#focus').fadeOut();
                  focused = false;
                }
            })
          .on('mouseover', function(hex) {
            d3.select(this).classed("hovered", true);
            // d3.select(this).moveToFront();
          })
          .on('mouseout', function(hex) {
            d3.select(this).classed("hovered", false);
          });

          // world.append("path")
          //      .attr("d", function (d) {
          //        isOdd(d.value.y) ? offsetx = hexRadius * 0.95 : offsetx = 0;
          //        return "M" 
          //        + (hexRadius * d.value.x * 1.9 + offsetx - 1)
          //        + "," 
          //        + (hexRadius * d.value.y * 1.65  + hexRadius + 4)
          //        + " L"
          //        + (hexRadius * d.value.x * 1.9 + offsetx + hexRadius - 4)
          //        + ","
          //        + (hexRadius * d.value.y * 1.65 + hexRadius / 2 + 1);
          //      })
          // .attr("class", function(d) {
          //    return "wall SE";
          // });

          // world.append("path")
          //      .attr("d", function (d) {
          //        isOdd(d.value.y) ? offsetx = hexRadius * 0.95 : offsetx = 0;
          //        return "M" 
          //        + (hexRadius * d.value.x * 1.9 + offsetx + 1)
          //        + "," 
          //        + (hexRadius * d.value.y * 1.65  + hexRadius + 4)
          //        + " L"
          //        + (hexRadius * d.value.x * 1.9 + offsetx - hexRadius + 4)
          //        + ","
          //        + (hexRadius * d.value.y * 1.65 + hexRadius / 2 + 1);
          //      })
          // .attr("class", function(d) {
          //    return "wall SW";
          // });

          // world.append("path")
          //      .attr("d", function (d) {
          //        isOdd(d.value.y) ? offsetx = hexRadius * 0.95 : offsetx = 0;
          //        return "M" 
          //        + (hexRadius * d.value.x * 1.9 + offsetx - hexRadius + 5)
          //        + "," 
          //        + (hexRadius * d.value.y * 1.65 + hexRadius / 2 + 3)
          //        + " L"
          //        + (hexRadius * d.value.x * 1.9 + offsetx - hexRadius + 5)
          //        + ","
          //        + (hexRadius * d.value.y * 1.65 - hexRadius / 2 - 3);
          //      })
          // .attr("class", function(d) {
          //    return "wall W";
          // });

          // world.append("path")
          //      .attr("d", function (d) {
          //        isOdd(d.value.y) ? offsetx = hexRadius * 0.95 : offsetx = 0;
          //        return "M" 
          //        + (hexRadius * d.value.x * 1.9 + offsetx - hexRadius + 4)
          //        + "," 
          //        + (hexRadius * d.value.y * 1.65 - hexRadius / 2 - 1)
          //        + " L"
          //        + (hexRadius * d.value.x * 1.9 + offsetx + 1)
          //        + ","
          //        + (hexRadius * d.value.y * 1.65 - hexRadius - 4);
          //      })
          // .attr("class", function(d) {
          //    return "wall NW";
          // });

          // world.append("path")
          //      .attr("d", function (d) {
          //        isOdd(d.value.y) ? offsetx = hexRadius * 0.95 : offsetx = 0;
          //        return "M" 
          //        + (hexRadius * d.value.x * 1.9 + offsetx - 1)
          //        + "," 
          //        + (hexRadius * d.value.y * 1.65 - hexRadius - 4)
          //        + " L"
          //        + (hexRadius * d.value.x * 1.9 + offsetx + hexRadius - 4)
          //        + ","
          //        + (hexRadius * d.value.y * 1.65 - hexRadius / 2 - 1);
          //      })
          // .attr("class", function(d) {
          //    return "wall NE";
          // });

          // world.append("path")
          //      .attr("d", function (d) {
          //        isOdd(d.value.y) ? offsetx = hexRadius * 0.95 : offsetx = 0;
          //        return "M" 
          //        + (hexRadius * d.value.x * 1.9 + offsetx + hexRadius - 5)
          //        + "," 
          //        + (hexRadius * d.value.y * 1.65 + hexRadius / 2 + 3)
          //        + " L"
          //        + (hexRadius * d.value.x * 1.9 + offsetx + hexRadius - 5)
          //        + ","
          //        + (hexRadius * d.value.y * 1.65 - hexRadius / 2 - 3);
          //      })
          // .attr("class", function(d) {
          //    return "wall E";
          // });

    };

    var updateHex = function(data) {
      hexData = Hexes.findOne({_id: data});
      hex = d3.select('#id'+data);
      hex.each(function(d) {
        d.value.owner = hexData.owner;
      })
      .attr("class", function (d) {
            return "hex " + d.value.terrain + " " + (_.isEmpty(d.value.owner) ? "unclaimed" : "claimed");
          })
      .attr("stroke", function(d) {
        return _.isEmpty(d.value.owner) ? "black" : Meteor.users.findOne({_id: d.value.owner}).colour;
      });
    }

  Hexes.find().observeChanges({
      changed: function(d) {
        updateHex(d);
      }
  });

  drawHexes();

  $('svg').height($('#camera').height());
  $('svg').width($('#camera').width());

};

d3.hexbin = function() {
  var width = 1,
      height = 1,
      r,
      x = d3_hexbinX,
      y = d3_hexbinY,
      dx,
      dy;

  function hexbin(points) {
    var binsById = {};

    points.forEach(function(point, i) {
      var py = y.call(hexbin, point, i) / dy, pj = Math.round(py),
          px = x.call(hexbin, point, i) / dx - (pj & 1 ? .5 : 0), pi = Math.round(px),
          py1 = py - pj;

      if (Math.abs(py1) * 3 > 1) {
        var px1 = px - pi,
            pi2 = pi + (px < pi ? -1 : 1) / 2,
            pj2 = pj + (py < pj ? -1 : 1),
            px2 = px - pi2,
            py2 = py - pj2;
        if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
      }

      var id = pi + "-" + pj, bin = binsById[id];
      if (bin) bin.push(point); else {
        bin = binsById[id] = [point];
        bin.i = pi;
        bin.j = pj;
        bin.x = (pi + (pj & 1 ? 1 / 2 : 0)) * dx;
        bin.y = pj * dy;
      }
    });

    return d3.values(binsById);
  }

  function hexagon(radius) {
    var x0 = 0, y0 = 0;
    return d3_hexbinAngles.map(function(angle) {
      var x1 = Math.sin(angle) * radius,
          y1 = -Math.cos(angle) * radius,
          dx = x1 - x0,
          dy = y1 - y0;
      x0 = x1, y0 = y1;
      return [dx, dy];
    });
  }

  hexbin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return hexbin;
  };

  hexbin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return hexbin;
  };

  hexbin.hexagon = function(radius) {
    if (arguments.length < 1) radius = r;
    return "m" + hexagon(radius).join("l") + "z";
  };

  hexbin.centers = function() {
    var centers = [];
    for (var y = 0, odd = false, j = 0; y < height + r; y += dy, odd = !odd, ++j) {
      for (var x = odd ? dx / 2 : 0, i = 0; x < width + dx / 2; x += dx, ++i) {
        var center = [x, y];
        center.i = i;
        center.j = j;
        centers.push(center);
      }
    }
    return centers;
  };

  hexbin.mesh = function() {
    var fragment = hexagon(r).slice(0, 4).join("l");
    return hexbin.centers().map(function(p) { return "M" + p + "m" + fragment; }).join("");
  };

  hexbin.size = function(_) {
    if (!arguments.length) return [width, height];
    width = +_[0], height = +_[1];
    return hexbin;
  };

  hexbin.radius = function(_) {
    if (!arguments.length) return r;
    r = +_;
    dx = r * 2 * Math.sin(Math.PI / 3);
    dy = r * 1.5;
    return hexbin;
  };

  return hexbin.radius(1);
};

var d3_hexbinAngles = d3.range(0, 2 * Math.PI, Math.PI / 3),
    d3_hexbinX = function(d) { return d[0]; },
    d3_hexbinY = function(d) { return d[1]; };

d3.contextMenu = function (menu, openCallback) {

  // create the div element that will hold the context menu
  d3.selectAll('.d3-context-menu').data([1])
    .enter()
    .append('div')
    .attr('class', 'd3-context-menu');

  // close menu
  d3.select('body').on('click.d3-context-menu', function() {
    d3.select('.d3-context-menu').style('display', 'none');
  });

  // this gets executed when a contextmenu event occurs
  return function(data, index) {
    var elm = this;

    d3.selectAll('.d3-context-menu').html('');
    var list = d3.selectAll('.d3-context-menu').append('ul');
    list.selectAll('li').data(menu).enter()
      .append('li')
      .html(function(d) {
        return (typeof d.title === 'string') ? d.title : d.title(data);
      })
      .on('click', function(d, i) {
        d.action(elm, data, index);
        d3.select('.d3-context-menu').style('display', 'none');
      })
      .attr("class", function(d,i){
        console.log(d.title(data));
        return (d.title(data)) ? '' : "hidden";
      });

    // the openCallback allows an action to fire before the menu is displayed
    // an example usage would be closing a tooltip
    if (openCallback) {
      if (openCallback(data, index) === false) {
        return;
      }
    }

    // display context menu
    d3.select('.d3-context-menu')
      .style('left', (d3.event.pageX - 2) + 'px')
      .style('top', (d3.event.pageY - 2) + 'px')
      .style('display', 'block');

    d3.event.preventDefault();
    d3.event.stopPropagation();
  };
};

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Accounts.onLogin(function(){
  userDeps.changed();
});

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function isOdd(num) { return num % 2; }        
