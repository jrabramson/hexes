Template.game.helpers({
  hexes: function() {
      _deps.depend();
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

var svg, world, walls, width = 10000, height = 10000, x, gameColumns = 100, gameRows = 100, blocks = [
  { x: 0, y: 0 }
];
  var hexRadius = d3.min([width/((gameColumns + 0.5) * Math.sqrt(3)),
     height/((gameRows + 1/3) * 1.5)]);
var userDeps= new Deps.Dependency;
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
            console.log("x: " + d.value.x);
            console.log("y: " + d.value.y);
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

  Template.game.walls = function(x, y, radius, placement) {
      walls = ["M" + x + "," + y];
      placement.move(5, 0).unshift(0);
      walls.push("m" + hexagon(radius)[0][0] + "," + hexagon(radius)[0][1]);
      for (i=1;i<=6;i++) {
        j = i;
        if (i === 6) {
          walls.push("M" + x + "," + y);
          walls.push(' m' + hexagon(radius)[0][0] + "," + hexagon(radius)[0][1]);
          j = 3;
        }
        placement[i] === 1 ? mod = ' m' : mod = ' l';
        walls.push(mod + hexagon(radius)[j][0] + "," + hexagon(radius)[j][1]);
      }
      return walls;
    };
  
  var multiY = 1.58;
  var multiX = 1.82;
  var multiO = 0.91;

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

  svg = d3.select('#camera')
        .append('svg')
        .append('g')
        .call(zoom)
        .call(drag)
        .attr("transform", "translate(-3000,-3000)")
        .attr("id", "world")
        .append('g');

  svg.attr('width', 1200)
    .attr('height', 800);

    var defs = svg.append("defs");

    var hexbin = d3.hexbin()
            .radius(hexRadius);

    var drawHexes = function () {
      var hexes = Hexes.find().fetch();
      data = d3.entries(hexes);
      data.pop();
      world = svg.selectAll(".hex")
          .data(data)
          .enter();

      world.append("path")
          .on('contextmenu', d3.contextMenu(hexMenu), function(d) {
              console.log(d);
          })
          .attr("class", function (d) {
            return "hex " + d.value.terrain + " " + (_.isEmpty(d.value.owner) ? "unclaimed" : "claimed");
          })
          .attr('id', function (d) {
            return "h" + d.value._id;
          })
          .attr("d", function (d, i) {
            isOdd(d.value.y) ? offsetx = hexRadius * multiO : offsetx = 0;
            return "M" + (hexRadius * d.value.x * multiX + offsetx) + "," + hexRadius * d.value.y * multiY + hexbin.hexagon();
          })
          .attr("stroke", function(d) {
            return "black";
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
          })
          .on('mouseout', function(hex) {
            d3.select(this).classed("hovered", false);
          });

          $('.hex').tipsy({ 
                  gravity: 'w', 
                  html: true, 
                  title: function() {
                    var d = this.__data__;
                    return  d.value.x + ', ' + d.value.y; 
                  }
                });

    };

    function drawWalls() {
      var hexes = Hexes.find().fetch();
      var walls = svg.selectAll(".wall")
          .data(d3.entries(hexes).filter(function(d) {
            _deps.depend();
            return _.isString(d.value.owner);
          }));

      console.log(walls);
      wallEnter = walls.enter();
          
      wallEnter.append("path")
          .attr("d", function (d) {
            isOdd(d.value.y) ? offsetx = hexRadius * multiO : offsetx = 0;
            return Template.game.walls((hexRadius * d.value.x * multiX + offsetx), (hexRadius * d.value.y * multiY), hexRadius, Hexes.findOne({_id: d.value._id}).look()).join(",");
          })
          .attr("stroke", function (d) {
            return Meteor.users.findOne({_id: d.value.owner}).colour;
          })
          .attr("class", function (d) {
             return "wall";
          })
          .attr('id', function (d) {
            return "w" + d.value._id;
          });

      console.log(walls);
      walls.exit().remove();
    }

    var updateHex = function(data) {
      hexData = Hexes.find({_id: data});
      hex = d3.select('#h'+data);
      hex.each(function(d) {
        d.value.owner = hexData.owner;
      })
      .attr("class", function (d) {
            return "hex " + d.value.terrain + " " + (_.isEmpty(d.value.owner) ? "unclaimed" : "claimed");
          })
      .attr("stroke", function(d) {
        return _.isEmpty(d.value.owner) ? "black" : "white";
      });
    }

    var updateWall = function(data) {
      var hexData = Hexes.findOne({_id: data}).fetch();
      var walls = svg.selectAll(".wall")
          .data(hexData);
      console.log(hexData);
      console.log(walls);
      wallEnter = walls.enter();
          
      wallEnter.append("path")
          .attr("d", function (d) {
            isOdd(d.value.y) ? offsetx = hexRadius * multiO : offsetx = 0;
            return Template.game.walls((hexRadius * d.value.x * multiX + offsetx), (hexRadius * d.value.y * multiY), hexRadius, Hexes.findOne({_id: d.value._id}).look()).join(",");
          })
          .attr("stroke", function (d) {
            return Meteor.users.findOne({_id: d.value.owner}).colour;
          })
          .attr("class", function (d) {
             return "wall";
          })
          .attr('id', function (d) {
            return "w" + d.value._id;
          });
    }

  Hexes.find().observeChanges({
      changed: function(d) {
        _deps.changed();
        updateHex(d);
        updateWall(d);
      }
  });

  drawHexes();
  drawWalls();

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

// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {
    
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    };
    
    function isElementInDOM(ele) {
      while (ele = ele.parentNode) {
        if (ele == document) return true;
      }
      return false;
    };
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
                this.$tip.data('tipsy-pointee', this.$element[0]);
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        };
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };
        
        if (!options.live) this.each(function() { get(this); });
        
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    
    $.fn.tipsy.revalidate = function() {
      $('.tipsy').each(function() {
        var pointee = $.data(this, 'tipsy-pointee');
        if (!pointee || !isElementInDOM(pointee)) {
          $(this).remove();
        }
      });
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
     $.fn.tipsy.autoBounds = function(margin, prefer) {
    return function() {
      var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
          boundTop = $(document).scrollTop() + margin,
          boundLeft = $(document).scrollLeft() + margin,
          $this = $(this);

      if ($this.offset().top < boundTop) dir.ns = 'n';
      if ($this.offset().left < boundLeft) dir.ew = 'w';
      if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
      if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

      return dir.ns + (dir.ew ? dir.ew : '');
    }
  };
    
})(jQuery);

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};
