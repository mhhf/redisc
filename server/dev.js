Meteor.methods({
  'mail.test': function(){
    
    Meteor.Sendgrid.send({
      to: 'denis.erfurt@gmail.com',
      from: 'super-ego@brainfilm.me',
      subject: 'test',
      text: 'omgomgomg'
    });
    
  }
});
