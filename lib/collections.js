World = new Mongo.Collection('worlds');
Timer = new Mongo.Collection('timer');
Landmarks = new Mongo.Collection('landmarks');
Market = new Mongo.Collection('market', {
  transform: function(market) {
    market.transaction = function(resource, trending) {
      var value = {};
      var trend = {};
      value[resource + '.value'] = trending ? 1 : -1
      trend[resource + '.trend'] = trending

      Market.update({_id: market._id}, {$inc: value, $set: trend});
    }

    market.buy = function(resource, amount, cash) {
      var cost = (this[resource]['value'] + 1) * amount;

      if (cost <= cash) {
        this.transaction(resource, true);

        return cost;
      } else {
        return false;
      }
    }

    market.sell = function(resource, amount, stock) {
      var cost = this[resource]['value'] * amount;

      if (amount <= stock) {
        market.transaction(resource, false);

        return cost;
      } else {
        return false;
      }
    }

    return market;
  }
});
Hexes = new Mongo.Collection('hexes', {
  transform: function(hex) {
    hex.spriteName = function() {
      return this.terrain + this.variant + (this.state.type || '');
    }

    hex.slice = function(){
      var returnObj = {};
      for(var i = 0, j = arguments.length; i < j; i++){
          if(this.hasOwnProperty(arguments[i])){
              returnObj[arguments[i]] = this[arguments[i]];
          }
      }
      return returnObj;
    }

  	hex.look = function(d) {
  		if (this.offset()) {
  			return (d === 'e'  || d === 0) ? Hexes.findOne({x: this.x + 1, y: this.y    })
  				:    (d === 'se' || d === 1) ? Hexes.findOne({x: this.x + 1, y: this.y + 1})
  				: 	 (d === 'sw' || d === 2) ? Hexes.findOne({x: this.x,     y: this.y + 1})
  				: 	 (d === 'w'  || d === 3) ? Hexes.findOne({x: this.x - 1, y: this.y    })
  				: 	 (d === 'nw' || d === 4) ? Hexes.findOne({x: this.x,     y: this.y - 1})
  				: 	 (d === 'ne' || d === 5) ? Hexes.findOne({x: this.x + 1, y: this.y - 1})
  				: 	walls(this);
  		} else {
	  		return (d === 'e'  || d === 0) ? Hexes.findOne({x: this.x + 1, y: this.y    })
  				: 	 (d === 'se' || d === 1) ? Hexes.findOne({x: this.x,     y: this.y + 1})
  				: 	 (d === 'sw' || d === 2) ? Hexes.findOne({x: this.x - 1, y: this.y + 1})
  				: 	 (d === 'w'  || d === 3) ? Hexes.findOne({x: this.x - 1, y: this.y    })
  				: 	 (d === 'nw' || d === 4) ? Hexes.findOne({x: this.x - 1, y: this.y - 1})
  				: 	 (d === 'ne' || d === 5) ? Hexes.findOne({x: this.x,     y: this.y - 1})
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
    	return this.y % 2 ? false : true;
    }

    hex.updateWalls = function() {
      if(hex && hex.owner) {
        Hexes.update({_id: hex._id}, {$set: {walls: this.look()}});
      }
    }

    hex.surrounding = function() {
      var collection = [];
      for (i=0;i<6;i++) {
        collection.push(hex.look(i));
      }

      return collection;
    }

    hex.adjacent = function(user) {
      var neighbors = hex.surrounding().filter(function(h) {
        if (h == undefined) {
          return false;
        }
        return h.owner == user;
      });
      return neighbors.length > 0;
    }

    hex.getIncrement = function() {
      switch (this.state.type) {
        case 'production':
          return this.state.level + 1;
        case 'tower':
          return 0;
        default:
          return 1;
      }
    }

    return hex;
  }
});