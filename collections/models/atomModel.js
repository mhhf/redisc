var atomModelMap = {};
AtomModelMap = atomModelMap;


/**
 * @param {(string|object)} - Atom _id or an Atom Object which will be inserted
 * 
 */

Atoms = new Meteor.Collection( 'atoms' );
AtomModel = function( o, params ){
  
  
  var _id;
  var deps = new Deps.Dependency;
  var nested;
  var self = this;
  
  _.extend( this, new EventEmitter() );
  
  
  var computeNested = function() {
    if( LLMD.Package(atom.name).nested ) {
      nested = {};
      
      LLMD.eachNested( atom, function(seq, key){
        nested[key] = [];
        
        for( var i in seq ){
          var child = new AtomModel(seq[i], {
            parent: self
          });
          nested[key][i] = child;
        }
        
      });
    }
  }
  this.computeNested = computeNested;
  
  
  
  if( typeof o == 'string' ) {
    _id = o;
    
    // singleton
    if( atomModelMap[ _id ] ) {
      return atomModelMap[ _id ];
    }
    atomModelMap[_id] = this;
    
  } else if( typeof o == 'object' && o != null ) {
    var insertAtoms = function( ast ){
      
      var n = {};
      if( LLMD.hasNested(ast) ) {
        LLMD.eachNested(ast, function( seq, key ){
          n[key] = [];
          for( var i in seq ){
            n[key][i] = insertAtoms( ast[key][i] );
          }
        });
      }
      
      if( ast._id ) {
        return ast._id;
      } else {
        var _atomId = Atoms.insert( _.extend({},ast,n) );
        return _atomId;
      }
      
      
    }
    
    if( o.meta.state != 'tmp' ) {
      _id = insertAtoms( o );
    } else {
      _id = 'tmp';
    }
    
  }   
  
  
  
  if( _id === 'tmp' ) {
    var atom = o;
    this.atom = atom;
  } else {
    var atom;
    
    var self = this;
    
    this.atomWatcher = Deps.autorun( function(){
      console.log('ar', _id);
      atom = Atoms.findOne({ _id: _id });
      if( !atom ) {
        // throw new Error('atom not found');
        return null;
      }
      self.atom = atom;
      deps.changed();
      self.parent && self.parent.changed();
    });
    
    if( !atom ) return null;
    computeNested();
    
    
    
    // this.atomWatcher = atomWatcher;
    
  }
  
  
  if( params && params.parent ) this.parent = params.parent; 
  
  // if a nested child cant be loaded
  if( _id && !atom ) {
    
    // invalidate the child
    delete atomModelMap[_id];
    
    // invalidate the parent, which holds the invalid child
    if( this.parent ) {
      delete atomModelMap[ this.parent.atom._id ];
    }
  
    // throw new Error('no Atom '+_id+' found, maybe its not subscribed to it or is removed.');
  
  }
  
  // [TODO] - refactor nested to atomModelMap call
  
  
  
  // this.atom = Atoms.findOne({ _id: _id });
  // 
  
  
  
  this.get = function(){
    deps.depend();
    return atom;
  }
  
  // [TODO] - refactor getChildren
  this.getNested = function( k ){
    deps.depend();
    return nested && nested[k];
  }
  
  this.getId = function(){
    return this.get()._id;
  }
  
  this.getSeed = function(){
    return this.get()._seedId;
  }
  
  /**
   * change( <object> )
   * 
   * 
   */
  this.update = function( atomO ){
    
    if( !atom.meta.lock && atom.meta.state != 'tmp' ) {
      Atoms.update({ _id: atom._id }, { $set: _.omit( atomO, '_id' ) });
      // atom = Atoms.findOne({ _id: atom._id });
      this.emit('change.soft', null);
      // trigger soft change
    } else {
      console.log('inserting', atom, atomO);
      
      atom.meta.lock = false;
      var _oldId = atom._id;
      // BUG: _.extend not extends deep, overvrites object propertys
      atom.meta = _.extend( atom.meta, atomO.meta );
      var _atomId = Atoms.insert( _.omit( _.extend( atom, _.omit(atomO,'meta') ), '_id' ) );
      
      this.atomWatcher && this.atomWatcher.stop();
      this.atomWatcher = Deps.autorun( function(){
        atom = Atoms.findOne({ _id: _atomId });
        deps.changed();
      });
      computeNested();
      
      delete atomModelMap[ _oldId ];
      atomModelMap[ _atomId ] = this;
       
      // trigger hard change
      this.emit('change.hard',{
        _oldId: _oldId,
        _newId: _atomId
      });
      
      this.parent && this.parent.exchangeChildren( _oldId, _atomId );
    }
    
    // [TODO] - maybe refactor out of the model
    Meteor.call( 'atom.compile', this.getId() );
    
  }
  
  
  this.getNestedPos = function( _atomId ){
    
    var p;
    var k;
    
    LLMD.eachNested( atom, function(seq, key){
      
      for(var i in seq) {
        
        
        if( seq[i] == _atomId ) {
          k = key;
          p = i;
        }
        
      }
    
    });
    
    
    if( p ) {
      return { key: k, pos: p };
    } else {
      return null;
    }
  }
  
  
  /**
   * @param key: nested sequence property
   * @param atom: the atom Object
   * @param pos: position in the nested sequence
   * 
   * addAfter( <key>, <Atom> [, <position> ] )
   * 
   * @return: AtomModel
   */
  this.addAfter = function( key, child, pos ){
    
    if( !( this.isNested() ) ) {
      throw new Error( 'atom '+atom.name+ ' is not nested or nested key isn\'t '+key);
    }
    
    if( typeof child == 'string' ) {
      var _atomId = child;
    } else {
      var _atomId = Atoms.insert( child );
    }
    
    if( !( pos && pos >= 0 && pos in atom[key] ) ) {
      pos = atom[key].length;
    }
    atom[key].splice( pos, 0, _atomId );
    var o = {};
    o[key] = atom[key];
    
    this.update(o);
    
    var atomModel = new AtomModel( _atomId, {
      parent: this
    } );
    
    this.emit('add', { target: atomModel });
    
    return atomModel;
    
  }
  
  
  // [TODO] - refactor hasChildren
  this.isNested = function(k){
    return LLMD.hasNested( atom );
  }
  
  this.isLocked = function(){
    return this.get().meta.lock;
  }
  
  // [TODO] - refactor: eachChildren
  this.eachNested = function( f ){
    if( this.isNested() ) {
      LLMD.eachNested(atom, f);
    }
  }
  
  // [TODO] - test
  this.eachChildren = function( f ){
    
    this.eachNested( function( seq, key ){
      
      for(var i in seq) {
        f( atomModelMap[seq[i]], key, i );
      }
      
    });
    
  }
  
  this.eachDescendant = function( f ){
    this.eachChildren( function( a, k, p ){
      if( a.isNested() ) {
        a.eachDescendant( f );
      }
      f(a);
    });
  }
  
  this.getChild = function( key, pos ){
    if( this.isNested() ) {
      return atom[key][pos];
    }
  }
  
  // @return: AtomModel
  this.getChildModel = function( key, pos ){
    if( this.isNested() ) {
      return new AtomModel( atom[key][pos] );
    }
  }
  
  // [TODO] - refactor: replaceChild
  this.exchangeChildAt = function( key, pos, _atomId ){
    var obj = {};
    obj[key] = atom[key];
    obj[key][pos] = _atomId;
    
    this.update( obj );
  }
  
  this.exchangeChildren = function( _oldId, _newId ){
    
    var pos = this.getNestedPos( _oldId );
    if( pos ) this.exchangeChildAt( pos.key, pos.pos, _newId )
    
  }
  
  this.removeAt = function( key, pos ){
    var obj = {};
    obj[key] = atom[key];
    var _atomId = obj[key].splice(pos, 1);
    
    this.update( obj );
    
    atomModelMap[ _atomId ].emit('remove');
    
  }
  
  this.removeChild = function( _id ){
    var pos = this.getNestedPos( _id );
    if( pos ) this.removeAt( pos.key, pos.pos );
  }
  
  this.remove = function(){
    this.parent.removeChild( atom._id );
  }
  
  this.lock = function(){
    if( !atom.meta.lock ) {
      this.update({meta:{lock: true}});
    }
  }
  
  this.export = function(){
    
    var n = _.clone(nested);
    _.forEach(n,function( s, k ){
      for( var i in s ) {
        n[k][i] = n[k][i].export();
      }
    });
    
    var e = _.extend( {}, _.omit(atom,['_id','meta','_seedId']), n );
    return e;
  }
  
  // search for the smalest matched index
  var findFirstMatched = function( as1, as2 ) {
    
    for(var m=0; m <= Math.max( as1.length, as2.length ); m++ ) {
      for( var i=0; i<= Math.min( as2.length, as1.length, m ); i++ ) {
        var j = m-i;
        
        if( i in as1 && j in as2 && as1[i].getSeed() == as2[j].getSeed() ) return { i:i, j:j };
        
      }
    }
    
    return { i: as1.length, j: as2.length };
  }
  
  var restackElements = function( seq, i, add ){
    
    var atoms = seq.splice( 0, i );
    // var key;
    
    atoms.forEach( function( a ){
      // if ( key = getCommitKey( a, _cId ) ) {
      //   a.meta.diff = {
      //     type: 'move',
      //     key: key
      //   }
      // } else {
      a.lock();
      a.update({
        meta: {
          diff: {
            type: (add?'add':'remove')
          },
          state: 'conflict' 
        }
      });
      /* } */
    });
    
    return _.map(atoms, function(a) { return a.getId(); });
    
  }
  
  var diffSeq = function( ast1, ast2 ){
    
    var ds = []; // final diffed sequence
    
    while ( ast1.length + ast2.length > 0 ) {
      
      var indexes = findFirstMatched( ast1, ast2 );
      // console.log( 'intexes:', indexes.i, indexes.j, ast1.length, ast2.length );
      
      // take all elements < indexes.i from ast1 and push them to ds with changes
      if( indexes.i > 0 )
        ds = ds.concat( restackElements( ast1, indexes.i, false ) );
      
      if( indexes.j > 0 )
        ds = ds.concat( restackElements( ast2, indexes.j, true ) );
      
      var a1 = ast1.splice(0, 1)[0];
      var a2 = ast2.splice(0, 1)[0];
      
      // console.log('a',a1,a2);
      if( a1 && a2 ) {
        a1.diff(a2);
        ds = ds.concat([a1.getId()]);
      }
      
    }
    return ds;
  }
  
  this.diff = function( _id ){
    var a_ = new AtomModel( _id );
    var self = this;
    if( _id === this.getId() ) {
      return this;
    } else if( a_ && a_.getSeed() === this.getSeed() ) {
      
      var o = { 
        meta: {
          diff: {
            type: 'change',
            atom: a_.getId()
          },
          state: 'conflict'
        }
      }
      
      if( this.isNested() ) {
        
        this.eachNested( function( seq, key ){
          
          var seq1 = self.getNested( key );
          var seq2 = a_.getNested( key );
          
          var ds = diffSeq( seq1, seq2 );
          
          o[key] = ds;
          
        });
        
      }
      
      this.lock();
      this.update(o);
      
    }
  }
  
  this.changed = function(){
    deps.changed();
  }
  
  
}
AtomModel.prototype.toString = function(){
  return this.getId();
}

