Accounts.onCreateUser(function(options, user) {
  
  console.log('o',options);
  
  console.log('u', user);
  
  user.profile = options.profile;
  user.profile.state = 1;
  user.profile.watch = {};
  
  if(user.services && user.services.google ) {
    user.emails = [{
      address: user.services.google.email,
      verified: true
    }]
  }
  
  if( 
    user.emails && typeof user.emails[0].address == 'string' &&
    user.profile.name && user.profile.id
    ) user.profile.state = 'rdy';
  
  
  
  return user;
});

Meteor.methods({
  "user.clear": function(){
    var usr;
    
    while( usr = Meteor.users.findOne()){
      Meteor.users.remove({_id: usr._id});
    }
  }
});
