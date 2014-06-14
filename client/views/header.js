Template.header.helpers({
  menuClass: function() {
    return Session.get('mobileMenuOpen') ? 'menu-open' : 'menu-closed';
  }
});

Template.header.events({
  'click #mobile-menu': function(event) {
    Session.get('mobileMenuOpen') ? Session.set('mobileMenuOpen', null) : Session.set('mobileMenuOpen', true);
  }
})