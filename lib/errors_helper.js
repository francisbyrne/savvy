throwError = function(error) {
  if (Errors) {
    Errors.throw(error.reason);
  } else {
    throw new Meteor.Error(error.error, error.reason);
  }
};