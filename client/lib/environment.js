Meteor.startup(function() {
  IronRouterProgress.configure({
    spinner : false
  });

  Session.set('mutedErrors', []);
});