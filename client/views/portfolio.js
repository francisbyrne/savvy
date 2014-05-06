Template.portfolio.helpers({
  visible: function() {
    return Session.get('showClosed') || this.shares > 0;
  },
  showClosed: function() {
    return Session.get('showClosed');
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  }
})

Template.portfolio.events({
  'click #show-closed': function(event, template) {
    Session.get('showClosed') && (Session.set('showClosed', false) || true) || Session.set('showClosed', true);
  },
  'click #display-percent': function(event, template) {
    Session.set('displayPercent', true);
  },
  'click #display-amount': function(event, template) {
    Session.set('displayPercent', undefined);
  }
})