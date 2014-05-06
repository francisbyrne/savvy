Template.portfolio.helpers({
  visible: function() {
    return Session.get('showClosed') || this.shares > 0;
  },
  showClosed: function() {
    return Session.get('showClosed');
  }
})

Template.portfolio.events({
  'click #show-closed': function(event, template) {
    Session.get('showClosed') && (Session.set('showClosed', false) || true) || Session.set('showClosed', true);
  }
})