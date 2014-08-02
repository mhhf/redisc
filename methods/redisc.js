Meteor.methods({
  'post.vote': function(o){
  
    if( !this.userId ) return null;
    
    
    var p = Atoms.findOne({_id: o._id});
    var b = 0;
    if(p.upvotes.indexOf(this.userId)>-1) b = -1;
    if(p.downvotes.indexOf(this.userId)>-1) b = 1;
    
    
    // if already voted
    if( b === -1 && o.value === 1 ) return false;
    if( b === 1 && o.value === -1 ) return false; 
    
    var score = p.upvotes.length - p.downvotes.length + o.value + b;
    
    
    if( o.value === -1 ) {
      
      Atoms.update( {_id: o._id}, {
        $pull: { upvotes: this.userId },
        $addToSet: { downvotes: this.userId },
        $set: {score: score} 
      }); 
      
    } else if( o.value === 1 ) {
      
      Atoms.update( {_id: o._id}, {
          $pull: { downvotes: this.userId },
          $addToSet: { upvotes: this.userId},
        $set: {score: score}
      });
      
    }
    
    // if( p.parent )
    //   Meteor.call('post.compile', {_id: p.parent});
    
  },
  'Redisc.Posts.count': function( tags ){
    
    var qry = { name: 'redisc', root: '' };
    if( tags.length > 0 ) qry.tags= { $in: tags };
    
    return Atoms.find( qry ).count();
  },
  "user.watchAtom": function( _id ){
    
    var o= {};
    o[ "profile.watch."+_id ] = new Date();
    
    Meteor.users.update(
        {_id: this.userId},
        { $set: o }
    ); // Meteor.users.update
  },
  "user.seen": function( _id ){
    
    var userId = this.userId;
    
    var o= {};
    o[ "profile.watch."+_id ] = new Date();

    Meteor.users.update(
        {_id: userId},
        { $set: o }
      ); // Meteor.users.update
  },
  "user.unwatchAtom": function( _id ){
    
    var o= {};
    o[ "profile.watch."+_id ] = "";
    
    Meteor.users.update(
        {_id: this.userId},
        { $unset: o }
    ); // Meteor.users.update
  },
  "clear": function(){
    Meteor.users.remove({});
  }
});
