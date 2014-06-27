Template.dashboard.helpers({
  losers: function() {
    return Holdings.find({'userId': Meteor.userId()}, {'sort': {'daysGain': 1}, 'limit': 3}).fetch();
  },
  winners: function() {
    return Holdings.find({'userId': Meteor.userId()}, {'sort': {'daysGain': -1}, 'limit': 3}).fetch();
  }
});