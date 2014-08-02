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

var rediscModel;

Template.RediscPostView.created = function(){
  rediscModel = this.data;
}


Template.RediscBackButton.helpers({
  getTags: function(){
    return Session.get('tags');
  }
});


Template.RediscPost.helpers({
  isEdit: function(){
    return rediscModel.get('EDIT') === this;
  },
  hasChildren: function(){
    var nested = this.getNested('nested');
    return nested.length > 0;
  }
});

Template.PostWrapper.events = {
  "click .btn-edit": function(){
    rediscModel.set('EDIT', this);
  },
  "click .btn-comment": function(){
    rediscModel.set('COMMENT', this);
  }
}

Template.PostWrapper.helpers({
  getAtom: function(){
    return this.get();
  },
  isComment: function(){
    return rediscModel.get('COMMENT') === this;
  },
  newCommentAtom: function(){
    var atom = new LLMD.Atom('redisc');
    // [TODO] - refactor _atomId to _seedId
    var parent = this.get();
    atom.root = parent.root != ''? parent.root : parent._seedId;
    atom.parent = parent._seedId;
    return {
      atom: atom,
      parents: [parent._id]
    };
  }
});

Template.EditorWrapper.events = {
  "click .cancel-btn": function(){
    rediscModel.set('INIT');
  },
  "click .save-btn": function(){
    rediscModel.save( this.buildAtom() );
  }
}

Template.Comments.helpers({
  getComments: function(){
    var children = this.getNested('nested');
    children.sort( function( a, b ){
      return b.get().score - a.get().score; });
    return children;
  }
});


Template.RediscPosts.helpers({
  atomModel: function(){
    return new AtomModel( this._id );
  },
  getTags: function(){
    return Session.get('tags');
  }
});
