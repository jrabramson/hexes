Template.game.helpers({
  hexes: function() {
    return Hexes.find();
  },
  user: function() {
    return Meteor.user();
  }
});

Template.sidebar.helpers({
  user: function () {
    return Meteor.user();
  },
  timer: function () {
    return Timer.findOne();
  }
});

Template.menu.helpers({
  data: function() {
    return newMenu;
  }
});

Meteor.startup(function() {
});

Template.game.rendered = function () {
  game = new Phaser.Game(
    window.innerWidth, 
    window.innerHeight, 
    Phaser.CANVAS, 
    'camera', 
    {
      preload: preload, 
      create: create, 
      update: update, 
      render: render 
    }
  );
}

Template.menu.rendered = function() {
  Session.set('hovered', {});
  Session.set('option', {});
  ReactDOM.render(<Menu />, document.getElementById("menu"));
}

Hexes.find().observeChanges({
    changed: function(d) {
      userDeps.changed();
      Actions.updateHex(d);
    }
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Accounts.onLogin(function(){
  userDeps.changed();
});
