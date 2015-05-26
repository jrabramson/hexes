// Users = Mongo.Users();
Factions = new Mongo.Collection('factions');
Landmarks = new Mongo.Collection('landmarks');
Hexes = new Mongo.Collection('hexes', {
  transform: function (hex) {
    hex.e = function () {
      return (Hexes.findOne({x: (this.x + 1)}));
    }
    hex.w = function () {
      return (Hexes.findOne({x: (this.x - 1)}));
    }    
    hex.ne = function () {
      return (Hexes.findOne({x: (this.x + 1), y: (this.y - 1)}));
    }    
    hex.nw = function () {
      return (Hexes.findOne({x: (this.x - 1), y: (this.y - 1)}));
    }    
    hex.se = function () {
      return (Hexes.findOne({x: (this.x + 1), y: (this.y + 1)}));
    }    
    hex.sw = function () {
      return (Hexes.findOne({x: (this.x - 1), y: (this.y + 1)}));
    }

    hex.owned = function () {
    	return ((this.owner === Meteor.userId()) ? 2 : (this.owner) ? 1 : 0);
    }
    hex.neighbors = function () {
    	var neighbors = [
    	 this.e().owned(), 
    	 this.se().owned(),  
    	 this.sw().owned(), 
    	 this.w().owned(), 
    	 this.nw().owned(), 
    	 this.ne().owned() ];
    }
    
    return hex;
  }
});
Worlds = new Mongo.Collection('worlds');