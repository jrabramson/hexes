Router.configure({  

  layoutTemplate: 'layout',
  notFoundTemplate: 'appNotFound',
  loadingTemplate: 'loading',

});

dataReadyHold = null;

if (Meteor.isClient) {
  dataReadyHold = LaunchScreen.hold();
  Router.onBeforeAction('loading', {except: ['join', 'signin']});
  Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}

Router.map(function() {
  this.route('join');
  this.route('signin');

  this.route('game', {
    path: '/',
    
    waitOn: function() {
      return [
          Meteor.subscribe('hexes'),
          Meteor.subscribe('allUserData'),
          Meteor.subscribe('wealth'),
          Meteor.subscribe('timer')
        ];
    },
    data: function () {
      return Hexes.find();
    },
    action: function () {
      if (this.ready()) {
              this.render();
          }
    }
  });

});

GameController = RouteController.extend({
  action: function() {
    this.render('home', {
      data: function () {
        return { posts: ['post red', 'post blue'] }
      }
    });
  }
});