EditorModel = function( o ){
  
  this.editable = !!o.editable;
  
  var branch = o.branch;
  
  this.dep =	new Deps.Dependency,
  this.val = null,
  this.data = null,
  this.get = function( state ){
    this.dep.depend();
    if( !state || state == this.val ) {
      return this.data;
    } else {
      return null;
    }
  };
   
  this.set = function( state, data ){
    this.dep.changed();
    this.val = state;
    this.data = data;
  };
  
  this.save = function( atom ){
    var edit = this.get('add') || this.get('edit');
    edit.atom.update( atom );
    
    if( this.val == 'add' ) {
      var _id = edit.atom.getId();
      edit.parent.addAfter( edit.key, _id );
    }
    
    this.set(null);
  };
  
  this.diffLeft = function( wrappedAtom ){
    
    var atom = wrappedAtom.atom;
    var ids = wrappedAtom.parents;
    // ids.push(atom._id);
    
    if( atom.meta.diff.type == 'add' ) {
      this.remove( ids );
      return null;
    }
    atom.meta = _.omit(atom.meta,'diff');
    atom.meta.state = 'ready';
    this.commitModel.change( atom, ids );
    
    this.set(null);
  };
  
  this.diffRight = function( wrappedAtom ){
    
    var ids = wrappedAtom.parents;
    console.log(wrappedAtom.parents);
    ids.push( wrappedAtom.atom._id );
    
    if( wrappedAtom.atom.meta.diff.type == 'remove' ) {
      this.remove( ids );
      return null;
    } else if( wrappedAtom.atom.meta.diff.type == 'change' ) {
      var atom = Atoms.findOne({ _id: wrappedAtom.atom.meta.diff.atom });
    } else {
      var atom = wrappedAtom.atom;
    }
    atom.meta = _.omit(atom.meta,'diff');
    atom.meta.state = 'ready';
    this.commitModel.change( atom, ids );
    
    this.set(null);
  };
  this.dismiss = function(){
    this.set(null);
  };
  this.remove = function( ids, commit ){
    
    this.commitModel.remove( ids );
  };
  
  this.add = function( name, key, parent ){
    
    var a = new LLMD.Atom( name );
    a.meta.state = 'tmp';
    var atom = new AtomModel( a, {parent:parent} );
    
    // var parents = this.data.parents.concat( this.data.atom._id );
    
    // var wrappedAtom = this.wrapAtom( atom, parents );
    // wrappedAtom.key = key;
    
    this.set('add', {
      atom: atom,
      key: key,
      parent: parent
    });
    
  };
  
  // this.wrapAtom = function( atom, parents ){
  //   var wrappedAtom = {
  //     atom: atom,
  //     editorModel: this,
  //   };
  //   
  //   // if( atom.meta.state == 'init' ) {
  //   //   this.set( wrappedAtom );
  //   // }
  //     
  //   return wrappedAtom;
  // };
  
  this.getRoot = function(){
    return branch.getCommit().getRoot();
  }
  
  this.getBranch = function(){
    return branch;
  }
  
}
