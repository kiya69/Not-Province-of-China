var keystone = require('keystone'),
  Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Enquiry = new keystone.List('Enquiry', {
  nocreate: true,
  noedit: true
});

Enquiry.add({
  name: {
    type: Types.Name,
    required: true
  },
  email: {
    type: Types.Email,
    required: true
  },
  phone: {
    type: String
  },
  enquiryType: {
    type: Types.Select,
    options: [{
      value: 'message',
      label: "Just leaving a message"
    }, {
      value: 'question',
      label: "I've got a question"
    }, {
      value: 'other',
      label: "Something else..."
    }]
  },
  message: {
    type: Types.Markdown,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

Enquiry.schema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
})

Enquiry.schema.post('save', function() {
  if (this.wasNew) {
    this.sendNotificationEmail(function(err) {
      console.log(err);
    });
  }
});

Enquiry.schema.methods.sendNotificationEmail = function(callback) {

  var enqiury = this;

  keystone.list('User').model.find().where('isAdmin', true).exec(function(err, admins) {

    if (err) return callback(err);

    new keystone.Email('enquiry-notification').send({
      to: admins,
      from: {
        name: 'My Site',
        email: 'kiya69@gmail.com'
      },
      subject: 'New Enquiry for My Site',
      enquiry: enqiury
    }, callback);

  });

}

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, enquiryType, createdAt';
Enquiry.register();