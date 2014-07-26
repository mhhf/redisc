var commitMap = {};




Commits = new Meteor.Collection( 'commits', {
  schema: new SimpleSchema( [
  {
    _rootId: {
      type: String,
      autoValue: function(){
        if( this.isSet ) {
          return this.value;
        } else {
          var a = Atoms.insert( new LLMD.Atom('seq') );
          return a;
        }
      }
    },
    parent: {
      type: String,
      optional: true
    },
    date: {
      type: Date,
      autoValue: function(){
        return new Date();
      }
    },
    msg: {
      type: String,
      defaultValue: '',
      optional: true
    },
    _seedId: {
      type: String,
      autoValue: function(){
        if( this.isSet ) {
          return this.value;
        } else {
          return CryptoJS.SHA1(Math.random()+''+Math.random()).toString();
        }
      }
    }
  }
])
});

CommitModel = function( _id ){
  _.extend( this, new EventEmitter() );
  
  if( commitMap[_id] ) {
    return commitMap[_id];
  } else {
    commitMap[_id] = this;
  }
  
  if( !_id ) { // insert
    
    var _id = Commits.insert({});
    
  }
  
  
  var commit = Commits.findOne({ _id: _id });
  var root = new AtomModel( commit._rootId );
  console.log(_id, commit);
  
  root.on('change.hard', function( o ){
    Commits.update({ _id: commit._id }, { _rootId: o._newId });
  });
  
  
  this.commit = function( o ){
    
    Commits.update({ _id: commit._id }, { $set: o });
    
    root.eachDescendant( function( a ){
      a.lock();
    });
    root.lock();
    
    var _cId = Commits.insert({
      _rootId: root.getId(),
      parent: commit._rootId,
      _seedId: commit._seedId
    });
    
    // commit = Commits.findOne( { _id: _cId } );
    
    this.emit('commit', _cId );
    
    return new CommitModel( _cId );
  }
  
  this.diff = function( _id ){
    // create diff on this stage with remove _id
  }
  
  this.getRoot = function(){
    return root;
  }
  
  this.getCommit = function(){
    return commit;
  }
  
  this.getId = function(){
    return _id;
  }
  
  
  
  
  
}
