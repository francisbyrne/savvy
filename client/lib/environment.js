Meteor.startup(function() {
  IronRouterProgress.configure({
    spinner : false
  });

  Session.set('mutedErrors', []);

  AccountsEntry.config({
    homeRoute: '/'
  });
});