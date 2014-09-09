Template.RediscPostView.helpers({
  getTitle: function(){
    return this.atom.get().title;
  },
  isWatching: function(){
    var watch = Meteor.user().profile.watch;
    return watch && watch[this.atom.getId()];
  }
});

Template.RediscPostView.created = function(){
  // rediscModel = this.data.atomModel;
}
Template.RediscPostView.rendered = function(){
  var watch = Meteor.user().profile.watch;
  if( watch && watch[this.data.atom.getId()] ) 
    Meteor.call('user.seen', this.data.atom.getId() );
}

Template.RediscPostView.events = {
  "click .watch-btn": function(e,t){
    e.preventDefault();
    
    Meteor.call('user.watchAtom', this.atom.getId() );
  },
  "click .unwatch-btn": function(e,t){
    e.preventDefault();
    
    Meteor.call('user.unwatchAtom', this.atom.getId() );
  }
}


Template.RediscBackButton.helpers({
  getTags: function(){
    return Session.get('tags');
  }
});


Template.RediscPost.helpers({
  isEdit: function(){
    return AtomModel.get('EDIT') === this;
  },
  hasChildren: function(){
    var nested = this.getNested('nested');
    return nested.length > 0;
  }
});

Template.PostWrapper.events = {
  "click .btn-edit": function(){
    AtomModel.set('EDIT',this);
  },
  "click .btn-comment": function(){
    AtomModel.set('COMMENT', this);
  }
}

Template.PostWrapper.helpers({
  getAtom: function(){
    return this.get();
  },
  isComment: function(){
    return AtomModel.get('COMMENT') === this;
  },
  newCommentAtom: function(){
    
    // [TODO] - export to atomModel
    var parent = this.get()
    var atom = new LLMD.Atom('redisc', null ,parent);
        
    atom.root = parent.root != ''? parent.root : parent._seedId;
    atom.parent = parent._seedId;
    atom.owner = parent.owner;
    
    atom.meta.state = 'tmp';
    var atomModel = new AtomModel( atom, {parent:parent} );
    
    return atomModel;
  }
});

Template.EditorWrapper.events = {
  "click .cancel-btn": function(){
    AtomModel.set('INIT');
  },
  "click .save-btn": function(){
    
    // [TODO] - export to atom model
    if( AtomModel.state === 'COMMENT' ) {
      var parent = AtomModel.data.get();
      var root = parent.root || parent._id;
      var atom = _.extend( new LLMD.Atom('redisc'), this.buildAtom(), {root: root} );
      AtomModel.data.addAfter( 'nested', atom );
    } else if( AtomModel.state === 'EDIT' ) {
      AtomModel.data.update( this.buildAtom() );
    }
    AtomModel.set('INIT');
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
