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
  var usr = Meteor.users.findOne({ _id: this.userId });
  
  var qry = { 
    name: 'redisc', 
    root: '',
    $or: [
      { _rights: 'public' },
      { owner: { $in: usr.profile.groups || [] } }
    ] };
  if( tags.length > 0 ) qry.tags= { $in: tags };
  
  return Atoms.find( qry, { sort:{ score: -1, updatedOn: -1 }, limit: 20, skip: 20*page } );
});

Meteor.publish('Redisc.Post', function(_id){
  
  // make shure user is logged in
  // replace with an scl and later with share model
  if( !this.userId ) return null;
  var usr = Meteor.users.findOne({ _id: this.userId });
  
  return Atoms.find({
    $or: [
      { _id: _id }, 
      { name: 'redisc',
        root: _id }
    ], 
    $or: [
      { _rights: 'public' },
      { owner: { $in: usr.profile.groups || [] } }
    ]
  });
  
});

Meteor.publish('GlobalTags', function(){
  return GlobalTags.find({}, {fields: { _remoteIds:0 }, limit: 50, sort: {rate:-1}});
});

Meteor.publish('popularTags', function(){
  return GlobalTags.find({},{sort:{rate:-1}, limit: 5, fields: { _remoteIds:0 } });
});

Meteor.publish('file', function(_id){
  return Files.find({ _id: _id });
});
