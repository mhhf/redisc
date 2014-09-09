describe.server('compile', function(){
  
  it('string shouldComile to a string', function(){
    var s = new AtomModel( new LLMD.Atom('string',{value:'val'}));
    
    s.compile().should.eql('val');
  });
  
  it('name should compile to an object', function(){
    var n = new AtomModel( new LLMD.Atom('name',{key:'keey'}));

    n.compile().should.be.a('object')
    .and.deep.equal({keey:undefined});
  });
  

  it('name+string should compile to an object', function(){
    var n = new AtomModel( new LLMD.Atom('name',{key:'k'}));
    n.push( new LLMD.Atom('string',{value:'v'}));

    n.compile().should.be.a('object')
    .and.have.property('k')
    .and.eql('v');
  });
  
  it('name+name+string should compile to an object', function(){
    var n = new AtomModel( new LLMD.Atom('name',{key:'k'}));
    n2 = n.push( new LLMD.Atom('name',{key:'k2'}));
    n2.push( new LLMD.Atom('string',{value:'v'}));

    n.compile().should.be.a('object')
    .and.have.property('k')
    .and.have.property('k2');
  });
  
  it('name+(name+string)*2 should compile to an object', function(){
    var n = new AtomModel( new LLMD.Atom('name',{key:'k'}));
    n2 = n.push( new LLMD.Atom('name',{key:'k2'}));
    n2.push( new LLMD.Atom('string',{value:'v'}));
    
    
    n3 = n.push( new LLMD.Atom('name',{key:'k3'}));
    n3.push( new LLMD.Atom('string',{value:'v2'}));

    n.compile().should.be.a('object').and.deep.equal({
      k:{
        k2:'v',
        k3:'v2'
      }
    });
  });

});
