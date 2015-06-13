Router.configure({  

  layoutTemplate: 'layout',
  notFoundTemplate: 'appNotFound',
  loadingTemplate: 'loading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
//   waitOn: function() {
//     return [
//       Meteor.subscribe('publicLists'),
//       Meteor.subscribe('privateLists')
//     ];
//   }

});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();

  // Show the loading screen on desktop
  Router.onBeforeAction('loading', {except: ['join', 'signin']});
  // Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}

Router.map(function() {
  this.route('join');
  this.route('signin');

  // this.route('game');
  this.route('canvas', {
    path: '/canvas',
    
    waitOn: function() {
      return [Meteor.subscribe('hexes'),Meteor.subscribe('allUserData'),Meteor.subscribe('credit')];
    },
    data: function () {
      return Hexes.find();
    },
    action: function () {
      // if (!(Meteor.user() || Meteor.loggingIn())) {
      //     Router.go('signin');
      //   } else {
      //     this.next();
      //   }
      if (this.ready()) {
              this.render();
          }
    }
  })
  this.route('game', {
    path: '/',
    
    waitOn: function() {
      return [Meteor.subscribe('hexes'),Meteor.subscribe('allUserData'),Meteor.subscribe('credit')];
    },
    data: function () {
      return Hexes.find();
    },
    action: function () {
      // if (!(Meteor.user() || Meteor.loggingIn())) {
      //     Router.go('signin');
      //   } else {
      //     this.next();
      //   }
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