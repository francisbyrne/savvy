Template.portfolio.helpers({
  options: function() {
    return {
      // Move the display options inside the datatables header after it initialises
      fnInitComplete: function() {
        $('#portfolio-table .datatable-header').prepend( $('#portfolio #display-options').detach() );
      }
    }
  },
  showClosed: function() {
    return Session.get('showClosed');
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  displayAmount: function() {
    return ! Session.get('displayPercent');
  }
});

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
});

Template.portfolio_table.helpers({
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  visible: function() {
    // Only show current holdings unless option is specified
    return Session.get('showClosed') || this.shares > 0;
  }
});