Template.body.selected = function(path) {
  return Router.current() && (Router.current().path === path) && 'selected';
};