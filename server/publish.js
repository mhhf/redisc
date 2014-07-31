Meteor.publish('atom', function( _id ){
   
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  
  return Atoms.find({ _id: _id });
});

Meteor.publish('Redisc.Posts', function( tags ){
  
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  
  var qry = { name: 'redisc', root: '' };
  if( tags.length > 0 ) qry.tags= { $in: tags };
  
  return Atoms.find( qry );
});

Meteor.publish('Redisc.Post', function(_id){
  
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  
  return Atoms.find({$or: [{_id: _id}, { name: 'redisc', root: _id }]});
  
});
