Template.RediscPostNew.events = {
  "click .save-btn": function(e,t){
    var atom = _.extend( new LLMD.Atom('redisc'), this.buildAtom() );
    var _atomId = Atoms.insert(atom);
    Meteor.call('atom.compile', _atomId);
    Router.go('RediscPostView', {
      _id: _atomId
    });
  }
}

Template.RediscPostNew.helpers({
  newAtom: function(){
    var atom = new LLMD.Atom('redisc');
    atom.meta.state = 'tmp';
    var atomModel = new AtomModel(atom);
    return atomModel;
  }
});
