chai.should();

describe.server('Model', function(){
  
  beforeAll( function(){
    
    // Accounts.createUser({username:'test', password:'123456', profile: { id: 'test', groups:['test'] }});
    // Meteor.loginWithPassword('test','123456');
    
  });

  
  it('schould hold the atom', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    a1.get().should.have.property('name','seq');
    
    // a1.should.have.property('atom')
    // .and.deep.property('name','seq');
    
  });
  
  it('should create one model per id', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var model1 = new AtomModel( a1.getId() );
    var model2 = new AtomModel( a1.getId() );
    
    a1.should.equal( model1 );
    model1.should.equal( model2 );
    
  });
  
  
  it('#getId() should return the id', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    a1.getId().should.equal( a1.getId() );
    
  });
    
  it('should update the atom', function(){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    var _id = a2.getId();
    a2.update({ data: '1' });
    a2.get().data.should.equal('1');
    a2.getId().should.equal( _id );
  });
  
  it('should push a value', function(){
    var a = new AtomModel( new LLMD.Atom('seq') );
    
    var s = a.push( new LLMD.Atom('string') );
    
    a.get().data.length.should.equal(1);
    a.get().data[0].should.equal(s.getId());
    
    
  });
  


  /*
   * Atom Lock - basis for versioning atoms and alternatives
   *
   *
   *
   */
  
  
  it('#isLocked()', function(){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    a2.isLocked().should.be.false;
    a2.lock();
    a2.isLocked().should.be.true;
    
  });
  
  it('should forg a locked atom on edit', function(){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    var preLockId = a2.getId();
    
    a2.lock();
    a2.update({ data: '6' });
    
    var postLockId = a2.getId();
    
    preLockId.should.not.equal( postLockId );
    
  });
  
  it('should trigger hard change callback', function( done ){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    a2.lock();
    
    a2.on('change.hard', function( atomModel ){
      this.isLocked().should.be.false;
      done();
    });
    
    a2.update({ data: '6' });
    
  });
  
  
  it('should hard update locked atoms', function(){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    var _id = a2.getId();
    
    a2.lock();
    a2.update({ value: '2' });
    a2.get().value.should.equal('2');
    a2.isLocked().should.be.false;
    a2.getId().should.not.equal( _id );
    
  });
  
  it('should hard update nested locked atoms', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    var a2 = a1.addAfter('data', new LLMD.Atom('if'));
    var a3 = a2.addAfter('t', new LLMD.Atom('string'));
    var _id1 = a1.getId();
    var _id2 = a2.getId();
    var _id3 = a3.getId();
    
    a2.lock();
    a3.lock();
    
    a2.isLocked().should.be.true;
    a3.isLocked().should.be.true;
    
    a3.update({ value: '2' });
    
    a3.get().value.should.equal('2');
    
    a2.isLocked().should.be.false;
    a3.isLocked().should.be.false;
    
    a2.getId().should.not.equal( _id2 );
    a3.getId().should.not.equal( _id3 );
    
  });
  
  it('should maintan singleton structure on hard change', function(){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    a2.lock();
    a2.update({data:'1'});
    
    var _id2 = a2.getId();
    
    var m2 = new AtomModel( _id2 );
    
    a2.should.equal( m2 );
    
  });
  
  it('should have a model for each _id', function(){
    
    var a = new AtomModel( new LLMD.Atom('string') );
    var _id1 = a.getId();
    a.lock();
    a.update({ data: '1' });
    var b = new AtomModel( _id1 );
    
    a.should.not.equal( b );
    
  });
  
  // it('should trigger change callback', function( done ){
  //   
  //   var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
  //   var a2 = new AtomModel( _atomId2 );
  //   
  //   a2.on('change', function(){
  //     done();
  //   });
  //   
  //   a2.update({ value: '4' });
  //   
  // });
  
  it('should trigger soft change callback', function( done ){
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    a2.on('change.soft', function(){
      done();
    });
    
    a2.update({ value: '5' });
    
  });
  
  
  it('#getChild() should return the child id', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    a1.addAfter('data', new LLMD.Atom('string'));
    a1.getChild('data', 0).should.be.a('string');
    
  });
  
  it('#exchangeChild should exchange a child on a given key and pos', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    a1.addAfter('data', new LLMD.Atom('string') );
    var _atomId = a1.getId();
    
    a1.exchangeChildAt('data',0, a2.getId() );
    
    a1.getId().should.equal( _atomId );
    a1.getChild('data',0).should.eql( a2.getId() );
    
  });
  
  it('#getNestedPos should find a children based on its id', function(){
    
    var a = new AtomModel( new LLMD.Atom('seq') );
    var b = a.push( new LLMD.Atom('string') );
    
    var pos = a.getNestedPos(b.getId());
    
    pos.should.not.be.null;
    pos.should.deep.equal({key:'data',pos:'0'});
    
  });
  
  it('#exchangeChildren should exchange a child _id for another child _id', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var a2 = a1.addAfter('data', new LLMD.Atom('string'));
    
    var _atomId = Atoms.insert( new LLMD.Atom('string'));
    
    a1.exchangeChildren( a2.getId(), _atomId );
    
    a1.getChild( 'data', 0 ).should.equal( _atomId );
    
  });
  
  it('#addAfter() should add atom without position', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var atom = new LLMD.Atom('string');
    atom.data = '1';
    var atom2 = a1.addAfter('data', atom );
    
    a1.get().data[0].should.be.a('string');
    atom2.get().name.should.eql('string'); 
    
  });
  
  it('#addAfter() should add atom after position', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var atom = new LLMD.Atom('string');
    atom.data = '1';
    var atom1 = a1.addAfter('data', atom );
    
    var atom = new LLMD.Atom('string');
    atom.data = '2';
    var atom2 = a1.addAfter('data', atom, 0 );
    a1.get().data[1].should.equal( atom2.getId() );
    
  });
  
  it('#addAfter() should ignore invalid positions', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var atom = new LLMD.Atom('string');
    atom.data = '3';
    a1.addAfter('data', atom, -1 );
    
    var atom = new LLMD.Atom('string');
    atom.data = '4';
    a1.addAfter('data', atom, 100 );
    
  });
  
  it('#remove() should remove the holding atom', function( done ){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    var a2 = a1.addAfter('data', new LLMD.Atom('string'));
    var _id2 = a2.getId();
    
    a2.on('remove', function(){
      
      _id2.should.not.equal( a1.getChild( 'data', 0 ) );
      done();
    })
    
    a1.getChild( 'data', 0 ).should.equal( _id2 );
    a2.remove();
    
    
  });
  
  it('#removeAt should remove __key__ and __pos__', function( done ){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    var a2 = a1.addAfter('data', new LLMD.Atom('string'));
    
    a2.on('remove', function(){
      a1.get().data.should.have.length(0);
      done();
    });
    
    a1.removeAt('data',0);
    
  });
  
  it('#isNested()', function(){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    var _atomId2 = Atoms.insert( new LLMD.Atom('string') );
    var a2 = new AtomModel( _atomId2 );
    
    a1.isNested().should.be.true;
    a2.isNested().should.be.false;
  });
  
  it('#eachNested()', function( done ){
    
    var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
    var a1 = new AtomModel( _atomId1 );
    
    a1.addAfter( 'data', new LLMD.Atom('string') );
    a1.eachNested(function( a, k ){
      a.should.be.a('array');
      k.should.eql('data');
      done();
    });
    
  });
  
  it('should insert an atom if no id is given', function(){
    
    var a = new AtomModel( new LLMD.Atom('string') );
    a.getId().should.be.a('string');
    
  });
  
  it('#contextDepth should return the right context depth', function(){
    
    var a0 = new AtomModel( new LLMD.Atom('name') );
    var a1 = a0.push( new LLMD.Atom('seq') );
    var a2 = a1.push( new LLMD.Atom('name') );
    var a3 = a2.push( new LLMD.Atom('seq') );
    var a4 = a3.push( new LLMD.Atom('name') );
    var a5 = a4.push( new LLMD.Atom('string') );
    
    a5.distanceToRoot().should.eql(3);
    
  });
  
  // it('should export an ast', function(){
  //   var _atomId1 = Atoms.insert( new LLMD.Atom('seq') );
  //   var a1 = new AtomModel( _atomId1 );
  //   
  //   var ifAtom = a1.addAfter('data', new LLMD.Atom('if') );
  //   ifAtom.addAfter('t', new LLMD.Atom('string') );
  //   
  //   var ast = a1.export();
  //   
  //   
  //   ast.should.have.deep.property('data[0].t[0].name','string');
  //   
  // });
  // 
  // it('should import an ast if given', function(){
  //   
  //   var ast = {"data":[{"c":"true","f":[],"name":"if","t":[{"name":"md","data":""}]}],"name":"seq"};
  //   
  //   var a = new AtomModel( ast );
  //   var ast2 = a.export();
  //   
  //   JSON.stringify( ast2 ).should.equal( JSON.stringify(ast) );
  //   
  // });
});

  
// describe('diff', function(){
//   
//   it('should cause a conflict', function(){
//     
//     var a = new AtomModel( new LLMD.Atom('string') );
//     var _oldId = a.getId();
//     a.lock();
//     a.update({ data: '1' });
//     
//     a.diff( _oldId );
//     a.get().meta.state.should.equal('conflict');
//     
//   }); 
//   
//   it('should hold a changed atom', function(){
//     
//     var a = new AtomModel( new LLMD.Atom('string') );
//     var _oldId = a.getId();
//     a.lock();
//     a.update({ data: '1' });
//     
//     a.diff( _oldId );
//     a.get().meta.diff.type.should.equal('change');
//     a.get().meta.diff.atom.should.be.an('string');
//     
//   });
//   
//   it('should remove an atom', function(){
//     
//     var a = new AtomModel( new LLMD.Atom('seq') );
//     var _oldId = a.getId();
//     a.lock();
//     var b = a.addAfter('data', new LLMD.Atom('string'));
//     
//     a.diff( _oldId );
//     
//     a.get().meta.state.should.equal('conflict');
//     a.get().meta.diff.type.should.equal('change');
//     
//     var removedAtom = a.getChildModel( 'data', 0 );
//     
//     removedAtom.get().meta.state.should.equal('conflict');
//     removedAtom.get().meta.diff.type.should.equal('remove');
//     
//   });
//   
//   
//   it('should add an atom', function(){
//     var a = new AtomModel( new LLMD.Atom('seq') );
//     var _oldId = a.getId();
//     a.lock();
//     a.addAfter('data', new LLMD.Atom('string'));
//     var _newId = a.getId();
//     a = new AtomModel( _oldId );
//     
//     a.getId().should.not.equal( _newId );
//     
//     a.diff( _newId );
//     
//     a.get().meta.state.should.equal('conflict');
//     a.get().meta.diff.type.should.equal('change');
//     
//     var addedAtom = a.getChildModel( 'data', 0 );
//     
//     addedAtom.get().meta.state.should.equal('conflict');
//     addedAtom.get().meta.diff.type.should.equal('add');
//     
//   });
//   
// 
//   afterAll( function(){
//     Atoms.remove({});
//   });
//   
//     
// });
    
  


checkDefaultAtomValues = function( a, name ){
  a.should.have.property('_seedId').and.to.be.a('string');
  a.should.have.property('meta').and.to.be.a('object');
  a.should.have.property('name').and.to.equal( name );
}

