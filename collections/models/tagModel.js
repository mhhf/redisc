TagModel = function( _id ){
  
  if( typeof _id != 'string' ) {
    _id = LQTags.insert({ type: _id.type });
  }
  
  var t = LQTags.findOne({ _id: _id });
  var c = new CommitModel( t._commitId );
  
  if( t.type == 'branch' ) {
    c.on('commit', function( _newId ){
      LQTags.update( { _id: _newId }, { $set: { _commitId: _newId } } );
      c = new CommitModel( _newId );
    });
  }
  
  
  this.getId = function(){
    return _id;
  }
  
  this.getCommit = function(){
    return c;
  }
  
  this.get = function(){
    return t;
  }
  
  
}

