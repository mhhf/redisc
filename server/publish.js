Meteor.publish('ownCourses', function(){
  // return Courses.find();
  return Courses.find({ 'owner._id': this.userId });
});

Meteor.publish('course', function( _id ){
  return  Courses.find({ _id: _id });
});

Meteor.publish('courseUnits', function( _courseId, name ){
  return Units.find({ memberOf: {$in: [_courseId]}, name: name });
})

Meteor.publish('unit', function( _id ){
  
  return Units.find({ _id: _id });
});


Meteor.publish('publicCourses', function(){
  return Courses.find();
});

Meteor.publish('commit', function( _id ){
  return Commits.find({ _id: _id })
});

Meteor.publish('atom', function( _id ){
  return Atoms.find({ _id: _id });
});

var buildHistory = function( _id ){
  var history = [];
  while( _id ) {
    history.push( _id );
    var commit = Commits.findOne({ _id: _id });  
    _id = commit && commit.parent;
  }
  
  return history;
}

Meteor.publish('commitHistory', function( _commitId ){
  var commitsId = buildHistory( _commitId );
  return Commits.find({ _id: { $in: commitsId } });
});

Meteor.publish('branch', function( _unitId, name ){
  // [TODO] - unitId
  return LQTags.find({ name:name });

});

Meteor.publish('diffedAtom', function( _c1, _c2 ){
  
  var commitOld = Commits.findOne({ _id: _c1 });
  var commitNew = Commits.findOne({ _id: _c2 });
  
  if( commitOld._rootId != commitNew._rootId ) {
    
    var retObject;
    if( retObject = Atoms.findOne( { _id: 'diff_'+_c1 +'_'+ _c2 } ) ) {
      Atoms.remove({ _id: 'diff_'+_c1 +'_'+ _c2 })
    }
    var seq = diffSeq3( commitOld._rootId, commitNew._rootId, _c1, _c2 );
    return Atoms.find({_id:seq});
  }
  
});

Meteor.publish('Redisc.Posts', function( tags ){
  console.log(tags);
  
  var qry = { name: 'redisc', root: '' };
  if( tags.length > 0 ) qry.tags= { $in: tags };
  
  return Atoms.find( qry );
});

Meteor.publish('Redisc.Post', function(_id){
  return Atoms.find({$or: [{_id: _id}, { name: 'redisc', root: _id }]});
});
