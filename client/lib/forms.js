forms = {
  parseForm: function(form) {
    var fields = {};
    var fieldArray = $(form).serializeArray();

    _.each(fieldArray, function (field) {
      fields[field.name] = field.value;
    });

    return fields;
  }
};