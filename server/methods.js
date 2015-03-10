Meteor.methods({
  "user.register1": function( o ){
    
    // [TODO] - validation
    // 
    
    var user = _.omit(Meteor.users.findOne({_id: this.userId}),'_id');
    var createGroup;
    
    if( !user.profile.id ) {
      console.log('creating user group');
      user.profile.id = o.id;
      createGroup = true;
    }
    
    user.profile.name = o.name;
    user.emails = [{
      address: o.email,
      verified: false
    }];
    user.profile.state = 'rdy';
    
    
    Meteor.users.update({_id: this.userId},{$set: user}, function(){
      if (createGroup ) {
        Meteor.call( 'owner.create', {
          shares: 1,
          name: o.id
        });
      }
    });
    
    
    
  }
  
});
