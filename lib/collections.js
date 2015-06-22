Timer = new Mongo.Collection('timer');
Landmarks = new Mongo.Collection('landmarks');
Worlds = new Mongo.Collection('worlds');
Hexes = new Mongo.Collection('hexes', {
  transform: function (hex) {
  	hex.look = function (d) {
  		if (this.offset()) {
  			return (d === 'e' || d === 0) ? Hexes.findOne({ x: this.x + 1, y: this.y    })
  				: 	(d === 'se' || d === 1) ? Hexes.findOne({ x: this.x + 1, y: this.y + 1})
  				: 	(d === 'sw' || d === 2) ? Hexes.findOne({ x: this.x,     y: this.y + 1})
  				: 	(d === 'w'  || d === 3) ? Hexes.findOne({ x: this.x - 1, y: this.y    })
  				: 	(d === 'nw' || d === 4) ? Hexes.findOne({ x: this.x,     y: this.y - 1})
  				: 	(d === 'ne' || d === 5) ? Hexes.findOne({ x: this.x + 1, y: this.y - 1})
  				: 	walls(this);
  		} else {
	  		return (d === 'e' || d === 0) ? Hexes.findOne({ x: this.x + 1, y: this.y    })
  				: 	(d === 'se' || d === 1) ? Hexes.findOne({ x: this.x,     y: this.y + 1})
  				: 	(d === 'sw' || d === 2) ? Hexes.findOne({ x: this.x - 1, y: this.y + 1})
  				: 	(d === 'w'  || d === 3) ? Hexes.findOne({ x: this.x - 1, y: this.y    })
  				: 	(d === 'nw' || d === 4) ? Hexes.findOne({ x: this.x - 1, y: this.y - 1})
  				: 	(d === 'ne' || d === 5) ? Hexes.findOne({ x: this.x,     y: this.y - 1})
  				: 	walls(this);
  		}
   	}
   
    function walls(hex) {
      var dir = [];
      for (i=0;i<6;i++) {
        dir.push(_.isUndefined(hex.look(i)) ? 1 : hex.look(i).owner === hex.owner ? 0 : 1);
      }
      return dir; 
    };

    hex.owned = function () {
    	return ((this.owner === Meteor.userId()) ? 2 : (this.owner) ? 1 : 0);
    }

    hex.offset = function () {
    	return this.y % 2 ? true : false;
    }

    hex.updateWalls = function() {
      this.update({}, {$set: {walls: this.look()}});
    }

    return hex;
  }
});