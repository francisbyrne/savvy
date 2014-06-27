Template.body.helpers({
  headerExists: function() {
    var current = Router.current();
    return current && current.path !== '/landing';
  }
});