Template.devNew.events = {
  "click .save-btn": function(e,t){
    var atom = _.extend( new LLMD.Atom('redisc'), this.buildAtom() );
    var _atomId = Atoms.insert(atom);
    Router.go('devPost', {
      _id: _atomId
    });
  }
}

var rediscModel;

Template.devPost.created = function(){
  rediscModel = this.data;
}



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
  isComment: function(){
    return rediscModel.get('COMMENT') === this;
  },
  newCommentAtom: function(){
    var atom = new LLMD.Atom('redisc');
    // [TODO] - refactor _atomId to _seedId
    atom.root = this.atom.root != ''? this.atom.root : this.atom._seedId;
    atom.parent = this.atom._seedId;
    return {
      atom: atom,
      parents: [this.atom._id]
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
    children.sort( function( a, b ){ return b.atom.score - a.atom.score; });
    return children;
  }
});

Template.rediscPosts.atomModel = function(){
  return new AtomModel( this._id );
}
