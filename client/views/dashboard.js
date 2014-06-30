Template.dashboard.helpers({
  losers: function() {
    return Holdings.find({'userId': Meteor.userId(), 'daysGain': {$lt: 0}}, {'sort': {'daysGain': 1}, 'limit': 3}).fetch();
  },
  total: totalHoldings,
  winners: function() {
    return Holdings.find({'userId': Meteor.userId(), 'daysGain': {$gt: 0}}, {'sort': {'daysGain': -1}, 'limit': 3}).fetch();
  },
  holdingsExist: function() {
    return Holdings.find({'userId': Meteor.userId()}).count() > 0;
  }
});