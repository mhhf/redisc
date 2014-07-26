var buildHistory = function( _id ){
  var history = [];
  while( _id ) {
    history.push( _id );
    var commit = Commits.findOne({ _id: _id });  
    _id = commit && commit.parent;
  }
  
  return history;
}

Template.commitHistory.helpers({
  getHistory: function(){
    var history = _.map( buildHistory(this.head._id) , function( _id ){
      return Commits.findOne({_id: _id});
    });
    return history;
  }
});
