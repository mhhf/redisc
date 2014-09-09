var atomModelMap = {};
AtomModelMap = atomModelMap;


/**
 * @param {(string|object)} - Atom _id or an Atom Object which will be inserted
 * 
 */

Atoms = new Meteor.Collection( 'atoms' );
AtomModel = function( o, params ){
  
  
  /*
   * Parameter, which not change with the atomModel
   * name
   */
  var _id, name, _seedId;

  // var deps = new Deps.Dependency;
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
          if( typeof child.get == 'function' )
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
      atom = Atoms.findOne({_id: _id});
      _seedId = atom._seedId;
      name = atom.name;
    } else {
      _id = 'tmp';
    }
    
  }   
  
  
  
  if( _id === 'tmp' ) {
    var atom = o;
  } else {
    var atom;
    
    atom = Atoms.findOne({ _id: _id });
    
    if( _id && !atom ) {
      // invalidate the child
      delete atomModelMap[_id];
      // invalidate the parent, which holds the invalid child
      if( this.parent ) {
        delete atomModelMap[ this.parent.atom._id ];
      }
      return null;
    }
    
    _seedId = atom._seedId;
    name = atom.name;
    
    computeNested();
    // deps.changed();
    
  }
  
  
  if( params && params.parent ) this.parent = params.parent; 
  
  // if a nested child cant be loaded
  
  // [TODO] - refactor nested to atomModelMap call
  
  
  
  // this.atom = Atoms.findOne({ _id: _id });
  
  
  
  this.get = function(){
    atom = Atoms.findOne( _id );
    return atom || o;
  }
  
  // [TODO] - refactor getChildren
  this.getNested = function( k ){
    atom = Atoms.findOne(_id);
    computeNested();
    return nested && nested[k];
  }
  
  this.getId = function(){
    return _id;
  }
  
  this.getSeed = function(){
    return _seedId;
  }
  
  /**
   * change( <object> )
   * 
   * 
   */
  this.update = function( atomO ){
    
    atom = this.get();

    if( !this.isLocked() && atom.meta.state != 'tmp' ) {
      if( atomO.meta ) atomO.meta = _.extend( atom.meta, atomO.meta )
        
      Atoms.update({ _id: _id }, { $set: _.omit( atomO, '_id' ) });
      // atom = Atoms.findOne({ _id: atom._id });
      this.emit('change.soft', null);
      // trigger soft change
    } else {
      
      atom.meta.lock = false;
      var _oldId = atom._id;
      // BUG: _.extend not extends deep, overvrites object propertys
      atom.meta = _.extend( atom.meta, atomO.meta );
      _id = Atoms.insert( _.omit( _.extend( atom, _.omit(atomO,'meta') ), '_id' ) );
      
      computeNested();
      
      delete atomModelMap[ _oldId ];
      atomModelMap[ _id ] = this;
       
      // trigger hard change
      this.emit('change.hard',{
        _oldId: _oldId,
        _newId: _id
      });
      
      this.parent && this.parent.exchangeChildren( _oldId, _id );
    }
    
    // [TODO] - maybe refactor out of the model
    Meteor.call( 'atom.precompile', this.getId() );
    
  }
  
  
  this.getNestedPos = function( _atomId ){
    
    var p;
    var k;
    
    LLMD.eachNested( this.get(), function(seq, key){
      
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
    
    atom = this.get();
    
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
    
    // computeNested();
    
    return atomModel;
    
  }
  
  this.push = function(child){
    if( this.isNested() ) {
      var k = LLMD.Package(this.get().name).nested[0];
      
      
      if( typeof child == 'string' ) {
        var _atomId = child;
      } else {
        var _atomId = Atoms.insert( child );
      }
      
      var field = this.get()[k];
      field.push( _atomId );
      
      var updateObject = {};
      updateObject[k] = field;
      
      this.update( updateObject );
      
      return new AtomModel(_atomId, {
        parent: this
      });
    }
  }
  
  
  // [TODO] - refactor hasChildren
  this.isNested = function(k){
    return LLMD.hasNested( this.get() );
  }
  
  this.isLocked = function(){
    return this.get().meta.lock;
  }
  
  // [TODO] - refactor: eachChildren
  this.eachNested = function( f ){
    if( this.isNested() ) {
      LLMD.eachNested(this.get(), f);
    }
  }
  
  
  this.hasChildren = function(){
    return this.numChildren() > 0;
  }

  this.numChildren = function( f ){
    
    var numChildren = 0;
    
    this.eachNested( function( seq, key ){
      
      numChildren += seq.length;
      
    });
    
    return numChildren;
    
  }
  
  // [TODO] - test
  this.eachChildren = function( f ){
    
    var atom;
    
    this.eachNested( function( seq, key ){
      
      for(var i in seq) {
        atom = atomModelMap[seq[i]];
        if( atom ) {
          f( atom, key, i );
        } else {
          console.log('ERROR: no model for atom', this.getId, seq[i], key);
        }
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
      return this.get()[key][pos];
    }
  }
  
  // @return: AtomModel
  this.getChildModel = function( key, pos ){
    if( this.isNested() ) {
      return new AtomModel( this.get()[key][pos] );
    }
  }
  
  // [TODO] - refactor: replaceChild
  this.exchangeChildAt = function( key, pos, _atomId ){
    var obj = {};
    obj[key] = this.get()[key];
    obj[key][pos] = _atomId;
    
    this.update( obj );
  }
  
  this.exchangeChildren = function( _oldId, _newId ){
    
    var pos = this.getNestedPos( _oldId );
    if( pos ) {
      this.exchangeChildAt( pos.key, pos.pos, _newId );
    } else {
      throw new Error('[LLMD] atom with id: '+_oldId+' not found in '+this.getId());
    }
     
    
  }
  
  this.removeAt = function( key, pos ){
    var obj = {};
    obj[key] = this.get()[key];
    var _atomId = obj[key].splice(pos, 1);
    
    this.update( obj );
    
    atomModelMap[ _atomId ].emit('remove');
    
  }
  
  this.removeChild = function( _id ){
    var pos = this.getNestedPos( _id );
    if( pos ) this.removeAt( pos.key, pos.pos );
  }
  
  this.remove = function(){
    this.parent.removeChild( this.getId() );
  }
  
  this.lock = function(){
    if( !this.get().meta.lock ) {
      this.update({meta:{lock: true}});
    }
  }
  
  // this.export = function(){
  //   
  //   var n = _.clone(nested);
  //   _.forEach(n,function( s, k ){
  //     for( var i in s ) {
  //       n[k][i] = n[k][i].export();
  //     }
  //   });
  //   
  //   var e = _.extend( {}, _.omit(atom,['_id','meta','_seedId']), n );
  //   return e;
  // }
  // 
  //


  this.distanceToRoot = function( distance ){
    if( !distance ) distance = 0;

    if( this.parent  ) {
      if( this.parent.get().name == 'name' ) distance += 1;
      return this.parent.distanceToRoot( distance );
    } else {
      return distance;
    }
    
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
      
      // take all elements < indexes.i from ast1 and push them to ds with changes
      if( indexes.i > 0 )
        ds = ds.concat( restackElements( ast1, indexes.i, false ) );
      
      if( indexes.j > 0 )
        ds = ds.concat( restackElements( ast2, indexes.j, true ) );
      
      var a1 = ast1.splice(0, 1)[0];
      var a2 = ast2.splice(0, 1)[0];
      
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
    // deps.changed();
  }
  
  
}
if( Meteor.isClient ) {
  AtomModel.dep = new Deps.Dependency;
  AtomModel.state = 'INIT';
  AtomModel.data = {};
  AtomModel.set = function( state, data ){
    AtomModel.dep.changed();
    AtomModel.state = state;
    AtomModel.data = data;
  }
  AtomModel.get = function( state ){
    AtomModel.dep.depend();
    if( !state || state == AtomModel.state) {
      return AtomModel.data;
    } else {
      return null;
    }
  };
}
AtomModel.prototype.toString = function(){
  return this.getId();
}

