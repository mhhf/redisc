RediscModel = function( o ) {
  
  
  /**
   * 
   * STATES:
   *   INIT <-> COMMENT
   *   INIT <-> EDIT
   * 
   */
  
  this.dep =	new Deps.Dependency,
  this.val = 'INIT',
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
  
  if( typeof o.rootId === 'string' ) {
    this.root = new AtomModel( o.rootId );
  }
  
  
  this.save = function( newAtomO ){
    
    if( this.val === 'COMMENT' ) {
      var parent = this.data.get();
      var root = parent.root || parent._id;
      var atom = _.extend( new LLMD.Atom('redisc'), newAtomO, {root: root} );
      this.data.addAfter( 'nested', atom );
    } else if( this.val === 'EDIT' ) {
      this.data.update( newAtomO );
    }
    
    this.set('INIT');
    
  }
  
  
}
