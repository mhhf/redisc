Meteor.methods({

  "atom.compile": function( _id ){
    var atom = Atoms.findOne({ _id: _id});
    
    if( LLMD.Package( atom.name ) && LLMD.Package( atom.name ).preprocess ) {
      var syncPreprocess = Meteor._wrapAsync( LLMD.Package( atom.name ).preprocess );
      
      var atom = syncPreprocess( atom );
      
    }
    
    var obj = _.omit( atom, '_id' );
    // if( !obj.meta ) obj.meta = {};
    obj.meta.state = 'ready';
    
    Atoms.update({ _id: atom._id },{ $set: obj });
    // Meteor.call( 'user.seen', atom.root || atom._id );
    
    return atom;
  }

});
