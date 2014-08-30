var rediscModel;

Template.RediscPostView.helpers({
  getTitle: function(){
    return this.root.get().title;
  },
  isWatching: function(){
    var watch = Meteor.user().profile.watch;
    return watch && watch[rediscModel.root.getId()];
  }
});

Template.RediscPostView.created = function(){
  rediscModel = this.data;
}
Template.RediscPostView.rendered = function(){
  var watch = Meteor.user().profile.watch;
  if( watch && watch[rediscModel.root.getId()] ) 
    Meteor.call('user.seen', rediscModel.root.getId() );
}

Template.RediscPostView.events = {
  "click .watch-btn": function(e,t){
    e.preventDefault();
    
    Meteor.call('user.watchAtom', rediscModel.root.getId() );
  },
  "click .unwatch-btn": function(e,t){
    e.preventDefault();
    
    Meteor.call('user.unwatchAtom', rediscModel.root.getId() );
  }
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
    
    // [TODO] - export to rediscModel
    var parent = this.get()
    var atom = new LLMD.Atom('redisc', parent);
        
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
