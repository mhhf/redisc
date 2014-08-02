Meteor.publish('atom', function( _id ){
   
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  
  return Atoms.find({ _id: _id });
});

Meteor.publish('Redisc.Posts', function( tags, page ){
  
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  
  var qry = { name: 'redisc', root: '' };
  if( tags.length > 0 ) qry.tags= { $in: tags };
  
  return Atoms.find( qry, { sort:{ score: -1, updatedOn: -1 }, limit: 20, skip: 20*page } );
});

Meteor.publish('Redisc.Post', function(_id){
  
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  
  return Atoms.find({$or: [{_id: _id}, { name: 'redisc', root: _id }]});
  
});

Meteor.publish('GlobalTags', function(){
  return GlobalTags.find();
});

Meteor.publish('popularTags', function(){
  return GlobalTags.find({},{sort:{rate:-1}, limit: 5 });
});
