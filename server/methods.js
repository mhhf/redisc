Meteor.methods({
  "atom.compile": function( _id ){
    var atom = Atoms.findOne({ _id: _id});
    console.log('c', _id);
    
    if( LLMD.Package( atom.name ) && LLMD.Package( atom.name ).preprocess ) {
      var syncPreprocess = Meteor._wrapAsync( LLMD.Package( atom.name ).preprocess );
      
      var atom = syncPreprocess( atom );
      
    }
    
    var obj = _.omit( atom, '_id' );
    // if( !obj.meta ) obj.meta = {};
    obj.meta.state = 'ready';
    
    Atoms.update({ _id: atom._id },{ $set: obj });
    Meteor.call( 'user.seen', atom.root || atom._id );
    
    return atom;
  },
  "user.register1": function( o ){
    
    // [TODO] - validation
    // 
    
    var user = _.omit(Meteor.users.findOne({_id: this.userId}),'_id');
    
    user.profile.name = o.name;
    user.emails = [{
      address: o.email,
      verified: false
    }];
    user.profile.state = 'rdy';
    
    
    Meteor.users.update({_id: this.userId},{$set: user});
    
    
  }
  
});
