Meteor.methods({
  'post.vote': function(o){
  
    if( !this.userId ) return null;
    
    
    var p = Atoms.findOne({_id: o._id});
    var b = 0;
     
    if( o.value == -1) { // DOWNVOTE
      if( p.pro.indexOf(this.userId)>-1 ) { // UPVOTED
        // 
        // RESET
        Atoms.update( {_id: o._id}, {
          $pull: { pro: this.userId },
          $set: {score: p.score - 1} 
        }); 
      } else if( p.con.indexOf(this.userId) == -1 ){ // NOT VOTED
        //
        // DOWNVOTE
        Atoms.update( {_id: o._id}, {
          $addToSet: { con: this.userId },
          $set: {score: p.score - 1} 
        }); 
      }
    } else if( o.value == 1 ) { // UPVOTE
      if( p.con.indexOf(this.userId)>-1 ) { // DOWNVOTED
        // 
        // RESET
        Atoms.update( {_id: o._id}, {
          $pull: { con: this.userId },
          $set: {score: p.score + 1} 
        }); 
      } else if( p.pro.indexOf(this.userId) == -1 ){ // NOT VOTED
        //
        // UPVOTE
        Atoms.update( {_id: o._id}, {
          $addToSet: { pro: this.userId },
          $set: {score: p.score + 1} 
        }); 
      }
    }
    
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
    var watch =  Meteor.user().profile.watch ;
    
    if( !(watch && watch[_id]) ) return null;
    
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
