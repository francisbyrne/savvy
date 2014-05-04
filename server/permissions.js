Meteor.startup(function() {

  // Only allow users to modify their own transactions
  Transactions.allow({
    insert: function(userId, doc) { return userId && userId == doc.userId; },
    update: function(userId, doc) { return userId && userId == doc.userId; },
    remove: function(userId, doc) { return userId && userId == doc.userId; },
    fetch: ['userId']
  });

  // Deny modifying userId field
  Transactions.deny({
    update: function (userId, docs, fields, modifier) {
      return _.contains(fields, 'userId');
    }
  });

});