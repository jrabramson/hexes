// Users = Mongo.Users();
Factions = new Mongo.Collection('factions');
Landmarks = new Mongo.Collection('landmarks');
Hexes = new Mongo.Collection('hexes', {
  transform: function (hex) {
  	hex.look = function (d) {
  		return (d === 'e') ? Hexes.findOne({ x: (this.x + 1), y: this.y})
  			: 	(d === 'w') ? Hexes.findOne({ x: this.x - 1, y: this.y})
  			: 	(d === 'ne') ? Hexes.findOne({ x: this.x, y: this.y - 1})
  			: 	(d === 'nw') ? Hexes.findOne({ x: this.x + 1, y: this.y - 1})
  			: 	(d === 'se') ? Hexes.findOne({ x: this.x, y: this.y + 1})
  			: 	(d === 'sw') ? Hexes.findOne({ x: this.x - 1, y: this.y + 1})
  			: 	[
  					Hexes.findOne({ x: this.x + 1, y: this.y}), 
  					Hexes.findOne({ x: this.x, y: this.y + 1}), 
  					Hexes.findOne({ x: this.x - 1, y: this.y + 1}),
  					Hexes.findOne({ x: this.x - 1, y: this.y}),
  					Hexes.findOne({ x: this.x, y: this.y - 1}),
  					Hexes.findOne({ x: this.x + 1, y: this.y - 1})
  				];
   	}
   
    hex.owned = function () {
    	return ((this.owner === Meteor.userId()) ? 2 : (this.owner) ? 1 : 0);
    }

    return hex;
  }
});
Worlds = new Mongo.Collection('worlds');

Hexes.check = function (x, y) {
	return Hexes.find({x: x,y: y}).fetch()
}