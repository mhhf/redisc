Meteor.startup(function(){
  Meteor.Sendgrid.config({
    username: 'app27918601@heroku.com',
    password: 'qx1youit'
  });
  
  AccountsEntry.config({
    signupCode: 'momentum2020'
  });
});
